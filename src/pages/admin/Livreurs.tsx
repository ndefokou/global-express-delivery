import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { getLivreurs, addLivreur, updateLivreur, deleteLivreur } from "@/services/storage";
import { toast } from "sonner";
import { Livreur } from "@/types";

const LivreursPage = () => {
  const [livreurs, setLivreurs] = useState<Livreur[]>(getLivreurs());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  const handleAddLivreur = () => {
    if (!formData.name || !formData.phone) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    addLivreur({ ...formData, active: true });
    setLivreurs(getLivreurs());
    setFormData({ name: "", phone: "" });
    setIsDialogOpen(false);
    toast.success("Livreur ajouté avec succès");
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateLivreur(id, { active: !currentActive });
    setLivreurs(getLivreurs());
    toast.success(currentActive ? "Livreur désactivé" : "Livreur activé");
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce livreur ?")) {
      deleteLivreur(id);
      setLivreurs(getLivreurs());
      toast.success("Livreur supprimé");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des livreurs</h1>
          <p className="text-muted-foreground">Ajouter et gérer vos livreurs</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un livreur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau livreur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ex: +225 07 XX XX XX XX"
                />
              </div>
              <Button onClick={handleAddLivreur} className="w-full">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {livreurs.map((livreur) => (
          <Card key={livreur.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{livreur.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{livreur.phone}</p>
                </div>
                <Badge variant={livreur.active ? "default" : "secondary"}>
                  {livreur.active ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(livreur.id, livreur.active)}
                  className="flex-1"
                >
                  {livreur.active ? (
                    <><UserX className="h-4 w-4 mr-1" /> Désactiver</>
                  ) : (
                    <><UserCheck className="h-4 w-4 mr-1" /> Activer</>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(livreur.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {livreurs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun livreur enregistré</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LivreursPage;
