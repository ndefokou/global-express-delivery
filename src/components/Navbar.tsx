import { Button } from "@/components/ui/button";
import { Package, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser } from "@/services/storage";
import { toast } from "sonner";

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
          <img src="/global-express-delivery.png" alt="Global Express Delivery Logo" className="h-8 w-8" />
          <span className="font-bold text-lg">Global Express</span>
          {user && (
            <span className="ml-4 text-sm text-muted-foreground">
              {user.role === "admin" ? "Administrateur" : "Livreur"}
            </span>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
