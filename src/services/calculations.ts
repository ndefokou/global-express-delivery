import { Course, Expense, DailyPayment, Manquant } from "@/types";

export const CONSTANTS = {
  FIXED_DAILY_COST: 2000, // Fixed fuel cost per day
  EXPEDITION_FEE: 1000,
  BASE_SALARY_HIGH: 50000,
  BASE_SALARY_LOW: 25000,
  COMMISSION_PER_COURSE: 150,
  COURSES_THRESHOLD: 500,
  WORKING_DAYS_FOR_SALARY: 25,
};

export function calculateDeliveredValue(course: Course): number {
  if (course.type === "expedition") {
    // Expeditions add 1,000 XOF delivery fee when completed
    return course.completed ? CONSTANTS.EXPEDITION_FEE : 0;
  }

  if (course.type === "livraison" && course.livraison) {
    const deliveredArticles = course.livraison.articles.filter(
      (a) => a.status === "delivered",
    );
    const articlesTotal = deliveredArticles.reduce(
      (sum, a) => sum + (a.price * a.quantity),
      0,
    );

    // Add delivery fee if at least one article was delivered
    const deliveryFee =
      deliveredArticles.length > 0 ? course.livraison.deliveryFee : 0;

    return articlesTotal + deliveryFee;
  }

  return 0;
}

export function isCourseCompleted(course: Course): boolean {
  if (course.type === "expedition") {
    return course.completed;
  }

  if (course.type === "livraison" && course.livraison) {
    return course.livraison.articles.some((a) => a.status === "delivered");
  }

  return false;
}

export function calculateDailyPayable(
  livreurId: string,
  date: string,
  courses: Course[],
  expenses: Expense[],
): number {
  const dayCourses = courses.filter(
    (c) => c.livreurId === livreurId && c.date === date,
  );

  const totalDelivered = dayCourses.reduce(
    (sum, c) => sum + calculateDeliveredValue(c),
    0,
  );

  // Add value of undelivered articles not returned
  const undeliveredValue = dayCourses.reduce((sum, c) => {
    if (c.type === "livraison" && c.livraison) {
      return (
        sum +
        c.livraison.articles
          .filter((a) => a.status === "not_delivered" && !a.returnedToAdmin)
          .reduce((s, a) => s + a.price * (a.quantity || 1), 0)
      );
    }
    return sum;
  }, 0);

  const approvedExpenses = expenses
    .filter((e) => e.livreurId === livreurId && e.date === date && e.validated)
    .reduce((sum, e) => sum + e.amount, 0);

  const validatedExpeditionFees = dayCourses
    .filter(
      (c) =>
        c.type === "expedition" &&
        c.completed &&
        c.expedition?.validated &&
        c.expedition.expeditionFee,
    )
    .reduce((sum, c) => sum + (c.expedition?.expeditionFee || 0), 0);

  return (
    totalDelivered +
    undeliveredValue -
    (CONSTANTS.FIXED_DAILY_COST + approvedExpenses + validatedExpeditionFees)
  );
}

// Calculate amount livreur must remit TODAY (before expense validation)
// Only deducts fixed fuel cost, not expenses or expedition fees
export function calculateDailyRemittance(
  livreurId: string,
  date: string,
  courses: Course[],
  expenses: Expense[],
): number {
  const dayCourses = courses.filter(
    (c) => c.livreurId === livreurId && c.date === date,
  );

  const totalDelivered = dayCourses.reduce(
    (sum, c) => sum + calculateDeliveredValue(c),
    0,
  );

  // Add value of undelivered articles not returned
  const undeliveredValue = dayCourses.reduce((sum, c) => {
    if (c.type === "livraison" && c.livraison) {
      return (
        sum +
        c.livraison.articles
          .filter((a) => a.status === "not_delivered" && !a.returnedToAdmin)
          .reduce((s, a) => s + a.price * (a.quantity || 1), 0)
      );
    }
    return sum;
  }, 0);

  // Deduct validated moto expenses
  const validatedExpenses = expenses
    .filter((e) => e.livreurId === livreurId && e.date === date && e.validated)
    .reduce((sum, e) => sum + e.amount, 0);

  // Deduct fixed fuel cost + validated expenses
  return totalDelivered + undeliveredValue - (CONSTANTS.FIXED_DAILY_COST + validatedExpenses);
}

// Calculate total value of articles RECEIVED (before delivery)
export function calculateTotalArticlesReceivedValue(course: Course): number {
  if (course.type === "livraison" && course.livraison) {
    return course.livraison.articles.reduce(
      (sum, a) => sum + (a.price * (a.quantity || 1)),
      0
    );
  }
  return 0;
}

export interface DailyFinancials {
  totalReceived: number;          // A
  totalDelivered: number;         // B
  totalValidatedExpenses: number; // C (Expenses + Expedition Fees)
  amountToRemit: number;          // D = B - C
  amountRemitted: number;         // E
  manquantPayment: number;        // Manquant 1 = D - E
  manquantArticles: number;       // Manquant 2
  totalManquant: number;          // Total = Manquant 1 + Manquant 2
  courseCount: number;
}

