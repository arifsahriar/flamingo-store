'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchAllProfiles, 
  updateUserRole, 
  getRoleBadgeConfig, 
  normalizeRole 
} from '@/lib/userService';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { 
  Users, 
  ShieldCheck, 
  Shield, 
  UserCheck, 
  Search, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  User, 
  Sparkles,
  ChevronDown,
  Filter
} from 'lucide-react';

function AdminUsersContent() {
  const { currentAdmin, currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL'); // 'ALL' | 'super_admin' | 'moderator' | 'customer'
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'warning', message: '' }

  const activeAdmin = currentAdmin || currentUser;
  const currentAdminId = activeAdmin?.id;
  const currentAdminEmail = activeAdmin?.email;
  const currentAdminUsername = activeAdmin?.username;

  // 1. Initial Load of profiles
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAllProfiles();
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast('ইউজার তালিকা লোড করতে ব্যর্থ হয়েছে: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Check if a specific user is the currently logged-in super admin
  const isCurrentUserLoggedInAdmin = (user) => {
    if (!user) return false;
    if (currentAdminId && user.id === currentAdminId) return true;
    if (currentAdminEmail && user.email && user.email.toLowerCase() === currentAdminEmail.toLowerCase()) return true;
    if (currentAdminUsername && (user.username === currentAdminUsername || user.phone === currentAdminUsername)) return true;
    return false;
  };

  // Handle Role Change
  const handleRoleChange = async (targetUser, newRole) => {
    const isSelf = isCurrentUserLoggedInAdmin(targetUser);
    
    // Prevent self-demotion
    if (isSelf && newRole !== 'super_admin') {
      showToast('আপনি নিজের সুপার অ্যাডমিন রোল ডিমোট করতে পারবেন না!', 'warning');
      return;
    }

    const previousRole = targetUser.role;
    if (previousRole === newRole) return;

    // Optimistic UI update
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
    );

    setUpdatingUserId(targetUser.id);

    try {
      const res = await updateUserRole(targetUser.id, newRole);
      
      const badgeConfig = getRoleBadgeConfig(newRole);
      const userName = targetUser.name || targetUser.email || 'ইউজার';

      if (res.success) {
        showToast(
          `"${userName}" এর রোল পরিবর্তন করে "${badgeConfig.label}" করা হয়েছে!`,
          'success'
        );
      } else {
        // Revert on error
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === targetUser.id ? { ...u, role: previousRole } : u))
        );
        showToast(
          `রোল পরিবর্তন ব্যর্থ হয়েছে: ${res.dbError || 'ডাটাবেজ ত্রুটি'}`,
          'error'
        );
      }
    } catch (err) {
      // Revert on catch
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === targetUser.id ? { ...u, role: previousRole } : u))
      );
      showToast('রোল আপডেট ব্যর্থ হয়েছে: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Helper for generating initials avatar
  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'FL';
  };

  // Format joined date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'অজানা';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q));

    const matchesRole =
      selectedRoleFilter === 'ALL' || normalizeRole(u.role) === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  // Role Counts
  const counts = {
    total: users.length,
    super_admin: users.filter((u) => normalizeRole(u.role) === 'super_admin').length,
    moderator: users.filter((u) => normalizeRole(u.role) === 'moderator').length,
    customer: users.filter((u) => normalizeRole(u.role) === 'customer').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* টপ ন্যাভিগেশন বার */}
        <AdminNavbar activePage="users" />

        {/* হেডার ও ইন্ট্রো */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-pink-600" /> ইউজার রোল ও স্টাফ এক্সেস কন্ট্রোল
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              সুপাবেজ <code className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded text-xs font-mono">profiles</code> টেবিল থেকে ব্যবহারকারীদের রোল এবং পারমিশন পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadUsers}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-pink-600 hover:border-pink-200 rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
              title="ইউজার তালিকা রিফ্রেশ করুন"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-pink-600' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {/* টোস্ট নোটিফিকেশন */}
        {toast && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm shadow-md animate-in fade-in slide-in-from-top-2 transition ${
              toast.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : toast.type === 'warning'
                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              ) : toast.type === 'warning' ? (
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              <span className="font-semibold">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-xs font-bold hover:underline opacity-80 ml-4"
            >
              বন্ধ করুন
            </button>
          </div>
        )}

        {/* স্ট্যাটিস্টিকস কার্ডস */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-gray-500 font-medium block">মোট ব্যবহারকারী</span>
              <span className="text-xl font-black text-gray-900 font-mono">{counts.total}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-pink-600 font-medium block">Super Admin</span>
              <span className="text-xl font-black text-pink-700 font-mono">{counts.super_admin}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-blue-600 font-medium block">Moderator</span>
              <span className="text-xl font-black text-blue-700 font-mono">{counts.moderator}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-emerald-600 font-medium block">Customer</span>
              <span className="text-xl font-black text-emerald-700 font-mono">{counts.customer}</span>
            </div>
          </div>
        </div>

        {/* সার্চ ও ফিল্টার বার */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ইমেইল অথবা মোবাইল নম্বর দিয়ে সার্চ করুন..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-pink-500 bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-gray-400 flex items-center gap-1 px-1">
              <Filter className="w-3.5 h-3.5" />
            </span>
            <button
              type="button"
              onClick={() => setSelectedRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                selectedRoleFilter === 'ALL'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              সকল ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleFilter('super_admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                selectedRoleFilter === 'super_admin'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              Super Admin ({counts.super_admin})
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleFilter('moderator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                selectedRoleFilter === 'moderator'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Moderator ({counts.moderator})
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoleFilter('customer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                selectedRoleFilter === 'customer'
                  ? 'bg-gray-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Customer ({counts.customer})
            </button>
          </div>
        </div>

        {/* ইউজারদের তালিকা টেবিল */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-400">সুপাবেজ থেকে প্রোফাইল তালিকা লোড হচ্ছে...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400 space-y-2">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <p>কোনো ব্যবহারকারী পাওয়া যায়নি। ফিল্টার পরিবর্তন করে চেষ্টা করুন।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-6">ইউজার / নাম</th>
                    <th className="py-3.5 px-6">ইমেইল ও যোগাযোগ</th>
                    <th className="py-3.5 px-6">যোগদানের তারিখ</th>
                    <th className="py-3.5 px-6">বর্তমান রোল</th>
                    <th className="py-3.5 px-6 text-right">রোল পরিবর্তন (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const normalized = normalizeRole(user.role);
                    const badge = getRoleBadgeConfig(normalized);
                    const isSelf = isCurrentUserLoggedInAdmin(user);
                    const isUpdating = updatingUserId === user.id;

                    return (
                      <tr key={user.id} className="hover:bg-pink-50/20 transition-colors">
                        
                        {/* ১. অবতার ও নাম */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0 ${
                              normalized === 'super_admin'
                                ? 'bg-gradient-to-tr from-pink-600 to-rose-400 text-white'
                                : normalized === 'moderator'
                                ? 'bg-gradient-to-tr from-blue-600 to-cyan-400 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {getInitials(user.name, user.email)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm">
                                <span>{user.name || 'নামহীন ইউজার'}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded-md font-semibold">
                                    আপনি (You)
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-gray-400 block truncate max-w-[150px]">
                                ID: {user.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* ২. ইমেইল ও যোগাযোগ */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{user.email || '—'}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-mono">
                                <Phone className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* ৩. যোগদানের তারিখ */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </td>

                        {/* ৪. বর্তমান রোল ব্যাজ */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        {/* ৫. রোল পরিবর্তন অ্যাকশন ড্রপডাউন */}
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            {isSelf ? (
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl cursor-not-allowed" title="আপনি নিজের সুপার অ্যাডমিন রোল ডিমোট করতে পারবেন না">
                                <Lock className="w-3 h-3 text-amber-500" />
                                <span className="font-semibold text-[11px]">লকড (সুরক্ষিত)</span>
                              </div>
                            ) : (
                              <div className="relative inline-block text-left">
                                <select
                                  disabled={isUpdating}
                                  value={normalized}
                                  onChange={(e) => handleRoleChange(user, e.target.value)}
                                  className={`appearance-none bg-white border rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold transition focus:outline-pink-500 cursor-pointer shadow-xs ${
                                    isUpdating
                                      ? 'opacity-50 cursor-wait'
                                      : 'hover:border-pink-300 text-gray-800'
                                  } ${
                                    normalized === 'super_admin'
                                      ? 'border-pink-300 text-pink-700 bg-pink-50/40'
                                      : normalized === 'moderator'
                                      ? 'border-blue-300 text-blue-700 bg-blue-50/40'
                                      : 'border-gray-200 text-gray-700'
                                  }`}
                                >
                                  <option value="customer">Customer (কাস্টমার)</option>
                                  <option value="moderator">Moderator (মডারেটর)</option>
                                  <option value="super_admin">Super Admin (প্রধান অ্যাডমিন)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                              </div>
                            )}

                            {isUpdating && (
                              <div className="w-3.5 h-3.5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminRouteGuard requiredRole="super_admin">
      <AdminUsersContent />
    </AdminRouteGuard>
  );
}
