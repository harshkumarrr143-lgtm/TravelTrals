// Main Application Orchestrator & GSAP Animation Controller
import './style.css';
import gsap from 'gsap';
import { travelData } from './data/travelData.js';
import { storage } from './services/storageService.js';
import { saveFirebaseConfig } from './services/firebaseConfig.js';

// Import UI Components
import { renderSidebar, renderTopbar } from './components/navigation.js';
import { renderHero, setHeroAttraction, getHeroAttraction, initHeroVideoCycle } from './components/hero.js';
import { renderPopularPlaces, setSkeletonDemo } from './components/popularPlaces.js';
import { renderScheduleCalendar, setActiveCalendarDay } from './components/scheduleCalendar.js';
import { renderAttractionModal, initLeafletMapForAttraction } from './components/attractionModal.js';
import { renderBookingModal, setBookingAttraction, triggerSuccessConfetti, updateBookingField, getBookingState } from './components/bookingModal.js';
import { renderAuthModal, setAuthModalState } from './components/authModal.js';
import { renderAuthPage, setAuthPageTab } from './components/authPage.js';
import { renderGoogleLoginModal } from './components/googleLoginModal.js';
import { requestBrowserLocation, setPresetLocation } from './services/locationService.js';
import { renderUserProfile, setProfileTab } from './components/userProfile.js';
import { renderTripPlanner, setPlannerTool, plannerState } from './components/tripPlanner.js';
import { renderPresentationView, openPresentationForTrip, nextSlide, prevSlide } from './components/presentationView.js';
import { renderFirebaseModal } from './components/firebaseModal.js';
import { renderCloudServicesModal } from './components/cloudServicesModal.js';
import { renderWishlistView, setWishlistCityFilter, renderWishlistEmptyState } from './components/wishlistView.js';
import { 
  uploadImageToCloudinary, 
  isCloudinaryConfigured, 
  getCloudinaryConfig, 
  saveCloudinaryConfig 
} from './services/cloudinaryService.js';
import { 
  saveUserProfileToFirestore, 
  recordImageInFirestore,
  saveTripToFirestore,
  deleteTripFromFirestore,
  getUserTripsFromFirestore
} from './services/firestoreService.js';

// Application State
const appState = {
  currentTab: 'dashboard', // 'dashboard', 'discover', 'tickets', 'favorites', 'planner', 'profile'
  searchQuery: '',
  activeAttractionModalId: null,
  isBookingModalOpen: false,
  isAuthModalOpen: false,
  isPresentationOpen: false,
  isFirebaseModalOpen: false,
  currentHeroMode: 'video',
  isVideoPlaying: true,
  isVideoMuted: true
};

// Main App Render
function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const user = storage.getUser();
  const isLoggedIn = user && user.isLoggedIn;

  if (!isLoggedIn || appState.currentTab === 'auth' || appState.currentTab === 'login' || appState.currentTab === 'register') {
    // Full-screen auth page — no sidebar/topbar
    appContainer.innerHTML = `
      ${renderCurrentView()}
      <div id="modalsContainer"></div>
    `;
    return;
  }

  const isCollapsed = localStorage.getItem('traveltales_sidebar_collapsed') === 'true';

  appContainer.innerHTML = `
    <div class="app-layout">
      ${renderSidebar(appState.currentTab, isCollapsed)}
      <div class="main-wrapper" id="mainWrapper">
        ${renderTopbar()}
        <div class="main-content-scroll" id="mainContentScroll">
          ${renderCurrentView()}
        </div>
      </div>
    </div>

    <!-- Modals Container -->
    <div id="modalsContainer"></div>
  `;

  // Animate with GSAP
  animatePageEntrance();

  // Start hero video cycling (Taj Mahal → Red Fort → loop)
  requestAnimationFrame(() => { initHeroVideoCycle(); });
}


window.toggleSidebarCollapse = function() {
  const sidebar = document.getElementById('mainSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
    const isNowCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('traveltales_sidebar_collapsed', isNowCollapsed ? 'true' : 'false');
    
    // Also toggle mobile drawer open if on small screen
    if (window.innerWidth < 900) {
      sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('active', sidebar.classList.contains('open'));
    }
  }
};

window.updateMainContent = function() {
  const container = document.getElementById('mainContentScroll');
  if (container) {
    container.innerHTML = renderCurrentView();
    container.scrollTo({ top: 0, behavior: 'smooth' });
    animatePageEntrance();
  } else {
    renderApp();
  }
};

function renderCurrentView() {
  const user = storage.getUser();
  const isLoggedIn = user && user.isLoggedIn;

  // Guard: if not logged in, always show auth page
  if (!isLoggedIn) {
    return renderAuthPage();
  }

  if (appState.currentTab === 'login' || appState.currentTab === 'register' || appState.currentTab === 'auth') {
    return renderAuthPage();
  } else if (appState.currentTab === 'profile') {
    return renderUserProfile();
  } else if (appState.currentTab === 'planner') {
    return renderTripPlanner();
  } else if (appState.currentTab === 'favorites') {
    return renderWishlistView();
  } else if (appState.currentTab === 'discover') {
    return `
      <div class="profile-view-container">
        <div style="margin-bottom: 24px;">
          <h2 style="font-family: var(--font-heading); font-size: 26px; font-weight: 800;">
            Discover Historic &amp; Sacred Destinations
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary);">
            Explore curated landmarks and holy temples across Agra, Mathura, and Vrindavan.
          </p>
        </div>
        ${renderPopularPlaces()}
      </div>
    `;
  }

  // Default: Dashboard View (matching reference mockup)
  return `
    <div class="dashboard-page-wrapper">
      ${renderHero()}
      <main class="dashboard-grid">
        <div class="center-column">
          ${renderPopularPlaces()}
        </div>
        ${renderScheduleCalendar()}
      </main>
    </div>
  `;
}

// GSAP Animations
function animatePageEntrance() {
  // Smooth GSAP card reveal
  gsap.from('.hero-card', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out'
  });

  gsap.from('.gsap-card-item', {
    y: 30,
    opacity: 0,
    duration: 0.5,
    stagger: 0.08,
    ease: 'power2.out',
    delay: 0.1
  });

  gsap.from('.calendar-card, .schedule-card, .planner-tools-card', {
    x: 20,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0.15
  });
}

