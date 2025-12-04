import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { getCourses, updateCourse, getLivreurs, getCurrentUser } from "@/services/storage";
import { toast } from "sonner";
import { Course } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const ValidationsPage = () => {
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
  const livreurs = getLivreurs();

  useEffect(() => {
    const courses = getCourses();
    const pending = courses.filter((c) => {
      if (
        c.type === "expedition" &&
        c.expedition &&
        c.completed &&
        !c.expedition.validated
      ) {
        return true;
      }
      if (c.type === "livraison" && c.livraison) {
        return c.livraison.articles.some(
          (a) => a.status === "not_delivered" && !a.returnedToAdmin,
        );
      }
      return false;
    });
    setPendingCourses(pending);
  }, []);

  const handleValidateExpedition = (courseId: string, validated: boolean) => {
    const course = pendingCourses.find((c) => c.id === courseId);
    if (!course || !course.expedition) return;

    updateCourse(courseId, {
      expedition: {
        ...course.expedition,
        validated,
      },
    });

    setPendingCourses(pendingCourses.filter((c) => c.id !== courseId));
    toast.success(validated ? "Expédition validée" : "Expédition rejetée");
  };

  const handleValidateReturn = (courseId: string, articleId: string) => {
    const course = pendingCourses.find((c) => c.id === courseId);
    if (!course || !course.livraison) return;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error("Utilisateur non connecté");
      return;
    }

    const updatedArticles = course.livraison.articles.map((a) =>
      a.id === articleId
        ? {
          ...a,
          returnedToAdmin: true,
          returnValidatedBy: currentUser.id,
          returnValidatedAt: new Date().toISOString()
        }
        : a,
    );

    updateCourse(courseId, {
      livraison: { ...course.livraison, articles: updatedArticles },
    });

    // Refresh
    const courses = getCourses();
    const pending = courses.filter((c) => {
      if (
        c.type === "expedition" &&
        c.expedition &&
        c.completed &&
        !c.expedition.validated
      ) {
        return true;
      }
      if (c.type === "livraison" && c.livraison) {
        return c.livraison.articles.some(
          (a) => a.status === "not_delivered" && !a.returnedToAdmin,
        );
      }
      return false;
    });
    setPendingCourses(pending);
    toast.success("Retour validé");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Validations</h1>
        <p className="text-muted-foreground">
          Valider les retours et expéditions
        </p>
      </div>

      <div className="space-y-4">
        {pendingCourses.map((course) => {
          const livreur = livreurs.find((l) => l.id === course.livreurId);

          return (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {course.type === "expedition"
                        ? `Expédition - ${course.expedition?.destinationCity}`
                        : `Livraison - ${course.livraison?.contactName}`}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {livreur?.name} •{" "}
                      {new Date(course.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <StatusBadge status="pending" />
                </div>
              </CardHeader>

              <CardContent>
                {course.type === "expedition" && course.expedition ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-secondary/50 p-4 rounded-lg">
                      <div>
                        <p className="font-medium">Montant de l'expédition</p>
                        <p className="text-2xl font-bold">
                          {course.expedition.expeditionFee} XOF
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleValidateExpedition(course.id, true)
                        }
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleValidateExpedition(course.id, false)
                        }
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                ) : (
                  course.livraison && (
                    <div className="space-y-3">
                      {course.livraison.articles
                        .filter(
                          (a) =>
                            a.status === "not_delivered" &&
                            !a.returnedToAdmin,
                        )
                        .map((article) => (
                          <div
                            key={article.id}
                            className="bg-secondary/50 p-4 rounded-lg space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{article.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {article.price} XOF
                                </p>
                                <p className="text-sm mt-1">
                                  <span className="font-medium">Raison:</span>{" "}
                                  {article.reason}
                                </p>
                              </div>
                              <StatusBadge status="not_delivered" />
                            </div>
                            <Button
                              onClick={() =>
                                handleValidateReturn(course.id, article.id)
                              }
                              size="sm"
                              className="w-full"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Valider le retour
                            </Button>
                          </div>
                        ))}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pendingCourses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aucune validation en attente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ValidationsPage;
