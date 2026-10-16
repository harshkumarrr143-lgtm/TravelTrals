// Popular Places Cards Grid with GSAP Tilt / Lift, Skeleton Loader, and Location-Based Attractions
import { travelData } from '../data/travelData.js';
import { storage } from '../services/storageService.js';
import { getLocationState, getNearbyAttractions, loadSavedLocation } from '../services/locationService.js';

let showSkeletonDemo = false;

export function setSkeletonDemo(state) {
  showSkeletonDemo = state;
}

export function renderPopularPlaces(filterCity = null) {
  loadSavedLocation();
  const favorites = storage.getFavorites();
  const locationState = getLocationState();

  let attractions;
  if (filterCity) {
    attractions = travelData.attractions.filter(a => a.cityId === filterCity);
  } else if (locationState.isAllowed && locationState.latitude) {
    attractions = getNearbyAttractions();
  } else {
    attractions = travelData.attractions;
  }

  // If skeleton demo is active, return shimmer placeholder cards
  if (showSkeletonDemo) {
    return `
      <section class="popular-places-section">
        <div class="section-header">
          <div class="section-title">
            Popular Destinations <span>🌈</span>
          </div>
          <button class="section-see-all" onclick="window.toggleSkeletonDemo()">Hide Skeletons</button>
        </div>

        <div class="cards-grid">
          ${[1, 2, 3, 4].map(() => `
            <div class="skeleton-card">
              <div class="skeleton skeleton-thumb"></div>
              <div class="skeleton skeleton-text-lg"></div>
              <div class="skeleton skeleton-text-sm"></div>
              <div class="skeleton" style="height: 36px; border-radius: 8px;"></div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  return `

      <div class="section-header">
        <div class="section-title">
          ${locationState.isAllowed ? `Nearby Attractions Near You <span>📍</span>` : `Popular Places <span>🌈</span>`}
        </div>
        <div style="display: flex; gap: 14px; align-items: center;">
          <a class="section-see-all" onclick="window.navigateTo('discover')">See all</a>
        </div>
      </div>


      <div class="cards-grid" id="popularCardsGrid">
        ${attractions.map(att => {
          const isFav = favorites.includes(att.id);
          const hasDistance = att.distance !== undefined && att.distance !== null;

          return `
            <div 
              class="travel-card gsap-card-item" 
              data-id="${att.id}"
              onclick="window.handleCardClick('${att.id}', event)"
            >
              <div class="card-img-wrapper">
                <img src="${att.image}" alt="${att.name}" class="card-img" loading="lazy" />
                <button 
                  class="card-fav-btn ${isFav ? 'active' : ''}" 
                  onclick="window.handleToggleFavorite('${att.id}', event)"
                  title="${isFav ? 'Remove from wishlist' : 'Add to wishlist'}"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#EF4444' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
                <span class="card-category-tag">${att.category}</span>
                ${hasDistance ? `
                  <span class="card-distance-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${att.distance} km away
                  </span>
                ` : ''}
              </div>

              <div class="card-content">
                <div class="card-title-row">
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

                <div class="card-footer">
                  <div class="card-price">
                    ${att.prices.currency}${att.prices.basePrice}
                    <span style="font-size: 11px; font-weight: 500; color: var(--text-muted);">/ person</span>
                  </div>
                  <div class="card-action-btn">
                    Details
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}
