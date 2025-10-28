import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, Truck } from "lucide-react";
import { getCourses, addCourse, getLivreurs } from "@/services/storage";
import { toast } from "sonner";
import { Course, Article } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>(getCourses());
  const livreurs = getLivreurs().filter(l => l.active);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseType, setCourseType] = useState<"livraison" | "expedition">("livraison");
  const [formData, setFormData] = useState({
    livreurId: "",
    date: new Date().toISOString().split("T")[0],
    contactName: "",
    quartier: "",
    deliveryFee: 500,
    destinationCity: "",
    articles: [] as Omit<Article, "id">[],
  });

  const addArticle = () => {
    setFormData({
      ...formData,
      articles: [...formData.articles, { name: "", price: 0, status: "delivered" }],
    });
  };

  const updateArticle = (index: number, field: string, value: any) => {
    const updated = [...formData.articles];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, articles: updated });
  };

  const removeArticle = (index: number) => {
    setFormData({
      ...formData,
      articles: formData.articles.filter((_, i) => i !== index),
    });
  };

  const handleAddCourse = () => {
    if (!formData.livreurId) {
      toast.error("Veuillez sélectionner un livreur");
      return;
    }

    const newCourse: Omit<Course, "id"> = {
      type: courseType,
      livreurId: formData.livreurId,
      date: formData.date,
      completed: false,
    };

    if (courseType === "livraison") {
      if (!formData.contactName || !formData.quartier || formData.articles.length === 0) {
        toast.error("Veuillez remplir tous les champs de livraison");
        return;
      }
      newCourse.livraison = {
        contactName: formData.contactName,
        quartier: formData.quartier,
        deliveryFee: formData.deliveryFee,
        articles: formData.articles.map((a, i) => ({
          ...a,
          id: `${Date.now()}-${i}`,
        })),
      };
    } else {
      if (!formData.destinationCity) {
        toast.error("Veuillez spécifier la ville de destination");
        return;
      }
      newCourse.expedition = {
        destinationCity: formData.destinationCity,
        expeditionFee: 0,
        validated: false,
      };
    }

    addCourse(newCourse);
    setCourses(getCourses());
    setIsDialogOpen(false);
    resetForm();
    toast.success("Course ajoutée avec succès");
  };

  const resetForm = () => {
    setFormData({
      livreurId: "",
      date: new Date().toISOString().split("T")[0],
      contactName: "",
      quartier: "",
      deliveryFee: 500,
      destinationCity: "",
      articles: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Assigner des courses aux livreurs</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type de course</Label>
                  <Select value={courseType} onValueChange={(v: any) => setCourseType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="livraison">Livraison</SelectItem>
                      <SelectItem value="expedition">Expédition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Livreur</Label>
                  <Select value={formData.livreurId} onValueChange={(v) => setFormData({ ...formData, livreurId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {livreurs.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {courseType === "livraison" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom du contact</Label>
                      <Input
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="Ex: Marie Kouassi"
                      />
                    </div>
                    <div>
                      <Label>Quartier</Label>
                      <Input
                        value={formData.quartier}
                        onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                        placeholder="Ex: Cocody"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Frais de livraison (XOF)</Label>
                    <Input
                      type="number"
                      value={formData.deliveryFee}
                      onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Articles</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addArticle}>
                        <Plus className="h-4 w-4 mr-1" /> Article
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.articles.map((article, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Nom de l'article"
                            value={article.name}
                            onChange={(e) => updateArticle(index, "name", e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Prix"
                            value={article.price}
                            onChange={(e) => updateArticle(index, "price", Number(e.target.value))}
                            className="w-32"
                          />
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeArticle(index)}>
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <Label>Ville de destination</Label>
                  <Input
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                    placeholder="Ex: Yamoussoukro"
                  />
                </div>
              )}

              <Button onClick={handleAddCourse} className="w-full">
                Créer la course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {courses.slice(0, 10).map((course) => {
          const livreur = livreurs.find(l => l.id === course.livreurId);
          return (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {course.type === "livraison" ? (
                      <Package className="h-5 w-5 text-primary" />
                    ) : (
                      <Truck className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {course.type === "livraison" 
                          ? `Livraison - ${course.livraison?.contactName}` 
                          : `Expédition - ${course.expedition?.destinationCity}`}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {livreur?.name} • {new Date(course.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={course.completed ? "delivered" : "pending"} />
                </div>
              </CardHeader>
              {course.type === "livraison" && course.livraison && (
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Quartier:</span> {course.livraison.quartier}</p>
                    <p><span className="font-medium">Articles:</span> {course.livraison.articles.length}</p>
                    <p><span className="font-medium">Frais de livraison:</span> {course.livraison.deliveryFee} XOF</p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucune course enregistrée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoursesPage;
