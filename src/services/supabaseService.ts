import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { User, Livreur, Course, Expense, DailyPayment, Manquant, Article } from '@/types';
import type { Database } from '@/types/database';
import type { Json } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

type DbLivreur = Database['public']['Tables']['livreurs']['Row'];
type DbCourse = Database['public']['Tables']['courses']['Row'];
type DbExpense = Database['public']['Tables']['expenses']['Row'];
type DbPayment = Database['public']['Tables']['daily_payments']['Row'];
type DbManquant = Database['public']['Tables']['manquants']['Row'];

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const signInAdmin = async (password: string): Promise<User> => {
    // For admin, we'll use a specific email format
    const adminEmail = 'tcheutchouaarthur38@gmail.com';

    const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: password,
    });

    if (error) throw new Error('Mot de passe incorrect');
    if (!data.user) throw new Error('Échec de connexion');

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError || !userProfile) throw new Error('Profil utilisateur introuvable');

    return {
        id: userProfile.id,
        name: userProfile.name,
        role: userProfile.role as 'admin' | 'livreur',
    };
};

export const signInLivreur = async (livreurId: string, password: string): Promise<User> => {
    // Get livreur details first
    const { data: livreur, error: livreurError } = await supabase
        .from('livreurs')
        .select('*')
        .eq('id', livreurId)
        .single();

    if (livreurError || !livreur) throw new Error('Livreur introuvable');

    // Livreur email format: livreur-{id}@globalexpress.local
    const livreurEmail = `livreur-${livreurId}@globalexpress.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: livreurEmail,
        password: password,
    });

    if (error) throw new Error('Mot de passe incorrect');
    if (!data.user) throw new Error('Échec de connexion');

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError || !userProfile) throw new Error('Profil utilisateur introuvable');

    return {
        id: userProfile.id,
        name: userProfile.name,
        role: userProfile.role as 'admin' | 'livreur',
    };
};

export const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !userProfile) return null;

    // For livreurs, use their livreur_id; for admins, use their user id
    const userId = (userProfile as any).livreur_id || userProfile.id;

    return {
        id: userId,
        name: userProfile.name,
        role: userProfile.role as 'admin' | 'livreur',
    };
};

export const getUserLivreurId = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !userProfile) return null;

    return userProfile.livreur_id;
};

// ============================================================================
// LIVREURS
// ============================================================================

const mapDbLivreurToLivreur = (dbLivreur: DbLivreur): Livreur => ({
    id: dbLivreur.id,
    name: dbLivreur.name,
    phone: dbLivreur.phone,
    active: dbLivreur.active,
    createdAt: dbLivreur.created_at,
    // Note: password is not stored in DB, handled by Supabase Auth
});

export const getLivreurs = async (): Promise<Livreur[]> => {
    const { data, error } = await supabase
        .from('livreurs')
        .select('*')
        .order('name');

    if (error) throw error;
    return data.map(mapDbLivreurToLivreur);
};

export const addLivreur = async (
    livreur: Omit<Livreur, 'id' | 'createdAt'> & { password: string }
): Promise<Livreur> => {
    // First, create the livreur record
    const { data: newLivreur, error: livreurError } = await supabase
        .from('livreurs')
        .insert({
            name: livreur.name,
            phone: livreur.phone,
            active: livreur.active,
        })
        .select()
        .single();

    if (livreurError || !newLivreur) throw livreurError || new Error('Failed to create livreur');

    // Create auth user for the livreur
    const livreurEmail = `livreur-${newLivreur.id}@globalexpress.local`;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: livreurEmail,
        password: livreur.password,
        email_confirm: true,
    });

    if (authError) {
        // Rollback: delete the livreur record
        await supabase.from('livreurs').delete().eq('id', newLivreur.id);
        throw authError;
    }

    // Create user profile
    const { error: profileError } = await supabase
        .from('users')
        .insert({
            id: authData.user.id,
            role: 'livreur',
            name: livreur.name,
            livreur_id: newLivreur.id,
        });

    if (profileError) {
        // Rollback: delete auth user and livreur
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        await supabase.from('livreurs').delete().eq('id', newLivreur.id);
        throw profileError;
    }

    return mapDbLivreurToLivreur(newLivreur);
};

export const updateLivreur = async (id: string, updates: Partial<Livreur>): Promise<void> => {
    // Filter out undefined values
    const updateData = Object.fromEntries(
        Object.entries({
            name: updates.name,
            phone: updates.phone,
            active: updates.active,
        }).filter(([_, value]) => value !== undefined)
    ) as Database['public']['Tables']['livreurs']['Update'];

    const { error } = await supabase
        .from('livreurs')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
};

export const deleteLivreur = async (id: string): Promise<void> => {
    // Soft delete: just mark as inactive
    const { error } = await supabase
        .from('livreurs')
        .update({ active: false })
        .eq('id', id);

    if (error) throw error;
};

// ============================================================================
// COURSES
// ============================================================================

const mapDbCourseToCourse = (dbCourse: DbCourse): Course => {
    const course: Course = {
        id: dbCourse.id,
        type: dbCourse.type as 'livraison' | 'expedition',
        livreurId: dbCourse.livreur_id,
        date: dbCourse.date,
        completed: dbCourse.completed,
    };

    if (dbCourse.type === 'livraison') {
        course.livraison = {
            contactName: dbCourse.livraison_contact_name || '',
            contactPhone: dbCourse.livraison_contact_phone || '',
            quartier: dbCourse.livraison_quartier || '',
            articles: (dbCourse.livraison_articles as unknown as Article[]) || [],
            deliveryFee: dbCourse.livraison_delivery_fee || 0,
        };
    } else {
        course.expedition = {
            destinationCity: dbCourse.expedition_destination_city || '',
            contactName: dbCourse.expedition_contact_name || '',
            contactPhone: dbCourse.expedition_contact_phone || '',
            expeditionFee: dbCourse.expedition_fee || 0,
            validated: dbCourse.expedition_validated || false,
        };
    }

    return course;
};

export const getCourses = async (filters?: {
    livreurId?: string;
    date?: string;
    completed?: boolean;
}): Promise<Course[]> => {
    let query = supabase.from('courses').select('*');

    if (filters?.livreurId) {
        query = query.eq('livreur_id', filters.livreurId);
    }
    if (filters?.date) {
        query = query.eq('date', filters.date);
    }
    if (filters?.completed !== undefined) {
        query = query.eq('completed', filters.completed);
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data.map(mapDbCourseToCourse);
};

export const addCourse = async (course: Omit<Course, 'id'>): Promise<Course> => {
    const insertData: Database['public']['Tables']['courses']['Insert'] = {
        type: course.type,
        livreur_id: course.livreurId,
        date: course.date,
        completed: course.completed,
    };

    if (course.type === 'livraison' && course.livraison) {
        insertData.livraison_contact_name = course.livraison.contactName;
        insertData.livraison_contact_phone = course.livraison.contactPhone;
        insertData.livraison_quartier = course.livraison.quartier;
        insertData.livraison_articles = course.livraison.articles as unknown as Json;
        insertData.livraison_delivery_fee = course.livraison.deliveryFee;
    } else if (course.type === 'expedition' && course.expedition) {
        insertData.expedition_destination_city = course.expedition.destinationCity;
        insertData.expedition_contact_name = course.expedition.contactName;
        insertData.expedition_contact_phone = course.expedition.contactPhone;
        insertData.expedition_fee = course.expedition.expeditionFee;
        insertData.expedition_validated = course.expedition.validated;
    }

    const { data, error } = await supabase
        .from('courses')
        .insert(insertData)
        .select()
        .single();

    if (error) throw error;
    return mapDbCourseToCourse(data);
};

export const updateCourse = async (id: string, updates: Partial<Course>): Promise<void> => {
    const updateData: Partial<{
        completed: boolean;
        livraison_contact_name: string | null;
        livraison_contact_phone: string | null;
        livraison_quartier: string | null;
        livraison_articles: Json | null;
        livraison_delivery_fee: number | null;
        expedition_destination_city: string | null;
        expedition_contact_name: string | null;
        expedition_contact_phone: string | null;
        expedition_fee: number | null;
        expedition_validated: boolean | null;
    }> = {};

    if (updates.completed !== undefined) {
        updateData.completed = updates.completed;
    }

    if (updates.livraison) {
        updateData.livraison_contact_name = updates.livraison.contactName;
        updateData.livraison_contact_phone = updates.livraison.contactPhone;
        updateData.livraison_quartier = updates.livraison.quartier;
        updateData.livraison_articles = updates.livraison.articles as unknown as Json;
        updateData.livraison_delivery_fee = updates.livraison.deliveryFee;
    }

    if (updates.expedition) {
        updateData.expedition_destination_city = updates.expedition.destinationCity;
        updateData.expedition_contact_name = updates.expedition.contactName;
        updateData.expedition_contact_phone = updates.expedition.contactPhone;
        updateData.expedition_fee = updates.expedition.expeditionFee;
        updateData.expedition_validated = updates.expedition.validated;
    }

    const { error } = await supabase
        .from('courses')
        // @ts-ignore
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
};

export const deleteCourse = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// ============================================================================
// EXPENSES
// ============================================================================

const mapDbExpenseToExpense = (dbExpense: DbExpense): Expense => ({
    id: dbExpense.id,
    livreurId: dbExpense.livreur_id,
    amount: dbExpense.amount,
    description: dbExpense.description,
    date: dbExpense.date,
    validated: dbExpense.validated,
    rejectedReason: dbExpense.rejected_reason || undefined,
    rejectedAt: dbExpense.rejected_at || undefined,
});

export const getExpenses = async (filters?: {
    livreurId?: string;
    validated?: boolean;
}): Promise<Expense[]> => {
    let query = supabase.from('expenses').select('*');

    if (filters?.livreurId) {
        query = query.eq('livreur_id', filters.livreurId);
    }
    if (filters?.validated !== undefined) {
        query = query.eq('validated', filters.validated);
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data.map(mapDbExpenseToExpense);
};

export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    const { data, error } = await supabase
        .from('expenses')
        .insert({
            livreur_id: expense.livreurId,
            amount: expense.amount,
            description: expense.description,
            date: expense.date,
            validated: expense.validated,
        })
        .select()
        .single();

    if (error) throw error;
    return mapDbExpenseToExpense(data);
};

export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<void> => {
    // Filter out undefined values
    const updateData = Object.fromEntries(
        Object.entries({
            validated: updates.validated,
            rejected_reason: updates.rejectedReason,
            rejected_at: updates.rejectedAt,
        }).filter(([_, value]) => value !== undefined)
    ) as Database['public']['Tables']['expenses']['Update'];

    const { error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
};

// ============================================================================
// PAYMENTS
// ============================================================================

const mapDbPaymentToPayment = (dbPayment: DbPayment): DailyPayment => ({
    id: dbPayment.id,
    livreurId: dbPayment.livreur_id,
    date: dbPayment.date,
    amount: dbPayment.amount,
    expectedAmount: dbPayment.expected_amount,
});

export const getPayments = async (filters?: {
    livreurId?: string;
    date?: string;
}): Promise<DailyPayment[]> => {
    let query = supabase.from('daily_payments').select('*');

    if (filters?.livreurId) {
        query = query.eq('livreur_id', filters.livreurId);
    }
    if (filters?.date) {
        query = query.eq('date', filters.date);
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data.map(mapDbPaymentToPayment);
};

export const addPayment = async (payment: Omit<DailyPayment, 'id'>): Promise<DailyPayment> => {
    const { data, error } = await supabase
        .from('daily_payments')
        .insert({
            livreur_id: payment.livreurId,
            date: payment.date,
            amount: payment.amount,
            expected_amount: payment.expectedAmount,
        })
        .select()
        .single();

    if (error) throw error;
    return mapDbPaymentToPayment(data);
};

// ============================================================================
// MANQUANTS
// ============================================================================

const mapDbManquantToManquant = (dbManquant: DbManquant): Manquant => ({
    id: dbManquant.id,
    livreurId: dbManquant.livreur_id,
    type: dbManquant.type as Manquant['type'],
    amount: dbManquant.amount,
    description: dbManquant.description,
    date: dbManquant.date,
});

export const getManquants = async (filters?: {
    livreurId?: string;
}): Promise<Manquant[]> => {
    let query = supabase.from('manquants').select('*');

    if (filters?.livreurId) {
        query = query.eq('livreur_id', filters.livreurId);
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data.map(mapDbManquantToManquant);
};

export const addManquant = async (manquant: Omit<Manquant, 'id'>): Promise<Manquant> => {
    const { data, error } = await supabase
        .from('manquants')
        .insert({
            livreur_id: manquant.livreurId,
            type: manquant.type,
            amount: manquant.amount,
            description: manquant.description,
            date: manquant.date,
        })
        .select()
        .single();

    if (error) throw error;
    return mapDbManquantToManquant(data);
};

export const deleteManquant = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('manquants')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const subscribeToCourses = (
    callback: (courses: Course[]) => void
): RealtimeChannel => {
    return supabase
        .channel('courses-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'courses' },
            async () => {
                const courses = await getCourses();
                callback(courses);
            }
        )
        .subscribe();
};

export const subscribeToExpenses = (
    callback: (expenses: Expense[]) => void
): RealtimeChannel => {
    return supabase
        .channel('expenses-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'expenses' },
            async () => {
                const expenses = await getExpenses();
                callback(expenses);
            }
        )
        .subscribe();
};

export const subscribeToPayments = (
    callback: (payments: DailyPayment[]) => void
): RealtimeChannel => {
    return supabase
        .channel('payments-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'daily_payments' },
            async () => {
                const payments = await getPayments();
                callback(payments);
            }
        )
        .subscribe();
};

export const subscribeToManquants = (
    callback: (manquants: Manquant[]) => void
): RealtimeChannel => {
    return supabase
        .channel('manquants-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'manquants' },
            async () => {
                const manquants = await getManquants();
                callback(manquants);
            }
        )
        .subscribe();
};
