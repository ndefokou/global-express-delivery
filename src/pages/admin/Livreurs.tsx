import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, UserCheck, UserX, Lock } from "lucide-react";
import {
  getLivreurs,
  addLivreur,
  updateLivreur,
  deleteLivreur,
} from "@/services/supabaseService";
import { toast } from "sonner";
import { Livreur } from "@/types";

const LivreursPage = () => {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", password: "" });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedLivreurId, setSelectedLivreurId] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    loadLivreurs();
  }, []);

  const loadLivreurs = async () => {
    try {
      const data = await getLivreurs();
      setLivreurs(data);
    } catch (error) {
      console.error('Error loading livreurs:', error);
      toast.error("Erreur lors du chargement des livreurs");
    }
  };

  const handleAddLivreur = async () => {
    if (!formData.name || !formData.phone || !formData.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      await addLivreur({ ...formData, active: true });
      await loadLivreurs();
      setFormData({ name: "", phone: "", password: "" });
      setIsDialogOpen(false);
      toast.success("Livreur ajouté avec succès");
    } catch (error: any) {
      console.error('Error adding livreur:', error);
      toast.error(error.message || "Erreur lors de l'ajout du livreur");
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateLivreur(id, { active: !currentActive });
      await loadLivreurs();
      toast.success(currentActive ? "Livreur désactivé" : "Livreur activé");
    } catch (error: any) {
      console.error('Error toggling livreur:', error);
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce livreur ?")) {
      try {
        await deleteLivreur(id);
        await loadLivreurs();
        toast.success("Livreur supprimé");
      } catch (error: any) {
        console.error('Error deleting livreur:', error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      toast.error("Veuillez entrer un mot de passe");
      return;
    }

    try {
      await updateLivreur(selectedLivreurId, { password: newPassword });
      await loadLivreurs();
      setNewPassword("");
      setSelectedLivreurId("");
      setIsPasswordDialogOpen(false);
      toast.success("Mot de passe modifié avec succès");
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error("Erreur lors de la modification du mot de passe");
    }
  };

  const openPasswordDialog = (id: string) => {
    setSelectedLivreurId(id);
    setNewPassword("");
    setIsPasswordDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Gestion des livreurs
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ajouter et gérer vos livreurs
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Ajouter un livreur</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau livreur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Ex: +225 07 XX XX XX XX"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Mot de passe pour se connecter"
                />
              </div>
              <Button onClick={handleAddLivreur} className="w-full">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {livreurs.map((livreur) => (
          <Card key={livreur.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg truncate">
                    {livreur.name}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">
                    {livreur.phone}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge
                    variant={livreur.active ? "default" : "secondary"}
                    className="text-xs whitespace-nowrap"
                  >
                    {livreur.active ? "Actif" : "Inactif"}
                  </Badge>
                  {!livreur.password && (
                    <Badge variant="destructive" className="text-xs whitespace-nowrap">
                      Sans MDP
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(livreur.id, livreur.active)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    {livreur.active ? (
                      <>
                        <UserX className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />{" "}
                        <span className="hidden sm:inline">Désactiver</span>
                        <span className="sm:hidden">Désact.</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />{" "}
                        <span className="hidden sm:inline">Activer</span>
                        <span className="sm:hidden">Act.</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(livreur.id)}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openPasswordDialog(livreur.id)}
                  className="w-full text-xs sm:text-sm"
                >
                  {livreur.password ? "Changer le mot de passe" : "Définir un mot de passe"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {livreurs.length === 0 && (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              Aucun livreur enregistré
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
                placeholder="Entrez le nouveau mot de passe"
                autoFocus
              />
            </div>
            <Button onClick={handleChangePassword} className="w-full">
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LivreursPage;