// Global Window Event Handlers & API Bridges
window.navigateTo = function(tabName) {
  appState.currentTab = tabName;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cascading Menu: click to open/close
window.toggleExploreCitiesMenu = function(e) {
  if (e) e.stopPropagation();
  const trigger = document.getElementById('exploreCitiesTrigger') || document.querySelector('.mega-menu-trigger');
  if (trigger) {
    trigger.classList.toggle('open');
  }
};

document.addEventListener('click', (e) => {
  const trigger = document.getElementById('exploreCitiesTrigger') || document.querySelector('.mega-menu-trigger');
  if (trigger && trigger.classList.contains('open')) {
    if (!trigger.contains(e.target)) {
      trigger.classList.remove('open');
    }
  }
});

// Cascading Menu: switch city on hover / click
window.switchMenuCity = function(cityId) {
  const city = travelData.cities.find(c => c.id === cityId);
  if (!city) return;

  // Update active state in city column
  document.querySelectorAll('.city-menu-item').forEach(item => {
    item.classList.toggle('active', item.dataset.cityId === cityId);
  });

  const cityTitle = document.getElementById('dropdownCityTitle');
  const attractionsGrid = document.getElementById('dropdownAttractionsGrid');

  if (cityTitle) cityTitle.textContent = `Attractions in ${city.name}`;

  if (attractionsGrid) {
    const cityAttractions = travelData.attractions.filter(a => a.cityId === cityId);
    attractionsGrid.innerHTML = cityAttractions.map(att => `
      <div class="attraction-menu-item" onclick="window.openAttractionModal('${att.id}')">
        <img src="${att.image}" alt="${att.name}" class="attraction-menu-thumb" />
        <div class="attraction-menu-info">
          <h4>${att.name}</h4>
          <p>${att.subtitle.substring(0, 32)}...</p>
          <div class="price-tag">From ${att.prices.currency}${att.prices.basePrice}</div>
        </div>
      </div>
    `).join('');

    // GSAP micro-animation on sub-menu update
    gsap.from('.attraction-menu-item', {
      opacity: 0,
      y: 6,
      stagger: 0.05,
      duration: 0.2,
      ease: 'power1.out'
    });
  }
};

// Hero Video & Controls
window.toggleHeroMode = function(mode) {
  appState.currentHeroMode = mode;
  const wrapper = document.getElementById('heroMediaWrapper');
  const att = getHeroAttraction();
  if (!wrapper) return;

  if (mode === 'video') {
    wrapper.innerHTML = `
      <video class="hero-video-element" id="heroAttractionVideo" autoplay loop muted playsinline poster="${att.image}">
        <source src="${att.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}" type="video/mp4" />
      </video>
      <div class="hero-video-badge">
        <span class="video-pulse"></span>
        4K Attraction Stream
      </div>
      <div class="hero-media-controls">
        <button class="media-control-btn" onclick="window.toggleHeroPlayPause()">▶/⏸</button>
        <button class="media-control-btn" onclick="window.toggleHeroMute()">🔊</button>
      </div>
    `;
  } else {
    wrapper.innerHTML = `<img src="${att.image}" alt="${att.name}" class="hero-image-fallback" />`;
  }

  document.querySelectorAll('.mode-toggle-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase().includes(mode));
  });
};

window.toggleHeroPlayPause = function() {
  const vid = document.getElementById('heroBgVideo');
  if (vid) {
    if (vid.paused) { vid.play(); appState.isVideoPlaying = true; }
    else { vid.pause(); appState.isVideoPlaying = false; }
  }
};

window.toggleHeroMute = function() {
  const vid = document.getElementById('heroBgVideo');
  if (vid) {
    vid.muted = !vid.muted;
    appState.isVideoMuted = vid.muted;
    const icon = document.getElementById('muteIcon');
    if (icon) {
      icon.innerHTML = vid.muted
        ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
        : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
    }
  }
};

window.setHeroFocus = function() {};
window.selectHeroThumbnail = function() {};

// Skeletons Simulation Toggle
window.toggleSkeletonDemo = function() {
  const current = appState.isSkeletonActive || false;
  appState.isSkeletonActive = !current;
  setSkeletonDemo(!current);
  window.updateMainContent();
};

// Search Destination Filter
window.handleSearchInput = function(e) {
  const query = e.target.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.travel-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? 'flex' : 'none';
  });
};

window.handleSearchClick = function() {
  const input = document.getElementById('globalSearchInput');
  if (input && input.value.trim()) {
    window.navigateTo('discover');
    setTimeout(() => {
      const q = input.value.toLowerCase().trim();
      document.querySelectorAll('.travel-card').forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
      });
    }, 100);
  }
};

window.toggleFilterModal = function() {
  window.alert('Filter options: Filter by Category (Heritage, Nature, Spiritual), Price tier (Free to $1080+), Duration, and Accessibility.');
};

