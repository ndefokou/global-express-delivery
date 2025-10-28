import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import {
  getLivreurs,
  getPayments,
  addPayment,
  getCourses,
  getExpenses,
} from "@/services/storage";
import { calculateDailyPayable } from "@/services/calculations";
import { toast } from "sonner";

const PaymentsPage = () => {
  const [payments, setPayments] = useState(getPayments());
  const livreurs = getLivreurs().filter((l) => l.active);
  const [formData, setFormData] = useState({
    livreurId: "",
    date: new Date().toISOString().split("T")[0],
    amount: 0,
  });

  const handleDeclarePayment = () => {
    if (!formData.livreurId || formData.amount <= 0) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const courses = getCourses();
    const expenses = getExpenses();
    const expectedAmount = calculateDailyPayable(
      formData.livreurId,
      formData.date,
      courses,
      expenses,
    );

    addPayment({
      ...formData,
      expectedAmount,
    });

    setPayments(getPayments());
    setFormData({
      livreurId: "",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
    });
    toast.success("Paiement enregistré");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paiements quotidiens</h1>
        <p className="text-muted-foreground">
          Déclarer les montants reçus des livreurs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Déclarer un paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Livreur</Label>
              <Select
                value={formData.livreurId}
                onValueChange={(v) =>
                  setFormData({ ...formData, livreurId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {livreurs.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div>
              <Label>Montant reçu (XOF)</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>
          </div>

          <Button onClick={handleDeclarePayment} className="w-full mt-4">
            <DollarSign className="h-4 w-4 mr-2" />
            Enregistrer le paiement
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Historique des paiements</h2>
        <div className="space-y-3">
          {payments.slice(0, 20).map((payment) => {
            const livreur = livreurs.find((l) => l.id === payment.livreurId);
            const difference = payment.amount - payment.expectedAmount;
            const isCorrect = difference >= 0;

            return (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {livreur?.name || "Livreur inconnu"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                        <div>
                          <p className="font-bold">
                            {payment.amount.toLocaleString()} XOF
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Attendu: {payment.expectedAmount.toLocaleString()}{" "}
                            XOF
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-destructive font-medium">
                              Manque: {Math.abs(difference).toLocaleString()}{" "}
                              XOF
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {payments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun paiement enregistré</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentsPage;
