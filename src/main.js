// Main Application Orchestrator & GSAP Animation Controller
import './style.css';
import gsap from 'gsap';
import { travelData } from './data/travelData.js';
import { storage, getDeterministicUserId } from './services/storageService.js';
import { saveFirebaseConfig } from './services/firebaseConfig.js';
import { showAlertModal, showConfirmModal, showPromptModal } from './components/modalDialog.js';

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
import { requestBrowserLocation, setPresetLocation, getLocationState, loadSavedLocation } from './services/locationService.js';
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
  saveCloudinaryConfig,
  formatCloudinaryAvatarUrl
} from './services/cloudinaryService.js';
import { 
  saveUserProfileToFirestore, 
  recordImageInFirestore,
  saveTripToFirestore,
  deleteTripFromFirestore,
  getUserTripsFromFirestore,
  syncUserDataWithFirestore
} from './services/firestoreService.js';
import { downloadItineraryPdf } from './services/pdfService.js';

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

  if (appState.currentTab === 'auth' || appState.currentTab === 'login' || appState.currentTab === 'register') {
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

  if (appState.currentTab === 'login' || appState.currentTab === 'register' || appState.currentTab === 'auth') {
    return renderAuthPage();
  } else if (appState.currentTab === 'profile') {
    if (!isLoggedIn) {
      return renderAuthPage();
    }
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

  const searchWrapper = document.getElementById('globalSearchWrapper');
  if (searchWrapper && !searchWrapper.contains(e.target)) {
    if (window.closeSearchDropdown) {
      window.closeSearchDropdown();
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

// ══════════════════════════════════════════════════════════════════
// AUTOCOMPLETE SEARCH DROPDOWN & FILTERING
// ══════════════════════════════════════════════════════════════════

let highlightedDropdownIndex = -1;

function highlightSearchMatch(text, query) {
  if (!query || !text) return text || '';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.closeSearchDropdown = function() {
  const dd = document.getElementById('searchDropdown');
  if (dd) {
    dd.style.display = 'none';
  }
  highlightedDropdownIndex = -1;
};

function renderSearchDropdown(query = '') {
  const dropdown = document.getElementById('searchDropdown');
  const clearBtn = document.getElementById('searchClearBtn');
  if (!dropdown) return;

  const q = (query || '').trim().toLowerCase();
  highlightedDropdownIndex = -1;

  if (clearBtn) {
    clearBtn.style.display = q ? 'flex' : 'none';
  }

  // 1. If Query is empty, show trending/popular recommendations
  if (!q) {
    const popularAttractions = travelData.attractions.slice(0, 4);
    const cities = travelData.cities;

    dropdown.innerHTML = `
      <div class="search-dropdown-section-header">
        <span>🔥 Popular Wonders</span>
        <span style="font-size: 10px; font-weight: normal; text-transform: none; color: var(--text-muted);">Trending in Braj</span>
      </div>
      ${popularAttractions.map((att, idx) => `
        <div class="search-dropdown-item" data-index="${idx}" onclick="window.selectSearchAttraction('${att.id}')">
          <img src="${att.image}" alt="${att.name}" class="search-dropdown-thumb" />
          <div class="search-dropdown-info">
            <div class="search-dropdown-title">${att.name}</div>
            <div class="search-dropdown-sub">
              <span>📍 ${att.cityName}</span>
              <span>⭐ ${att.rating}</span>
              <span class="search-dropdown-tag">${att.category || 'Wonder'}</span>
            </div>
          </div>
        </div>
      `).join('')}

      <div class="search-dropdown-section-header" style="margin-top: 6px;">
        <span>📍 Explore Cities</span>
      </div>
      ${cities.map((city, idx) => `
        <div class="search-dropdown-item" data-index="${popularAttractions.length + idx}" onclick="window.selectSearchCity('${city.id}')">
          <div class="search-dropdown-city-icon">🏛️</div>
          <div class="search-dropdown-info">
            <div class="search-dropdown-title">${city.name}, ${city.state}</div>
            <div class="search-dropdown-sub">
              <span>${city.badge}</span>
              <span>• ${city.attractionsCount} Attractions</span>
            </div>
          </div>
        </div>
      `).join('')}
    `;
    dropdown.style.display = 'flex';
    return;
  }

  // 2. Filter matching attractions and cities
  const matchedAttractions = travelData.attractions.filter(att => {
    return (
      att.name.toLowerCase().includes(q) ||
      att.cityName.toLowerCase().includes(q) ||
      (att.subtitle && att.subtitle.toLowerCase().includes(q)) ||
      (att.category && att.category.toLowerCase().includes(q)) ||
      (att.cityId && att.cityId.toLowerCase().includes(q))
    );
  });

  const matchedCities = travelData.cities.filter(city => {
    return (
      city.name.toLowerCase().includes(q) ||
      city.state.toLowerCase().includes(q) ||
      (city.badge && city.badge.toLowerCase().includes(q))
    );
  });

  if (matchedAttractions.length === 0 && matchedCities.length === 0) {
    dropdown.innerHTML = `
      <div class="search-dropdown-empty">
        <span class="search-dropdown-empty-icon">🧭</span>
        <div style="font-weight: 700; color: var(--text-main);">No destinations found for "${escapeHtml(query)}"</div>
        <p style="margin: 6px 0 12px; font-size: 11.5px; color: var(--text-muted);">
          Try searching for <strong>Taj Mahal</strong>, <strong>Prem Mandir</strong>, <strong>Mathura</strong>, or <strong>Ghats</strong>
        </p>
        <button class="promo-btn" style="padding: 6px 14px; font-size: 11.5px; margin: 0 auto; background: var(--primary); color: white;" onclick="window.navigateTo('discover'); window.closeSearchDropdown();">
          Browse All Wonders
        </button>
      </div>
    `;
    dropdown.style.display = 'flex';
    return;
  }

  let html = '';
  let itemCounter = 0;

  // Matching Cities
  if (matchedCities.length > 0) {
    html += `
      <div class="search-dropdown-section-header">
        <span>📍 Matching Cities (${matchedCities.length})</span>
      </div>
    `;
    matchedCities.forEach(city => {
      html += `
        <div class="search-dropdown-item" data-index="${itemCounter++}" onclick="window.selectSearchCity('${city.id}')">
          <div class="search-dropdown-city-icon">📍</div>
          <div class="search-dropdown-info">
            <div class="search-dropdown-title">${highlightSearchMatch(city.name, query)}, ${city.state}</div>
            <div class="search-dropdown-sub">
              <span>${city.badge}</span>
              <span>• ${city.attractionsCount} Attractions</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  // Matching Attractions
  if (matchedAttractions.length > 0) {
    html += `
      <div class="search-dropdown-section-header" style="${matchedCities.length > 0 ? 'margin-top: 6px;' : ''}">
        <span>🏛️ Attractions & Wonders (${matchedAttractions.length})</span>
      </div>
    `;
    matchedAttractions.forEach(att => {
      html += `
        <div class="search-dropdown-item" data-index="${itemCounter++}" onclick="window.selectSearchAttraction('${att.id}')">
          <img src="${att.image}" alt="${att.name}" class="search-dropdown-thumb" />
          <div class="search-dropdown-info">
            <div class="search-dropdown-title">${highlightSearchMatch(att.name, query)}</div>
            <div class="search-dropdown-sub">
              <span>📍 ${highlightSearchMatch(att.cityName, query)}</span>
              <span>⭐ ${att.rating}</span>
              <span class="search-dropdown-tag">${att.category || 'Wonder'}</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  // Footer shortcut
  html += `
    <div class="search-dropdown-footer" onclick="window.handleSearchClick()">
      <span>🔍 Show all results on Discover page</span>
      <span style="font-size: 11px; opacity: 0.7;">↵ Press Enter</span>
    </div>
  `;

  dropdown.innerHTML = html;
  dropdown.style.display = 'flex';
}

window.handleSearchFocus = function(e) {
  renderSearchDropdown(e.target.value || '');
};

window.handleSearchInput = function(e) {
  const query = e.target.value;
  renderSearchDropdown(query);

  // Live filter cards on current view if any exist
  const qLower = query.toLowerCase().trim();
  const cards = document.querySelectorAll('.travel-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = (!qLower || text.includes(qLower)) ? 'flex' : 'none';
  });
};

window.clearSearchInput = function(e) {
  if (e) e.stopPropagation();
  const input = document.getElementById('globalSearchInput');
  if (input) {
    input.value = '';
    input.focus();
  }
  renderSearchDropdown('');
  document.querySelectorAll('.travel-card').forEach(card => {
    card.style.display = 'flex';
  });
};

window.selectSearchAttraction = function(attractionId) {
  window.closeSearchDropdown();
  const att = travelData.attractions.find(a => a.id === attractionId);
  const input = document.getElementById('globalSearchInput');
  if (input && att) {
    input.value = att.name;
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.style.display = 'flex';
  }
  window.openAttractionModal(attractionId);
};

window.selectSearchCity = function(cityId) {
  window.closeSearchDropdown();
  const city = travelData.cities.find(c => c.id === cityId);
  const input = document.getElementById('globalSearchInput');
  if (input && city) {
    input.value = city.name;
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.style.display = 'flex';
  }
  window.selectPresetCity(cityId);
  window.navigateTo('discover');
};

function updateDropdownHighlight(items) {
  items.forEach((item, idx) => {
    if (idx === highlightedDropdownIndex) {
      item.classList.add('highlighted');
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      item.classList.remove('highlighted');
    }
  });
}

window.handleSearchKeydown = function(e) {
  const dropdown = document.getElementById('searchDropdown');
  if (!dropdown || dropdown.style.display === 'none') {
    if (e.key === 'Enter') {
      window.handleSearchClick();
    }
    return;
  }

  const items = dropdown.querySelectorAll('.search-dropdown-item');
  if (items.length === 0) {
    if (e.key === 'Enter') {
      window.handleSearchClick();
    }
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedDropdownIndex = (highlightedDropdownIndex + 1) % items.length;
    updateDropdownHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedDropdownIndex = (highlightedDropdownIndex - 1 + items.length) % items.length;
    updateDropdownHighlight(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (highlightedDropdownIndex >= 0 && items[highlightedDropdownIndex]) {
      items[highlightedDropdownIndex].click();
    } else {
      window.handleSearchClick();
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    window.closeSearchDropdown();
  }
};

window.handleSearchClick = function() {
  window.closeSearchDropdown();
  const input = document.getElementById('globalSearchInput');
  const q = input?.value?.toLowerCase().trim();
  if (q) {
    window.navigateTo('discover');
    setTimeout(() => {
      document.querySelectorAll('.travel-card').forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
      });
    }, 120);
  }
};

window.toggleFilterModal = function() {
  showAlertModal({
    title: 'Explore Filters & Categories',
    message: 'Filter attractions by:\n• Categories: World Heritage, Sacred Temples, Spiritual Ghats\n• Price Tier: Free Entry, Guided Tours, Fast-Passes\n• Duration & Accessibility: Half-day, Full-day, Wheelchair friendly.',
    icon: '🔍',
    buttonText: 'Got It'
  });
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
  const email = document.getElementById('googleInputEmail')?.value?.trim();
  const name = document.getElementById('googleInputName')?.value?.trim();
  if (!email) return;

  const user = storage.loginWithGoogle(email, name);
  
  // Pull fresh cloud data from Firestore (profile, custom photo, trips)
  try {
    const cloudData = await syncUserDataWithFirestore(user.id);
    if (cloudData) {
      if (cloudData.profile) {
        storage.updateProfile(cloudData.profile);
      }
      if (cloudData.trips && cloudData.trips.length > 0) {
        storage.setTrips(cloudData.trips);
      }
    }
    // Also sync current active user to Firestore
    await saveUserProfileToFirestore(user.id, storage.getUser() || user);
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
  const phone = document.getElementById('authPhone')?.value?.trim();
  const email = document.getElementById('authEmail')?.value?.trim();
  const pass = document.getElementById('authPassword')?.value || document.getElementById('authPhonePass')?.value;
  const regName = document.getElementById('authRegName')?.value?.trim();

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
      const cloudData = await syncUserDataWithFirestore(user.id);
      if (cloudData) {
        if (cloudData.profile) storage.updateProfile(cloudData.profile);
        if (cloudData.trips && cloudData.trips.length > 0) storage.setTrips(cloudData.trips);
      }
      await saveUserProfileToFirestore(user.id, storage.getUser() || user);
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
  const userInp = document.getElementById('authLoginUser')?.value?.trim();
  const pass = document.getElementById('authLoginPassword')?.value;

  if (!userInp || !pass) {
    showToast('Please enter both username/email and password.', '⚠️');
    return;
  }

  const userId = getDeterministicUserId(userInp);
  const existingUser = storage.getUserFromRegistry(userId);

  // If password was previously configured for this user, check it
  if (existingUser && existingUser.password && existingUser.password !== pass) {
    showToast('Incorrect password for this account. Please try again.', '⚠️');
    return;
  }

  const user = storage.loginWithEmail(userInp, pass);

  // Synchronize with Cloud Firestore database
  try {
    const cloudData = await syncUserDataWithFirestore(user.id);
    if (cloudData) {
      if (cloudData.profile) {
        storage.updateProfile(cloudData.profile);
      }
      if (cloudData.trips && cloudData.trips.length > 0) {
        storage.setTrips(cloudData.trips);
      }
    }
    await saveUserProfileToFirestore(user.id, storage.getUser() || user);
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
  const name = document.getElementById('authRegFullName')?.value?.trim();
  const email = document.getElementById('authRegEmail')?.value?.trim();
  const pass = document.getElementById('authRegPassword')?.value;
  const city = document.getElementById('authRegCity')?.value?.trim() || '';

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
window.requestUserLocation = function(silent = false) {
  const btn = document.querySelector('.btn-location-allow') || document.querySelector('.location-refresh-btn');
  const originalText = btn ? btn.innerHTML : '';
  if (btn) btn.innerHTML = '<span>Locating your position... 📍</span>';

  requestBrowserLocation(
    (locState) => {
      renderApp();
      triggerSuccessConfetti();
      showToast(`📍 Location detected: ${locState.nearestCity} area! Showing nearest attractions first.`, '🧭');
    },
    (errMsg) => {
      if (btn) btn.innerHTML = originalText;
      if (!silent) {
        showAlertModal({
          title: 'Location Notice',
          message: `${errMsg}\n\nYou can select a preset city (Agra, Mathura, Vrindavan) anytime from the dropdown to explore nearest attractions.`,
          icon: '📍',
          buttonText: 'Got It'
        });
      }
      renderApp();
    }
  );
};

window.resetUserLocation = function() {
  localStorage.removeItem('traveltales_user_location');
  const locState = getLocationState();
  if (locState) {
    locState.isAllowed = false;
    locState.latitude = null;
    locState.longitude = null;
    locState.nearestCity = null;
    locState.locationName = null;
  }
  renderApp();
  showToast('Location filter cleared. Showing all destinations.', 'ℹ️');
};

window.selectPresetCity = function(cityId) {
  if (!cityId) return;
  const locState = setPresetLocation(cityId);
  renderApp();
  triggerSuccessConfetti();
  showToast(`📍 Showing attractions sorted from ${locState.locationName}!`, '✨');
};

window.handleLogout = async function() {
  const confirmed = await showConfirmModal({
    title: 'Log Out of TravelTales?',
    message: 'Your profile, custom photo, and all planned trips will stay securely saved and connected to your account in the Database.',
    confirmText: 'Log Out',
    cancelText: 'Stay Logged In',
    icon: '🚪',
    isDanger: true
  });

  if (confirmed) {
    storage.logout();
    appState.currentTab = 'auth';
    renderApp();
    showToast('You have been logged out.', '👋');
  }
};

// Profile Tabs & Updates
window.switchProfileTab = function(tab) {
  setProfileTab(tab);
  window.updateMainContent();
};

// Profile Photo, Local Gallery, Cloudinary & Firestore Handlers
// Profile Photo, Local Gallery, Cloudinary & Firestore Handlers
function compressImageForAvatar(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(e.target.result);
      img.onload = () => {
        try {
          const targetDim = 280;
          const canvas = document.createElement('canvas');
          canvas.width = targetDim;
          canvas.height = targetDim;
          const ctx = canvas.getContext('2d');

          // Smart square crop: prioritize the face/head area (upper center)
          let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
          if (img.width > img.height) {
            // Landscape: take center square
            sWidth = img.height;
            sx = (img.width - img.height) / 2;
          } else if (img.height > img.width) {
            // Portrait: bias towards upper-center (head/face area)
            sHeight = img.width;
            sy = Math.max(0, Math.min((img.height - img.width) * 0.15, (img.height - img.width) * 0.3));
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetDim, targetDim);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          resolve(compressed);
        } catch (err) {
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function updateAvatarElementsOnPage(url) {
  const formattedUrl = formatCloudinaryAvatarUrl(url);
  const previewImg = document.getElementById('avatarPreviewImg');
  const fallbackInitials = document.getElementById('avatarFallbackInitials');
  const photoUrlInput = document.getElementById('editPhotoUrl');

  const topbarImg = document.getElementById('topbarUserAvatarImg');
  const topbarInitials = document.getElementById('topbarUserAvatarInitials');

  const headerImg = document.getElementById('profileHeaderAvatar');
  const headerInitials = document.getElementById('profileHeaderAvatarInitials');

  if (formattedUrl) {
    if (previewImg) {
      previewImg.src = formattedUrl;
      previewImg.style.display = 'block';
      previewImg.style.objectPosition = 'center 20%';
    }
    if (fallbackInitials) {
      fallbackInitials.style.display = 'none';
    }
    if (photoUrlInput) {
      photoUrlInput.value = url;
    }
    if (topbarImg) {
      topbarImg.src = formattedUrl;
      topbarImg.style.display = 'block';
      topbarImg.style.objectPosition = 'center 20%';
    }
    if (topbarInitials) {
      topbarInitials.style.display = 'none';
    }
    if (headerImg) {
      headerImg.src = formattedUrl;
      headerImg.style.display = 'block';
      headerImg.style.objectPosition = 'center 20%';
    }
    if (headerInitials) {
      headerInitials.style.display = 'none';
    }
    document.querySelectorAll('.user-avatar-img').forEach(img => {
      img.src = formattedUrl;
      img.style.display = 'block';
      img.style.objectPosition = 'center 20%';
    });
    document.querySelectorAll('.user-avatar-initials, .profile-main-avatar-initials').forEach(el => {
      el.style.display = 'none';
    });
  } else {
    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    if (fallbackInitials) {
      fallbackInitials.style.display = 'flex';
    }
    if (photoUrlInput) {
      photoUrlInput.value = '';
    }
    if (topbarImg) {
      topbarImg.src = '';
      topbarImg.style.display = 'none';
    }
    if (topbarInitials) {
      topbarInitials.style.display = 'flex';
    }
    if (headerImg) {
      headerImg.src = '';
      headerImg.style.display = 'none';
    }
    if (headerInitials) {
      headerInitials.style.display = 'flex';
    }
    document.querySelectorAll('.user-avatar-img').forEach(img => {
      img.style.display = 'none';
    });
    document.querySelectorAll('.user-avatar-initials, .profile-main-avatar-initials').forEach(el => {
      el.style.display = 'flex';
    });
  }
}

window.selectProfileAvatar = function(avatarUrl) {
  updateAvatarElementsOnPage(avatarUrl);
  const updated = storage.updateProfile({ photoUrl: avatarUrl });
  try {
    saveUserProfileToFirestore(updated.id, updated);
  } catch (e) {
    console.warn(e);
  }
  showToast('Avatar selected and saved!', '📸');
};

window.handleManualUrlInput = function(url) {
  if (url) {
    updateAvatarElementsOnPage(url);
    const updated = storage.updateProfile({ photoUrl: url });
    try {
      saveUserProfileToFirestore(updated.id, updated);
    } catch (e) {
      console.warn(e);
    }
  }
};

window.handleLocalPhotoSelect = async function(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const progressBox = document.getElementById('cloudinaryUploadProgress');
  const statusText = document.getElementById('cldStatusText');
  const percentText = document.getElementById('cldPercentText');
  const progressFill = document.getElementById('cldProgressFill');
  const detailMsg = document.getElementById('cldDetailMessage');

  if (progressBox) progressBox.style.display = 'block';
  if (statusText) {
    statusText.innerHTML = 'Processing photo... 📷';
    statusText.style.color = 'var(--primary)';
  }
  if (progressFill) progressFill.style.width = '20%';
  if (percentText) percentText.textContent = '20%';

  // 1. Immediately compress image on canvas to lightweight avatar data URL (~15KB)
  const localDataUrl = await compressImageForAvatar(file);
  if (localDataUrl) {
    updateAvatarElementsOnPage(localDataUrl);

    // Save immediately so photo persists instantly even before upload or offline
    const updated = storage.updateProfile({ photoUrl: localDataUrl });
    try {
      saveUserProfileToFirestore(updated.id, updated);
    } catch (err) {
      console.warn('Firestore photo save note:', err);
    }
  }

  // 2. Upload original file to Cloudinary CDN for permanent cloud hosting
  try {
    if (statusText) {
      statusText.innerHTML = 'Uploading to Cloudinary CDN... ☁️';
      statusText.style.color = 'var(--primary)';
    }

    const uploadResult = await uploadImageToCloudinary(file, (percent) => {
      if (progressFill) progressFill.style.width = `${percent}%`;
      if (percentText) percentText.textContent = `${percent}%`;
    });

    // Cloudinary upload successful!
    const cloudinaryUrl = formatCloudinaryAvatarUrl(uploadResult.url);
    console.log('✅ Cloudinary Upload Succeeded! Photo CDN URL:', cloudinaryUrl);

    // Persist Cloudinary URL in user profile & database
    const currentUser = storage.updateProfile({ photoUrl: cloudinaryUrl });
    try {
      await saveUserProfileToFirestore(currentUser.id, currentUser);
    } catch (e) {
      console.warn('Firestore photo save note:', e);
    }

    // Immediately re-render application so Topbar avatar and Profile header show the uploaded image!
    updateAvatarElementsOnPage(cloudinaryUrl);
    renderApp();

    showToast('Profile photo successfully saved and active! 📸', '✨');

    // Record image in Firestore image collection
    await recordImageInFirestore({
      url: cloudinaryUrl,
      publicId: uploadResult.publicId || '',
      userId: currentUser.id,
      fileName: file.name,
      bytes: uploadResult.bytes || file.size,
      source: 'profile_photo_upload'
    });

  } catch (error) {
    console.warn('Cloudinary upload note:', error);
    renderApp();
    showToast('Photo saved locally to your profile! 📸', '✅');
  }
};

window.handleSaveProfile = async function(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Save Profile Changes';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Saving to Database... 🔥';
  }

  const name = document.getElementById('editName')?.value;
  const phone = document.getElementById('editPhone')?.value;
  const email = document.getElementById('editEmail')?.value;
  const homeCity = document.getElementById('editHomeCity')?.value;
  const bio = document.getElementById('editBio')?.value;
  const photoUrlInput = document.getElementById('editPhotoUrl')?.value?.trim();
  const existingPhoto = storage.getUser()?.photoUrl || '';
  const photoUrl = photoUrlInput || existingPhoto;

  const profileData = { name, phone, email, homeCity, bio, photoUrl };

  // 1. Update local state & User Registry
  const updatedUser = storage.updateProfile(profileData);

  // 2. Persist to Cloud Firestore (collection: "users", doc: user.id)
  let firestoreResult = { syncedWithFirestore: false };
  try {
    firestoreResult = await saveUserProfileToFirestore(updatedUser.id, updatedUser);
  } catch (err) {
    console.warn('Firestore sync note:', err);
  }

  setProfileTab('trips');
  renderApp();
  triggerSuccessConfetti();

  const msg = firestoreResult.syncedWithFirestore 
    ? '🎉 Profile and photo synced to Cloud Firestore Database!' 
    : '✅ Profile updated successfully!';
  
  showToast(msg, '✨');
};

window.removeProfilePhoto = async function() {
  updateAvatarElementsOnPage('');
  const updated = storage.updateProfile({ photoUrl: '', forceClearPhoto: true });
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

window.handleChangePassword = async function(e) {
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

  // Persist updated password to Cloud Firestore Database
  const updatedUser = storage.getUser();
  if (updatedUser && updatedUser.id) {
    try {
      await saveUserProfileToFirestore(updatedUser.id, updatedUser);
    } catch (e) {
      console.warn('Firestore password sync note:', e);
    }
  }

  // Success
  showAlert(result.message + ' Your new password is now active and synced to Database.', true);
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

window.openNewTripModal = async function() {
  const title = await showPromptModal({
    title: 'New Trip Destination',
    message: 'Enter destination or journey title to add to your Schedule:',
    placeholder: 'e.g. Mathura & Vrindavan Heritage Circuit',
    defaultValue: 'Braj Darshan & Yamuna Aarti',
    confirmText: 'Continue'
  });
  if (!title) return;

  const dates = await showPromptModal({
    title: 'Trip Date Range',
    message: 'Enter travel dates for this trip:',
    placeholder: 'e.g. 18 Oct - 20 Oct',
    defaultValue: 'This Weekend',
    confirmText: 'Add to Schedule'
  });

  const user = storage.getUser();
  const newTrip = storage.addTrip({
    title: title,
    location: 'Heritage & Spiritual Tour',
    dateRange: dates || 'Upcoming',
    budgetTotal: 1800,
    attendees: 2,
    highlight: 'Curated custom journey.'
  });

  try {
    await saveTripToFirestore(newTrip, user?.id || 'usr_guest');
  } catch (e) {
    console.warn('Firestore trip save note:', e);
  }

  window.updateMainContent();
  showToast('Trip added to schedule and synced to Database! 🚀', '✨');
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

  // 4. Also automatically generate & download the itinerary PDF with photos
  try {
    downloadItineraryPdf(plannerState);
  } catch (pdfErr) {
    console.warn('PDF download note:', pdfErr);
  }

  // 5. Navigate to dashboard to showcase the updated "My Schedule" card
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

// Dedicated Itinerary PDF Download Handler
window.downloadTripItineraryPdf = async function() {
  const topBtn = document.getElementById('topDownloadPdfBtn');
  const originalHtml = topBtn ? topBtn.innerHTML : '';
  if (topBtn) {
    topBtn.disabled = true;
    topBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>Creating PDF...</span>
    `;
  }

  showToast('Compiling official itinerary PDF with photos & schedules... 📄', '⏳');

  try {
    const res = await downloadItineraryPdf(plannerState);
    triggerSuccessConfetti();
    showToast(`✅ ${res.fileName} downloaded successfully!`, '🎉');
  } catch (err) {
    console.error('PDF generation error:', err);
    showToast('Failed to generate PDF. Please try again.', '⚠️');
  } finally {
    if (topBtn) {
      topBtn.disabled = false;
      topBtn.innerHTML = originalHtml;
    }
  }
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
  const confirmed = await showConfirmModal({
    title: 'Delete Planned Trip?',
    message: 'Are you sure you want to remove this trip from your Schedule and Database? This will permanently delete it from Cloud Firestore.',
    confirmText: 'Delete Trip',
    cancelText: 'Keep Trip',
    icon: '🗑️',
    isDanger: true
  });

  if (!confirmed) return;

  // 1. Delete from storage
  storage.deleteTrip(tripId);

  // 2. Delete live from Cloud Firestore Database
  try {
    await deleteTripFromFirestore(tripId);
  } catch (err) {
    console.warn('Firestore delete error:', err);
  }

  renderApp();
  showToast('Trip removed from Schedule and Database.', '🗑️');
};

// Clear All Planned Trips from Schedule & Database
window.clearAllTripPlans = async function() {
  const trips = storage.getTrips();
  if (!trips || trips.length === 0) return;

  const confirmed = await showConfirmModal({
    title: 'Delete All Planned Trips?',
    message: `Are you sure you want to remove all ${trips.length} planned trip cards? They will be permanently deleted from your Schedule and Database.`,
    confirmText: 'Delete All',
    cancelText: 'Keep Trips',
    icon: '🗑️',
    isDanger: true
  });

  if (!confirmed) return;

  for (const t of trips) {
    if (t.id) {
      try {
        await deleteTripFromFirestore(t.id);
      } catch (err) {
        console.warn('Firestore delete error for trip:', t.id, err);
      }
    }
  }

  storage.clearAllTrips();
  renderApp();
  showToast('All planned trip cards removed.', '🗑️');
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
  showAlertModal({
    title: type === 'taj-friday' ? 'Taj Mahal Friday Notice' : 'Transit Buffer Resolved',
    message: type === 'taj-friday' 
      ? 'Auto-rescheduled Taj Mahal entry to Thursday Sunrise (6:00 AM). Friday prayer closure avoided!' 
      : 'Added a 45-minute tea break & Mathura Peda tasting stop. Transit buffer resolved!',
    icon: '✨',
    buttonText: 'Got It'
  });
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
      showAlertModal({
        title: 'Invalid Firebase JSON',
        message: 'The Firebase configuration provided is not valid JSON. Cloudinary settings were saved successfully.',
        icon: '⚠️'
      });
      return;
    }
  }

  showAlertModal({
    title: 'Cloud Credentials Configured',
    message: 'Cloudinary CDN and Firestore Database configurations have been successfully saved.',
    icon: '✅'
  });
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
    showAlertModal({
      title: 'Firebase Connected',
      message: 'Firebase configuration saved successfully! Cloud Firestore is active.',
      icon: '🔥'
    });
    window.closeFirebaseModal();
  } catch (err) {
    showAlertModal({
      title: 'Invalid JSON Format',
      message: 'Please ensure valid JSON syntax with quotes around keys and values.',
      icon: '⚠️'
    });
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

// Initial Cloud Firestore Data Sync on App Launch
function initAppStartupSync() {
  const activeUser = storage.getUser();
  if (activeUser && activeUser.id) {
    syncUserDataWithFirestore(activeUser.id).then(cloudData => {
      if (cloudData) {
        let shouldRerender = false;
        if (cloudData.profile && typeof cloudData.profile === 'object') {
          const validUpdates = {};
          for (const [k, v] of Object.entries(cloudData.profile)) {
            if (v !== undefined && v !== null && v !== '') {
              validUpdates[k] = v;
            }
          }
          if (Object.keys(validUpdates).length > 0) {
            storage.updateProfile(validUpdates);
            shouldRerender = true;
          }
        }
        if (cloudData.trips && cloudData.trips.length > 0) {
          storage.setTrips(cloudData.trips);
          shouldRerender = true;
        }
        if (shouldRerender) {
          renderApp();
        }
      }
    }).catch(e => {
      console.warn('Initial Firestore sync note:', e);
    });
  }
}

// Automatic Location Prompt on Startup
function initLocationOnStartup() {
  const saved = loadSavedLocation();
  if (saved && saved.isAllowed && saved.latitude) {
    console.log('📍 Loaded saved user location:', saved.nearestCity);
    return;
  }

  if (!navigator.geolocation) return;

  // Ask for location on first visit or startup after a gentle delay
  const hasAsked = sessionStorage.getItem('traveltales_location_prompted');
  if (!hasAsked) {
    sessionStorage.setItem('traveltales_location_prompted', 'true');
    setTimeout(() => {
      // Trigger browser location request so the user is prompted to Allow
      window.requestUserLocation(true);
    }, 1200);
  }
}

// Initialize Application on DOM Ready or immediately if DOM is already parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderApp();
    initAppStartupSync();
    initLocationOnStartup();
  });
} else {
  renderApp();
  initAppStartupSync();
  initLocationOnStartup();
}


