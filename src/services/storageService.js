// Storage Service with Firebase-ready schema and LocalStorage fallback
import { travelData } from '../data/travelData.js';

const STORAGE_KEYS = {
  CURRENT_USER: 'traveltales_user',
  FAVORITES: 'traveltales_favorites',
  BOOKINGS: 'traveltales_bookings',
  TRIPS: 'traveltales_trips',
  BUDGET: 'traveltales_budget',
  PASSWORD: 'traveltales_user_password',
  PWD_UPDATED: 'traveltales_user_pwd_updated'
};

// Default initial state (Clean - No fake users)
const INITIAL_BOOKINGS = [];

// Initial default budget items (Agra, Mathura & Vrindavan)
const INITIAL_BUDGET = [
  {
    id: 'bgt-1',
    description: 'Heritage Hotel Agra Stay (2 Nights)',
    category: 'Lodging',
    amount: 3200,
    paidBy: 'Alex',
    splitAmong: ['Alex', 'Harsh', 'Pooja', 'Rohan']
  },
  {
    id: 'bgt-2',
    description: 'Agra to Mathura-Vrindavan AC Cab Transfer',
    category: 'Transport',
    amount: 1800,
    paidBy: 'Harsh',
    splitAmong: ['Alex', 'Harsh', 'Pooja', 'Rohan']
  },
  {
    id: 'bgt-3',
    description: 'Chhappan Bhog Prasadam & Authentic Mathura Peda',
    category: 'Food',
    amount: 950,
    paidBy: 'Pooja',
    splitAmong: ['Alex', 'Harsh', 'Pooja', 'Rohan']
  }
];

