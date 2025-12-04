import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Wrench } from "lucide-react";
import { getExpenses, updateExpense, getLivreurs } from "@/services/storage";
import { toast } from "sonner";
import { Expense } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const AdminExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const livreurs = getLivreurs();

  useEffect(() => {
    setExpenses(getExpenses());
  }, []);

  const handleValidate = (id: string) => {
    updateExpense(id, { validated: true, rejectedReason: undefined });
    setExpenses(getExpenses());
    toast.success("Dépense validée");
  };

  const handleReject = (id: string) => {
    const reason = prompt("Raison du rejet:");
    if (!reason) return;

    updateExpense(id, {
      validated: false,
      rejectedReason: reason,
      rejectedAt: new Date().toISOString()
    });
    setExpenses(getExpenses());
    toast.success("Dépense rejetée");
  };

  const pendingExpenses = expenses.filter(
    (e) => !e.validated && !e.rejectedReason,
  );
  const validatedExpenses = expenses.filter((e) => e.validated);
  const rejectedExpenses = expenses.filter((e) => e.rejectedReason);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dépenses moto</h1>
        <p className="text-muted-foreground">
          Valider ou rejeter les dépenses des livreurs
        </p>
      </div>

      {pendingExpenses.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">En attente de validation</h2>
          <div className="space-y-3">
            {pendingExpenses.map((expense) => {
              const livreur = livreurs.find((l) => l.id === expense.livreurId);
              return (
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
                            {livreur?.name} •{" "}
                            {new Date(expense.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status="pending" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-bold">
                        {expense.amount.toLocaleString()} XOF
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleValidate(expense.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(expense.id)}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {validatedExpenses.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Validées</h2>
          <div className="space-y-3">
            {validatedExpenses.slice(0, 5).map((expense) => {
              const livreur = livreurs.find((l) => l.id === expense.livreurId);
              return (
                <Card key={expense.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {livreur?.name} •{" "}
                          {new Date(expense.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {expense.amount.toLocaleString()} XOF
                        </p>
                        <StatusBadge status="validated" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {rejectedExpenses.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Rejetées</h2>
          <div className="space-y-3">
            {rejectedExpenses.slice(0, 5).map((expense) => {
              const livreur = livreurs.find((l) => l.id === expense.livreurId);
              return (
                <Card key={expense.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {livreur?.name} •{" "}
                          {new Date(expense.date).toLocaleDateString("fr-FR")}
                        </p>
                        <p className="text-sm text-destructive mt-1">
                          Raison: {expense.rejectedReason}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {expense.amount.toLocaleString()} XOF
                        </p>
                        <StatusBadge status="rejected" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

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

export default AdminExpensesPage;
