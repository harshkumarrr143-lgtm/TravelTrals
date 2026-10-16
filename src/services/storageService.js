import { travelData } from '../data/travelData.js';
import { formatCloudinaryAvatarUrl } from './cloudinaryService.js';

export const STORAGE_KEYS = {
  CURRENT_USER: 'traveltales_user',
  USERS_REGISTRY: 'traveltales_users_registry',
  FAVORITES: 'traveltales_favorites',
  BOOKINGS: 'traveltales_bookings',
  TRIPS: 'traveltales_trips',
  TRIPS_INITIALIZED: 'traveltales_trips_initialized',
  BUDGET: 'traveltales_budget',
  PASSWORD: 'traveltales_user_password',
  PWD_UPDATED: 'traveltales_user_pwd_updated'
};

/**
 * Generates a clean, deterministic User ID based on email, phone, or username.
 * Guaranteed to return the EXACT same ID on subsequent logins so all user data,
 * trips, profile photos, and settings persist permanently across sessions.
 */
export function getDeterministicUserId(identifier) {
  if (!identifier) return 'usr_guest';
  const clean = identifier.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return clean ? `usr_${clean}` : 'usr_guest';
}

// Default initial state (Clean - No fake users)
const INITIAL_BOOKINGS = [];

// Initial default budget items (Agra, Mathura & Vrindavan)
const INITIAL_BUDGET = [
  {
    id: 'bgt-1',
    description: 'Heritage Hotel Agra Stay (2 Nights)',
    category: 'Lodging',
    amount: 3200,
    paidBy: 'Traveler',
    splitAmong: ['Traveler', 'Pooja', 'Rohan']
  },
  {
    id: 'bgt-2',
    description: 'Agra to Mathura-Vrindavan AC Cab Transfer',
    category: 'Transport',
    amount: 1800,
    paidBy: 'Traveler',
    splitAmong: ['Traveler', 'Pooja', 'Rohan']
  },
  {
    id: 'bgt-3',
    description: 'Chhappan Bhog Prasadam & Authentic Mathura Peda',
    category: 'Food',
    amount: 950,
    paidBy: 'Pooja',
    splitAmong: ['Traveler', 'Pooja', 'Rohan']
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
    // Initialize trips only if first visit and never initialized
    if (!localStorage.getItem(STORAGE_KEYS.TRIPS_INITIALIZED)) {
      if (localStorage.getItem(STORAGE_KEYS.TRIPS) === null) {
        localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(travelData.scheduleTrips));
      }
      localStorage.setItem(STORAGE_KEYS.TRIPS_INITIALIZED, 'true');
    }
    // Initialize budget
    if (!localStorage.getItem(STORAGE_KEYS.BUDGET)) {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(INITIAL_BUDGET));
    }
    // Initialize user registry
    if (!localStorage.getItem(STORAGE_KEYS.USERS_REGISTRY)) {
      localStorage.setItem(STORAGE_KEYS.USERS_REGISTRY, JSON.stringify({}));
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

  // --- MULTI-USER REGISTRY HELPERS ---
  getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_REGISTRY) || '{}');
    } catch {
      return {};
    }
  }

  getUserFromRegistry(userId) {
    if (!userId) return null;
    const users = this.getAllUsers();
    return users[userId] || null;
  }

  saveUserToRegistry(user) {
    if (!user || !user.id) return;
    try {
      const users = this.getAllUsers();
      users[user.id] = {
        ...(users[user.id] || {}),
        ...user,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.USERS_REGISTRY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save user to registry:', e);
    }
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
      if (!user || !user.isLoggedIn) return null;

      // Always pull fresh synced data from the users registry if available
      const registryUser = this.getUserFromRegistry(user.id);
      if (registryUser) {
        // Master source of truth: preserve photoUrl if either copy has it
        const rawPhoto = user.photoUrl || registryUser.photoUrl || '';
        const photo = formatCloudinaryAvatarUrl(rawPhoto);
        const merged = { ...registryUser, ...user, photoUrl: photo, isLoggedIn: true };
        return merged;
      }
      if (user.photoUrl) {
        user.photoUrl = formatCloudinaryAvatarUrl(user.photoUrl);
      }
      return user;
    } catch {
      return null;
    }
  }

  updateProfile(updates) {
    const current = this.getUser() || {
      id: updates.id || (updates.email ? getDeterministicUserId(updates.email) : 'usr_guest'),
      name: updates.name || 'Traveler',
      email: updates.email || '',
      phone: updates.phone || '',
      photoUrl: '',
      bio: '',
      homeCity: '',
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };

    // Protect photoUrl: if updates.photoUrl is empty/missing, preserve existing photoUrl unless explicitly cleared
    let finalPhoto = updates.photoUrl;
    if (finalPhoto === undefined || finalPhoto === null || (finalPhoto === '' && current.photoUrl && !updates.forceClearPhoto)) {
      finalPhoto = current.photoUrl;
    }

    const updated = { 
      ...current, 
      ...updates, 
      photoUrl: formatCloudinaryAvatarUrl(finalPhoto),
      isLoggedIn: true,
      updatedAt: new Date().toISOString()
    };

    // 1. Update session storage safely
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save note for current user:', e);
    }

    // 2. Persist in multi-user registry by stable ID
    try {
      this.saveUserToRegistry(updated);
    } catch (e) {
      console.warn('LocalStorage save note for registry:', e);
    }

    this.notify('user:updated', updated);
    return updated;
  }

  getPassword() {
    try {
      const user = this.getUser();
      if (user && user.password) return user.password;
      if (user && user.id) {
        const regUser = this.getUserFromRegistry(user.id);
        if (regUser && regUser.password) return regUser.password;
      }
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
    // If an existing password was set, verify it matches
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
        user.passwordUpdatedAt = now;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        this.saveUserToRegistry(user);
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
    const userId = getDeterministicUserId(cleanEmail);

    // Look up existing user in registry
    const existing = this.getUserFromRegistry(userId);

    const userName = cleanEmail.includes('@')
      ? cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : cleanEmail.charAt(0).toUpperCase() + cleanEmail.slice(1);

    const user = {
      id: userId,
      name: existing?.name || userName,
      email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@gmail.com`,
      phone: existing?.phone || '',
      photoUrl: existing?.photoUrl || '', // Preserves custom uploaded photo!
      bio: existing?.bio || '',
      homeCity: existing?.homeCity || '',
      isLoggedIn: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (password) {
      user.password = password;
      localStorage.setItem(STORAGE_KEYS.PASSWORD, password);
    } else if (existing?.password) {
      user.password = existing.password;
    }

    // Persist in session and registry
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.saveUserToRegistry(user);

    this.notify('user:login', user);
    return user;
  }

  loginWithPhone(phone, password) {
    const cleanPhone = (phone || '').trim();
    const userId = getDeterministicUserId('ph_' + cleanPhone);
    const existing = this.getUserFromRegistry(userId);

    const user = {
      id: userId,
      name: existing?.name || ('Traveler ' + (cleanPhone.length >= 4 ? cleanPhone.slice(-4) : cleanPhone)),
      email: existing?.email || '',
      phone: cleanPhone,
      photoUrl: existing?.photoUrl || '',
      bio: existing?.bio || '',
      homeCity: existing?.homeCity || '',
      isLoggedIn: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (password) {
      user.password = password;
      localStorage.setItem(STORAGE_KEYS.PASSWORD, password);
    } else if (existing?.password) {
      user.password = existing.password;
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.saveUserToRegistry(user);

    this.notify('user:login', user);
    return user;
  }

  loginWithGoogle(googleEmail, googleName, googlePhoto = '') {
    const cleanEmail = (googleEmail || '').trim();
    const userId = getDeterministicUserId(cleanEmail);
    const existing = this.getUserFromRegistry(userId);

    const name = (googleName && googleName.trim())
      ? googleName.trim()
      : (existing?.name || (cleanEmail.includes('@') ? cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Google Traveler'));

    const user = {
      id: userId,
      name: name,
      email: cleanEmail,
      phone: existing?.phone || '',
      photoUrl: googlePhoto || existing?.photoUrl || '',
      bio: existing?.bio || '',
      homeCity: existing?.homeCity || '',
      isLoggedIn: true,
      provider: 'google',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existing?.password) {
      user.password = existing.password;
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.saveUserToRegistry(user);

    this.notify('user:login', user);
    return user;
  }

  register(userData) {
    const cleanEmail = (userData.email || '').trim();
    const userId = getDeterministicUserId(cleanEmail || userData.name);
    const existing = this.getUserFromRegistry(userId);

    const user = {
      id: userId,
      name: (userData.name || '').trim() || existing?.name || 'New Traveler',
      email: cleanEmail || existing?.email || '',
      phone: (userData.phone || '').trim() || existing?.phone || '',
      photoUrl: userData.photoUrl || existing?.photoUrl || '',
      bio: userData.bio || existing?.bio || '',
      homeCity: userData.homeCity || existing?.homeCity || '',
      isLoggedIn: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (userData.password) {
      user.password = userData.password;
      localStorage.setItem(STORAGE_KEYS.PASSWORD, userData.password);
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.saveUserToRegistry(user);

    this.notify('user:register', user);
    return user;
  }

  logout() {
    const user = this.getUser();
    if (user && user.id) {
      const regUser = this.getUserFromRegistry(user.id);
      if (regUser) {
        regUser.isLoggedIn = false;
        this.saveUserToRegistry(regUser);
      }
    }
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

  // --- TRIPS & ITINERARIES (Scoped by user) ---
  getTrips() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRIPS);
      // Only seed default demo trips on fresh installation if never initialized
      if (raw === null && !localStorage.getItem(STORAGE_KEYS.TRIPS_INITIALIZED)) {
        localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(travelData.scheduleTrips));
        localStorage.setItem(STORAGE_KEYS.TRIPS_INITIALIZED, 'true');
        return travelData.scheduleTrips;
      }

      const allTrips = JSON.parse(raw || '[]');
      const user = this.getUser();
      const currentUserId = user?.id;

      // Filter out invalid/removed trips
      const validTrips = allTrips.filter(t => !/switzerland|alps|crook|tartaruga|gioc|jaipur|amber|hawa/i.test((t.location || '') + ' ' + (t.title || '')));

      if (currentUserId) {
        const userSpecific = validTrips.filter(t => t.userId === currentUserId);
        if (userSpecific.length > 0) {
          return userSpecific;
        }
        // If user has no custom trips created, return remaining unassigned/curated trips (or [] if deleted)
        return validTrips.filter(t => !t.userId);
      }

      return validTrips;
    } catch {
      return [];
    }
  }

  setTrips(trips) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips || []));
      localStorage.setItem(STORAGE_KEYS.TRIPS_INITIALIZED, 'true');
      this.notify('trips:updated', trips || []);
    } catch (e) {
      console.warn('Failed to set trips:', e);
    }
  }

  addTrip(tripData) {
    const allTrips = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || '[]');
    const user = this.getUser();
    const currentUserId = user?.id || 'usr_guest';

    const newTrip = {
      id: tripData.id || ('sch-' + Date.now().toString(36)),
      userId: currentUserId,
      status: 'Confirmed',
      attendees: tripData.attendees || 1,
      image: tripData.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80',
      ...tripData
    };

    allTrips.unshift(newTrip);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(allTrips));
    localStorage.setItem(STORAGE_KEYS.TRIPS_INITIALIZED, 'true');
    this.notify('trips:updated', allTrips);
    return newTrip;
  }

  deleteTrip(tripId) {
    let allTrips = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || '[]');
    allTrips = allTrips.filter(t => t.id !== tripId);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(allTrips));
    // Explicitly record that the user has modified their trips so we NEVER auto-fill again
    localStorage.setItem(STORAGE_KEYS.TRIPS_INITIALIZED, 'true');
    this.notify('trips:updated', allTrips);
    return allTrips;
  }

  clearAllTrips() {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TRIPS_INITIALIZED, 'true');
    this.notify('trips:updated', []);
    return [];
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

  calculateBudgetSummary() {
    const items = this.getBudgetItems();
    const totalSpent = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    
    const balances = {};
    const allMembers = new Set();

    items.forEach(item => {
      const paidBy = (item.paidBy || 'Traveler').trim();
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
      const net = paid - share;
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

  // Export full app data
  exportFirebaseData() {
    return {
      users: this.getAllUsers(),
      currentUser: this.getUser(),
      favorites: this.getFavorites(),
      bookings: this.getBookings(),
      trips: this.getTrips(),
      budget: this.getBudgetItems(),
      exportedAt: new Date().toISOString()
    };
  }
}

export const storage = new StorageService();