// Floating Feedback Toast
function showToast(msg, icon = '✨') {
  const existing = document.getElementById('appGlobalToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'appGlobalToast';
  toast.className = 'travel-toast';
  toast.innerHTML = `
    <span style="font-size: 16px;">${icon}</span>
    <span>${msg}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px) scale(0.95)';
    setTimeout(() => { toast.remove(); }, 300);
  }, 2200);
}

// Unwish Destination Handler (Remove from Wishlist with smooth animation)
window.handleUnwish = function(attractionId, e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  const att = travelData.attractions.find(a => a.id === attractionId);
  const name = att ? att.name : 'Destination';

  // Remove from storage
  if (storage.isFavorite(attractionId)) {
    storage.toggleFavorite(attractionId);
  }

  // Update heart buttons across all views
  document.querySelectorAll(`.travel-card[data-id="${attractionId}"] .card-fav-btn`).forEach(btn => {
    btn.classList.remove('active');
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', 'none');
  });

  // Update modal heart if open
  const modalFavBtn = document.querySelector('#attractionModalOverlay .icon-btn-circle');
  if (modalFavBtn && appState.activeAttractionModalId === attractionId) {
    const svg = modalFavBtn.querySelector('svg');
    if (svg) svg.setAttribute('fill', 'none');
    modalFavBtn.setAttribute('title', 'Save to wishlist');
  }

  // Update badge in sidebar
  const remainingFavs = storage.getFavorites();
  const badge = document.getElementById('navFavsBadge');
  if (badge) badge.textContent = remainingFavs.length;

  // Animate and remove card from Wishlist view
  const card = document.getElementById(`wishlist-card-${attractionId}`);
  if (card) {
    card.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.85) translateY(14px)';

    setTimeout(() => {
      card.remove();

      // Update header count
      const headerCount = document.getElementById('wishlistHeaderCount');
      if (headerCount) {
        headerCount.innerHTML = `
          <span class="counter-number">${remainingFavs.length}</span>
          <span class="counter-label">Saved Places</span>
        `;
      }

      // If empty, show empty state
      const grid = document.getElementById('wishlistCardsGrid');
      if (grid && remainingFavs.length === 0) {
        grid.outerHTML = renderWishlistEmptyState();
      }
    }, 350);
  } else {
    // If we're on favorites tab and card wasn't found by id
    if (appState.currentTab === 'favorites') {
      renderApp();
    }
  }

  showToast(`Unwished ${name}`, '💔');
};

// Filter Wishlist by City
window.filterWishlistByCity = function(cityId) {
  setWishlistCityFilter(cityId);
  renderApp();
};

// Favorites handling
window.handleToggleFavorite = function(attractionId, e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  const att = travelData.attractions.find(a => a.id === attractionId);
  const name = att ? att.name : 'Destination';

  // If on Wishlist page and item is currently favorited, user is clicking to unwish
  if (appState.currentTab === 'favorites' && storage.isFavorite(attractionId)) {
    window.handleUnwish(attractionId, e);
    return;
  }

  storage.toggleFavorite(attractionId);
  const isFav = storage.isFavorite(attractionId);

  // Update card heart icons
  document.querySelectorAll(`.travel-card[data-id="${attractionId}"] .card-fav-btn`).forEach(btn => {
    btn.classList.toggle('active', isFav);
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', isFav ? '#EF4444' : 'none');
  });

  // Update modal heart if open
  const modalFavBtn = document.querySelector('#attractionModalOverlay .icon-btn-circle');
  if (modalFavBtn && appState.activeAttractionModalId === attractionId) {
    const svg = modalFavBtn.querySelector('svg');
    if (svg) svg.setAttribute('fill', isFav ? '#EF4444' : 'none');
    modalFavBtn.setAttribute('title', isFav ? 'Remove from wishlist' : 'Save to wishlist');
  }

  // Update badge in sidebar
  const badge = document.getElementById('navFavsBadge');
  if (badge) badge.textContent = storage.getFavorites().length;

  if (isFav) {
    showToast(`Added ${name} to Wishlist ❤️`, '❤️');
  } else {
    showToast(`Unwished ${name}`, '💔');
  }
};

// Card click opens attraction modal
window.handleCardClick = function(attractionId, e) {
  if (e.target.closest('.card-fav-btn')) return;
  window.openAttractionModal(attractionId);
};

// Attraction Modal
window.openAttractionModal = function(attractionId) {
  appState.activeAttractionModalId = attractionId;
  const modals = document.getElementById('modalsContainer');
  if (!modals) return;

  modals.innerHTML = renderAttractionModal(attractionId);
  const overlay = document.getElementById('attractionModalOverlay');
  if (overlay) {
    overlay.classList.add('open');
    initLeafletMapForAttraction(attractionId);
  }
};

window.closeAttractionModal = function() {
  const overlay = document.getElementById('attractionModalOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.remove(); }, 250);
  }
};

// Booking & Checkout Flow
window.openBookingModal = function(attractionId) {
  window.closeAttractionModal();
  setBookingAttraction(attractionId);
  const modals = document.getElementById('modalsContainer');
  if (!modals) return;

  modals.innerHTML = renderBookingModal();
  const overlay = document.getElementById('bookingModalOverlay');
  if (overlay) overlay.classList.add('open');
};

window.closeBookingModal = function() {
  const overlay = document.getElementById('bookingModalOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.remove(); }, 250);
  }
};

window.updateBookingTier = function(tierIdx) {
  updateBookingField('selectedTierIndex', tierIdx);
  const modals = document.getElementById('modalsContainer');
  if (modals) modals.innerHTML = renderBookingModal();
  document.getElementById('bookingModalOverlay')?.classList.add('open');
};

window.updateBookingDate = function(val) {
  updateBookingField('date', val);
};

window.updateBookingSlot = function(val) {
  updateBookingField('timeSlot', val);
};

window.updateGuests = function(type, delta) {
  const state = getBookingState();
  const current = state[type] || 0;
  const next = Math.max(type === 'adults' ? 1 : 0, current + delta);
  updateBookingField(type, next);

  const modals = document.getElementById('modalsContainer');
  if (modals) modals.innerHTML = renderBookingModal();
  document.getElementById('bookingModalOverlay')?.classList.add('open');
};

window.proceedToPayment = function() {
  updateBookingField('step', 2);
  const modals = document.getElementById('modalsContainer');
  if (modals) modals.innerHTML = renderBookingModal();
  document.getElementById('bookingModalOverlay')?.classList.add('open');
};

window.backToBookingDetails = function() {
  updateBookingField('step', 1);
  const modals = document.getElementById('modalsContainer');
  if (modals) modals.innerHTML = renderBookingModal();
  document.getElementById('bookingModalOverlay')?.classList.add('open');
};

window.selectPaymentMethod = function(method) {
  updateBookingField('paymentMethod', method);
  const modals = document.getElementById('modalsContainer');
  if (modals) modals.innerHTML = renderBookingModal();
  document.getElementById('bookingModalOverlay')?.classList.add('open');
};

window.processPaymentExecution = function(attractionId, totalPaid, tierName, currency) {
  const btn = document.getElementById('btnConfirmPay');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="video-pulse" style="display: inline-block; margin-right: 8px;"></span> Authorizing Transaction...`;
  }

  const bState = getBookingState();
  const att = travelData.attractions.find(a => a.id === attractionId) || travelData.attractions[0];

  setTimeout(() => {
    // Save to storage
    const newBooking = storage.createBooking({
      attractionId: att.id,
      attractionName: att.name,
      cityName: att.cityName,
      date: bState.date,
      timeSlot: bState.timeSlot,
      ticketTier: tierName,
      guests: { adults: bState.adults, children: bState.children },
      totalPaid: totalPaid,
      currency: currency,
      paymentMethod: bState.paymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' : 'Credit Card (Visa)'
    });

    updateBookingField('confirmedBooking', newBooking);
    updateBookingField('step', 3);

    const modals = document.getElementById('modalsContainer');
    if (modals) modals.innerHTML = renderBookingModal();
    document.getElementById('bookingModalOverlay')?.classList.add('open');

    // Confetti celebration
    triggerSuccessConfetti();

    // Update tickets badge in sidebar
    const badge = document.getElementById('navTicketsBadge');
    if (badge) badge.textContent = storage.getBookings().length;
  }, 1000);
};

