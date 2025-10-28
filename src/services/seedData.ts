import { addLivreur, addCourse } from "./storage";

export function seedDemoData() {
  // Add demo livreurs
  const livreur1 = addLivreur({
    name: "Kouadio Jean",
    phone: "+225 07 12 34 56 78",
    active: true,
  });

  const livreur2 = addLivreur({
    name: "Yao Marie",
    phone: "+225 05 98 76 54 32",
    active: true,
  });

  // Add demo courses
  const today = new Date().toISOString().split("T")[0];

  addCourse({
    type: "livraison",
    livreurId: livreur1.id,
    date: today,
    completed: false,
    livraison: {
      contactName: "Aya Koné",
      quartier: "Cocody",
      deliveryFee: 500,
      articles: [
        {
          id: "1",
          name: "Samsung Galaxy",
          price: 150000,
          status: "delivered",
        },
        {
          id: "2",
          name: "Écouteurs Bluetooth",
          price: 15000,
          status: "delivered",
        },
      ],
    },
  });

  addCourse({
    type: "expedition",
    livreurId: livreur2.id,
    date: today,
    completed: false,
    expedition: {
      destinationCity: "Yamoussoukro",
      expeditionFee: 0,
      validated: false,
    },
  });

  console.log("Demo data seeded successfully");
}
