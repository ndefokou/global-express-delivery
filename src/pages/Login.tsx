import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCog, Bike, Lock, Loader2 } from "lucide-react";
import { getLivreurs } from "@/services/supabaseService";
import { signInAdmin, signInLivreur } from "@/services/supabaseService";
import { toast } from "sonner";
import { Livreur } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PWAInstallButton } from "@/components/PWAInstallButton";

const Login = () => {
  const navigate = useNavigate();
  const [isLivreurDialogOpen, setIsLivreurDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [selectedLivreur, setSelectedLivreur] = useState<Livreur | null>(null);
  const [livreurPassword, setLivreurPassword] = useState("");
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [isLoadingLivreurs, setIsLoadingLivreurs] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Load livreurs when dialog opens
  useEffect(() => {
    if (isLivreurDialogOpen) {
      loadLivreurs();
    }
  }, [isLivreurDialogOpen]);

  const loadLivreurs = async () => {
    setIsLoadingLivreurs(true);
    try {
      const allLivreurs = await getLivreurs();
      setLivreurs(allLivreurs.filter((l) => l.active));
    } catch (error) {
      console.error('Error loading livreurs:', error);
      toast.error("Erreur lors du chargement des livreurs");
    } finally {
      setIsLoadingLivreurs(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminPassword) {
      toast.error("Veuillez entrer le mot de passe");
      return;
    }

    setIsLoggingIn(true);
    try {
      await signInAdmin(adminPassword);
      toast.success("Connecté en tant qu'Administrateur");
      setAdminPassword("");
      setIsAdminDialogOpen(false);
      // Use setTimeout to ensure dialog closes before navigation
      setTimeout(() => navigate("/admin"), 100);
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.message || "Mot de passe incorrect");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLivreurLogin = async () => {
    if (!selectedLivreur) {
      toast.error("Veuillez sélectionner un livreur");
      return;
    }

    if (!livreurPassword) {
      toast.error("Veuillez entrer le mot de passe");
      return;
    }

    setIsLoggingIn(true);
    try {
      await signInLivreur(selectedLivreur.id, livreurPassword);
      toast.success(`Connecté en tant que ${selectedLivreur.name}`);
      setSelectedLivreur(null);
      setLivreurPassword("");
      setIsLivreurDialogOpen(false);
      // Use setTimeout to ensure dialog closes before navigation
      setTimeout(() => navigate("/livreur"), 100);
    } catch (error: any) {
      console.error('Livreur login error:', error);
      toast.error(error.message || "Mot de passe incorrect");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLivreurSelect = (livreur: Livreur) => {
    setSelectedLivreur(livreur);
    setLivreurPassword("");
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
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-4">
            Système de gestion des livraisons
          </p>
          <div className="flex justify-center">
            <PWAInstallButton />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
            <DialogTrigger asChild>
              <Card className="border-2 hover:border-primary transition-all cursor-pointer group">
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
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Connexion Administrateur</DialogTitle>
                <DialogDescription>
                  Entrez votre mot de passe pour accéder au panneau d'administration.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="admin-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                      placeholder="Entrez le mot de passe"
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </div>
                <Button onClick={handleAdminLogin} className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isLivreurDialogOpen}
            onOpenChange={(open) => {
              setIsLivreurDialogOpen(open);
              if (!open) {
                setSelectedLivreur(null);
                setLivreurPassword("");
              }
            }}
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
                <DialogTitle>
                  {selectedLivreur ? "Entrez votre mot de passe" : "Qui se connecte ?"}
                </DialogTitle>
                <DialogDescription>
                  {selectedLivreur
                    ? "Veuillez saisir votre mot de passe pour continuer."
                    : "Sélectionnez votre profil dans la liste ci-dessous."}
                </DialogDescription>
              </DialogHeader>

              {!selectedLivreur ? (
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-2 pt-4 pr-4">
                    {isLoadingLivreurs ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : livreurs.length > 0 ? (
                      livreurs.map((livreur) => (
                        <Button
                          key={livreur.id}
                          variant="outline"
                          className="w-full justify-start p-4 h-auto"
                          onClick={() => handleLivreurSelect(livreur)}
                        >
                          <Bike className="h-5 w-5 mr-3 flex-shrink-0" />
                          <div className="text-left flex-1">
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
              ) : (
                <div className="space-y-4 pt-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">{selectedLivreur.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedLivreur.phone}</p>
                  </div>
                  <div>
                    <Label htmlFor="livreur-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="livreur-password"
                        type="password"
                        value={livreurPassword}
                        onChange={(e) => setLivreurPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLivreurLogin()}
                        placeholder="Entrez votre mot de passe"
                        className="pl-10"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedLivreur(null);
                        setLivreurPassword("");
                      }}
                      className="flex-1"
                      disabled={isLoggingIn}
                    >
                      Retour
                    </Button>
                    <Button onClick={handleLivreurLogin} className="flex-1" disabled={isLoggingIn}>
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        "Se connecter"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Login;