window.printTicketVoucher = function() {
  window.print();
};

window.viewBookingVoucher = function(bookingId) {
  const bk = storage.getBookings().find(b => b.id === bookingId);
  if (!bk) return;
  setBookingAttraction(bk.attractionId);
  updateBookingField('step', 3);
  updateBookingField('confirmedBooking', bk);

  const modals = document.getElementById('modalsContainer');
  if (modals) modals.innerHTML = renderBookingModal();
  document.getElementById('bookingModalOverlay')?.classList.add('open');
};

// Auth Modal
window.openAuthModal = function(tab = 'login', method = 'email') {
  setAuthModalState(tab, method);
  const modals = document.getElementById('modalsContainer');
  if (!modals) return;

  modals.innerHTML = renderAuthModal();
  document.getElementById('authModalOverlay')?.classList.add('open');
};

window.closeAuthModal = function() {
  const overlay = document.getElementById('authModalOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.remove(); }, 250);
  }
};

window.switchAuthTab = function(tab) {
  setAuthModalState(tab);
  const modals = document.getElementById('modalsContainer');
  if (modals) modals.innerHTML = renderAuthModal();
  document.getElementById('authModalOverlay')?.classList.add('open');
};

window.switchLoginMethod = function(method) {
  setAuthModalState('login', method);
  const modals = document.getElementById('modalsContainer');
  if (modals) modals.innerHTML = renderAuthModal();
  document.getElementById('authModalOverlay')?.classList.add('open');
};

// Custom Google Login Modal Open / Close / Submit
window.openGoogleLoginModal = function() {
  window.closeAuthModal();
  let container = document.getElementById('googleModalContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'googleModalContainer';
    document.body.appendChild(container);
  }
  container.innerHTML = renderGoogleLoginModal();
  setTimeout(() => {
    document.getElementById('googleInputEmail')?.focus();
  }, 100);
};

window.closeGoogleLoginModal = function() {
  const container = document.getElementById('googleModalContainer');
  if (container) container.innerHTML = '';
};

window.handleCustomGoogleSubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('googleInputEmail')?.value;
  const name = document.getElementById('googleInputName')?.value;
  if (!email) return;

  const user = storage.loginWithGoogle(email, name);
  
  // Save user profile directly to Cloud Firestore
  try {
    await saveUserProfileToFirestore(user.id, user);
  } catch (err) {
    console.warn('Firestore sync note:', err);
  }

  window.closeGoogleLoginModal();
  appState.currentTab = 'dashboard';
  renderApp();
  triggerSuccessConfetti();
  showToast(`Welcome, ${user.name}! Signed in with Google 🚀`, '✨');
};

window.handleGoogleLogin = function() {
  window.openGoogleLoginModal();
};

window.handleAuthSubmit = async function(e) {
  e.preventDefault();
  const phone = document.getElementById('authPhone')?.value;
  const email = document.getElementById('authEmail')?.value;
  const pass = document.getElementById('authPassword')?.value || document.getElementById('authPhonePass')?.value;
  const regName = document.getElementById('authRegName')?.value;

  let user = null;
  if (regName) {
    user = storage.register({ name: regName, email: email, phone: phone, password: pass });
  } else if (phone) {
    user = storage.loginWithPhone(phone, pass);
  } else if (email) {
    user = storage.loginWithEmail(email, pass);
  }

  if (user) {
    try {
      await saveUserProfileToFirestore(user.id, user);
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }
  }

  window.closeAuthModal();
  appState.currentTab = 'dashboard';
  renderApp();
  triggerSuccessConfetti();
  showToast(`Welcome, ${user ? user.name : 'Traveler'}! ✨`, '🎉');
};

// --- Full Page Login & Registration Handlers ---
window.switchAuthPageTab = function(tab) {
  setAuthPageTab(tab);
  renderApp();
};

window.handlePageAuthSubmit = async function(e) {
  e.preventDefault();
  const userInp = document.getElementById('authLoginUser')?.value;
  const pass = document.getElementById('authLoginPassword')?.value;

  if (!userInp || !pass) {
    showToast('Please enter both username/email and password.', '⚠️');
    return;
  }

  const expectedPassword = storage.getPassword();
  if (expectedPassword && pass !== expectedPassword) {
    showToast('Incorrect password. Please try again.', '⚠️');
    return;
  }

  const user = storage.loginWithEmail(userInp, pass);
  try {
    await saveUserProfileToFirestore(user.id, user);
  } catch (err) {
    console.warn('Firestore sync note:', err);
  }

  appState.currentTab = 'dashboard';
  renderApp();
  triggerSuccessConfetti();
  showToast(`Welcome back, ${user.name}! 🌟`, '👋');
};

window.handlePageRegisterSubmit = async function(e) {
  e.preventDefault();
  const name = document.getElementById('authRegFullName')?.value;
  const email = document.getElementById('authRegEmail')?.value;
  const pass = document.getElementById('authRegPassword')?.value;
  const city = document.getElementById('authRegCity')?.value || '';

  if (!name || !email || !pass) {
    showToast('Please fill in all required fields.', '⚠️');
    return;
  }

  const user = storage.register({ name, email, password: pass, homeCity: city });
  
  // Persist directly to Cloud Firestore database
  try {
    await saveUserProfileToFirestore(user.id, user);
  } catch (err) {
    console.warn('Firestore sync note:', err);
  }

  appState.currentTab = 'dashboard';
  renderApp();
  triggerSuccessConfetti();
  showToast(`Account created! Welcome, ${user.name} 🎉`, '✨');
};

