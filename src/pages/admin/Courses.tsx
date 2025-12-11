import { useState, useEffect } from "react";
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
import { Plus, Package, Truck, Pencil, Trash2, ArrowLeft, User, Calendar } from "lucide-react";
import { getCourses, addCourse, getLivreurs, updateCourse, deleteCourse } from "@/services/supabaseService";
import { toast } from "sonner";
import { Course, Article } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [selectedLivreurId, setSelectedLivreurId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, livreursData] = await Promise.all([
        getCourses(),
        getLivreurs()
      ]);
      setCourses(coursesData);
      setLivreurs(livreursData.filter((l) => l.active));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Erreur lors du chargement des données");
    }
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseType, setCourseType] = useState<"livraison" | "expedition">(
    "livraison",
  );
  const [formData, setFormData] = useState({
    livreurId: "",
    date: new Date().toISOString().split("T")[0],
    contactName: "",
    contactPhone: "",
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
        { name: "", price: 0, quantity: 1, status: "not_delivered" },
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
    let contactName = course.livraison?.contactName || course.expedition?.contactName || "";
    let contactPhone = course.livraison?.contactPhone || course.expedition?.contactPhone || "";

    // Heuristic: If name looks like a phone number (digits only, length >= 8) and phone is empty, move it
    if (!contactPhone && /^\d[\d\s]*$/.test(contactName) && contactName.replace(/\s/g, '').length >= 8) {
      contactPhone = contactName;
      contactName = "";
    }

    setFormData({
      livreurId: course.livreurId,
      date: course.date,
      contactName,
      contactPhone,
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

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette course?")) {
      try {
        await deleteCourse(courseId);
        await loadData();
        toast.success("Course supprimée avec succès");
      } catch (error: any) {
        console.error('Error deleting course:', error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleAddCourse = async () => {
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
        contactPhone: formData.contactPhone,
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
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        expeditionFee: editingCourse?.expedition?.expeditionFee || 0,
        validated: editingCourse?.expedition?.validated || false,
      };
    }

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData);
        toast.success("Course modifiée avec succès");
      } else {
        await addCourse(courseData);
        toast.success("Course ajoutée avec succès");
      }

      await loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error.message || "Erreur lors de l'enregistrement");
    }
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      livreurId: selectedLivreurId || "",
      date: new Date().toISOString().split("T")[0],
      contactName: "",
      contactPhone: "",
      quartier: "",
      deliveryFee: 0,
      destinationCity: "",
      articles: [],
    });
  };

  // Group courses by date
  const getGroupedCourses = () => {
    if (!selectedLivreurId) return {};

    const livreurCourses = courses
      .filter(c => c.livreurId === selectedLivreurId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const grouped: { [key: string]: Course[] } = {};

    livreurCourses.forEach(course => {
      if (!grouped[course.date]) {
        grouped[course.date] = [];
      }
      grouped[course.date].push(course);
    });

    return grouped;
  };

  const groupedCourses = getGroupedCourses();
  const sortedDates = Object.keys(groupedCourses).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  const selectedLivreur = livreurs.find(l => l.id === selectedLivreurId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {selectedLivreurId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedLivreurId(null)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {selectedLivreurId ? `Courses - ${selectedLivreur?.name}` : "Courses"}
            </h1>
            <p className="text-muted-foreground">
              {selectedLivreurId
                ? "Gérer les courses du livreur"
                : "Sélectionnez un livreur pour voir ses courses"}
            </p>
          </div>
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
                    disabled={!!selectedLivreurId && !editingCourse}
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
                        placeholder="Ex: John"
                      />
                    </div>
                    <div>
                      <Label>Contact (Téléphone)</Label>
                      <Input
                        value={formData.contactPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPhone: e.target.value,
                          })
                        }
                        placeholder="Ex: 699..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Quartier</Label>
                      <Input
                        value={formData.quartier}
                        onChange={(e) =>
                          setFormData({ ...formData, quartier: e.target.value })
                        }
                        placeholder="Ex:Nkolbisson"
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
                  <div className="grid grid-cols-2 gap-4 mb-4">
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
                        placeholder="Ex: John"
                      />
                    </div>
                    <div>
                      <Label>Contact (Téléphone)</Label>
                      <Input
                        value={formData.contactPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPhone: e.target.value,
                          })
                        }
                        placeholder="Ex: 699..."
                      />
                    </div>
                  </div>
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

      {!selectedLivreurId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {livreurs.map((livreur) => {
            const livreurCourses = courses.filter(c => c.livreurId === livreur.id);
            const activeCourses = livreurCourses.filter(c => !c.completed).length;

            return (
              <Card
                key={livreur.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedLivreurId(livreur.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold">{livreur.name}</CardTitle>
                  <User className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mt-2">
                    <div className="flex justify-between">
                      <span>Courses actives:</span>
                      <span className="font-medium text-foreground">{activeCourses}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Total courses:</span>
                      <span className="font-medium text-foreground">{livreurCourses.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Aucune course trouvée pour ce livreur
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedDates.map(date => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <h3 className="font-medium">
                    {new Date(date).toLocaleDateString("fr-FR", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                </div>

                <div className="grid gap-4">
                  {groupedCourses[date].map((course) => (
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
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
