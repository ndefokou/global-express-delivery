import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, AlertTriangle } from "lucide-react";
import {
  getLivreurs,
  getCourses,
  getPayments,
  getManquants,
  getExpenses,
} from "@/services/supabaseService";
import { isCourseCompleted, detectManquants } from "@/services/calculations";

const AdminDashboard = () => {
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [manquants, setManquants] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [livreursData, coursesData, paymentsData, manquantsData, expensesData] = await Promise.all([
        getLivreurs(),
        getCourses(),
        getPayments(),
        getManquants(),
        getExpenses()
      ]);
      setLivreurs(livreursData.filter((l) => l.active));
      setCourses(coursesData);
      setPayments(paymentsData);
      setManquants(manquantsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayCourses = courses.filter(
    (c) => c.date === today && isCourseCompleted(c),
  );
  const todayPayments = payments.filter((p) => p.date === today);
  const totalRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  // Calculate stored manquants
  const storedManquantsTotal = manquants.reduce((sum, m) => sum + m.amount, 0);

  // Calculate dynamic manquants for today for all livreurs
  const dynamicManquantsTotal = livreurs.reduce((sum, livreur) => {
    const dailyManquants = detectManquants(
      livreur.id,
      today,
      courses,
      undefined,
      expenses
    );
    return sum + dailyManquants.reduce((s, m) => s + m.amount, 0);
  }, 0);

  const totalManquants = storedManquantsTotal + dynamicManquantsTotal;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Vue d'ensemble de l'activité
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Livreurs actifs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {livreurs.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Courses aujourd'hui
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {todayCourses.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Revenus du jour
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold break-all">
              {totalRevenue.toLocaleString()} XOF
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Manquants totaux
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-destructive break-all">
              {totalManquants.toLocaleString()} XOF
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