// --- Location-Based Attractions Handlers ---
window.requestUserLocation = function() {
  const btn = document.querySelector('.location-btn-primary') || document.querySelector('.location-btn-active');
  if (btn) btn.innerHTML = '<span>Locating... 📍</span>';

  requestBrowserLocation(
    (locState) => {
      renderApp();
      triggerSuccessConfetti();
    },
    (errMsg) => {
      alert(`Location access: ${errMsg}\nYou can choose a preset city below to view nearest attractions.`);
      renderApp();
    }
  );
};

window.selectPresetCity = function(cityId) {
  setPresetLocation(cityId);
  renderApp();
};

window.handleLogout = function() {
  if (confirm('Are you sure you want to log out?')) {
    storage.logout();
    appState.currentTab = 'auth';
    renderApp();
  }
};

// Profile Tabs & Updates
window.switchProfileTab = function(tab) {
  setProfileTab(tab);
  window.updateMainContent();
};

// Profile Photo, Local Gallery, Cloudinary & Firestore Handlers
window.selectProfileAvatar = function(avatarUrl) {
  const input = document.getElementById('editPhotoUrl');
  if (input) input.value = avatarUrl;
  const preview = document.getElementById('avatarPreviewImg');
  if (preview) preview.src = avatarUrl;
};

window.handleManualUrlInput = function(url) {
  const preview = document.getElementById('avatarPreviewImg');
  if (preview && url) {
    preview.src = url;
  }
};

window.handleLocalPhotoSelect = async function(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // Show immediate local preview
  const previewImg = document.getElementById('avatarPreviewImg');
  const reader = new FileReader();
  reader.onload = (e) => {
    if (previewImg) previewImg.src = e.target.result;
  };
  reader.readAsDataURL(file);

  const progressBox = document.getElementById('cloudinaryUploadProgress');
  const statusText = document.getElementById('cldStatusText');
  const percentText = document.getElementById('cldPercentText');
  const progressFill = document.getElementById('cldProgressFill');
  const detailMsg = document.getElementById('cldDetailMessage');
  const photoUrlInput = document.getElementById('editPhotoUrl');

  if (progressBox) progressBox.style.display = 'block';

  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured()) {
    if (statusText) statusText.innerHTML = '⚠️ Cloudinary credentials required';
    if (statusText) statusText.style.color = '#D97706';
    if (detailMsg) {
      detailMsg.innerHTML = 'Local preview set. Click <strong style="cursor:pointer; text-decoration:underline;" onclick="window.openCloudServicesModal()">Cloud Services Setup</strong> to enter your Cloud Name & Unsigned Preset to save directly on Cloudinary.';
    }
    return;
  }

  // Upload to Cloudinary
  try {
    if (statusText) {
      statusText.innerHTML = 'Uploading to Cloudinary CDN... ☁️';
      statusText.style.color = 'var(--primary)';
    }
    if (progressFill) progressFill.style.width = '10%';
    if (percentText) percentText.textContent = '10%';

    const uploadResult = await uploadImageToCloudinary(file, (percent) => {
      if (progressFill) progressFill.style.width = `${percent}%`;
      if (percentText) percentText.textContent = `${percent}%`;
    });

    // Cloudinary upload successful!
    const cloudinaryUrl = uploadResult.url;
    if (photoUrlInput) photoUrlInput.value = cloudinaryUrl;
    if (previewImg) previewImg.src = cloudinaryUrl;

    if (statusText) {
      statusText.innerHTML = '✅ Saved to Cloudinary CDN!';
      statusText.style.color = '#059669';
    }
    if (progressFill) progressFill.style.width = '100%';
    if (percentText) percentText.textContent = '100%';
    if (detailMsg) {
      detailMsg.innerHTML = `<span style="word-break: break-all; color: #059669;">Hosted at: ${cloudinaryUrl}</span>`;
    }

    // Auto-hide the progress box after 2 seconds
    setTimeout(() => {
      if (progressBox) {
        progressBox.style.transition = 'opacity 0.4s ease';
        progressBox.style.opacity = '0';
        setTimeout(() => { progressBox.style.display = 'none'; progressBox.style.opacity = '1'; }, 420);
      }
    }, 2000);

    // Record image in Firestore image history
    const currentUser = storage.getUser() || { id: 'usr_alex_01' };
    await recordImageInFirestore({
      url: cloudinaryUrl,
      publicId: uploadResult.publicId || '',
      userId: currentUser.id,
      fileName: file.name,
      bytes: uploadResult.bytes || file.size,
      source: 'local_gallery_upload'
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (statusText) {
      statusText.innerHTML = '❌ Upload failed';
      statusText.style.color = '#EF4444';
    }
    if (detailMsg) {
      detailMsg.innerHTML = `${error.message || 'Check your Cloud Name and Unsigned Preset.'} <a href="javascript:void(0)" onclick="window.openCloudServicesModal()" style="text-decoration:underline; font-weight:600;">Check Settings</a>`;
    }
  }
};

window.handleSaveProfile = async function(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Save Profile Changes';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Saving to Firestore... 🔥';
  }

  const name = document.getElementById('editName')?.value;
  const phone = document.getElementById('editPhone')?.value;
  const email = document.getElementById('editEmail')?.value;
  const homeCity = document.getElementById('editHomeCity')?.value;
  const bio = document.getElementById('editBio')?.value;
  const photoUrl = document.getElementById('editPhotoUrl')?.value;

  const profileData = { name, phone, email, homeCity, bio, photoUrl };

  // 1. Update local state & LocalStorage cache
  const updatedUser = storage.updateProfile(profileData);

  // 2. Persist to Cloud Firestore (collection: "users", doc: user.id)
  let firestoreResult = { syncedWithFirestore: false };
  try {
    firestoreResult = await saveUserProfileToFirestore(updatedUser.id || ('usr_' + Date.now().toString(36)), updatedUser);
  } catch (err) {
    console.warn('Firestore sync note:', err);
  }

  setProfileTab('trips');
  renderApp();
  triggerSuccessConfetti();

  const msg = firestoreResult.syncedWithFirestore 
    ? '🎉 Profile and photo synced to Cloud Firestore!' 
    : '✅ Profile updated successfully!';
  
  showToast(msg, '✨');
};

