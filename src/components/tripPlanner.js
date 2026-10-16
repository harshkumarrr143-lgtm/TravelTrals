// GoCity Step-by-Step AI Trip Planner Component & TravelTools Suite
import { storage } from '../services/storageService.js';
import { travelData } from '../data/travelData.js';

// Global Planner State matching GoCity Multi-Step Wizard
export const plannerState = {
  step: 1, // 1: 'info', 2: 'attractions', 3: 'starting-point', 4: 'itinerary'
  adults: 2,
  children: 1,
  days: 2,
  startDate: getDefaultStartDate(),
  categoryFilter: 'all',
  selectedAttractionIds: ['taj-mahal', 'prem-mandir', 'agra-fort', 'mehtab-bagh', 'krishna-janmabhoomi'],
  startingPoint: 'taj-ganj',
  pacing: 'balanced', // 'relaxed', 'balanced', 'energetic'
  activeItineraryDay: 1,
  activeTool: 'planner' // 'planner', 'budget', 'conflict', 'family', 'catalogue'
};

function getDefaultStartDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1); // tomorrow
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatDateRange(startDateStr, days) {
  if (!startDateStr) return `${days} Days Trip`;
  const parts = startDateStr.split('-');
  if (parts.length !== 3) return `${days} Days Trip`;
  const start = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const end = new Date(start);
  end.setDate(start.getDate() + (days - 1));

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${months[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${months[start.getMonth()]} ${start.getDate()} – ${months[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${months[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} – ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

const STARTING_HUBS = [
  {
    id: 'taj-ganj',
    name: 'Taj Ganj (Central Agra)',
    desc: 'Direct proximity to Taj Mahal East Gate, heritage rooftop cafes & boutique stays.',
    icon: '🏰',
    city: 'Agra'
  },
  {
    id: 'agra-cantt',
    name: 'Agra Cantt Railway Station',
    desc: 'Convenient transit hub for arrivals via Gatimaan Express and Vande Bharat trains.',
    icon: '🚆',
    city: 'Agra'
  },
  {
    id: 'vrindavan-center',
    name: 'Vrindavan Town Center (Raman Reti)',
    desc: 'Heart of the sacred temple circuit, morning parikrama walks and divine evening aartis.',
    icon: '🛕',
    city: 'Vrindavan'
  },
  {
    id: 'mathura-junction',
    name: 'Mathura Junction & Vishram Ghat',
    desc: 'Braj arrival gateway connecting Sri Krishna Janmasthan and historic Yamuna boat rides.',
    icon: '⛵',
    city: 'Mathura'
  }
];

export function setPlannerTool(tool) {
  plannerState.activeTool = tool;
}

export function renderTripPlanner() {
  const budgetData = storage.calculateBudgetSummary();
  const budgetItems = storage.getBudgetItems();

  return `
    <div class="gocity-planner-container">
      <!-- Secondary Tool Tabs for Full Suite Support -->
      <div class="planner-suite-subnav">
        <button class="planner-nav-chip ${plannerState.activeTool === 'planner' ? 'active' : ''}" onclick="window.switchPlannerTool('planner')">
          🧭 AI Step-by-Step Trip Planner
        </button>
        <button class="planner-nav-chip ${plannerState.activeTool === 'budget' ? 'active' : ''}" onclick="window.switchPlannerTool('budget')">
          💰 Budget-Sharing Calculator
        </button>
        <button class="planner-nav-chip ${plannerState.activeTool === 'conflict' ? 'active' : ''}" onclick="window.switchPlannerTool('conflict')">
          ⚠️ Timeline Conflict Checker
        </button>
        <button class="planner-nav-chip ${plannerState.activeTool === 'family' ? 'active' : ''}" onclick="window.switchPlannerTool('family')">
          👨‍👩‍👧 Family-Friendly Routes
        </button>
        <button class="planner-nav-chip ${plannerState.activeTool === 'catalogue' ? 'active' : ''}" onclick="window.switchPlannerTool('catalogue')">
          📖 Destination Catalogue
        </button>
      </div>

      ${plannerState.activeTool === 'planner' ? renderGoCityWizard() : ''}
      ${plannerState.activeTool === 'budget' ? renderBudgetCalculator(budgetData, budgetItems) : ''}
      ${plannerState.activeTool === 'conflict' ? renderConflictChecker() : ''}
      ${plannerState.activeTool === 'family' ? renderFamilyPlanner() : ''}
      ${plannerState.activeTool === 'catalogue' ? renderCatalogueView() : ''}
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════════
// GOCITY STEP-BY-STEP PLANNER FLOW
// ══════════════════════════════════════════════════════════════════
function renderGoCityWizard() {
  return `
    <div class="gocity-wizard-wrapper">
      <!-- GoCity Header Bar with Stepper & AI Badge -->
      <header class="gocity-header">
        <div class="gocity-logo-section">
          <div class="gocity-brand-text">
            <span>TravelTales</span>
            <span class="gocity-brand-accent">Planner</span>
          </div>
        </div>

        <nav class="gocity-stepper-nav" aria-label="Trip planning steps">
          <div class="gocity-step-item ${plannerState.step === 1 ? 'active' : ''} ${plannerState.step > 1 ? 'completed' : ''}" onclick="window.setPlannerStep(1)">
            <span class="gocity-step-indicator"></span>
            <span class="gocity-step-label">Trip Info</span>
          </div>
          <div class="gocity-step-item ${plannerState.step === 2 ? 'active' : ''} ${plannerState.step > 2 ? 'completed' : ''}" onclick="window.setPlannerStep(2)">
            <span class="gocity-step-indicator"></span>
            <span class="gocity-step-label">Attractions</span>
          </div>
          <div class="gocity-step-item ${plannerState.step === 3 ? 'active' : ''} ${plannerState.step > 3 ? 'completed' : ''}" onclick="window.setPlannerStep(3)">
            <span class="gocity-step-indicator"></span>
            <span class="gocity-step-label">Starting Point</span>
          </div>
          ${plannerState.step === 4 ? `
            <div class="gocity-step-item active completed">
              <span class="gocity-step-indicator"></span>
              <span class="gocity-step-label">Trip Details</span>
            </div>
          ` : ''}
        </nav>

        <div class="gocity-header-actions">
          <div class="gocity-ai-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>Powered by AI</span>
          </div>
          <div class="gocity-currency-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span>INR (₹)</span>
          </div>
        </div>
      </header>

      <!-- Step Content Area -->
      <div class="gocity-step-content-area">
        ${plannerState.step === 1 ? renderStep1TripInfo() : ''}
        ${plannerState.step === 2 ? renderStep2Attractions() : ''}
        ${plannerState.step === 3 ? renderStep3StartingPoint() : ''}
        ${plannerState.step === 4 ? renderStep4ItineraryDetails() : ''}
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────────────────
// STEP 1: "Who's going and when?"
// ──────────────────────────────────────────────────────────────────
function renderStep1TripInfo() {
  const dateRangeDisplay = formatDateRange(plannerState.startDate, plannerState.days);
  const dayOptions = [1, 2, 3, 4, 5, 7];

  return `
    <div class="gocity-step1-container">
      <div class="gocity-step-title-block">
        <h1 class="gocity-step-h1">Who's going and when?</h1>
        <p class="gocity-step-subtitle">
          You can select up to 7 days (and if you know the exact dates, even better!)
        </p>
      </div>

      <!-- Card 1: Who's going? -->
      <div class="gocity-card-box gocity-who-card">
        <h2 class="gocity-box-title">Who's going?</h2>
        
        <div class="gocity-counters-row">
          <!-- Adult counter -->
          <div class="gocity-counter-group">
            <span class="gocity-counter-label">Adult</span>
            <div class="gocity-counter-controls">
              <button 
                type="button" 
                class="gocity-circle-btn" 
                aria-label="Decrease adults"
                onclick="window.updatePlannerCounter('adults', -1)"
                ${plannerState.adults <= 1 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}
              >
                –
              </button>
              <span class="gocity-counter-value" id="plannerAdultCount">${plannerState.adults}</span>
              <button 
                type="button" 
                class="gocity-circle-btn" 
                aria-label="Increase adults"
                onclick="window.updatePlannerCounter('adults', 1)"
                ${plannerState.adults >= 10 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}
              >
                +
              </button>
            </div>
          </div>

          <!-- Child counter -->
          <div class="gocity-counter-group">
            <span class="gocity-counter-label">Child (3-12)</span>
            <div class="gocity-counter-controls">
              <button 
                type="button" 
                class="gocity-circle-btn" 
                aria-label="Decrease children"
                onclick="window.updatePlannerCounter('children', -1)"
                ${plannerState.children <= 0 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}
              >
                –
              </button>
              <span class="gocity-counter-value" id="plannerChildCount">${plannerState.children}</span>
              <button 
                type="button" 
                class="gocity-circle-btn" 
                aria-label="Increase children"
                onclick="window.updatePlannerCounter('children', 1)"
                ${plannerState.children >= 10 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: How many days? -->
      <div class="gocity-card-box gocity-days-card">
        <h2 class="gocity-box-title">How many days?</h2>

        <div class="gocity-days-pills">
          ${dayOptions.map(d => `
            <button 
              type="button" 
              class="gocity-day-pill ${plannerState.days === d ? 'active' : ''}" 
              onclick="window.setPlannerDays(${d})"
            >
              ${d} ${d === 1 ? 'day' : 'days'}
            </button>
          `).join('')}
        </div>

        <div class="gocity-date-selector-row">
          <div class="gocity-date-label-col">
            <span class="gocity-date-prompt">Add start date (optional)</span>
          </div>

          <div class="gocity-travel-date-input-wrap">
            <label class="gocity-floating-label" for="plannerTravelDate">Travel Date</label>
            <input 
              type="date" 
              id="plannerTravelDate" 
              class="gocity-date-input" 
              value="${plannerState.startDate}" 
              min="${new Date().toISOString().split('T')[0]}" 
              onchange="window.setPlannerStartDate(this.value)"
            />
            <span class="gocity-cal-icon">📅</span>
          </div>
        </div>

        <!-- Dynamic Range Feedback -->
        <div class="gocity-date-feedback">
          You're going from <strong>${dateRangeDisplay}</strong>
        </div>
      </div>

      <!-- Step 1 Bottom Bar -->
      <div class="gocity-bottom-bar right-align">
        <button class="gocity-btn-teal" onclick="window.plannerNextStep()">
          <span>Next</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────────────────
// STEP 2: "What do you want to see?"
// ──────────────────────────────────────────────────────────────────
function renderStep2Attractions() {
  const selectedCount = plannerState.selectedAttractionIds.length;
  const remainingSlots = Math.max(0, 8 - selectedCount);

  // Compute total activity hours
  let totalHours = 0;
  plannerState.selectedAttractionIds.forEach(id => {
    const att = travelData.attractions.find(a => a.id === id);
    if (att) {
      const match = (att.durationHours || '').match(/(\d+(\.\d+)?)/);
      totalHours += match ? parseFloat(match[1]) : 2;
    }
  });

  const categories = [
    { id: 'all', label: 'All Destinations' },
    { id: 'Heritage', label: 'Historic & Cultural' },
    { id: 'Spiritual', label: 'Sacred & Spiritual' },
    { id: 'Ghats', label: 'Riverfront & Ghats' },
    { id: 'Architecture', label: 'City Views & Gardens' }
  ];

  const filteredAttractions = travelData.attractions.filter(att => {
    if (plannerState.categoryFilter === 'all') return true;
    if (plannerState.categoryFilter === 'Heritage') return att.category === 'Heritage' || att.cityId === 'agra';
    if (plannerState.categoryFilter === 'Spiritual') return att.category === 'Spiritual' || att.cityId === 'vrindavan';
    if (plannerState.categoryFilter === 'Ghats') return att.category === 'Ghats' || att.cityId === 'mathura';
    if (plannerState.categoryFilter === 'Architecture') return att.category === 'Architecture' || att.badges?.some(b => /garden|view/i.test(b));
    return true;
  });

  return `
    <div class="gocity-step2-container">
      <div class="gocity-step-title-block">
        <h1 class="gocity-step-h1">What do you want to see?</h1>
        <div class="gocity-info-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Add at least 3 attractions (max 8)</span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="gocity-filter-pills-row">
        ${categories.map(c => `
          <button 
            type="button" 
            class="gocity-filter-chip ${plannerState.categoryFilter === c.id ? 'active' : ''}" 
            onclick="window.setPlannerCategoryFilter('${c.id}')"
          >
            ${c.label}
          </button>
        `).join('')}
      </div>

      <!-- Two-column Main Planner Layout -->
      <div class="gocity-two-col-layout">
        <!-- Left: Attractions Grid -->
        <div class="gocity-attractions-grid">
          ${filteredAttractions.map(att => {
            const isSelected = plannerState.selectedAttractionIds.includes(att.id);
            return `
              <div class="gocity-attraction-card ${isSelected ? 'selected' : ''}" onclick="window.togglePlannerAttraction('${att.id}')">
                <div class="gocity-card-image-wrap">
                  <img src="${att.image}" alt="${att.name}" class="gocity-card-img" loading="lazy" />
                  <!-- Selection button (Top Right) -->
                  <button 
                    type="button" 
                    class="gocity-select-circle-btn ${isSelected ? 'checked' : ''}" 
                    aria-label="${isSelected ? 'Deselect ' + att.name : 'Select ' + att.name}"
                    onclick="event.stopPropagation(); window.togglePlannerAttraction('${att.id}')"
                  >
                    ${isSelected ? `
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ` : `
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    `}
                  </button>
                </div>

                <div class="gocity-card-body">
                  <h3 class="gocity-card-title">${att.name}</h3>
                  <div class="gocity-card-cat">${att.category || att.cityName}</div>

                  <div class="gocity-card-meta-row">
                    <div class="gocity-stars-wrap">
                      <span class="gocity-stars">★★★★★</span>
                      <span class="gocity-rating-val">${att.rating}</span>
                      <span class="gocity-rating-count">(${att.reviewsCount > 999 ? (att.reviewsCount/1000).toFixed(1) + 'k' : att.reviewsCount})</span>
                    </div>
                  </div>

                  <div class="gocity-card-time-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Up to ${att.durationHours || '2 hours'}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Right: Sticky "Your trip" Sidebar -->
        <aside class="gocity-trip-sidebar">
          <div class="gocity-sidebar-card">
            <div class="gocity-sidebar-header">
              <h2 class="gocity-sidebar-title">Your trip</h2>
              <button class="gocity-edit-days-pill" onclick="window.setPlannerStep(1)" title="Change duration">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
                <span>${plannerState.days} ${plannerState.days === 1 ? 'day' : 'days'}</span>
              </button>
            </div>

            <div class="gocity-sidebar-stats">
              <div class="gocity-stat-line">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span><strong>${selectedCount}/8</strong> attractions</span>
              </div>
              <div class="gocity-stat-line">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Total activity time: up to <strong>${totalHours} hours</strong></span>
              </div>
            </div>

            <!-- Selected Attractions List -->
            <div class="gocity-selected-items-list">
              ${plannerState.selectedAttractionIds.map(id => {
                const att = travelData.attractions.find(a => a.id === id);
                if (!att) return '';
                return `
                  <div class="gocity-mini-item">
                    <button 
                      type="button" 
                      class="gocity-remove-item-btn" 
                      aria-label="Remove ${att.name}"
                      onclick="window.togglePlannerAttraction('${att.id}')"
                    >
                      ✕
                    </button>
                    <img src="${att.image}" alt="${att.name}" class="gocity-mini-thumb" />
                    <span class="gocity-mini-title">${att.name}</span>
                  </div>
                `;
              }).join('')}

              ${remainingSlots > 0 ? `
                <div class="gocity-add-more-placeholder">
                  Add up to ${remainingSlots} more attractions
                </div>
              ` : ''}
            </div>
          </div>
        </aside>
      </div>

      <!-- Step 2 Bottom Navigation -->
      <div class="gocity-bottom-bar space-between">
        <button class="gocity-btn-back" onclick="window.plannerPrevStep()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>Back</span>
        </button>

        <button 
          class="gocity-btn-teal" 
          onclick="window.plannerNextStep()"
          ${selectedCount < 2 ? 'disabled style="opacity:0.5; cursor:not-allowed;" title="Select at least 2 attractions"' : ''}
        >
          <span>Next</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────────────────
// STEP 3: "Starting Point & Preferences"
// ──────────────────────────────────────────────────────────────────
function renderStep3StartingPoint() {
  return `
    <div class="gocity-step3-container">
      <div class="gocity-step-title-block">
        <h1 class="gocity-step-h1">Where's your starting point?</h1>
        <p class="gocity-step-subtitle">
          We'll sequence your attractions logically from your arrival hub to minimize transit and avoid delays.
        </p>
      </div>

      <!-- Starting Point Cards -->
      <div class="gocity-starting-grid">
        ${STARTING_HUBS.map(hub => {
          const isSelected = plannerState.startingPoint === hub.id;
          return `
            <div 
              class="gocity-hub-card ${isSelected ? 'active' : ''}" 
              onclick="window.setPlannerStartingPoint('${hub.id}')"
            >
              <div class="gocity-hub-header">
                <span class="gocity-hub-icon">${hub.icon}</span>
                <div class="gocity-radio-circle ${isSelected ? 'checked' : ''}">
                  ${isSelected ? '<span class="radio-inner-dot"></span>' : ''}
                </div>
              </div>
              <h3 class="gocity-hub-name">${hub.name}</h3>
              <p class="gocity-hub-desc">${hub.desc}</p>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Pace Preference -->
      <div class="gocity-card-box" style="margin-top: 24px;">
        <h2 class="gocity-box-title">What travel pace do you prefer?</h2>
        <div class="gocity-pace-options-row">
          <label class="gocity-pace-card ${plannerState.pacing === 'relaxed' ? 'active' : ''}">
            <input type="radio" name="tripPace" value="relaxed" ${plannerState.pacing === 'relaxed' ? 'checked' : ''} onchange="window.setPlannerPacing('relaxed')" style="display:none;" />
            <div class="pace-badge">🧘 Relaxed</div>
            <div class="pace-desc">Max 2 stops per day with plenty of tea, street food & leisure time.</div>
          </label>

          <label class="gocity-pace-card ${plannerState.pacing === 'balanced' ? 'active' : ''}">
            <input type="radio" name="tripPace" value="balanced" ${plannerState.pacing === 'balanced' ? 'checked' : ''} onchange="window.setPlannerPacing('balanced')" style="display:none;" />
            <div class="pace-badge">⭐ Balanced (Recommended)</div>
            <div class="pace-desc">3 curated stops per day with smooth transit and optimal photography hours.</div>
          </label>

          <label class="gocity-pace-card ${plannerState.pacing === 'energetic' ? 'active' : ''}">
            <input type="radio" name="tripPace" value="energetic" ${plannerState.pacing === 'energetic' ? 'checked' : ''} onchange="window.setPlannerPacing('energetic')" style="display:none;" />
            <div class="pace-badge">⚡ Action-Packed</div>
            <div class="pace-desc">Sunrise to night light shows; covers maximum sacred temples & palaces.</div>
          </label>
        </div>
      </div>

      <!-- Step 3 Bottom Navigation -->
      <div class="gocity-bottom-bar space-between">
        <button class="gocity-btn-back" onclick="window.plannerPrevStep()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>Back</span>
        </button>

        <button class="gocity-btn-teal pulse-btn" onclick="window.generateAndShowItinerary()">
          <span>Generate My Itinerary ✨</span>
        </button>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────────────────
// STEP 4: "Trip Details / Tailored Itinerary View"
// (Directly matching Screenshot 3: Unveil stories over two days)
// ──────────────────────────────────────────────────────────────────
function renderStep4ItineraryDetails() {
  const selectedAttractions = plannerState.selectedAttractionIds
    .map(id => travelData.attractions.find(a => a.id === id))
    .filter(Boolean);

  const hub = STARTING_HUBS.find(h => h.id === plannerState.startingPoint) || STARTING_HUBS[0];

  // Distribute selected attractions across trip days
  const daysCount = plannerState.days;
  const daySchedule = [];
  for (let i = 0; i < daysCount; i++) {
    daySchedule.push([]);
  }

  selectedAttractions.forEach((att, index) => {
    const targetDayIndex = index % daysCount;
    daySchedule[targetDayIndex].push(att);
  });

  const activeDayIdx = Math.min(plannerState.activeItineraryDay - 1, daysCount - 1);
  const currentDayAttractions = daySchedule[activeDayIdx] || [];

  const timeSlots = ['07:30 AM – 10:00 AM', '11:00 AM – 01:30 PM', '03:30 PM – 05:45 PM', '06:30 PM – 08:30 PM'];
  const foodPicks = [
    'Deviram Sweets: Bedai & Crispy Jalebi breakfast',
    'Panchi Petha Emporium: Kesar Angoori & Chocolate Petha',
    'Brijwasi Mithai Wala: Authentic Mathura Khoya Peda & Rabri Lassi',
    'Chhappan Bhog Vrindavan: Sacred temple prasadam feast'
  ];

  return `
    <div class="gocity-step4-container">
      <!-- Back link row & Top Actions -->
      <div class="gocity-itinerary-top-row">
        <button class="gocity-back-link-btn" onclick="window.setPlannerStep(2)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>Back to trip planning</span>
        </button>

        <div class="gocity-itinerary-header-buttons">
          <button class="gocity-secondary-btn" onclick="window.setPlannerStep(2)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
            <span>Edit</span>
          </button>
          <button class="gocity-save-action-btn" onclick="window.savePlannedTripToSchedule()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span>Save to My Schedule</span>
          </button>
        </div>
      </div>

      <!-- AI badge -->
      <div class="gocity-ai-badge inline-badge">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span>Powered by AI</span>
      </div>

      <!-- Main Headline -->
      <h1 class="gocity-itinerary-title">
        Unveil ${hub.city} &amp; Braj's stories over ${plannerState.days} ${plannerState.days === 1 ? 'day' : 'days'}
      </h1>

      <!-- Meta Pill Summary Banner -->
      <div class="gocity-meta-pill-bar">
        <div class="meta-pill-segment">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
          </svg>
          <span>${plannerState.days} ${plannerState.days === 1 ? 'day' : 'days'}</span>
        </div>

        <div class="meta-pill-divider"></div>

        <div class="meta-pill-segment">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>${plannerState.adults} adults${plannerState.children ? `, ${plannerState.children} child` : ''}</span>
        </div>

        <div class="meta-pill-divider"></div>

        <div class="meta-pill-segment">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${selectedAttractions.length} Attractions</span>
        </div>
      </div>

      <!-- Narrative Introduction -->
      <p class="gocity-itinerary-intro">
        Embark on a tailored ${plannerState.days}-day adventure starting from <strong>${hub.name}</strong>. Explore iconic historic sites and enjoy cultural discoveries at renowned landmarks. Our algorithm ensures an optimized route with designated time buffers, making your exploration of this vibrant spiritual circuit seamless and enriching.
      </p>

      <!-- "Want to tweak your plans?" Banner -->
      <div class="gocity-tweak-banner">
        <div class="tweak-icon-col">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </div>
        <div class="tweak-text-col">
          <div class="tweak-title">Want to tweak your plans?</div>
          <div class="tweak-desc">Make changes anytime — adjust this itinerary or add more destinations.</div>
        </div>
        <button class="gocity-secondary-btn edit-btn" onclick="window.setPlannerStep(2)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
          <span>Edit</span>
        </button>
      </div>

      <!-- Day Navigation Tabs -->
      <div class="gocity-day-nav-tabs">
        ${Array.from({ length: daysCount }).map((_, i) => `
          <button 
            type="button" 
            class="gocity-day-tab-btn ${plannerState.activeItineraryDay === (i + 1) ? 'active' : ''}" 
            onclick="window.setPlannerItineraryDay(${i + 1})"
          >
            Day ${i + 1}
          </button>
        `).join('')}
      </div>

      <!-- Day Subheader -->
      <div class="gocity-day-summary-row">
        <h2 class="gocity-day-heading">Day ${plannerState.activeItineraryDay}</h2>
        <span class="gocity-day-count-tag">${currentDayAttractions.length} attractions scheduled</span>
      </div>

      <!-- Timeline Stops for Current Day -->
      <div class="gocity-timeline-list">
        ${currentDayAttractions.length === 0 ? `
          <div class="gocity-empty-day-note">
            No attractions allocated for this day. Click "Edit" above to select more destinations!
          </div>
        ` : currentDayAttractions.map((att, slotIdx) => `
          <div class="gocity-timeline-card">
            <div class="timeline-slot-indicator">
              <span class="slot-time-badge">${timeSlots[slotIdx % timeSlots.length]}</span>
              <span class="slot-transit-hint">🚗 ~15 min transfer from ${slotIdx === 0 ? hub.name : 'previous stop'}</span>
            </div>

            <div class="timeline-card-content">
              <img src="${att.image}" alt="${att.name}" class="timeline-attraction-img" />
              <div class="timeline-details-col">
                <div class="timeline-badges-row">
                  <span class="timeline-cat-pill">${att.category}</span>
                  <span class="timeline-city-pill">${att.cityName}</span>
                  <span class="timeline-rating-pill">⭐ ${att.rating}</span>
                </div>

                <h3 class="timeline-att-title">${att.name}</h3>
                <p class="timeline-att-sub">${att.subtitle}</p>

                <!-- Food Highlight -->
                <div class="timeline-food-box">
                  <span class="food-icon">🍴</span>
                  <span class="food-text"><strong>Recommended Stop:</strong> ${foodPicks[slotIdx % foodPicks.length]}</span>
                </div>

                <!-- Action Button -->
                <div class="timeline-action-row">
                  <button class="btn-book-travel" style="padding: 7px 16px; font-size: 13px;" onclick="window.openBookingModal('${att.id}')">
                    Book Priority Pass (${att.prices?.currency || '₹'}${att.prices?.basePrice || 50})
                  </button>
                  <button class="gocity-secondary-btn" style="padding: 7px 14px; font-size: 13px;" onclick="window.openAttractionModal('${att.id}')">
                    View Monument Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Prominent Final CTA: Save to My Schedule & Cloud DB -->
      <div class="gocity-final-save-banner">
        <div class="save-banner-info">
          <div class="save-banner-title">Ready to lock in your journey?</div>
          <p class="save-banner-desc">
            Save this AI-sequenced itinerary directly to your <strong>"My Schedule" card</strong> and synchronize with the <strong>Cloud Firestore Database</strong>.
          </p>
        </div>
        <div class="save-banner-actions">
          <button class="gocity-btn-teal pulse-btn" style="font-size: 15px; padding: 14px 28px;" onclick="window.savePlannedTripToSchedule()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span>Save to My Schedule &amp; Cloud DB</span>
          </button>
          <button class="gocity-secondary-btn" style="padding: 14px 22px;" onclick="window.openTripPresentation()">
            <span>Present Slides</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────────────────
// COMPANION TOOLS (Budget, Conflicts, Family, Catalogue)
// ──────────────────────────────────────────────────────────────────
function renderBudgetCalculator(budgetData, budgetItems) {
  return `
    <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 24px; margin-top: 16px;">
      <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">Group Travel Expenses</h3>
          <button class="btn-book-travel" style="padding: 8px 16px; font-size: 13px;" onclick="window.toggleAddExpenseForm()">
            + Add Expense
          </button>
        </div>

        <div id="addExpenseInlineForm" style="display: none; background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; margin-bottom: 18px;">
          <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 10px;">Log New Expense</h4>
          <form onsubmit="window.handleSaveExpense(event)">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
              <input type="text" id="expDesc" class="form-input" placeholder="Expense description" required />
              <input type="number" id="expAmount" class="form-input" placeholder="Amount (₹)" required />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <input type="text" id="expPaidBy" class="form-input" placeholder="Paid by" required />
              <input type="text" id="expSplit" class="form-input" placeholder="Split with" required />
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="submit" class="btn-book-travel" style="padding: 6px 14px; font-size: 12px;">Save</button>
              <button type="button" class="promo-btn" style="background: #E2E8F0; color: var(--text-secondary); font-size: 12px; padding: 6px 14px;" onclick="window.toggleAddExpenseForm()">Cancel</button>
            </div>
          </form>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${budgetItems.map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #FAFCFE; border: 1px solid var(--border-light); border-radius: var(--radius-md);">
              <div>
                <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">${item.description}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                  Paid by <strong>${item.paidBy}</strong> • Split with: ${item.splitAmong?.join(', ') || item.paidBy}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="font-size: 16px; font-weight: 800; color: var(--primary-dark);">₹${item.amount}</div>
                <button class="icon-btn-circle" style="width: 28px; height: 28px;" onclick="window.deleteExpenseItem('${item.id}')" title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 24px; height: fit-content;">
        <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; margin-bottom: 12px;">Settlement Balance</h3>
        <div style="background: #F0FDF8; border: 1px solid #A7F3D0; border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 12px; color: var(--primary-dark); font-weight: 700; text-transform: uppercase;">Total Shared Trip Cost</div>
          <div style="font-family: var(--font-heading); font-size: 28px; font-weight: 800; color: var(--text-main);">₹${budgetData.totalSpent}</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${budgetData.breakdown.map(b => `
            <div style="padding: 10px; border-radius: var(--radius-md); background: #F8FAFC; border: 1px solid var(--border-light);">
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700;">
                <span>${b.name}</span>
                <span style="color: ${b.net >= 0 ? 'var(--primary-dark)' : '#EF4444'};">
                  ${b.net >= 0 ? `Gets back +₹${b.net}` : `Owes -₹${Math.abs(b.net)}`}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                <span>Paid: ₹${b.paid}</span>
                <span>Fair Share: ₹${b.share}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderConflictChecker() {
  return `
    <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 28px; margin-top: 16px;">
      <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; margin-bottom: 8px;">
        Itinerary Conflict &amp; Timing Feasibility Validator
      </h3>
      <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px;">
        TravelTales checks your planned visits against monument closing days, prayer hours, and town transit buffers.
      </p>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: #FEF2F2; border: 1.5px solid #F87171; border-radius: var(--radius-md); padding: 18px; display: flex; gap: 16px; align-items: flex-start;">
          <div style="font-size: 24px;">⛔</div>
          <div style="flex: 1;">
            <h4 style="font-size: 15px; font-weight: 700; color: #991B1B;">Monument Closed Day Alert</h4>
            <p style="font-size: 13px; color: #7F1D1D; margin: 4px 0;">
              <strong>Taj Mahal</strong> is closed on Fridays for general tourism. Grounds are exclusively accessible for registered Friday prayers.
            </p>
            <button class="btn-book-travel" style="background: #DC2626; padding: 6px 14px; font-size: 12px; margin-top: 6px;" onclick="window.autoResolveConflict('taj-friday')">
              Auto-Reschedule to Thursday Sunrise
            </button>
          </div>
        </div>

        <div style="background: #F0FDF8; border: 1.5px solid #34D399; border-radius: var(--radius-md); padding: 18px; display: flex; gap: 16px; align-items: flex-start;">
          <div style="font-size: 24px;">✅</div>
          <div>
            <h4 style="font-size: 15px; font-weight: 700; color: #065F46;">Agra &amp; Braj Circuit: Optimal Flow</h4>
            <p style="font-size: 13px; color: #047857; margin-top: 4px;">
              Taj Mahal sunrise slots, Agra Fort mid-day walks, and Prem Mandir 7:30 PM musical fountain shows are sequenced without timing clashes.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderFamilyPlanner() {
  return `
    <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 28px; margin-top: 16px;">
      <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; margin-bottom: 8px;">
        Family-Friendly Route Generator
      </h3>
      <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px;">
        Customized itineraries with senior ramps, stroller-friendly paths, and authentic comfort treats.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
        ${travelData.attractions.filter(a => a.familyFriendly).map(att => `
          <div style="border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: 16px; background: #FBFDFB;">
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
              <img src="${att.image}" alt="${att.name}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;" />
              <div>
                <h5 style="font-size: 15px; font-weight: 700;">${att.name}</h5>
                <span style="font-size: 11px; background: #D1FAE5; color: var(--primary-dark); padding: 2px 8px; border-radius: 99px; font-weight: 600;">
                  👨‍👩‍👧 Family &amp; Senior Friendly
                </span>
              </div>
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">${att.subtitle}</p>
            <button class="btn-book-travel" style="width: 100%; justify-content: center; font-size: 12px; padding: 6px;" onclick="window.openBookingModal('${att.id}')">
              Book Family Pass
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCatalogueView() {
  return `
    <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 28px; margin-top: 16px;">
      <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; margin-bottom: 16px;">
        Agra, Mathura &amp; Vrindavan Destination Catalogue
      </h3>
      <div class="cards-grid">
        ${travelData.attractions.map(att => `
          <div class="travel-card" onclick="window.openAttractionModal('${att.id}')">
            <div class="card-img-wrapper">
              <img src="${att.image}" alt="${att.name}" class="card-img" />
              <span class="card-category-tag">${att.category}</span>
            </div>
            <div class="card-content">
              <h4 class="card-title">${att.name}</h4>
              <div class="card-location-row">
                <span>${att.cityName}</span>
                <span class="card-rating">⭐ ${att.rating}</span>
              </div>
              <div class="card-footer">
                <div class="card-price">${att.prices.currency}${att.prices.basePrice}</div>
                <span class="card-action-btn">View Details ›</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
