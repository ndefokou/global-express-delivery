import { Course, Expense, DailyPayment, Manquant } from "@/types";

export const CONSTANTS = {
  FIXED_DAILY_COST: 3000,
  EXPEDITION_FEE: 1000,
  BASE_SALARY_HIGH: 50000,
  BASE_SALARY_LOW: 25000,
  COMMISSION_PER_COURSE: 150,
  COURSES_THRESHOLD: 500,
  WORKING_DAYS_FOR_SALARY: 25,
};

export function calculateDeliveredValue(course: Course): number {
  if (course.type === "expedition") {
    return course.completed && course.expedition?.validated
      ? course.expedition.expeditionFee
      : 0;
  }

  if (course.type === "livraison" && course.livraison) {
    const deliveredArticles = course.livraison.articles.filter(
      (a) => a.status === "delivered",
    );
    const articlesTotal = deliveredArticles.reduce(
      (sum, a) => sum + a.price,
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

  const approvedExpenses = expenses
    .filter((e) => e.livreurId === livreurId && e.date === date && e.validated)
    .reduce((sum, e) => sum + e.amount, 0);

  return totalDelivered - (CONSTANTS.FIXED_DAILY_COST + approvedExpenses);
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
        (a) => a.status === "not_delivered" && !a.reason?.includes("returned"),
      );

      undeliveredNotReturned.forEach((article) => {
        manquants.push({
          livreurId,
          type: "undelivered_not_returned",
          amount: article.price,
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

  // Check unvalidated expenses
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
