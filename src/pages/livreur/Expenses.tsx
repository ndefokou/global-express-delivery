import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Wrench } from "lucide-react";
import { getExpenses, addExpense, getCurrentUser } from "@/services/supabaseService";
import { toast } from "sonner";
import { Expense } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const LivreurExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [user, setUser] = useState(getCurrentUser());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    amount: number | string;
    description: string;
    date: string;
  }>({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const allExpenses = getExpenses();
      setExpenses(allExpenses.filter((e) => e.livreurId === currentUser.id));
    }
  }, []);

  const handleSubmit = () => {
    if (!formData.description || !formData.amount || Number(formData.amount) <= 0) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    addExpense({
      livreurId: user!.id,
      amount: Number(formData.amount),
      description: formData.description,
      date: formData.date,
      validated: false,
    });

    setExpenses(getExpenses().filter((e) => e.livreurId === user?.id));
    setFormData({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(false);
    toast.success("Dépense enregistrée");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dépenses moto</h1>
          <p className="text-muted-foreground">Gérer vos frais de réparation</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle dépense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer une dépense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Montant (XOF)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="Ex: 5000"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Ex: Changement de pneu"
                  rows={3}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">
                      {expense.description}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  status={
                    expense.validated
                      ? "validated"
                      : expense.rejectedReason
                        ? "rejected"
                        : "pending"
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {expense.amount.toLocaleString()} XOF
              </p>
              {expense.rejectedReason && (
                <p className="mt-2 text-sm text-destructive">
                  <span className="font-medium">Raison du rejet:</span>{" "}
                  {expense.rejectedReason}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {expenses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucune dépense enregistrée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LivreurExpensesPage;
