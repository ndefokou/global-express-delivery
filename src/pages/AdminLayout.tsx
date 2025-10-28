import { Outlet, NavLink } from "react-router-dom";
import { Users, Package, CheckSquare, DollarSign, FileText, Wrench } from "lucide-react";
import Navbar from "@/components/Navbar";

const AdminLayout = () => {
  const navItems = [
    { to: "/admin", label: "Tableau de bord", icon: Package, end: true },
    { to: "/admin/livreurs", label: "Livreurs", icon: Users },
    { to: "/admin/courses", label: "Courses", icon: Package },
    { to: "/admin/validations", label: "Validations", icon: CheckSquare },
    { to: "/admin/payments", label: "Paiements", icon: DollarSign },
    { to: "/admin/expenses", label: "Dépenses moto", icon: Wrench },
    { to: "/admin/reports", label: "Rapports", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-foreground"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
