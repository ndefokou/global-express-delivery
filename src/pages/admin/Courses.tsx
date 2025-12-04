import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Package, Truck, Pencil, Trash2 } from "lucide-react";
import { getCourses, addCourse, getLivreurs, updateCourse, deleteCourse } from "@/services/storage";
import { toast } from "sonner";
import { Course, Article } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>(getCourses());
  const livreurs = getLivreurs().filter((l) => l.active);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [filterDate, setFilterDate] = useState<string>("");
  const [courseType, setCourseType] = useState<"livraison" | "expedition">(
    "livraison",
  );
  const [formData, setFormData] = useState({
    livreurId: "",
    date: new Date().toISOString().split("T")[0],
    contactName: "",
    quartier: "",
    deliveryFee: 0,
    destinationCity: "",
    articles: [] as Omit<Article, "id">[],
  });

  // Calculate total invoice: sum of (articles × quantity) + admin-entered delivery fee
  const calculateTotalInvoice = () => {
    const articlesTotal = formData.articles.reduce((sum, a) => sum + ((a.price || 0) * (a.quantity || 1)), 0);
    return articlesTotal + (formData.deliveryFee || 0);
  };

  const addArticle = () => {
    setFormData({
      ...formData,
      articles: [
        ...formData.articles,
        { name: "", price: 0, quantity: 1, status: "delivered" },
      ],
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

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseType(course.type);
    setFormData({
      livreurId: course.livreurId,
      date: course.date,
      contactName: course.livraison?.contactName || "",
      quartier: course.livraison?.quartier || "",
      deliveryFee: course.livraison?.deliveryFee || 0,
      destinationCity: course.expedition?.destinationCity || "",
      articles: course.livraison?.articles.map(a => ({
        name: a.name,
        price: a.price,
        quantity: a.quantity || 1,
        status: a.status,
        reason: a.reason
      })) || [],
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette course?")) {
      deleteCourse(courseId);
      setCourses(getCourses());
      toast.success("Course supprimée avec succès");
    }
  };

  const handleAddCourse = () => {
    if (!formData.livreurId) {
      toast.error("Veuillez sélectionner un livreur");
      return;
    }

    const courseData: Omit<Course, "id"> = {
      type: courseType,
      livreurId: formData.livreurId,
      date: formData.date,
      completed: editingCourse?.completed || false,
    };

    if (courseType === "livraison") {
      if (
        !formData.contactName ||
        !formData.quartier ||
        formData.articles.length === 0
      ) {
        toast.error("Veuillez remplir tous les champs de livraison");
        return;
      }
      courseData.livraison = {
        contactName: formData.contactName,
        quartier: formData.quartier,
        deliveryFee: formData.deliveryFee,
        articles: formData.articles.map((a, i) => ({
          ...a,
          id: editingCourse?.livraison?.articles[i]?.id || `${Date.now()}-${i}`,
        })),
      };
    } else {
      if (!formData.destinationCity) {
        toast.error("Veuillez spécifier la ville de destination");
        return;
      }
      courseData.expedition = {
        destinationCity: formData.destinationCity,
        expeditionFee: editingCourse?.expedition?.expeditionFee || 0,
        validated: editingCourse?.expedition?.validated || false,
      };
    }

    if (editingCourse) {
      updateCourse(editingCourse.id, courseData);
      toast.success("Course modifiée avec succès");
    } else {
      addCourse(courseData);
      toast.success("Course ajoutée avec succès");
    }

    setCourses(getCourses());
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      livreurId: "",
      date: new Date().toISOString().split("T")[0],
      contactName: "",
      quartier: "",
      deliveryFee: 0,
      destinationCity: "",
      articles: [],
    });
  };

  // Filter and sort courses
  const getFilteredAndSortedCourses = () => {
    let filtered = courses;

    // Filter by date if a date is selected
    if (filterDate) {
      filtered = filtered.filter(course => course.date === filterDate);
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const filteredCourses = getFilteredAndSortedCourses();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">
            Assigner des courses aux livreurs
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Modifier la course" : "Nouvelle course"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type de course</Label>
                  <Select
                    value={courseType}
                    onValueChange={(v: any) => setCourseType(v)}
                  >
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
                  <Select
                    value={formData.livreurId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, livreurId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {livreurs.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
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
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              {courseType === "livraison" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom du contact</Label>
                      <Input
                        value={formData.contactName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactName: e.target.value,
                          })
                        }
                        placeholder="Ex: Marie Kouassi"
                      />
                    </div>
                    <div>
                      <Label>Quartier</Label>
                      <Input
                        value={formData.quartier}
                        onChange={(e) =>
                          setFormData({ ...formData, quartier: e.target.value })
                        }
                        placeholder="Ex: Cocody"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Frais de livraison (XOF)</Label>
                    <Input
                      type="number"
                      value={formData.deliveryFee || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryFee: e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                      placeholder="Entrez les frais de livraison"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Articles</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addArticle}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Article
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.articles.map((article, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Nom de l'article"
                              value={article.name}
                              onChange={(e) =>
                                updateArticle(index, "name", e.target.value)
                              }
                              className="flex-1"
                            />
                            <div className="w-24">
                              <Input
                                type="number"
                                placeholder="Prix"
                                value={article.price || ""}
                                onChange={(e) =>
                                  updateArticle(
                                    index,
                                    "price",
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                  )
                                }
                              />
                            </div>
                            <div className="w-20">
                              <Input
                                type="number"
                                min="1"
                                placeholder="Qté"
                                value={article.quantity || 1}
                                onChange={(e) =>
                                  updateArticle(
                                    index,
                                    "quantity",
                                    e.target.value === "" ? 1 : Number(e.target.value),
                                  )
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeArticle(index)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.articles.length > 0 && (
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total articles:</span>
                          <span className="font-medium">
                            {formData.articles.reduce((sum, a) => sum + ((a.price || 0) * (a.quantity || 1)), 0)} XOF
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Frais de livraison:</span>
                          <span className="font-medium">{formData.deliveryFee || 0} XOF</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-semibold">Facture totale:</span>
                          <span className="font-bold text-lg text-primary">
                            {calculateTotalInvoice()} XOF
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <Label>Ville de destination</Label>
                  <Input
                    value={formData.destinationCity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destinationCity: e.target.value,
                      })
                    }
                    placeholder="Ex: Yamoussoukro"
                  />
                </div>
              )}

              <Button onClick={handleAddCourse} className="w-full">
                {editingCourse ? "Modifier la course" : "Créer la course"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Filtrer par date</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder="Sélectionner une date"
              />
            </div>
            {filterDate && (
              <Button
                variant="outline"
                onClick={() => setFilterDate("")}
                className="mt-6"
              >
                Afficher toutes les courses
              </Button>
            )}
            <div className="text-sm text-muted-foreground mt-6">
              {filterDate
                ? `${filteredCourses.length} course(s) le ${new Date(filterDate).toLocaleDateString("fr-FR")}`
                : `${filteredCourses.length} course(s) au total`}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredCourses.map((course) => {
          const livreur = livreurs.find((l) => l.id === course.livreurId);
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
                        {livreur?.name} •{" "}
                        {new Date(course.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={course.completed ? "delivered" : "pending"}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {course.type === "livraison" && course.livraison && (
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p>
                      <span className="font-medium">Quartier:</span>{" "}
                      {course.livraison.quartier}
                    </p>
                    <p>
                      <span className="font-medium">Articles:</span>{" "}
                      {course.livraison.articles.length}
                    </p>
                    <p>
                      <span className="font-medium">Frais de livraison:</span>{" "}
                      {course.livraison.deliveryFee} XOF
                    </p>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total client:</span>
                        <span className="font-bold text-primary">
                          {course.livraison.articles.reduce((sum, a) => sum + ((a.price || 0) * (a.quantity || 1)), 0) + (course.livraison.deliveryFee || 0)} XOF
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Articles: {course.livraison.articles.reduce((sum, a) => sum + ((a.price || 0) * (a.quantity || 1)), 0)} XOF + Livraison: {course.livraison.deliveryFee || 0} XOF)
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {filterDate
                ? `Aucune course enregistrée pour le ${new Date(filterDate).toLocaleDateString("fr-FR")}`
                : "Aucune course enregistrée"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoursesPage;
