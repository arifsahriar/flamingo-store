import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Standardize role strings to one of: 'super_admin' | 'moderator' | 'customer'
 */
export function normalizeRole(role) {
  if (!role) return 'customer';
  const r = String(role).toLowerCase().trim();
  if (r === 'superadmin' || r === 'super_admin') return 'super_admin';
  if (r === 'moderator') return 'moderator';
  return 'customer';
}

/**
 * Visual badge configuration for roles
 */
export function getRoleBadgeConfig(role) {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'super_admin':
      return {
        label: 'Super Admin',
        roleKey: 'super_admin',
        badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
        dotClass: 'bg-pink-600',
      };
    case 'moderator':
      return {
        label: 'Moderator',
        roleKey: 'moderator',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-600',
      };
    case 'customer':
    default:
      return {
        label: 'Customer',
        roleKey: 'customer',
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
        dotClass: 'bg-gray-400',
      };
  }
}

/**
 * Default Seed Staff & Demo Users (when Supabase table is fresh/empty)
 */
export const DEFAULT_DEMO_USERS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'FLAMINGO Admin',
    email: 'admin@flamingostore.com',
    phone: '01700000001',
    role: 'super_admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Order Moderator',
    email: 'moderator@flamingostore.com',
    phone: '01700000002',
    role: 'moderator',
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Ayesha Rahman',
    email: 'ayesha.silver@gmail.com',
    phone: '01812345678',
    role: 'customer',
    createdAt: '2026-03-10T00:00:00.000Z',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Tanvir Hossain',
    email: 'tanvir.jewelry@yahoo.com',
    phone: '01987654321',
    role: 'customer',
    createdAt: '2026-04-05T00:00:00.000Z',
  },
];

const LOCAL_STORAGE_USERS_KEY = 'flamingo_users';
const LOCAL_STORAGE_STAFF_KEY = 'flamingo_staff_users';

/**
 * Fetch all users from Supabase profiles table with local fallback & consolidation
 */
export async function fetchAllProfiles() {
  let dbUsers = [];
  let dbError = null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        dbUsers = data.map((p) => ({
          id: p.id,
          name: p.full_name || (p.email ? p.email.split('@')[0] : 'গ্রাহক'),
          email: p.email || '',
          phone: p.phone || '',
          role: normalizeRole(p.role),
          createdAt: p.created_at || new Date().toISOString(),
        }));
      } else if (error) {
        dbError = error.message;
        console.warn('Error querying profiles from Supabase:', error.message);
      }
    } catch (err) {
      dbError = err?.message || 'Database query error';
      console.warn('Supabase profiles query offline fallback:', err);
    }
  }

  // If Supabase returned rows, return them
  if (dbUsers.length > 0) {
    return { success: true, users: dbUsers, source: 'supabase' };
  }

  // Otherwise, consolidate local users & staff
  const localMap = new Map();

  // Add default demo staff
  DEFAULT_DEMO_USERS.forEach((u) => {
    localMap.set(u.email || u.id, u);
  });

  // Merge staff from localStorage
  if (typeof window !== 'undefined') {
    try {
      const storedStaff = JSON.parse(localStorage.getItem(LOCAL_STORAGE_STAFF_KEY) || '[]');
      storedStaff.forEach((s) => {
        const key = s.email || s.username || s.id;
        localMap.set(key, {
          id: s.id || `staff_${s.username}`,
          name: s.name || s.username,
          email: s.email || `${s.username}@flamingostore.com`,
          phone: s.phone || '01700000000',
          role: normalizeRole(s.role),
          createdAt: s.createdAt || new Date('2026-01-01').toISOString(),
        });
      });
    } catch (e) {}

    // Merge registered customers
    try {
      const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY) || '[]');
      storedUsers.forEach((u) => {
        const key = u.email || u.phone || u.id;
        if (!localMap.has(key)) {
          localMap.set(key, {
            id: u.id,
            name: u.name,
            email: u.email || '',
            phone: u.phone || '',
            role: normalizeRole(u.role || 'customer'),
            createdAt: u.createdAt || new Date().toISOString(),
          });
        }
      });
    } catch (e) {}
  }

  const consolidated = Array.from(localMap.values());
  return { success: true, users: consolidated, source: 'local', dbError };
}

/**
 * Update user role in Supabase profiles table and sync local state
 * Executes: UPDATE profiles SET role = <selected_role> WHERE id = <user_id>
 */
export async function updateUserRole(userId, newRole) {
  const normalized = normalizeRole(newRole);
  let dbSuccess = false;
  let dbError = null;

  // 1. Execute UPDATE on Supabase profiles table
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          role: normalized,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select();

      if (error) {
        dbError = error.message;
        console.warn('Supabase profile role update error:', error.message);
      } else {
        dbSuccess = true;
      }
    } catch (err) {
      dbError = err?.message || 'Database error';
      console.warn('Supabase profile update offline fallback:', err);
    }
  }

  // 2. Synchronize localStorage
  if (typeof window !== 'undefined') {
    try {
      // Sync flamingo_users
      const users = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY) || '[]');
      const updatedUsers = users.map((u) => (u.id === userId ? { ...u, role: normalized } : u));
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updatedUsers));

      // Sync flamingo_staff_users
      const staffList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_STAFF_KEY) || '[]');
      let staffFound = false;
      const updatedStaff = staffList.map((s) => {
        if (s.id === userId || s.email === userId || s.username === userId) {
          staffFound = true;
          return { ...s, role: normalized };
        }
        return s;
      });

      if (!staffFound && (normalized === 'super_admin' || normalized === 'moderator')) {
        updatedStaff.push({
          id: userId,
          username: userId,
          role: normalized,
          name: 'Staff Member',
        });
      }

      localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(updatedStaff));

      // If current admin matches, update their session
      const currentAdminRaw = localStorage.getItem('flamingo_current_admin');
      if (currentAdminRaw) {
        const curAdmin = JSON.parse(currentAdminRaw);
        if (curAdmin.id === userId || curAdmin.username === userId) {
          curAdmin.role = normalized;
          localStorage.setItem('flamingo_current_admin', JSON.stringify(curAdmin));
        }
      }

      // If current user matches, update their session
      const currentUserRaw = localStorage.getItem('flamingo_current_user');
      if (currentUserRaw) {
        const curUser = JSON.parse(currentUserRaw);
        if (curUser.id === userId) {
          curUser.role = normalized;
          localStorage.setItem('flamingo_current_user', JSON.stringify(curUser));
        }
      }
    } catch (e) {
      console.error('Error syncing local user role:', e);
    }
  }

  return {
    success: true,
    dbSynced: dbSuccess,
    dbError,
    role: normalized,
  };
}
