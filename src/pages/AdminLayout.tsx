import { Outlet, NavLink } from "react-router-dom";
import {
  Users,
  Package,
  CheckSquare,
  DollarSign,
  FileText,
  Wrench,
  Menu,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: "/admin", label: "Tableau de bord", icon: Package, end: true },
    { to: "/admin/livreurs", label: "Livreurs", icon: Users },
    { to: "/admin/courses", label: "Courses", icon: Package },
    { to: "/admin/validations", label: "Validations", icon: CheckSquare },
    { to: "/admin/payments", label: "Paiements", icon: DollarSign },
    { to: "/admin/expenses", label: "Dépenses moto", icon: Wrench },
    { to: "/admin/reports", label: "Rapports", icon: FileText },
  ];

  const NavItems = () => (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setIsOpen(false)}
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
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-card min-h-[calc(100vh-4rem)] p-4">
          <NavItems />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            asChild
            className="md:hidden fixed bottom-4 right-4 z-50"
          >
            <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <NavItems />
          </SheetContent>
        </Sheet>

        <main className="flex-1 p-4 sm:p-6 w-full md:w-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
