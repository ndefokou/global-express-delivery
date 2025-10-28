import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { getCourses, updateCourse, getCurrentUser } from "@/services/storage";
import { toast } from "sonner";
import { Course } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const LivreurCoursesPage = () => {
  const user = getCurrentUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user) {
      const allCourses = getCourses();
      const myCourses = allCourses.filter(
        c => c.livreurId === user.id && c.date === today
      );
      setCourses(myCourses);
    }
  }, [user, today]);

  const handleArticleStatusChange = (courseId: string, articleId: string, status: "delivered" | "not_delivered", reason?: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.livraison) return;

    const updatedArticles = course.livraison.articles.map(a => 
      a.id === articleId ? { ...a, status, reason: status === "not_delivered" ? reason : undefined } : a
    );

    const hasDelivered = updatedArticles.some(a => a.status === "delivered");

    updateCourse(courseId, {
      livraison: { ...course.livraison, articles: updatedArticles },
      completed: hasDelivered,
    });

    setCourses(getCourses().filter(c => c.livreurId === user?.id && c.date === today));
    toast.success("Statut mis à jour");
  };

  const handleExpeditionComplete = (courseId: string, fee: number) => {
    if (fee <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    updateCourse(courseId, {
      expedition: {
        destinationCity: courses.find(c => c.id === courseId)?.expedition?.destinationCity || "",
        expeditionFee: fee,
        validated: false,
      },
      completed: true,
    });

    setCourses(getCourses().filter(c => c.livreurId === user?.id && c.date === today));
    toast.success("Expédition enregistrée");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes courses du jour</h1>
        <p className="text-muted-foreground">{new Date(today).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {course.type === "livraison" ? (
                  <Package className="h-5 w-5 text-primary" />
                ) : (
                  <Truck className="h-5 w-5 text-primary" />
                )}
                <CardTitle className="text-lg">
                  {course.type === "livraison"
                    ? `Livraison - ${course.livraison?.contactName}`
                    : `Expédition - ${course.expedition?.destinationCity}`}
                </CardTitle>
                <StatusBadge status={course.completed ? "delivered" : "pending"} />
              </div>
            </CardHeader>

            <CardContent>
              {course.type === "livraison" && course.livraison ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Quartier:</span> {course.livraison.quartier}
                    </div>
                    <div>
                      <span className="font-medium">Frais de livraison:</span> {course.livraison.deliveryFee} XOF
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Articles</Label>
                    {course.livraison.articles.map((article) => (
                      <Card key={article.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium">{article.name}</p>
                              <p className="text-sm text-muted-foreground">{article.price} XOF</p>
                            </div>
                            <StatusBadge status={article.status === "delivered" ? "delivered" : "not_delivered"} />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant={article.status === "delivered" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleArticleStatusChange(course.id, article.id, "delivered")}
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Livré
                            </Button>
                            <Button
                              variant={article.status === "not_delivered" ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => {
                                const reason = prompt("Raison de non-livraison:");
                                if (reason) {
                                  handleArticleStatusChange(course.id, article.id, "not_delivered", reason);
                                }
                              }}
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Non livré
                            </Button>
                          </div>

                          {article.status === "not_delivered" && article.reason && (
                            <p className="mt-2 text-sm text-destructive">Raison: {article.reason}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : course.expedition && (
                <div className="space-y-4">
                  {!course.completed ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Montant de l'expédition (XOF)</Label>
                        <Input
                          type="number"
                          id={`expedition-fee-${course.id}`}
                          placeholder="Entrer le montant"
                          defaultValue={course.expedition.expeditionFee}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          const input = document.getElementById(`expedition-fee-${course.id}`) as HTMLInputElement;
                          handleExpeditionComplete(course.id, Number(input.value));
                        }}
                        className="w-full"
                      >
                        Marquer comme complétée
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm space-y-2">
                      <p><span className="font-medium">Montant:</span> {course.expedition.expeditionFee} XOF</p>
                      <p>
                        <span className="font-medium">Statut de validation:</span>{" "}
                        {course.expedition.validated ? (
                          <span className="text-success">Validé</span>
                        ) : (
                          <span className="text-warning">En attente de validation admin</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucune course assignée aujourd'hui</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LivreurCoursesPage;
