import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { getLivreurs, getCourses, getManquants, getExpenses } from "@/services/storage";
import { calculateMonthlySalary, isCourseCompleted } from "@/services/calculations";
import { toast } from "sonner";
import jsPDF from "jspdf";

const ReportsPage = () => {
  const livreurs = getLivreurs();
  const [selectedLivreur, setSelectedLivreur] = useState("");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const generatePDF = () => {
    if (!selectedLivreur) {
      toast.error("Veuillez sélectionner un livreur");
      return;
    }

    const livreur = livreurs.find(l => l.id === selectedLivreur);
    if (!livreur) return;

    const courses = getCourses();
    const manquants = getManquants();

    const salary = calculateMonthlySalary(
      selectedLivreur,
      dateRange.start,
      dateRange.end,
      courses,
      manquants
    );

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("FICHE DE PAIE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Période: ${new Date(dateRange.start).toLocaleDateString('fr-FR')} - ${new Date(dateRange.end).toLocaleDateString('fr-FR')}`, 105, 30, { align: "center" });

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
    doc.text(`Salaire de base: ${salary.baseSalary.toLocaleString()} XOF`, 20, yPos);
    yPos += 8;
    doc.text(`Commissions: ${salary.commissions.toLocaleString()} XOF`, 20, yPos);
    yPos += 8;
    doc.text(`Total manquants: ${salary.totalManquants.toLocaleString()} XOF`, 20, yPos);
    yPos += 12;

    // Net salary
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`SALAIRE NET: ${salary.netSalary.toLocaleString()} XOF`, 20, yPos);

    // Footer
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 280, { align: "center" });

    doc.save(`fiche-paie-${livreur.name.replace(/\s+/g, '-')}-${dateRange.start}.pdf`);
    toast.success("Fiche de paie générée");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapports</h1>
        <p className="text-muted-foreground">Générer des fiches de paie et rapports</p>
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
              <Select value={selectedLivreur} onValueChange={setSelectedLivreur}>
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
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div>
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>

            {selectedLivreur && (
              <Card className="bg-secondary/50">
                <CardContent className="pt-6">
                  {(() => {
                    const salary = calculateMonthlySalary(
                      selectedLivreur,
                      dateRange.start,
                      dateRange.end,
                      getCourses(),
                      getManquants()
                    );

                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Jours travaillés:</span>
                          <span className="font-medium">{salary.workingDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Courses livrées:</span>
                          <span className="font-medium">{salary.totalCourses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Salaire de base:</span>
                          <span className="font-medium">{salary.baseSalary.toLocaleString()} XOF</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Commissions:</span>
                          <span className="font-medium">{salary.commissions.toLocaleString()} XOF</span>
                        </div>
                        <div className="flex justify-between text-destructive">
                          <span>Manquants:</span>
                          <span className="font-medium">-{salary.totalManquants.toLocaleString()} XOF</span>
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
              <p className="text-2xl font-bold">{livreurs.filter(l => l.active).length}</p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Courses totales</p>
              <p className="text-2xl font-bold">
                {getCourses().filter(c => isCourseCompleted(c)).length}
              </p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Manquants totaux</p>
              <p className="text-2xl font-bold text-destructive">
                {getManquants().reduce((sum, m) => sum + m.amount, 0).toLocaleString()} XOF
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
