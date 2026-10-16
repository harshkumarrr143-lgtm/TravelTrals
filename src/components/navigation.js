// Navigation Component: Sidebar, Topbar, and Cascading Mega-Menu
import { travelData } from '../data/travelData.js';
import { storage } from '../services/storageService.js';

export function renderSidebar(activeTab = 'dashboard', isCollapsed = false) {
  const user = storage.getUser();

  return `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="mainSidebar">
      <!-- Sidebar Header Row with Brand & Panel Closer Button -->
      <div class="sidebar-header-row">
        <div class="sidebar-logo" onclick="window.navigateTo('dashboard')" title="TravelTales Home">
          <img src="./traveltales-logo.png" alt="TravelTales" class="sidebar-logo-img" />
        </div>

        <button class="sidebar-closer-btn" id="sidebarCollapseBtn" onclick="window.toggleSidebarCollapse()" title="${isCollapsed ? 'Expand Menu Panel' : 'Close / Collapse Menu Panel'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <a class="nav-item ${activeTab === 'dashboard' ? 'active' : ''}" onclick="window.navigateTo('dashboard')" title="Dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="9" rx="1.5"/>
            <rect x="14" y="3" width="7" height="5" rx="1.5"/>
            <rect x="14" y="12" width="7" height="9" rx="1.5"/>
            <rect x="3" y="16" width="7" height="5" rx="1.5"/>
          </svg>
          <span class="nav-text">Dashboard</span>
        </a>

        <a class="nav-item ${activeTab === 'discover' ? 'active' : ''}" onclick="window.navigateTo('discover')" title="Discover">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
          <span class="nav-text">Discover</span>
        </a>


        <a class="nav-item ${activeTab === 'favorites' ? 'active' : ''}" onclick="window.navigateTo('favorites')" title="Favorites">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          <span class="nav-text">Favorites</span>
          <span class="nav-badge" id="navFavsBadge">${storage.getFavorites().length}</span>
        </a>

        <a class="nav-item ${activeTab === 'planner' ? 'active' : ''}" onclick="window.navigateTo('planner')" title="Trip Planner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
          <span class="nav-text">Trip Planner</span>
        </a>

        <a class="nav-item ${activeTab === 'profile' ? 'active' : ''}" onclick="window.navigateTo('profile')" title="Profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span class="nav-text">Profile</span>
        </a>
      </nav>

      <!-- Sidebar Bottom: Settings / Log in / Log out -->
      <div class="sidebar-bottom">
        ${user && user.isLoggedIn ? `
          <a class="nav-item" onclick="window.handleLogout()" title="Log out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
            </svg>
            <span class="nav-text">Log out</span>
          </a>
        ` : `
          <a class="nav-item" onclick="window.openAuthModal('login')" title="Log in / Register">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>
            </svg>
            <span class="nav-text">Log in / Register</span>
          </a>
        `}
      </div>
    </aside>

    <!-- Sidebar Backdrop Wrapper for Overlay mode -->
    <div class="sidebar-backdrop-overlay" id="sidebarBackdrop" onclick="window.toggleSidebarCollapse()"></div>
  `;
}

export function renderTopbar() {
  const user = storage.getUser();
  const activeCity = travelData.cities[0];

  return `
    <header class="topbar">
      <div class="topbar-left">
        <!-- Search Destination bar -->
        <div class="search-container">
          <span class="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </span>
          <input 
            type="text" 
            class="search-input" 
            id="globalSearchInput" 
            placeholder="Search Destination, City, or Wonder..." 
            oninput="window.handleSearchInput(event)"
          />
          <button class="search-btn" onclick="window.handleSearchClick()">Search</button>
        </div>

        <!-- Cascading Sub-Menu (Click to Open) -->
        <div class="mega-menu-trigger" id="exploreCitiesTrigger">
          <button class="mega-btn" id="megaMenuBtn" onclick="window.toggleExploreCitiesMenu(event)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" x2="8" y1="2" y2="18"/>
              <line x1="16" x2="16" y1="6" y2="22"/>
            </svg>
            Explore Cities &amp; Wonders
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          <!-- Cascading Dropdown Container -->
          <div class="cascading-dropdown">
            <!-- Left Column: Cities List -->
            <div class="dropdown-cities-col">
              <div class="dropdown-col-title">Select City</div>
              ${travelData.cities.map((city, idx) => `
                <div 
                  class="city-menu-item ${idx === 0 ? 'active' : ''}" 
                  data-city-id="${city.id}" 
                  onmouseenter="window.switchMenuCity('${city.id}')"
                >
                  <span>${city.name}</span>
                  <span class="city-arrow">›</span>
                </div>
              `).join('')}
            </div>

            <!-- Right Column: Sub-sub menu Attractions on that City -->
            <div class="dropdown-attractions-col" id="dropdownAttractionsList">
              <div class="dropdown-col-title" id="dropdownCityTitle">Attractions in ${activeCity.name}</div>
              <div class="attractions-grid-preview" id="dropdownAttractionsGrid">
                ${travelData.attractions.filter(a => a.cityId === activeCity.id).map(att => `
                  <div class="attraction-menu-item" onclick="window.openAttractionModal('${att.id}')">
                    <img src="${att.image}" alt="${att.name}" class="attraction-menu-thumb" />
                    <div class="attraction-menu-info">
                      <h4>${att.name}</h4>
                      <p>${att.subtitle.substring(0, 32)}...</p>
                      <div class="price-tag">From ${att.prices.currency}${att.prices.basePrice}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Topbar Right: Notification, User Profile -->
      <div class="topbar-right">
        <button class="icon-btn-circle" title="Notifications" onclick="window.alert('Notifications: 1. Your Skip-the-line pass for Taj Mahal is ready! 2. Special evening Aarti passes for Vrindavan available now.')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <span class="notification-dot"></span>
        </button>

        <!-- User Profile Pill -->
        <div class="user-profile-trigger" onclick="window.navigateTo('profile')">
          <img src="${user?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}" alt="User Avatar" class="user-avatar-img" />
          <div class="user-info-text">
            <div class="user-display-name">${user?.name || 'Alex Rivera'}</div>
            <div class="user-role-label">Verified Traveler</div>
          </div>
        </div>
      </div>
    </header>
  `;
}
