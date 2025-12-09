import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, AlertTriangle, TrendingUp } from "lucide-react";
import {
  getCourses,
  getExpenses,
  getPayments,
  getManquants,
  getCurrentUser,
} from "@/services/supabaseService";
import {
  calculateDailyRemittance,
  calculateDailyFinancials,
  isCourseCompleted,
  calculateDeliveredValue,
  detectManquants,
  CONSTANTS,
} from "@/services/calculations";
import { toast } from "sonner";

const LivreurSummaryPage = () => {
  const [summary, setSummary] = useState({
    todayCourses: 0,
    todayRevenue: 0,
    todayRemittance: 0,
    pendingExpenses: 0,
    totalManquants: 0,
  });

  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [manquants, setManquants] = useState<any[]>([]);
  const [today] = useState(new Date().toISOString().split("T")[0]);
  const [financials, setFinancials] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [today]);

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const [coursesData, expensesData, paymentsData, manquantsData] = await Promise.all([
          getCourses(),
          getExpenses(),
          getPayments(),
          getManquants(),
        ]);
        setCourses(coursesData);
        setExpenses(expensesData);
        setPayments(paymentsData);
        setManquants(manquantsData);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
      toast.error("Erreur lors du chargement");
    }
  };

  useEffect(() => {
    if (user && courses.length >= 0 && expenses.length >= 0) {
      const dailyFinancials = calculateDailyFinancials(
        user.id,
        today,
        courses,
        expenses,
        payments
      );
      setFinancials(dailyFinancials);

      // Stored manquants from database (historical)
      const userManquants = manquants.filter((m) => m.livreurId === user.id);
      const totalStoredAmount = userManquants.reduce((sum, m) => sum + m.amount, 0);

      setSummary({
        todayCourses: dailyFinancials.courseCount,
        todayRevenue: dailyFinancials.totalDelivered,
        todayRemittance: dailyFinancials.amountToRemit,
        pendingExpenses: expenses.filter(e => e.livreurId === user.id && !e.validated && !e.rejectedReason).length,
        totalManquants: totalStoredAmount + dailyFinancials.totalManquant,
      });
    }
  }, [user, courses, expenses, payments, manquants, today]);

  if (!financials) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Récapitulatif Journalier</h1>
        <p className="text-muted-foreground">
          Vue détaillée de votre activité du {new Date(today).toLocaleDateString("fr-FR")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valeur articles reçus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financials.totalReceived.toLocaleString()} XOF</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valeur articles livrés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financials.totalDelivered.toLocaleString()} XOF</div>
            <p className="text-xs text-muted-foreground">{financials.courseCount} courses effectuées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dépenses validées + Frais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financials.totalValidatedExpenses.toLocaleString()} XOF</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Montant à verser </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{financials.amountToRemit.toLocaleString()} XOF</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Montant versé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financials.amountRemitted.toLocaleString()} XOF</div>
          </CardContent>
        </Card>

        <Card className={financials.totalManquant > 0 ? "bg-destructive/10 border-destructive/20" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Manquants du jour
              {financials.totalManquant > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{financials.totalManquant.toLocaleString()} XOF</div>
            <div className="text-xs text-muted-foreground space-y-1 mt-1">
              <p>Manque paiement: {financials.manquantPayment.toLocaleString()} XOF</p>
              <p>Articles non livrés/retournés: {financials.manquantArticles.toLocaleString()} XOF</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Information sur le salaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p>
              <span className="font-medium">Coût fixe journalier:</span>{" "}
              {CONSTANTS.FIXED_DAILY_COST.toLocaleString()} XOF
            </p>
            <p>
              <span className="font-medium">
                Salaire de base (≥25 jours travaillés):
              </span>
            </p>
            <ul className="ml-6 list-disc">
              <li>
                &gt;{CONSTANTS.COURSES_THRESHOLD} courses:{" "}
                {CONSTANTS.BASE_SALARY_HIGH.toLocaleString()} XOF
              </li>
              <li>
                ≤{CONSTANTS.COURSES_THRESHOLD} courses:{" "}
                {CONSTANTS.BASE_SALARY_LOW.toLocaleString()} XOF
              </li>
            </ul>
            <p>
              <span className="font-medium">Commission par course:</span>{" "}
              {CONSTANTS.COMMISSION_PER_COURSE} XOF
            </p>
            <p>
              <span className="font-medium">Frais d'expédition standard:</span>{" "}
              {CONSTANTS.EXPEDITION_FEE} XOF
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivreurSummaryPage;
