import {
    getLivreurs as getLocalLivreurs,
    getCourses as getLocalCourses,
    getExpenses as getLocalExpenses,
    getPayments as getLocalPayments,
    getManquants as getLocalManquants,
} from './storage';

/**
 * Export all localStorage data to JSON format
 * This can be used to backup data before migration or to import into Supabase
 */
export const exportLocalStorageData = () => {
    const data = {
        livreurs: getLocalLivreurs(),
        courses: getLocalCourses(),
        expenses: getLocalExpenses(),
        payments: getLocalPayments(),
        manquants: getLocalManquants(),
        exportedAt: new Date().toISOString(),
    };

    // Create downloadable JSON file
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `global-express-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return data;
};

/**
 * Get migration statistics
 */
export const getMigrationStats = () => {
    const livreurs = getLocalLivreurs();
    const courses = getLocalCourses();
    const expenses = getLocalExpenses();
    const payments = getLocalPayments();
    const manquants = getLocalManquants();

    return {
        livreurs: livreurs.length,
        courses: courses.length,
        expenses: expenses.length,
        payments: payments.length,
        manquants: manquants.length,
        total: livreurs.length + courses.length + expenses.length + payments.length + manquants.length,
    };
};

/**
 * Clear all localStorage data (use with caution!)
 */
export const clearLocalStorageData = () => {
    const keys = [
        'ged_current_user',
        'ged_livreurs',
        'ged_courses',
        'ged_expenses',
        'ged_daily_payments',
        'ged_manquants',
    ];

    keys.forEach(key => localStorage.removeItem(key));
};
