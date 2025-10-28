import { Outlet, NavLink } from "react-router-dom";
import { Package, Wrench, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";

const LivreurLayout = () => {
  const navItems = [
    { to: "/livreur", label: "Mes courses", icon: Package, end: true },
    { to: "/livreur/expenses", label: "Dépenses moto", icon: Wrench },
    { to: "/livreur/summary", label: "Récapitulatif", icon: FileText },
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

export default LivreurLayout;
