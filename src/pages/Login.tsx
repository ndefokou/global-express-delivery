import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, UserCog, Bike } from "lucide-react";
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

const Login = () => {
  const navigate = useNavigate();
  const [isLivreurDialogOpen, setIsLivreurDialogOpen] = useState(false);
  const livreurs = getLivreurs().filter(l => l.active);

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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/global-express-delivery.png" alt="Global Express Delivery Logo" className="h-12 w-12" />
            <h1 className="text-4xl font-bold text-foreground">Global Express Delivery</h1>
          </div>
          <p className="text-muted-foreground text-lg">Système de gestion des livraisons</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 hover:border-primary transition-all cursor-pointer group"
                onClick={handleAdminLogin}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <UserCog className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Administrateur</CardTitle>
              </div>
              <CardDescription className="text-base">
                Gérer les livreurs, assigner les courses, valider les retours et suivre les paiements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Se connecter en tant qu'Admin
              </Button>
            </CardContent>
          </Card>

          <Dialog open={isLivreurDialogOpen} onOpenChange={setIsLivreurDialogOpen}>
            <DialogTrigger asChild>
              <Card className="border-2 hover:border-primary transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Bike className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">Livreur</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Consulter vos courses quotidiennes, marquer les livraisons et gérer vos dépenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg">
                    Se connecter en tant que Livreur
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Qui se connecte ?</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 pt-4">
                {livreurs.length > 0 ? (
                  livreurs.map((livreur) => (
                    <Button
                      key={livreur.id}
                      variant="outline"
                      className="w-full justify-start p-4 h-auto"
                      onClick={() => handleLivreurSelect(livreur)}
                    >
                      <Bike className="h-5 w-5 mr-3" />
                      <div>
                        <p className="font-semibold">{livreur.name}</p>
                        <p className="text-sm text-muted-foreground">{livreur.phone}</p>
                      </div>
                    </Button>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun livreur actif. Veuillez en ajouter un depuis le panneau admin.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Login;
