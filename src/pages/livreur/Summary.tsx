import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, AlertTriangle, TrendingUp } from "lucide-react";
import {
  getCourses,
  getExpenses,
  getManquants,
  getCurrentUser,
} from "@/services/supabaseService";
import {
  calculateDailyRemittance,
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
  const [manquants, setManquants] = useState<any[]>([]); // Added manquants state
  const [today] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadData();
  }, [today]);

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const [coursesData, expensesData, manquantsData] = await Promise.all([
          getCourses(),
          getExpenses(),
          getManquants(), // Fetch manquants here
        ]);
        setCourses(coursesData);
        setExpenses(expensesData);
        setManquants(manquantsData); // Set manquants state
      }
    } catch (error) {
      console.error('Error loading summary:', error);
      toast.error("Erreur lors du chargement");
    }
  };

  useEffect(() => {
    if (user && courses.length > 0 && expenses.length > 0 && manquants.length > 0) { // Depend on all fetched data
      const todayCourses = courses.filter(
        (c) =>
          c.livreurId === user.id && c.date === today && isCourseCompleted(c),
      );

      const todayRevenue = todayCourses.reduce(
        (sum, c) => sum + calculateDeliveredValue(c),
        0,
      );

      const pendingExpenses = expenses.filter(
        (e) => e.livreurId === user.id && !e.validated && !e.rejectedReason,
      );

      const userManquants = manquants.filter((m) => m.livreurId === user.id);

      const todayRemittance = calculateDailyRemittance(
        user.id,
        today,
        courses,
        expenses,
      );

      // Calculate dynamic manquants for today (undelivered articles, unvalidated expenses)
      const todayDynamicManquants = detectManquants(
        user.id,
        today,
        courses,
        undefined, // No payment record yet for today
        expenses
      );

      const totalDynamicAmount = todayDynamicManquants.reduce((sum, m) => sum + m.amount, 0);
      const totalStoredAmount = userManquants.reduce((sum, m) => sum + m.amount, 0);

      setSummary({
        todayCourses: todayCourses.length,
        todayRevenue,
        todayRemittance,
        pendingExpenses: pendingExpenses.length,
        totalManquants: totalStoredAmount + totalDynamicAmount,
      });
    }
  }, []); // Empty dependency array - runs only once on mount

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Récapitulatif</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Revenus du jour
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.todayRevenue.toLocaleString()} XOF
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.todayCourses} courses effectuées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              À remettre aujourd'hui
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.todayRemittance.toLocaleString()} XOF
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Dépenses en attente
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingExpenses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Manquants</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {summary.totalManquants.toLocaleString()} XOF
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
