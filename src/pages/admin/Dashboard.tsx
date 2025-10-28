import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, AlertTriangle } from "lucide-react";
import { getLivreurs, getCourses, getPayments, getManquants } from "@/services/storage";
import { isCourseCompleted } from "@/services/calculations";

const AdminDashboard = () => {
  const livreurs = getLivreurs().filter(l => l.active);
  const courses = getCourses();
  const payments = getPayments();
  const manquants = getManquants();

  const today = new Date().toISOString().split("T")[0];
  const todayCourses = courses.filter(c => c.date === today && isCourseCompleted(c));
  const todayPayments = payments.filter(p => p.date === today);
  const totalRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalManquants = manquants.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de l'activité</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Livreurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{livreurs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses aujourd'hui</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCourses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus du jour</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} XOF</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Manquants totaux</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalManquants.toLocaleString()} XOF</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
