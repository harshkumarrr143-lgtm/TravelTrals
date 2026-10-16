// Notification Service for user activity tracking and live alerts

const NOTIFICATIONS_KEY = 'traveltales_notifications';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif_welcome',
    title: 'Welcome to TravelTales! 🚀',
    message: 'Explore heritage wonders across Agra, Mathura, and Vrindavan with curated GoCity itineraries.',
    type: 'system',
    icon: '🧭',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: 'notif_taj',
    title: 'Taj Mahal Fast-Pass Ready 🎟️',
    message: 'Skip-the-line sunrise passes and authorized ASI guides are available for booking.',
    type: 'booking',
    icon: '✨',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false
  }
];

class NotificationService {
  constructor() {
    this.listeners = [];
  }

  getNotifications() {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY);
      if (!raw) {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
        return DEFAULT_NOTIFICATIONS;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  }

  getUnreadCount() {
    const list = this.getNotifications();
    return list.filter(n => !n.read).length;
  }

  addNotification({ title, message, type = 'system', icon = '🔔', link = null }) {
    const list = this.getNotifications();
    const newNotif = {
      id: 'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      title: title || 'Travel Update',
      message: message || '',
      type,
      icon,
      link,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Add to top of list and cap at 30 items
    list.unshift(newNotif);
    if (list.length > 30) list.length = 30;

    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
      this.notify(list);
    } catch (e) {
      console.warn('Failed to save notification:', e);
    }

    return newNotif;
  }

  markAsRead(id) {
    const list = this.getNotifications();
    let changed = false;
    list.forEach(n => {
      if (n.id === id && !n.read) {
        n.read = true;
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
      this.notify(list);
    }
    return list;
  }

  markAllAsRead() {
    const list = this.getNotifications();
    list.forEach(n => { n.read = true; });
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    this.notify(list);
    return list;
  }

  clearAll() {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
    this.notify([]);
    return [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(data) {
    this.listeners.forEach(cb => {
      try { cb(data); } catch (e) { console.error('Notification listener error:', e); }
    });
  }

  formatTime(isoString) {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 7) return `${diffDay}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }
}

export const notificationService = new NotificationService();
