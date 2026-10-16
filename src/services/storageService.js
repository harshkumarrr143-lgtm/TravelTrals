// Storage Service with Firebase-ready schema and LocalStorage fallback
import { travelData } from '../data/travelData.js';

const STORAGE_KEYS = {
  CURRENT_USER: 'traveltales_user',
  FAVORITES: 'traveltales_favorites',
  BOOKINGS: 'traveltales_bookings',
  TRIPS: 'traveltales_trips',
  BUDGET: 'traveltales_budget'
};

// Default Demo User
const DEFAULT_USER = {
  id: 'usr_alex_01',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  phone: '+91 98765 43210',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Passionate traveler exploring the sacred temples of Vrindavan, holy ghats of Mathura, and Mughal wonders of Agra.',
  homeCity: 'Agra, India',
  isLoggedIn: true,
  createdAt: '2024-01-15'
};

// Initial default bookings to showcase the feature
const INITIAL_BOOKINGS = [
  {
    id: 'TT-BK-9281',
    attractionId: 'taj-mahal',
    attractionName: 'Taj Mahal',
    cityName: 'Agra, India',
    date: '2024-06-18',
    timeSlot: '06:00 AM - 08:30 AM (Sunrise Slot)',
    ticketTier: 'Skip-The-Line VIP Entry',
    guests: { adults: 2, children: 0 },
    totalPaid: 3300,
    currency: '₹',
    paymentMethod: 'Google Pay (UPI)',
    status: 'Confirmed',
    bookedAt: '2024-05-10',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TT-BK-9281-TAJ-MAHAL'
  }
];

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
    // Initialize default user if not present
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
    }
    // Initialize default favorites
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
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  updateProfile(updates) {
    const current = this.getUser() || DEFAULT_USER;
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    this.notify('user:updated', updated);
    return updated;
  }

  loginWithEmail(email, password) {
    const isDefault = !email || email.trim().toLowerCase() === 'user' || email.trim().toLowerCase() === 'user@traveltales.com';
    const userName = isDefault 
      ? 'User' 
      : (email.includes('@') ? email.split('@')[0].replace('.', ' ').replace(/^(\w)/, c => c.toUpperCase()) : email);

    const user = {
      id: isDefault ? 'usr_user_default' : 'usr_' + Date.now().toString(36),
      name: userName,
      email: isDefault ? 'user@traveltales.com' : (email.includes('@') ? email : `${email}@traveltales.com`),
      phone: '+91 98765 43210',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: 'Enthusiastic explorer visiting historical landmarks and holy cities.',
      homeCity: 'Agra, India',
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify('user:login', user);
    return user;
  }

  loginWithPhone(phone, password) {
    const user = {
      id: 'usr_ph_' + Date.now().toString(36),
      name: 'Traveler ' + phone.slice(-4),
      email: `user${phone.slice(-4)}@traveltales.io`,
      phone: phone,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Mobile verified traveler ready for spontaneous journeys.',
      homeCity: 'Mathura, India',
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify('user:login', user);
    return user;
  }

  loginWithGoogle() {
    const user = {
      id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
      name: 'Elena Rostova',
      email: 'elena.rostova@gmail.com',
      phone: '+91 98765 12345',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Photographer & culture seeker. Exploring sacred temples, forts, and holy river ghats.',
      homeCity: 'Vrindavan, India',
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify('user:login', user);
    return user;
  }

  register(userData) {
    const user = {
      id: 'usr_reg_' + Date.now().toString(36),
      name: userData.name || 'New Traveler',
      email: userData.email || '',
      phone: userData.phone || '',
      photoUrl: userData.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: userData.bio || 'New explorer on TravelTales.',
      homeCity: userData.homeCity || 'Traveler Destination',
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify('user:register', user);
    return user;
  }

  logout() {
    const user = this.getUser();
    // Clear user session completely from localStorage
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
      return filtered.length > 0 ? filtered : ['taj-mahal', 'prem-mandir', 'krishna-janmabhoomi'];
    } catch {
      return ['taj-mahal', 'prem-mandir', 'krishna-janmabhoomi'];
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
