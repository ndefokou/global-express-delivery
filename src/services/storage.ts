import {
  User,
  Livreur,
  Course,
  Expense,
  DailyPayment,
  Manquant,
} from "@/types";

const STORAGE_KEYS = {
  CURRENT_USER: "ged_current_user",
  LIVREURS: "ged_livreurs",
  COURSES: "ged_courses",
  EXPENSES: "ged_expenses",
  PAYMENTS: "ged_daily_payments",
  MANQUANTS: "ged_manquants",
} as const;

// Admin password constant
export const ADMIN_PASSWORD = "global admin password";

// Password validation functions
export const validateAdminPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};

export const validateLivreurPassword = (livreurId: string, password: string): boolean => {
  const livreurs = getLivreurs();
  const livreur = livreurs.find(l => l.id === livreurId);
  if (!livreur || !livreur.password) return false;
  return livreur.password === password;
};

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// User Management
export const getCurrentUser = (): User | null => {
  return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user: User | null): void => {
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
};

// Livreurs
export const getLivreurs = (): Livreur[] => {
  return getFromStorage<Livreur[]>(STORAGE_KEYS.LIVREURS, []);
};

export const saveLivreurs = (livreurs: Livreur[]): void => {
  saveToStorage(STORAGE_KEYS.LIVREURS, livreurs);
};

export const addLivreur = (
  livreur: Omit<Livreur, "id" | "createdAt">,
): Livreur => {
  const livreurs = getLivreurs();
  const newLivreur: Livreur = {
    ...livreur,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  saveLivreurs([...livreurs, newLivreur]);
  return newLivreur;
};

export const updateLivreur = (id: string, updates: Partial<Livreur>): void => {
  const livreurs = getLivreurs();
  const updated = livreurs.map((l) => (l.id === id ? { ...l, ...updates } : l));
  saveLivreurs(updated);
};

export const deleteLivreur = (id: string): void => {
  const livreurs = getLivreurs();
  saveLivreurs(livreurs.filter((l) => l.id !== id));
};

// Courses
export const getCourses = (): Course[] => {
  return getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
};

export const saveCourses = (courses: Course[]): void => {
  saveToStorage(STORAGE_KEYS.COURSES, courses);
};

export const addCourse = (course: Omit<Course, "id">): Course => {
  const courses = getCourses();
  const newCourse: Course = {
    ...course,
    id: Date.now().toString(),
  };
  saveCourses([...courses, newCourse]);
  return newCourse;
};

export const updateCourse = (id: string, updates: Partial<Course>): void => {
  const courses = getCourses();
  const updated = courses.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveCourses(updated);
};

export const deleteCourse = (id: string): void => {
  const courses = getCourses();
  saveCourses(courses.filter((c) => c.id !== id));
};

// Expenses
export const getExpenses = (): Expense[] => {
  return getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
};

export const saveExpenses = (expenses: Expense[]): void => {
  saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
};

export const addExpense = (expense: Omit<Expense, "id">): Expense => {
  const expenses = getExpenses();
  const newExpense: Expense = {
    ...expense,
    id: Date.now().toString(),
  };
  saveExpenses([...expenses, newExpense]);
  return newExpense;
};

export const updateExpense = (id: string, updates: Partial<Expense>): void => {
  const expenses = getExpenses();
  const updated = expenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
  saveExpenses(updated);
};

// Payments
export const getPayments = (): DailyPayment[] => {
  return getFromStorage<DailyPayment[]>(STORAGE_KEYS.PAYMENTS, []);
};

export const savePayments = (payments: DailyPayment[]): void => {
  saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
};

export const addPayment = (payment: Omit<DailyPayment, "id">): DailyPayment => {
  const payments = getPayments();
  const newPayment: DailyPayment = {
    ...payment,
    id: Date.now().toString(),
  };
  savePayments([...payments, newPayment]);
  return newPayment;
};

// Manquants
export const getManquants = (): Manquant[] => {
  return getFromStorage<Manquant[]>(STORAGE_KEYS.MANQUANTS, []);
};

export const saveManquants = (manquants: Manquant[]): void => {
  saveToStorage(STORAGE_KEYS.MANQUANTS, manquants);
};

export const addManquant = (manquant: Omit<Manquant, "id">): Manquant => {
  const manquants = getManquants();
  const newManquant: Manquant = {
    ...manquant,
    id: Date.now().toString(),
  };
  saveManquants([...manquants, newManquant]);
  return newManquant;
};
