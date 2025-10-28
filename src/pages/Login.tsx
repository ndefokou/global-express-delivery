import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCog, Bike } from "lucide-react";
import { getLivreurs, setCurrentUser } from "@/services/storage";
import { toast } from "sonner";
import { Livreur } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Login = () => {
  const navigate = useNavigate();
  const [isLivreurDialogOpen, setIsLivreurDialogOpen] = useState(false);
  const livreurs = getLivreurs().filter((l) => l.active);

  const handleAdminLogin = () => {
    setCurrentUser({
      id: `admin-${Date.now()}`,
      name: "Admin",
      role: "admin",
    });
    toast.success("Connecté en tant qu'Administrateur");
    navigate("/admin");
  };

  const handleLivreurSelect = (livreur: Livreur) => {
    setCurrentUser({
      id: livreur.id,
      name: livreur.name,
      role: "livreur",
    });
    toast.success(`Connecté en tant que ${livreur.name}`);
    setIsLivreurDialogOpen(false);
    navigate("/livreur");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <img
              src="/global-express-delivery.png"
              alt="Global Express Delivery Logo"
              className="h-8 w-8 sm:h-12 sm:w-12"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Global Express Delivery
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Système de gestion des livraisons
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <Card
            className="border-2 hover:border-primary transition-all cursor-pointer group"
            onClick={handleAdminLogin}
          >
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-2 sm:p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <UserCog className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl">
                  Administrateur
                </CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm md:text-base">
                Gérer les livreurs, assigner les courses, valider les retours et
                suivre les paiements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Button className="w-full" size="lg">
                <span className="text-sm sm:text-base">
                  Se connecter en tant qu'Admin
                </span>
              </Button>
            </CardContent>
          </Card>

          <Dialog
            open={isLivreurDialogOpen}
            onOpenChange={setIsLivreurDialogOpen}
          >
            <DialogTrigger asChild>
              <Card className="border-2 hover:border-primary transition-all cursor-pointer group">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="p-2 sm:p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Bike className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl">
                      Livreur
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm md:text-base">
                    Consulter vos courses quotidiennes, marquer les livraisons
                    et gérer vos dépenses
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <Button className="w-full" size="lg">
                    <span className="text-sm sm:text-base">
                      Se connecter en tant que Livreur
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Qui se connecte ?</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-2 pt-4 pr-4">
                  {livreurs.length > 0 ? (
                    livreurs.map((livreur) => (
                      <Button
                        key={livreur.id}
                        variant="outline"
                        className="w-full justify-start p-4 h-auto"
                        onClick={() => handleLivreurSelect(livreur)}
                      >
                        <Bike className="h-5 w-5 mr-3 flex-shrink-0" />
                        <div className="text-left">
                          <p className="font-semibold text-sm sm:text-base">
                            {livreur.name}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {livreur.phone}
                          </p>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      Aucun livreur actif. Veuillez en ajouter un depuis le
                      panneau admin.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Login;
