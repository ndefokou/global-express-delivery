import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Truck, Calendar } from "lucide-react";
import { getCourses, getCurrentUser } from "@/services/supabaseService";
import { toast } from "sonner";
import { Course } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const LivreurHistoryPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            setFilteredCourses(courses.filter(c => c.date === selectedDate));
        } else {
            setFilteredCourses(courses);
        }
    }, [selectedDate, courses]);

    const loadHistory = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                const allCourses = await getCourses();
                const myHistory = allCourses
                    .filter((c) => c.livreurId === currentUser.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setCourses(myHistory);
                setFilteredCourses(myHistory);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            toast.error("Erreur lors du chargement de l'historique");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Historique des livraisons</h1>
                    <p className="text-muted-foreground">
                        Consultez vos livraisons passées
                    </p>
                </div>

                <div className="w-full sm:w-auto">
                    <Label htmlFor="date-filter" className="sr-only">Filtrer par date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="date-filter"
                            type="date"
                            className="pl-9 w-full sm:w-[200px]"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredCourses.map((course) => (
                    <Card key={course.id}>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                            {new Date(course.date).toLocaleDateString("fr-FR", {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge
                                    status={course.completed ? "delivered" : "pending"}
                                />
                            </div>
                        </CardHeader>

                        <CardContent>
                            {course.type === "livraison" && course.livraison ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Quartier:</span>{" "}
                                            {course.livraison.quartier}
                                        </div>
                                        <div>
                                            <span className="font-medium">Frais:</span>{" "}
                                            {course.livraison.deliveryFee} XOF
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Articles</Label>
                                        <div className="grid gap-2">
                                            {course.livraison.articles.map((article) => (
                                                <div
                                                    key={article.id}
                                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
                                                >
                                                    <div>
                                                        <span className="font-medium">{article.name}</span>
                                                        <span className="text-muted-foreground ml-2">
                                                            x{article.quantity || 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${article.status === 'delivered'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {article.status === 'delivered' ? 'Livré' : 'Non livré'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                course.expedition && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Destination:</span>
                                            <span>{course.expedition.destinationCity}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Montant:</span>
                                            <span>{course.expedition.expeditionFee} XOF</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Validation:</span>
                                            <span className={course.expedition.validated ? "text-green-600" : "text-yellow-600"}>
                                                {course.expedition.validated ? "Validé" : "En attente"}
                                            </span>
                                        </div>
                                    </div>
                                )
                            )}
                        </CardContent>
                    </Card>
                ))}

                {filteredCourses.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                Aucune course trouvée {selectedDate && "pour cette date"}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default LivreurHistoryPage;