window.removeProfilePhoto = async function() {
  const updated = storage.updateProfile({ photoUrl: '' });
  try {
    if (updated && updated.id) {
      await saveUserProfileToFirestore(updated.id, updated);
    }
  } catch (e) {
    console.warn(e);
  }
  renderApp();
  showToast('Profile photo removed.', '🗑️');
};

// --- Change Password & Security Handlers ---
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '🙈';
    btn.title = 'Hide password';
  } else {
    input.type = 'password';
    btn.innerHTML = '👁️';
    btn.title = 'Show password';
  }
};

window.handlePasswordStrengthCheck = function(val) {
  const label = document.getElementById('strengthLabel');
  const bar = document.getElementById('strengthBar');
  if (!label || !bar) return;

  if (!val || val.length === 0) {
    label.textContent = 'None';
    label.style.color = 'var(--text-muted)';
    bar.style.width = '0%';
    bar.style.background = '#94A3B8';
    return;
  }

  let score = 0;
  if (val.length >= 4) score += 1;
  if (val.length >= 7) score += 1;
  if (/[0-9]/.test(val)) score += 1;
  if (/[^A-Za-z0-9]/.test(val)) score += 1;

  if (score <= 1) {
    label.textContent = 'Weak';
    label.style.color = '#EF4444';
    bar.style.width = '25%';
    bar.style.background = '#EF4444';
  } else if (score === 2) {
    label.textContent = 'Fair';
    label.style.color = '#F59E0B';
    bar.style.width = '50%';
    bar.style.background = '#F59E0B';
  } else if (score === 3) {
    label.textContent = 'Good';
    label.style.color = '#3B82F6';
    bar.style.width = '75%';
    bar.style.background = '#3B82F6';
  } else {
    label.textContent = 'Strong 🔒';
    label.style.color = '#10B981';
    bar.style.width = '100%';
    bar.style.background = '#10B981';
  }
};

window.handlePasswordMatchCheck = function() {
  const newPass = document.getElementById('newPassword')?.value || '';
  const confirmPass = document.getElementById('confirmPassword')?.value || '';
  const feedback = document.getElementById('matchFeedback');
  if (!feedback) return;

  if (!confirmPass) {
    feedback.textContent = 'Must match new password';
    feedback.style.color = 'var(--text-muted)';
    return;
  }

  if (newPass === confirmPass) {
    feedback.textContent = '✓ Passwords match';
    feedback.style.color = '#10B981';
    feedback.style.fontWeight = '600';
  } else {
    feedback.textContent = '✗ Passwords do not match';
    feedback.style.color = '#EF4444';
    feedback.style.fontWeight = '600';
  }
};

window.handleChangePassword = function(e) {
  e.preventDefault();
  const currentPass = document.getElementById('currentPassword')?.value || '';
  const newPass = document.getElementById('newPassword')?.value || '';
  const confirmPass = document.getElementById('confirmPassword')?.value || '';
  const alertBox = document.getElementById('passwordAlertBox');
  const submitBtn = document.getElementById('submitChangePasswordBtn');

  function showAlert(message, isSuccess = false) {
    if (!alertBox) return;
    alertBox.style.display = 'block';
    alertBox.style.background = isSuccess ? '#ECFDF5' : '#FEF2F2';
    alertBox.style.color = isSuccess ? '#065F46' : '#991B1B';
    alertBox.style.border = isSuccess ? '1px solid #A7F3D0' : '1px solid #FECACA';
    alertBox.innerHTML = `${isSuccess ? '✅' : '⚠️'} ${message}`;
  }

  if (newPass !== confirmPass) {
    showAlert('New password and confirm password do not match.');
    document.getElementById('confirmPassword')?.focus();
    return;
  }

  if (newPass.length < 4) {
    showAlert('New password must be at least 4 characters long.');
    document.getElementById('newPassword')?.focus();
    return;
  }

  const result = storage.changePassword(currentPass, newPass);

  if (!result.success) {
    showAlert(result.message, false);
    return;
  }

  // Success
  showAlert(result.message + ' Your new password is now active for account logins.', true);
  showToast('Password successfully updated! 🔒', '🎉');
  triggerSuccessConfetti();

  // Reset inputs
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  window.handlePasswordStrengthCheck('');
  const feedback = document.getElementById('matchFeedback');
  if (feedback) {
    feedback.textContent = 'Must match new password';
    feedback.style.color = 'var(--text-muted)';
  }

  if (submitBtn) {
    const origText = submitBtn.innerHTML;
    submitBtn.innerHTML = '✓ Password Saved!';
    submitBtn.style.background = '#10B981';
    setTimeout(() => {
      submitBtn.innerHTML = origText;
      submitBtn.style.background = '';
    }, 2500);
  }
};

window.deleteTripPlan = function(tripId) {
  if (confirm('Delete this planned trip from schedule?')) {
    storage.deleteTrip(tripId);
    window.updateMainContent();
  }
};

window.openNewTripModal = function() {
  const title = prompt('Enter Trip Destination / Title:', 'Kyoto Zen Temples & Gardens');
  if (!title) return;
  const dates = prompt('Enter Date Range:', '15 Oct - 20 Oct');
  storage.addTrip({
    title: title,
    location: 'International Destination',
    dateRange: dates || 'Upcoming',
    budgetTotal: 1600,
    attendees: 2,
    highlight: 'Newly added journey.'
  });
  window.updateMainContent();
};

// ══════════════════════════════════════════════════════════════════
// GOCITY STEP-BY-STEP PLANNER & SCHEDULE DB INTEGRATION
// ══════════════════════════════════════════════════════════════════