export function calculateDailyFinancials(
  livreurId: string,
  date: string,
  courses: Course[],
  expenses: Expense[],
  payments: DailyPayment[]
): DailyFinancials {
  const dayCourses = courses.filter(
    (c) => c.livreurId === livreurId && c.date === date
  );

  // A. Valeur totale des articles reçus
  const totalReceived = dayCourses.reduce(
    (sum, c) => sum + calculateTotalArticlesReceivedValue(c),
    0
  );

  // B. Valeur totale des articles livrés (includes delivery fees)
  const totalDelivered = dayCourses.reduce(
    (sum, c) => sum + calculateDeliveredValue(c),
    0
  );

  // C. Somme totale des dépenses validées + frais expedition + fixed daily cost
  const validatedExpenses = expenses
    .filter((e) => e.livreurId === livreurId && e.date === date && e.validated)
    .reduce((sum, e) => sum + e.amount, 0);

  const validatedExpeditionFees = dayCourses
    .filter(
      (c) =>
        c.type === "expedition" &&
        c.completed &&
        c.expedition?.validated &&
        c.expedition.expeditionFee
    )
    .reduce((sum, c) => sum + (c.expedition?.expeditionFee || 0), 0);

  const totalValidatedExpenses = validatedExpenses + validatedExpeditionFees + CONSTANTS.FIXED_DAILY_COST;

  // D. Montant à verser: B - C
  const amountToRemit = Math.max(0, totalDelivered - totalValidatedExpenses);

  // E. Montant versé
  const dayPayments = payments.filter(
    (p) => p.livreurId === livreurId && p.date === date
  );
  const amountRemitted = dayPayments.reduce((sum, p) => sum + p.amount, 0);

  // Manquant 1: D - E
  // Only calculate shortage if there is an expected payment or if the day is over/reconciled
  // For now, we calculate it as simple difference, but it might be negative if they paid more (surplus)
  const manquantPayment = Math.max(0, amountToRemit - amountRemitted);

  // Manquant 2: somme valeur articles non livrés et non retournés
  const manquantArticles = dayCourses.reduce((sum, c) => {
    if (c.type === "livraison" && c.livraison) {
      return (
        sum +
        c.livraison.articles
          .filter((a) => a.status === "not_delivered" && !a.returnedToAdmin)
          .reduce((s, a) => s + a.price * (a.quantity || 1), 0)
      );
    }
    return sum;
  }, 0);

  return {
    totalReceived,
    totalDelivered,
    totalValidatedExpenses,
    amountToRemit,
    amountRemitted,
    manquantPayment,
    manquantArticles,
    totalManquant: manquantPayment + manquantArticles,
    courseCount: dayCourses.filter(isCourseCompleted).length
  };
}

export function calculateMonthlySalary(
  livreurId: string,
  startDate: string,
  endDate: string,
  courses: Course[],
  manquants: Manquant[],
): {
  workingDays: number;
  totalCourses: number;
  baseSalary: number;
  commissions: number;
  totalManquants: number;
  netSalary: number;
} {
  const relevantCourses = courses.filter(
    (c) =>
      c.livreurId === livreurId &&
      c.date >= startDate &&
      c.date <= endDate &&
      isCourseCompleted(c),
  );

  const workingDays = new Set(relevantCourses.map((c) => c.date)).size;
  const totalCourses = relevantCourses.length;

  const baseSalary =
    workingDays >= CONSTANTS.WORKING_DAYS_FOR_SALARY
      ? totalCourses > CONSTANTS.COURSES_THRESHOLD
        ? CONSTANTS.BASE_SALARY_HIGH
        : CONSTANTS.BASE_SALARY_LOW
      : 0;

  const commissions = totalCourses * CONSTANTS.COMMISSION_PER_COURSE;

  const totalManquants = manquants
    .filter(
      (m) =>
        m.livreurId === livreurId && m.date >= startDate && m.date <= endDate,
    )
    .reduce((sum, m) => sum + m.amount, 0);

  const netSalary = baseSalary + commissions - totalManquants;

  return {
    workingDays,
    totalCourses,
    baseSalary,
    commissions,
    totalManquants,
    netSalary,
  };
}

export function detectManquants(
  livreurId: string,
  date: string,
  courses: Course[],
  payment: DailyPayment | undefined,
  expenses: Expense[],
): Manquant[] {
  const manquants: Omit<Manquant, "id">[] = [];

  const dayCourses = courses.filter(
    (c) => c.livreurId === livreurId && c.date === date,
  );

  // Check for undelivered articles not returned
  dayCourses.forEach((course) => {
    if (course.type === "livraison" && course.livraison) {
      const undeliveredNotReturned = course.livraison.articles.filter(
        (a) => a.status === "not_delivered" && !a.returnedToAdmin,
      );

      undeliveredNotReturned.forEach((article) => {
        manquants.push({
          livreurId,
          type: "undelivered_not_returned",
          amount: article.price * (article.quantity || 1),
          description: `Article non livré et non retourné: ${article.name}`,
          date,
        });
      });
    }
  });

  // Check payment shortage
  if (payment) {
    const expectedAmount = payment.expectedAmount;
    const actualAmount = payment.amount;

    if (actualAmount < expectedAmount) {
      manquants.push({
        livreurId,
        type: "payment_shortage",
        amount: expectedAmount - actualAmount,
        description: `Manque de paiement: ${expectedAmount - actualAmount} XOF`,
        date,
      });
    }
  }

  // Check unvalidated expenses (remain as manquants until validated)
  const unvalidatedExpenses = expenses.filter(
    (e) =>
      e.livreurId === livreurId &&
      e.date === date &&
      !e.validated &&
      !e.rejectedReason,
  );

  unvalidatedExpenses.forEach((expense) => {
    manquants.push({
      livreurId,
      type: "unvalidated_expense",
      amount: expense.amount,
      description: `Dépense non validée: ${expense.description}`,
      date,
    });
  });

  return manquants as Manquant[];
}
