// Attraction Detail Modal Component: Opening Hours, Prices, Visitor Rules & Leaflet Map
import { travelData } from '../data/travelData.js';
import { storage } from '../services/storageService.js';

let activeLeafletMap = null;

export function renderAttractionModal(attractionId) {
  const att = travelData.attractions.find(a => a.id === attractionId) || travelData.attractions[0];
  const isFav = storage.isFavorite(att.id);

  return `
    <div class="modal-overlay" id="attractionModalOverlay" onclick="window.handleModalBackdropClick(event, 'attractionModalOverlay')">
      <div class="modal-card">
        <button class="modal-close-btn" onclick="window.closeAttractionModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Hero Image Banner -->
        <div class="attraction-hero-banner">
          <img src="${att.image}" alt="${att.name}" class="attraction-hero-img" />
          <div class="attraction-hero-overlay">
            <span class="card-category-tag" style="position: static; margin-bottom: 8px; width: fit-content;">${att.category} • ${att.cityName}</span>
            <h2 style="font-family: var(--font-heading); font-size: 28px; font-weight: 800;">${att.name}</h2>
            <p style="font-size: 14px; opacity: 0.9;">${att.subtitle}</p>
          </div>
        </div>

        <div class="attraction-modal-body">
          <!-- Quick Highlights Row -->
          <div class="info-cards-grid">
            <div class="info-card-box">
              <div class="info-card-label">Rating & Reviews</div>
              <div class="info-card-value">⭐ ${att.rating} (${att.reviewsCount.toLocaleString()})</div>
            </div>
            <div class="info-card-box">
              <div class="info-card-label">Suggested Duration</div>
              <div class="info-card-value">⏱ ${att.durationHours}</div>
            </div>
            <div class="info-card-box">
              <div class="info-card-label">Best Season</div>
              <div class="info-card-value">📅 ${att.bestTime}</div>
            </div>
            <div class="info-card-box">
              <div class="info-card-label">Accessibility</div>
              <div class="info-card-value">
                ${att.familyFriendly ? '👨‍👩‍👧 Family Friendly' : '⛰ Adventure'} ${att.seniorFriendly ? '• 👴 Senior OK' : ''}
              </div>
            </div>
          </div>

          <!-- Section 1: Opening Hours (Requested in notebook) -->
          <div class="modal-info-section">
            <h4 class="modal-section-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Opening Hours & Timings
            </h4>
            <div style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span style="font-weight: 600; color: var(--text-main);">Standard Visiting Hours:</span>
                <span style="color: var(--text-secondary);">${att.openingHours.regular}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span style="font-weight: 600; color: #EF4444;">Closed / Restricted Days:</span>
                <span style="color: #EF4444; font-weight: 600;">${att.openingHours.closedOn}</span>
              </div>
              ${att.openingHours.nightView ? `
                <div style="display: flex; justify-content: space-between; font-size: 14px;">
                  <span style="font-weight: 600; color: var(--accent-purple);">Night / Evening Special:</span>
                  <span style="color: var(--text-secondary);">${att.openingHours.nightView}</span>
                </div>
              ` : ''}
            </div>
          </div>


          <!-- Section 3: Visitor Requirements & Guidelines (Requested in notebook) -->
          <div class="modal-info-section">
            <h4 class="modal-section-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              </svg>
              Visitor Guidelines & Requirements
            </h4>
            <ul class="requirements-list">
              ${att.visitorRequirements.map(req => `
                <li class="requirement-item">
                  <span class="requirement-bullet">✔</span>
                  <span>${req}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Section 4: Interactive External Map Integration (Requested in notebook) -->
          <div class="modal-info-section">
            <h4 class="modal-section-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" x2="8" y1="2" y2="18"/><line x1="16" x2="16" y1="6" y2="22"/>
              </svg>
              Location & Map Coordinates
            </h4>
            
            <div id="attractionLeafletMap" class="map-container-box"></div>
            
            <div class="map-action-bar">
              <span style="font-size: 12px; color: var(--text-muted);">
                GPS: ${att.coordinates.lat.toFixed(4)}, ${att.coordinates.lng.toFixed(4)}
              </span>
              <a href="${att.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-external-map">
                <span>Open in Google Maps / Directions</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Action Buttons Bar -->
          <div style="display: flex; gap: 14px; margin-top: 10px;">
            <button 
              class="icon-btn-circle" 
              style="width: 50px; height: 50px;" 
              onclick="window.handleToggleFavorite('${att.id}', event)"
              title="${isFav ? 'Remove from wishlist' : 'Save to wishlist'}"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="${isFav ? '#EF4444' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Function to initialize Leaflet Map safely after DOM is attached
export function initLeafletMapForAttraction(attractionId) {
  const att = travelData.attractions.find(a => a.id === attractionId) || travelData.attractions[0];
  const mapElement = document.getElementById('attractionLeafletMap');
  if (!mapElement || typeof L === 'undefined') return;

  if (activeLeafletMap) {
    try {
      activeLeafletMap.remove();
    } catch (e) {
      console.warn('Map cleanup', e);
    }
  }

  try {
    const map = L.map('attractionLeafletMap').setView([att.coordinates.lat, att.coordinates.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker([att.coordinates.lat, att.coordinates.lng]).addTo(map);
    marker.bindPopup(`<b>${att.name}</b><br>${att.cityName}`).openPopup();

    activeLeafletMap = map;
    setTimeout(() => { map.invalidateSize(); }, 250);
  } catch (err) {
    console.error('Leaflet initialization failed', err);
  }
}