window.startNewGoCityPlan = function() {
  appState.currentTab = 'planner';
  plannerState.step = 1;
  setPlannerTool('planner');
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.switchPlannerTool = function(tool) {
  setPlannerTool(tool);
  window.updateMainContent();
};

window.openTripTool = function(tool) {
  appState.currentTab = 'planner';
  setPlannerTool(tool);
  renderApp();
};

window.setPlannerStep = function(step) {
  plannerState.step = Math.max(1, Math.min(4, step));
  window.updateMainContent();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.plannerNextStep = function() {
  if (plannerState.step === 2 && plannerState.selectedAttractionIds.length < 2) {
    showToast('Please select at least 2 attractions for your journey.', '⚠️');
    return;
  }
  plannerState.step = Math.min(4, plannerState.step + 1);
  window.updateMainContent();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.plannerPrevStep = function() {
  plannerState.step = Math.max(1, plannerState.step - 1);
  window.updateMainContent();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.updatePlannerCounter = function(type, delta) {
  if (type === 'adults') {
    plannerState.adults = Math.max(1, Math.min(10, plannerState.adults + delta));
  } else if (type === 'children') {
    plannerState.children = Math.max(0, Math.min(10, plannerState.children + delta));
  }
  window.updateMainContent();
};

window.setPlannerDays = function(days) {
  plannerState.days = Number(days);
  window.updateMainContent();
};

window.setPlannerStartDate = function(val) {
  if (val) {
    plannerState.startDate = val;
    window.updateMainContent();
  }
};

window.setPlannerCategoryFilter = function(cat) {
  plannerState.categoryFilter = cat;
  window.updateMainContent();
};

window.togglePlannerAttraction = function(attId) {
  const index = plannerState.selectedAttractionIds.indexOf(attId);
  if (index > -1) {
    // Remove if more than 1
    if (plannerState.selectedAttractionIds.length <= 1) {
      showToast('Keep at least 1 landmark in your itinerary.', 'ℹ️');
      return;
    }
    plannerState.selectedAttractionIds.splice(index, 1);
  } else {
    if (plannerState.selectedAttractionIds.length >= 8) {
      showToast('Maximum 8 attractions allowed for optimal pacing.', '⚠️');
      return;
    }
    plannerState.selectedAttractionIds.push(attId);
  }
  window.updateMainContent();
};

window.setPlannerStartingPoint = function(hubId) {
  plannerState.startingPoint = hubId;
  window.updateMainContent();
};

window.setPlannerPacing = function(pacing) {
  plannerState.pacing = pacing;
  window.updateMainContent();
};

window.setPlannerItineraryDay = function(dayNum) {
  plannerState.activeItineraryDay = dayNum;
  window.updateMainContent();
};

window.generateAndShowItinerary = function() {
  plannerState.step = 4;
  plannerState.activeItineraryDay = 1;
  triggerSuccessConfetti();
  window.updateMainContent();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Save Planned Trip to Schedule and Cloud Firestore Database
window.savePlannedTripToSchedule = async function() {
  const user = storage.getUser() || { id: 'usr_guest_' + Date.now().toString(36) };
  const firstAtt = travelData.attractions.find(a => a.id === plannerState.selectedAttractionIds[0]);

  // Compute date range
  const startDate = plannerState.startDate || new Date().toISOString().split('T')[0];
  const parts = startDate.split('-');
  const startObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const endObj = new Date(startObj);
  endObj.setDate(startObj.getDate() + (plannerState.days - 1));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateRangeStr = `${startObj.getDate()} ${months[startObj.getMonth()]} - ${endObj.getDate()} ${months[endObj.getMonth()]}`;

  const hubLabels = {
    'taj-ganj': 'Taj Ganj & Heritage',
    'agra-cantt': 'Agra Gateway',
    'vrindavan-center': 'Sacred Vrindavan',
    'mathura-junction': 'Holy Mathura & Ghats'
  };

  const hubName = hubLabels[plannerState.startingPoint] || 'Heritage Circuit';

  const newTrip = {
    id: 'trip_' + Date.now().toString(36),
    title: `${plannerState.days}-Day ${hubName} Tour`,
    location: 'Agra, Mathura & Vrindavan',
    dateRange: dateRangeStr,
    startDate: startDate,
    endDate: endObj.toISOString().split('T')[0],
    status: 'Confirmed',
    image: firstAtt?.image || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80',
    attendees: plannerState.adults + plannerState.children,
    adults: plannerState.adults,
    children: plannerState.children,
    days: plannerState.days,
    startingPoint: plannerState.startingPoint,
    pacing: plannerState.pacing,
    attractionIds: [...plannerState.selectedAttractionIds],
    attractionCount: plannerState.selectedAttractionIds.length,
    highlight: `Curated ${plannerState.days}-day tour with ${plannerState.selectedAttractionIds.length} stops and priority fast passes.`,
    budgetTotal: (plannerState.days * 450) + (plannerState.selectedAttractionIds.length * 150),
    budgetPerPerson: Math.round(((plannerState.days * 450) + (plannerState.selectedAttractionIds.length * 150)) / (plannerState.adults + plannerState.children)),
    syncedWithDb: true,
    createdAt: new Date().toISOString()
  };

  // 1. Save to LocalStorage trips
  storage.addTrip(newTrip);

  // 2. Persist to Cloud Firestore Database (collection: "trips")
  let firestoreResult = { syncedWithFirestore: false };
  try {
    firestoreResult = await saveTripToFirestore(newTrip, user.id);
  } catch (err) {
    console.warn('Firestore sync note:', err);
  }

  // 3. Trigger celebration confetti and toast
  triggerSuccessConfetti();

  const syncMsg = firestoreResult.syncedWithFirestore
    ? '🎉 Trip saved to My Schedule and synced to Cloud Firestore Database!'
    : '🎉 Trip successfully saved to your Schedule!';

  showToast(syncMsg, '✨');

  // 4. Navigate to dashboard to showcase the updated "My Schedule" card
  setTimeout(() => {
    appState.currentTab = 'dashboard';
    renderApp();
    
    // Smooth scroll to the Schedule card
    const scheduleCard = document.getElementById('myScheduleCardContainer');
    if (scheduleCard) {
      scheduleCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      scheduleCard.classList.add('highlight-pulse');
      setTimeout(() => scheduleCard.classList.remove('highlight-pulse'), 2500);
    }
  }, 900);
};

// View Full Trip Itinerary
window.viewTripItinerary = function(tripId) {
  const trips = storage.getTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) return;

  if (trip.attractionIds && trip.attractionIds.length > 0) {
    plannerState.selectedAttractionIds = [...trip.attractionIds];
    if (trip.days) plannerState.days = trip.days;
    if (trip.adults) plannerState.adults = trip.adults;
    if (trip.children !== undefined) plannerState.children = trip.children;
    if (trip.startingPoint) plannerState.startingPoint = trip.startingPoint;
    if (trip.startDate) plannerState.startDate = trip.startDate;
    plannerState.step = 4;
    plannerState.activeItineraryDay = 1;
    setPlannerTool('planner');
    appState.currentTab = 'planner';
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.openTripPresentation(tripId);
  }
};

// Delete Trip from Schedule & Database
window.deleteTripPlan = async function(tripId) {
  if (!confirm('Are you sure you want to remove this trip from your Schedule and Database?')) {
    return;
  }

  // 1. Delete from storage
  storage.deleteTrip(tripId);

  // 2. Delete from Cloud Firestore
  try {
    await deleteTripFromFirestore(tripId);
  } catch (err) {
    console.warn('Firestore delete error:', err);
  }

  renderApp();
  showToast('Trip removed from Schedule and Database.', '🗑️');
};

window.toggleAddExpenseForm = function() {
  const form = document.getElementById('addExpenseInlineForm');
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
};

window.handleSaveExpense = function(e) {
  e.preventDefault();
  const desc = document.getElementById('expDesc')?.value;
  const amount = Number(document.getElementById('expAmount')?.value || 0);
  const paidBy = document.getElementById('expPaidBy')?.value;
  const splitRaw = document.getElementById('expSplit')?.value;
  const splitAmong = splitRaw ? splitRaw.split(',').map(s => s.trim()) : [paidBy];

  storage.addBudgetItem({ description: desc, amount, paidBy, splitAmong });
  window.updateMainContent();
};

window.deleteExpenseItem = function(id) {
  storage.deleteBudgetItem(id);
  window.updateMainContent();
};

window.autoResolveConflict = function(type) {
  alert(type === 'taj-friday' 
    ? 'Auto-rescheduled Taj Mahal entry to Thursday Sunrise (6:00 AM). Friday prayer closure avoided!' 
    : 'Added a 45-minute tea break & Mathura Peda tasting stop. Transit buffer resolved!');
};

// Calendar Handlers
window.selectCalendarDay = function(day) {
  setActiveCalendarDay(day);
  document.querySelectorAll('.day-pill').forEach(pill => {
    pill.classList.remove('active');
  });
  renderApp();
};

window.changeCalendarMonth = function(delta) {
  const title = document.getElementById('calendarMonthTitle');
  if (title) {
    title.textContent = delta > 0 ? 'June 2024' : 'April 2024';
  }
};

// Presentation View
window.openTripPresentation = function(tripId) {
  openPresentationForTrip(tripId);
  const modals = document.getElementById('modalsContainer');
  if (!modals) return;

  modals.innerHTML = renderPresentationView();
};

window.closePresentation = function() {
  const overlay = document.getElementById('presentationOverlay');
  if (overlay) overlay.remove();
};

window.nextPresentationSlide = function() {
  const ok = nextSlide();
  if (ok) {
    const modals = document.getElementById('modalsContainer');
    if (modals) modals.innerHTML = renderPresentationView();
  } else {
    window.closePresentation();
  }
};

window.prevPresentationSlide = function() {
  const ok = prevSlide();
  if (ok) {
    const modals = document.getElementById('modalsContainer');
    if (modals) modals.innerHTML = renderPresentationView();
  }
};

// Cloud Services (Cloudinary & Firestore) Modal
window.openCloudServicesModal = function() {
  const modals = document.getElementById('modalsContainer');
  if (!modals) return;
  modals.innerHTML = renderCloudServicesModal();
};

window.closeCloudServicesModal = function() {
  const overlay = document.getElementById('cloudServicesModalOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.remove(); }, 250);
  }
};

window.saveAllCloudSettings = function() {
  const cloudName = document.getElementById('cldModalCloudName')?.value.trim();
  const uploadPreset = document.getElementById('cldModalUploadPreset')?.value.trim();
  const fbConfigJson = document.getElementById('fbModalConfigJson')?.value.trim();

  // Save Cloudinary settings
  saveCloudinaryConfig({ cloudName, uploadPreset });

  // Save Firebase settings if provided
  if (fbConfigJson) {
    try {
      const parsedFb = JSON.parse(fbConfigJson);
      saveFirebaseConfig(parsedFb);
    } catch (err) {
      alert('Firebase config is not valid JSON, but Cloudinary settings were saved!');
      return;
    }
  }

  alert('✅ Cloud credentials saved successfully! Cloudinary and Firestore are ready.');
  window.closeCloudServicesModal();
  window.updateMainContent();
};

// Firebase Setup Modal
window.openFirebaseModal = function() {
  const modals = document.getElementById('modalsContainer');
  if (!modals) return;
  modals.innerHTML = renderFirebaseModal();
  document.getElementById('firebaseModalOverlay')?.classList.add('open');
};

window.closeFirebaseModal = function() {
  const overlay = document.getElementById('firebaseModalOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.remove(); }, 250);
  }
};

window.handleSaveFirebaseConfig = function(e) {
  e.preventDefault();
  const text = document.getElementById('firebaseConfigTextarea')?.value;
  try {
    const parsed = JSON.parse(text);
    saveFirebaseConfig(parsed);
    alert('Firebase Configuration saved successfully! Live Cloud adapter is now primed.');
    window.closeFirebaseModal();
  } catch (err) {
    alert('Invalid JSON format. Please ensure valid configuration keys.');
  }
};

window.downloadFirebaseJson = function() {
  const data = storage.exportFirebaseData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traveltales-firestore-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.handleModalBackdropClick = function(e, overlayId) {
  if (e.target.id === overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => { overlay.remove(); }, 250);
    }
  }
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});

