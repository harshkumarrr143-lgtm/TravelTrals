// Wishlist View Component: Dedicated Saved Places & Wishlist with Unwish feature
import { travelData } from '../data/travelData.js';
import { storage } from '../services/storageService.js';

let activeWishlistCity = 'all';

export function setWishlistCityFilter(cityId) {
  activeWishlistCity = cityId;
}

export function renderWishlistEmptyState() {
  return `
    <div class="wishlist-empty-state">
      <div class="empty-state-icon-box">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="1.8">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>
      <h3 class="empty-state-title">Your Wishlist is Empty</h3>
      <p class="empty-state-desc">
        You haven't saved any destinations yet. Discover sacred temples, ancient forts, and scenic wonders to start planning your dream trips!
      </p>
      <button class="btn-book-travel" onclick="window.navigateTo('discover')" style="margin: 0 auto; display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; font-size: 14px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Explore Destinations
      </button>
    </div>
  `;
}

export function renderWishlistView() {
  const favoriteIds = storage.getFavorites();
  const allFavoriteAttractions = travelData.attractions.filter(a => favoriteIds.includes(a.id));

  // Distinct cities in favorites for quick filter tags
  const citiesMap = new Map();
  allFavoriteAttractions.forEach(att => {
    if (!citiesMap.has(att.cityId)) {
      citiesMap.set(att.cityId, { id: att.cityId, name: att.cityName, count: 0 });
    }
    citiesMap.get(att.cityId).count++;
  });
  const citiesList = Array.from(citiesMap.values());

  const filteredAttractions = activeWishlistCity === 'all'
    ? allFavoriteAttractions
    : allFavoriteAttractions.filter(a => a.cityId === activeWishlistCity);

  return `
    <div class="wishlist-page-container">
      <!-- Wishlist Header Hero -->
      <div class="wishlist-hero-card">
        <div class="wishlist-hero-left">
          <div class="wishlist-pill-tag">
            <span class="wishlist-pulse-dot"></span>
            SAVED WISHES &amp; DESTINATIONS
          </div>
          <h1 class="wishlist-main-heading">
            My Wishlist <span class="wishlist-heart-gradient">❤️</span>
          </h1>
          <p class="wishlist-subtext">
            All your saved landmarks and monuments in one place. Ready to plan and book whenever you are.
          </p>
        </div>

        <div class="wishlist-hero-right">
          <div class="wishlist-counter-box" id="wishlistHeaderCount">
            <span class="counter-number">${allFavoriteAttractions.length}</span>
            <span class="counter-label">Saved Places</span>
          </div>
          <button class="btn-book-travel" onclick="window.navigateTo('discover')" style="display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 10px 18px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Explore More
          </button>
        </div>
      </div>

      <!-- City Filter Bar (if items exist) -->
      ${allFavoriteAttractions.length > 0 && citiesList.length > 1 ? `
        <div class="wishlist-city-filter-bar">
          <button 
            class="wishlist-city-btn ${activeWishlistCity === 'all' ? 'active' : ''}" 
            onclick="window.filterWishlistByCity('all')"
          >
            All Cities (${allFavoriteAttractions.length})
          </button>
          ${citiesList.map(c => `
            <button 
              class="wishlist-city-btn ${activeWishlistCity === c.id ? 'active' : ''}" 
              onclick="window.filterWishlistByCity('${c.id}')"
            >
              ${c.name} (${c.count})
            </button>
          `).join('')}
        </div>
      ` : ''}

      <!-- Wishlist Items Grid -->
      ${allFavoriteAttractions.length === 0 ? renderWishlistEmptyState() : `
        <div class="cards-grid" id="wishlistCardsGrid">
          ${filteredAttractions.map(att => `
            <div 
              class="travel-card wishlist-card" 
              id="wishlist-card-${att.id}" 
              data-id="${att.id}"
            >
              <div class="card-img-wrapper" onclick="window.handleCardClick('${att.id}', event)">
                <img src="${att.image}" alt="${att.name}" class="card-img" loading="lazy" />
                <!-- Unwish / Favorite Button in Image Corner -->
                <button 
                  class="card-fav-btn active" 
                  onclick="window.handleUnwish('${att.id}', event)" 
                  title="Remove from wishlist (Unwish)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" stroke-width="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
                <span class="card-category-tag">${att.cityName}</span>
              </div>

              <div class="card-content">
                <div class="card-title-row" onclick="window.handleCardClick('${att.id}', event)">
                  <h3 class="card-title">${att.name}</h3>
                </div>

                <div class="card-location-row">
                  <div class="card-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${att.cityName}
                  </div>
                  <div class="card-rating">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    ${att.rating}
                  </div>
                </div>

                <p style="font-size: 13px; color: var(--text-secondary); margin: 6px 0 12px 0; line-height: 1.4;">
                  ${att.subtitle.substring(0, 52)}${att.subtitle.length > 52 ? '...' : ''}
                </p>

                <div class="card-footer" style="padding-top: 10px; border-top: 1px solid var(--border-card); display: flex; align-items: center; justify-content: space-between;">
                  <div class="card-price" style="font-weight: 700; color: var(--text-main);">
                    ${att.prices.currency}${att.prices.basePrice}
                  </div>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <!-- Explicit Unwish Button -->
                    <button 
                      class="btn-unwish-card" 
                      onclick="window.handleUnwish('${att.id}', event)"
                      title="Unwish destination"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                      </svg>
                      Unwish
                    </button>
                    <button 
                      class="btn-book-travel" 
                      style="padding: 6px 14px; font-size: 12px;" 
                      onclick="window.openBookingModal('${att.id}')"
                    >
                      Book Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}
