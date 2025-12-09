import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Download, AlertTriangle } from "lucide-react";
import {
  getLivreurs,
  getCourses,
  getManquants,
  getExpenses,
  getPayments,
} from "@/services/supabaseService";
import {
  calculateMonthlySalary,
  isCourseCompleted,
  calculateDailyFinancials,
} from "@/services/calculations";
import { toast } from "sonner";
import jsPDF from "jspdf";

const ReportsPage = () => {
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [manquants, setManquants] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedLivreur, setSelectedLivreur] = useState("");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [livreursData, coursesData, manquantsData, expensesData, paymentsData] = await Promise.all([
        getLivreurs(),
        getCourses(),
        getManquants(),
        getExpenses(),
        getPayments(),
      ]);
      setLivreurs(livreursData);
      setCourses(coursesData);
      setManquants(manquantsData);
      setExpenses(expensesData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error("Erreur lors du chargement");
    }
  };

  const generatePDF = () => {
    if (!selectedLivreur) {
      toast.error("Veuillez sélectionner un livreur");
      return;
    }

    const livreur = livreurs.find((l) => l.id === selectedLivreur);
    if (!livreur) return;

    const salary = calculateMonthlySalary(
      selectedLivreur,
      dateRange.start,
      dateRange.end,
      courses,
      manquants,
    );

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("FICHE DE PAIE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(
      `Période: ${new Date(dateRange.start).toLocaleDateString("fr-FR")} - ${new Date(dateRange.end).toLocaleDateString("fr-FR")}`,
      105,
      30,
      { align: "center" },
    );

    // Livreur info
    doc.setFontSize(14);
    doc.text("INFORMATIONS LIVREUR", 20, 50);
    doc.setFontSize(11);
    doc.text(`Nom: ${livreur.name}`, 20, 60);
    doc.text(`Téléphone: ${livreur.phone}`, 20, 68);

    // Salary breakdown
    doc.setFontSize(14);
    doc.text("DÉTAILS DU SALAIRE", 20, 85);
    doc.setFontSize(11);

    let yPos = 95;
    doc.text(`Jours travaillés: ${salary.workingDays}`, 20, yPos);
    yPos += 8;
    doc.text(`Total courses livrées: ${salary.totalCourses}`, 20, yPos);
    yPos += 8;
    doc.text(
      `Salaire de base: ${salary.baseSalary.toLocaleString()} XOF`,
      20,
      yPos,
    );
    yPos += 8;
    doc.text(
      `Commissions: ${salary.commissions.toLocaleString()} XOF`,
      20,
      yPos,
    );
    yPos += 8;
    doc.text(
      `Total manquants: ${salary.totalManquants.toLocaleString()} XOF`,
      20,
      yPos,
    );
    yPos += 12;

    // Net salary
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`SALAIRE NET: ${salary.netSalary.toLocaleString()} XOF`, 20, yPos);

    // Footer
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(
      `Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
      105,
      280,
      { align: "center" },
    );

    doc.save(
      `fiche-paie-${livreur.name.replace(/\s+/g, "-")}-${dateRange.start}.pdf`,
    );
    toast.success("Fiche de paie générée");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapports</h1>
        <p className="text-muted-foreground">
          Générer des fiches de paie et rapports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Génération de fiche de paie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Livreur</Label>
              <Select
                value={selectedLivreur}
                onValueChange={setSelectedLivreur}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un livreur" />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
            </div>

            {selectedLivreur && (
              <>
                {/* Daily Recap Section - Visible only when start date equals end date */}
                {dateRange.start === dateRange.end && (
                  <Card className="bg-secondary/50 mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Récapitulatif Journalier ({new Date(dateRange.start).toLocaleDateString("fr-FR")})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const dailyFinancials = calculateDailyFinancials(
                          selectedLivreur,
                          dateRange.start,
                          courses,
                          expenses,
                          payments
                        );

                        return (
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="bg-background">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium">Valeur articles reçus</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-lg font-bold">{dailyFinancials.totalReceived.toLocaleString()} XOF</div>
                              </CardContent>
                            </Card>

                            <Card className="bg-background">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium">Valeur articles livrés</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-lg font-bold">{dailyFinancials.totalDelivered.toLocaleString()} XOF</div>
                                <p className="text-[10px] text-muted-foreground">{dailyFinancials.courseCount} courses</p>
                              </CardContent>
                            </Card>

                            <Card className="bg-background">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium">Dépenses validées + Frais</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-lg font-bold">{dailyFinancials.totalValidatedExpenses.toLocaleString()} XOF</div>
                              </CardContent>
                            </Card>

                            <Card className="bg-primary/10 border-primary/20">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium">Montant à verser</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-lg font-bold text-primary">{dailyFinancials.amountToRemit.toLocaleString()} XOF</div>
                              </CardContent>
                            </Card>

                            <Card className="bg-background">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium">Montant versé</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-lg font-bold">{dailyFinancials.amountRemitted.toLocaleString()} XOF</div>
                              </CardContent>
                            </Card>

                            <Card className={`bg-background ${dailyFinancials.totalManquant > 0 ? "border-destructive/50" : ""}`}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-medium flex items-center gap-1">
                                  Manquants
                                  {dailyFinancials.totalManquant > 0 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-lg font-bold text-destructive">{dailyFinancials.totalManquant.toLocaleString()} XOF</div>
                                <div className="text-[10px] text-muted-foreground">
                                  Paiement: {dailyFinancials.manquantPayment.toLocaleString()} | Articles: {dailyFinancials.manquantArticles.toLocaleString()}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-secondary/50">
                  <CardContent className="pt-6">
                    {(() => {
                      const salary = calculateMonthlySalary(
                        selectedLivreur,
                        dateRange.start,
                        dateRange.end,
                        courses,
                        manquants,
                      );

                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Jours travaillés:</span>
                            <span className="font-medium">
                              {salary.workingDays}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Courses livrées:</span>
                            <span className="font-medium">
                              {salary.totalCourses}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Salaire de base:</span>
                            <span className="font-medium">
                              {salary.baseSalary.toLocaleString()} XOF
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Commissions:</span>
                            <span className="font-medium">
                              {salary.commissions.toLocaleString()} XOF
                            </span>
                          </div>
                          <div className="flex justify-between text-destructive">
                            <span>Manquants:</span>
                            <span className="font-medium">
                              -{salary.totalManquants.toLocaleString()} XOF
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Net à payer:</span>
                            <span>{salary.netSalary.toLocaleString()} XOF</span>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {(() => {
                  const salary = calculateMonthlySalary(
                    selectedLivreur,
                    dateRange.start,
                    dateRange.end,
                    courses,
                    manquants,
                  );

                  return salary.workingDays !== 25 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        La période sélectionnée contient {salary.workingDays} jours travaillés.
                        Le salaire de base nécessite exactement 25 jours travaillés.
                        {salary.workingDays < 25 && " Le livreur ne recevra que les commissions."}
                        {salary.workingDays > 25 && " Veuillez ajuster la période."}
                      </AlertDescription>
                    </Alert>
                  );
                })()}
              </>
            )}

            <Button onClick={generatePDF} className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Télécharger la fiche de paie (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résumé global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total livreurs</p>
              <p className="text-2xl font-bold">
                {livreurs.filter((l) => l.active).length}
              </p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Courses totales</p>
              <p className="text-2xl font-bold">
                {courses.filter((c) => isCourseCompleted(c)).length}
              </p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Manquants totaux</p>
              <p className="text-2xl font-bold text-destructive">
                {manquants
                  .reduce((sum, m) => sum + m.amount, 0)
                  .toLocaleString()}{" "}
                XOF
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
