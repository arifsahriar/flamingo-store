'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_STAFF_USERS = [
  {
    username: 'admin',
    password: 'password123',
    role: 'superadmin',
    name: 'FLAMINGO Admin',
  },
  {
    username: 'moderator',
    password: 'mod123',
    role: 'moderator',
    name: 'Order Moderator',
  },
];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // ব্রাউজার লোড হলে লোকাল স্টোরেজ থেকে অথেনটিকেশন ডাটা রিড করা
  useEffect(() => {
    try {
      // ১. স্টাফ ইউজার ইনিশিয়ালাইজেশন
      const savedStaff = localStorage.getItem('flamingo_staff_users');
      if (!savedStaff) {
        localStorage.setItem('flamingo_staff_users', JSON.stringify(DEFAULT_STAFF_USERS));
      }

      // ২. বর্তমান লগইন থাকা কাস্টমার
      const savedUser = localStorage.getItem('flamingo_current_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }

      // ৩. বর্তমান লগইন থাকা অ্যাডমিন
      const savedAdmin = localStorage.getItem('flamingo_current_admin');
      if (savedAdmin) {
        setCurrentAdmin(JSON.parse(savedAdmin));
      }
    } catch (e) {
      console.error('Error initializing auth from localStorage:', e);
    } finally {
      setIsAuthLoaded(true);
    }

    // মাল্টি-ট্যাব অথেনটিকেশন সিঙ্ক
    const handleStorage = (e) => {
      if (e.key === 'flamingo_current_user') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
      if (e.key === 'flamingo_current_admin') {
        setCurrentAdmin(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // --- কাস্টমার রেজিস্ট্রেশন ---
  const registerCustomer = ({ name, phone, email, password }) => {
    try {
      const users = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
      
      const cleanPhone = phone.trim();
      const cleanEmail = email ? email.trim().toLowerCase() : '';

      // ফোন বা ইমেইল দিয়ে ডুপ্লিকেট চেক
      const exists = users.some(
        (u) => u.phone === cleanPhone || (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
      );

      if (exists) {
        return { success: false, error: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে!' };
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        password: password,
        createdAt: new Date().toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('flamingo_users', JSON.stringify(updatedUsers));

      // রেজিস্ট্রেশন সম্পন্ন হলে স্বয়ংক্রিয় লগইন
      const safeUser = {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        createdAt: newUser.createdAt,
      };

      localStorage.setItem('flamingo_current_user', JSON.stringify(safeUser));
      setCurrentUser(safeUser);

      return { success: true, user: safeUser };
    } catch (err) {
      console.error('Registration failed:', err);
      return { success: false, error: 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি। আবার চেষ্টা করুন।' };
    }
  };

  // --- কাস্টমার লগইন ---
  const loginCustomer = ({ identifier, password }) => {
    try {
      const users = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
      const iden = identifier.trim().toLowerCase();

      const matched = users.find(
        (u) =>
          (u.phone.toLowerCase() === iden || (u.email && u.email.toLowerCase() === iden)) &&
          u.password === password
      );

      if (!matched) {
        return { success: false, error: 'মোবাইল/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়!' };
      }

      const safeUser = {
        id: matched.id,
        name: matched.name,
        phone: matched.phone,
        email: matched.email,
        createdAt: matched.createdAt,
      };

      localStorage.setItem('flamingo_current_user', JSON.stringify(safeUser));
      setCurrentUser(safeUser);

      return { success: true, user: safeUser };
    } catch (err) {
      console.error('Customer login error:', err);
      return { success: false, error: 'লগইন করার সময় সমস্যা হয়েছে।' };
    }
  };

  // --- কাস্টমার লগআউট ---
  const logoutCustomer = () => {
    try {
      localStorage.removeItem('flamingo_current_user');
      setCurrentUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  // --- অ্যাডমিন লগইন ---
  const loginAdmin = ({ username, password }) => {
    try {
      const staffList = JSON.parse(
        localStorage.getItem('flamingo_staff_users') || JSON.stringify(DEFAULT_STAFF_USERS)
      );

      const matchedStaff = staffList.find(
        (staff) =>
          staff.username.toLowerCase() === username.trim().toLowerCase() &&
          staff.password === password
      );

      if (!matchedStaff) {
        return { success: false, error: 'ভুল অ্যাডমিন ইউজারনেম অথবা পাসওয়ার্ড!' };
      }

      const safeAdmin = {
        username: matchedStaff.username,
        role: matchedStaff.role, // 'superadmin' | 'moderator'
        name: matchedStaff.name,
      };

      localStorage.setItem('flamingo_current_admin', JSON.stringify(safeAdmin));
      setCurrentAdmin(safeAdmin);

      return { success: true, admin: safeAdmin };
    } catch (err) {
      console.error('Admin login error:', err);
      return { success: false, error: 'লগইন প্রসেস ব্যর্থ হয়েছে।' };
    }
  };

  // --- অ্যাডমিন লগআউট ---
  const logoutAdmin = () => {
    try {
      localStorage.removeItem('flamingo_current_admin');
      setCurrentAdmin(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentAdmin,
        isAuthLoaded,
        registerCustomer,
        loginCustomer,
        logoutCustomer,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