class StorageService {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    // Initialize default favorites if not present
    if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['taj-mahal', 'prem-mandir', 'krishna-janmabhoomi']));
    }
    // Initialize default bookings
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    }
    // Initialize trips
    if (!localStorage.getItem(STORAGE_KEYS.TRIPS)) {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(travelData.scheduleTrips));
    }
    // Initialize budget
    if (!localStorage.getItem(STORAGE_KEYS.BUDGET)) {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(INITIAL_BUDGET));
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, data) {
    this.listeners.forEach(cb => {
      try { cb(event, data); } catch (e) { console.error(e); }
    });
  }

  // --- USER AUTH & PROFILE ---
  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) return null;
      const user = JSON.parse(data);
      // Remove any leftover legacy demo users
      if (user && (user.id === 'usr_alex_01' || user.id === 'usr_user_default' || user.name === 'Alex Rivera' || user.name === 'Elena Rostova' || user.email === 'alex.rivera@example.com')) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return null;
      }
      return (user && user.isLoggedIn) ? user : null;
    } catch {
      return null;
    }
  }

  updateProfile(updates) {
    const current = this.getUser() || {
      id: 'usr_' + Date.now().toString(36),
      name: 'Traveler',
      email: '',
      phone: '',
      photoUrl: '',
      bio: '',
      homeCity: '',
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };
    const updated = { ...current, ...updates, isLoggedIn: true };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    this.notify('user:updated', updated);
    return updated;
  }

  getPassword() {
    try {
      const user = this.getUser();
      if (user && user.password) return user.password;
      return localStorage.getItem(STORAGE_KEYS.PASSWORD) || '';
    } catch {
      return '';
    }
  }

  getPasswordUpdatedAt() {
    try {
      return localStorage.getItem(STORAGE_KEYS.PWD_UPDATED) || null;
    } catch {
      return null;
    }
  }

  changePassword(currentPassword, newPassword) {
    const existingPassword = this.getPassword();
    // If no existing password set, allow setting the first password
    if (existingPassword && currentPassword !== existingPassword) {
      return { success: false, message: 'Incorrect current password. Please try again.' };
    }
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }
    if (existingPassword && newPassword === existingPassword) {
      return { success: false, message: 'New password must be different from your current password.' };
    }

    try {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PASSWORD, newPassword);
      localStorage.setItem(STORAGE_KEYS.PWD_UPDATED, now);

      const user = this.getUser();
      if (user) {
        user.password = newPassword;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      }

      this.notify('user:password_changed', { updatedAt: now });
      return { success: true, message: 'Password updated successfully!', updatedAt: now };
    } catch (err) {
      console.error('Failed to change password:', err);
      return { success: false, message: 'Failed to save new password. Please try again.' };
    }
  }

  loginWithEmail(email, password) {
    if (!email) return null;
    const cleanEmail = email.trim();
    const userName = cleanEmail.includes('@')
      ? cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : cleanEmail.charAt(0).toUpperCase() + cleanEmail.slice(1);

    const user = {
      id: 'usr_' + Date.now().toString(36),
      name: userName,
      email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@gmail.com`,
      phone: '',
      photoUrl: '', // Clean profile, no fake image
      bio: '',
      homeCity: '',
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };
    if (password) {
      user.password = password;
      localStorage.setItem(STORAGE_KEYS.PASSWORD, password);
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify('user:login', user);
    return user;
  }

  loginWithPhone(phone, password) {
    const cleanPhone = (phone || '').trim();
    const user = {
      id: 'usr_ph_' + Date.now().toString(36),
      name: 'Traveler ' + (cleanPhone.length >= 4 ? cleanPhone.slice(-4) : cleanPhone),
      email: '',
      phone: cleanPhone,
      photoUrl: '', // Clean profile, no fake image
      bio: '',
      homeCity: '',
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };
    if (password) {
      user.password = password;
      localStorage.setItem(STORAGE_KEYS.PASSWORD, password);
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify('user:login', user);
    return user;
  }

  loginWithGoogle(googleEmail, googleName, googlePhoto = '') {
    const cleanEmail = (googleEmail || '').trim();
    const name = (googleName && googleName.trim())
      ? googleName.trim()
      : (cleanEmail.includes('@') ? cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Google Traveler');

    const user = {
      id: 'usr_g_' + Date.now().toString(36),
      name: name,
      email: cleanEmail,
      phone: '',
      photoUrl: googlePhoto || '', // Real photo if provided via Google or empty
      bio: '',
      homeCity: '',
      isLoggedIn: true,
      provider: 'google',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify('user:login', user);
    return user;
  }

  register(userData) {
    const user = {
      id: 'usr_reg_' + Date.now().toString(36),
      name: (userData.name || '').trim() || 'New Traveler',
      email: (userData.email || '').trim(),
      phone: (userData.phone || '').trim(),
      photoUrl: userData.photoUrl || '', // Clean, no fake image
      bio: userData.bio || '',
      homeCity: userData.homeCity || '',
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };
    if (userData.password) {
      user.password = userData.password;
      localStorage.setItem(STORAGE_KEYS.PASSWORD, userData.password);
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify('user:register', user);
    return user;
  }

  logout() {
    const user = this.getUser();
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.notify('user:logout', user);
  }

  // --- FAVORITES / WISHLIST ---
  getFavorites() {
    try {
      const favs = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
      const validIds = travelData.attractions.map(a => a.id);
      const filtered = favs.filter(id => validIds.includes(id));
      if (filtered.length !== favs.length) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
      }
      return filtered;
    } catch {
      return [];
    }
  }

  isFavorite(attractionId) {
    const favs = this.getFavorites();
    return favs.includes(attractionId);
  }

  toggleFavorite(attractionId) {
    let favs = this.getFavorites();
    if (favs.includes(attractionId)) {
      favs = favs.filter(id => id !== attractionId);
    } else {
      favs.push(attractionId);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    this.notify('favorites:updated', favs);
    return favs;
  }

  // --- BOOKINGS & TICKETS ---
  getBookings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    } catch {
      return [];
    }
  }

  createBooking(bookingData) {
    const bookings = this.getBookings();
    const newBooking = {
      id: 'TT-BK-' + Math.floor(1000 + Math.random() * 9000),
      bookedAt: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TT-BK-${Math.floor(1000 + Math.random() * 9000)}`,
      ...bookingData
    };
    bookings.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    this.notify('bookings:created', newBooking);
    return newBooking;
  }

  cancelBooking(bookingId) {
    let bookings = this.getBookings();
    bookings = bookings.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    this.notify('bookings:updated', bookings);
    return bookings;
  }

  // --- TRIPS & ITINERARIES ---
  getTrips() {
    try {
      const trips = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || '[]');
      const filtered = trips.filter(t => !/switzerland|alps|crook|tartaruga|gioc|jaipur|amber|hawa/i.test((t.location || '') + ' ' + (t.title || '')));
      if (filtered.length === 0) {
        localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(travelData.scheduleTrips));
        return travelData.scheduleTrips;
      }
      return filtered;
    } catch {
      return travelData.scheduleTrips;
    }
  }

  addTrip(tripData) {
    const trips = this.getTrips();
    const newTrip = {
      id: 'sch-' + Date.now().toString(36),
      status: 'Confirmed',
      attendees: 1,
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80',
      ...tripData
    };
    trips.unshift(newTrip);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    this.notify('trips:updated', trips);
    return newTrip;
  }

  deleteTrip(tripId) {
    let trips = this.getTrips();
    trips = trips.filter(t => t.id !== tripId);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    this.notify('trips:updated', trips);
    return trips;
  }

  // --- BUDGET SHARING ---
  getBudgetItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGET) || '[]');
    } catch {
      return [];
    }
  }

  addBudgetItem(item) {
    const items = this.getBudgetItems();
    const newItem = {
      id: 'bgt-' + Date.now().toString(36),
      ...item
    };
    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(items));
    this.notify('budget:updated', items);
    return newItem;
  }

  deleteBudgetItem(itemId) {
    let items = this.getBudgetItems();
    items = items.filter(i => i.id !== itemId);
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(items));
    this.notify('budget:updated', items);
    return items;
  }

  // Calculate settlement balances
  calculateBudgetSummary() {
    const items = this.getBudgetItems();
    const totalSpent = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    
    // Track paid totals and owed totals
    const balances = {};
    const allMembers = new Set();

    items.forEach(item => {
      const paidBy = item.paidBy.trim();
      const splitWith = item.splitAmong && item.splitAmong.length > 0 ? item.splitAmong : [paidBy];
      const perShare = Number(item.amount) / splitWith.length;

      allMembers.add(paidBy);
      splitWith.forEach(m => allMembers.add(m.trim()));

      if (!balances[paidBy]) balances[paidBy] = { paid: 0, share: 0 };
      balances[paidBy].paid += Number(item.amount);

      splitWith.forEach(m => {
        const member = m.trim();
        if (!balances[member]) balances[member] = { paid: 0, share: 0 };
        balances[member].share += perShare;
      });
    });

    const memberBreakdown = Object.keys(balances).map(member => {
      const { paid, share } = balances[member];
      const net = paid - share; // positive means owed money, negative means owes money
      return {
        name: member,
        paid: Math.round(paid),
        share: Math.round(share),
        net: Math.round(net)
      };
    });

    return {
      totalSpent: Math.round(totalSpent),
      memberCount: allMembers.size,
      breakdown: memberBreakdown
    };
  }

  // Export full app data to Firebase-ready JSON
  exportFirebaseData() {
    return {
      users: { [this.getUser()?.id || 'usr_default']: this.getUser() },
      favorites: this.getFavorites(),
      bookings: this.getBookings(),
      trips: this.getTrips(),
      budget: this.getBudgetItems(),
      exportedAt: new Date().toISOString()
    };
  }
}

export const storage = new StorageService();
