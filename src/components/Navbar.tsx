import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser } from "@/services/storage";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    setCurrentUser(null);
    toast.success("Déconnecté avec succès");
    navigate("/");
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/global-express-delivery.png"
            alt="Global Express Delivery Logo"
            className="h-6 w-6 sm:h-8 sm:w-8"
          />
          <span className="font-bold text-base sm:text-lg">Global Express</span>
          {user && (
            <span className="hidden sm:inline ml-4 text-sm text-muted-foreground">
              {user.role === "admin" ? "Administrateur" : "Livreur"}
            </span>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-0 sm:mr-2" />
          <span className="hidden sm:inline">Déconnexion</span>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
