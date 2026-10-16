// Trip Presentation View Component (Handwritten Notebook Requirement)
import { storage } from '../services/storageService.js';
import { travelData } from '../data/travelData.js';

let currentSlideIndex = 0;
let currentTrip = null;

export function openPresentationForTrip(tripId = null) {
  const trips = storage.getTrips();
  currentTrip = trips.find(t => t.id === tripId) || trips[0] || travelData.scheduleTrips[0];
  currentSlideIndex = 0;
}

export function renderPresentationView() {
  const trip = currentTrip || travelData.scheduleTrips[0];
  const slides = [
    {
      title: trip.title,
      subtitle: `${trip.location} • ${trip.dateRange}`,
      type: 'cover',
      bg: trip.image,
      desc: `A breathtaking journey through the scenic wonders of ${trip.location}. Featuring nature trails, alpine lakes, and cultural monuments.`
    },
    {
      title: 'Journey Highlights & Itinerary',
      subtitle: `${trip.dateRange} • ${trip.attendees} Group Members`,
      type: 'itinerary',
      bg: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      points: [
        'Day 1: Arrival & Alpine Chalet check-in with fondue dinner',
        'Day 2: Morning cableway ascent to high vantage observation deck',
        'Day 3: Glacier boat safari and forest walking trail',
        'Day 4: Stargazing camp under clear night skies'
      ]
    },
    {
      title: 'Shared Trip Financial Summary',
      subtitle: `Total Budget: $${trip.budgetTotal || 1450}`,
      type: 'budget',
      bg: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      details: [
        { label: 'Lodging & Chalet Stay', val: '$850' },
        { label: 'Transit, Shuttles & Passes', val: '$380' },
        { label: 'Food & Group Dinners', val: '$220' },
        { label: 'Average Share Per Person', val: `$${Math.round((trip.budgetTotal || 1450) / trip.attendees)}` }
      ]
    }
  ];

  const slide = slides[currentSlideIndex] || slides[0];

  return `
    <div class="modal-overlay open" id="presentationOverlay">
      <div class="modal-card" style="max-width: 900px; padding: 0; background: #0F172A; color: white;">
        <button class="modal-close-btn" style="background: rgba(255,255,255,0.2); color: white;" onclick="window.closePresentation()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div class="presentation-container">
          <img src="${slide.bg}" alt="Background" class="presentation-slide-bg" />

          <!-- Content Layer -->
          <div class="presentation-content-layer">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--primary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
              <span>TRAVELTALES EXPEDITION VIEW</span>
              <span>•</span>
              <span>SLIDE ${currentSlideIndex + 1} / ${slides.length}</span>
            </div>

            <h1 style="font-family: var(--font-heading); font-size: 38px; font-weight: 800; line-height: 1.15; margin-bottom: 8px;">
              ${slide.title}
            </h1>
            <p style="font-size: 16px; color: #94A3B8; margin-bottom: 24px;">${slide.subtitle}</p>

            ${slide.type === 'cover' ? `
              <p style="font-size: 16px; line-height: 1.7; max-width: 600px; color: #E2E8F0;">
                ${slide.desc}
              </p>
              <div style="display: flex; gap: 12px; margin-top: 24px;">
                <span class="hero-feature-badge" style="background: rgba(255,255,255,0.15); color: white; border: none;">
                  🧭 Fully Completed Journey
                </span>
                <span class="hero-feature-badge" style="background: rgba(255,255,255,0.15); color: white; border: none;">
                  👥 ${trip.attendees} Happy Travelers
                </span>
              </div>
            ` : ''}

            ${slide.type === 'itinerary' ? `
              <div style="display: flex; flex-direction: column; gap: 12px; max-width: 650px;">
                ${slide.points.map(pt => `
                  <div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(8px); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.12); font-size: 14.5px;">
                    ${pt}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${slide.type === 'budget' ? `
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; max-width: 600px;">
                ${slide.details.map(d => `
                  <div style="background: rgba(255, 255, 255, 0.08); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.12);">
                    <div style="font-size: 12px; color: #94A3B8; text-transform: uppercase;">${d.label}</div>
                    <div style="font-size: 24px; font-weight: 800; color: var(--primary); font-family: var(--font-heading); margin-top: 4px;">
                      ${d.val}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Bottom Presentation Controls -->
          <div class="presentation-controls">
            <div style="display: flex; gap: 6px;">
              ${slides.map((_, idx) => `
                <div style="width: 24px; height: 4px; border-radius: 2px; background: ${idx === currentSlideIndex ? 'var(--primary)' : 'rgba(255,255,255,0.3)'};"></div>
              `).join('')}
            </div>

            <div style="display: flex; gap: 10px;">
              <button 
                class="promo-btn" 
                style="background: rgba(255,255,255,0.15); color: white;" 
                onclick="window.prevPresentationSlide()" 
                ${currentSlideIndex === 0 ? 'disabled style="opacity: 0.4;"' : ''}
              >
                ◀ Previous
              </button>
              <button 
                class="btn-book-travel" 
                onclick="window.nextPresentationSlide()"
              >
                ${currentSlideIndex === slides.length - 1 ? 'Finish Presentation' : 'Next Slide ▶'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function nextSlide() {
  if (currentSlideIndex < 2) {
    currentSlideIndex++;
    return true;
  }
  return false;
}

export function prevSlide() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    return true;
  }
  return false;
}
