// Trip Planner Suite Component: Budget Calculator, Conflict Checker & Family Planner
import { storage } from '../services/storageService.js';
import { travelData } from '../data/travelData.js';

let activePlannerTool = 'budget'; // 'budget', 'conflict', 'family', 'catalogue'

export function setPlannerTool(tool) {
  activePlannerTool = tool;
}

export function renderTripPlanner() {
  const budgetData = storage.calculateBudgetSummary();
  const budgetItems = storage.getBudgetItems();
  const trips = storage.getTrips();

  return `
    <div class="profile-view-container">
      <div style="margin-bottom: 24px;">
        <h2 style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; color: var(--text-main);">
          Smart Journey Planner Suite
        </h2>
        <p style="font-size: 14px; color: var(--text-secondary);">
          Collaborate on budgets, resolve itinerary timing conflicts, and generate family-friendly routes.
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div class="content-tabs-nav">
        <button class="content-tab-btn ${activePlannerTool === 'budget' ? 'active' : ''}" onclick="window.switchPlannerTool('budget')">
          💰 Budget-Sharing Calculator
        </button>
        <button class="content-tab-btn ${activePlannerTool === 'conflict' ? 'active' : ''}" onclick="window.switchPlannerTool('conflict')">
          ⚠️ Itinerary Conflict Checker
        </button>
        <button class="content-tab-btn ${activePlannerTool === 'family' ? 'active' : ''}" onclick="window.switchPlannerTool('family')">
          👨‍👩‍👧 Family-Friendly Planner
        </button>
        <button class="content-tab-btn ${activePlannerTool === 'catalogue' ? 'active' : ''}" onclick="window.switchPlannerTool('catalogue')">
          📖 Destination Catalogue
        </button>
      </div>

      <!-- Tool 1: Budget-Sharing Calculator -->
      ${activePlannerTool === 'budget' ? `
        <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 24px;">
          <!-- Expenses List -->
          <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
              <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">Group Travel Expenses</h3>
              <button class="btn-book-travel" style="padding: 8px 16px; font-size: 13px;" onclick="window.toggleAddExpenseForm()">
                + Add Expense
              </button>
            </div>

            <!-- Add Expense Inline Form (hidden by default) -->
            <div id="addExpenseInlineForm" style="display: none; background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; margin-bottom: 18px;">
              <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 10px;">Log New Expense</h4>
              <form onsubmit="window.handleSaveExpense(event)">
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
                  <input type="text" id="expDesc" class="form-input" placeholder="Expense description (e.g. Hotel stay)" required />
                  <input type="number" id="expAmount" class="form-input" placeholder="Amount ($)" required />
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                  <input type="text" id="expPaidBy" class="form-input" placeholder="Paid by (e.g. Alex)" required />
                  <input type="text" id="expSplit" class="form-input" placeholder="Split with (Alex, Sarah, Liam)" required />
                </div>
                <div style="display: flex; gap: 8px;">
                  <button type="submit" class="btn-book-travel" style="padding: 6px 14px; font-size: 12px;">Save Expense</button>
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
                    <div style="font-size: 16px; font-weight: 800; color: var(--primary-dark);">$${item.amount}</div>
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

          <!-- Settlement Summary Card -->
          <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 24px; height: fit-content;">
            <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; margin-bottom: 12px;">
              Settlement Balance
            </h3>
            <div style="background: #F0FDF8; border: 1px solid #A7F3D0; border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
              <div style="font-size: 12px; color: var(--primary-dark); font-weight: 700; text-transform: uppercase;">Total Shared Trip Cost</div>
              <div style="font-family: var(--font-heading); font-size: 28px; font-weight: 800; color: var(--text-main);">$${budgetData.totalSpent}</div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${budgetData.breakdown.map(b => `
                <div style="padding: 10px; border-radius: var(--radius-md); background: #F8FAFC; border: 1px solid var(--border-light);">
                  <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700;">
                    <span>${b.name}</span>
                    <span style="color: ${b.net >= 0 ? 'var(--primary-dark)' : '#EF4444'};">
                      ${b.net >= 0 ? `Gets back +$${b.net}` : `Owes -$${Math.abs(b.net)}`}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                    <span>Paid: $${b.paid}</span>
                    <span>Fair Share: $${b.share}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Tool 2: Itinerary Conflict Checker -->
      ${activePlannerTool === 'conflict' ? `
        <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 28px;">
          <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; margin-bottom: 8px;">
            Itinerary Conflict & Timeline Feasibility Validator
          </h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px;">
            TravelTales checks your planned visits against real-time monument open days, transit time buffers, and overlapping time slots.
          </p>

          <!-- Conflict Cards -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="background: #FEF2F2; border: 1.5px solid #F87171; border-radius: var(--radius-md); padding: 18px; display: flex; gap: 16px; align-items: flex-start;">
              <div style="font-size: 24px;">⛔</div>
              <div style="flex: 1;">
                <h4 style="font-size: 15px; font-weight: 700; color: #991B1B;">Monument Closed Date Alert</h4>
                <p style="font-size: 13px; color: #7F1D1D; margin: 4px 0;">
                  <strong>Taj Mahal</strong> is scheduled on a Friday (Closed Day). The monument grounds are only accessible for registered afternoon prayers.
                </p>
                <button class="btn-book-travel" style="background: #DC2626; padding: 6px 14px; font-size: 12px; margin-top: 6px;" onclick="window.autoResolveConflict('taj-friday')">
                  Auto-Reschedule to Thursday Sunrise
                </button>
              </div>
            </div>

            <div style="background: #FFFBEB; border: 1.5px solid #FBBF24; border-radius: var(--radius-md); padding: 18px; display: flex; gap: 16px; align-items: flex-start;">
              <div style="font-size: 24px;">⚠️</div>
              <div style="flex: 1;">
                <h4 style="font-size: 15px; font-weight: 700; color: #92400E;">Tight Transit Window Detected</h4>
                <p style="font-size: 13px; color: #78350F; margin: 4px 0;">
                  Only 25 minutes buffer planned between <strong>Banke Bihari Mandir</strong> (Vrindavan) and <strong>Krishna Janmabhoomi</strong> (Mathura). Estimated holy town transit is 45-55 mins.
                </p>
                <button class="btn-book-travel" style="background: #D97706; padding: 6px 14px; font-size: 12px; margin-top: 6px;" onclick="window.autoResolveConflict('transit-buffer')">
                  Add 45-Min Leisure & Tea Break
                </button>
              </div>
            </div>

            <div style="background: #F0FDF8; border: 1.5px solid #34D399; border-radius: var(--radius-md); padding: 18px; display: flex; gap: 16px; align-items: flex-start;">
              <div style="font-size: 24px;">✅</div>
              <div>
                <h4 style="font-size: 15px; font-weight: 700; color: #065F46;">Agra &amp; Braj Circuit: 100% Conflict Free</h4>
                <p style="font-size: 13px; color: #047857; margin-top: 4px;">
                  Taj Mahal, Agra Fort, Mehtab Bagh, and Prem Mandir routes have optimal sunrise-to-sunset time slots with no overlapping bookings.
                </p>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Tool 3: Family-Friendly Trip Planner -->
      ${activePlannerTool === 'family' ? `
        <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 28px;">
          <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; margin-bottom: 8px;">
            Family-Friendly Route Generator
          </h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px;">
            Customizes itineraries with child-safe trails, senior accessibility ramps, gentle walking distances, and famous local comfort food!
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div class="form-group">
              <label class="form-label">Traveling Group Composition</label>
              <select class="form-input" id="familyGroupType">
                <option value="with_kids">Family with Young Children (Pram / Stroller friendly)</option>
                <option value="with_seniors">Multigenerational (Wheelchair & Minimal walking)</option>
                <option value="balanced" selected>Standard Family (All ages)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Preferred Trip Pace</label>
              <select class="form-input" id="familyTripPace">
                <option value="relaxed" selected>Relaxed Pace (Max 2 attractions per day + Rest)</option>
                <option value="moderate">Moderate Pace (3 attractions per day)</option>
              </select>
            </div>
          </div>

          <h4 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; margin-bottom: 14px;">
            Recommended Family Attractions with Food Specialties
          </h4>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
            ${travelData.attractions.filter(a => a.familyFriendly).map(att => {
              const city = travelData.cities.find(c => c.id === att.cityId);
              return `
                <div style="border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: 16px; background: #FBFDFB;">
                  <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
                    <img src="${att.image}" alt="${att.name}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;" />
                    <div>
                      <h5 style="font-size: 15px; font-weight: 700;">${att.name}</h5>
                      <span style="font-size: 11px; background: #D1FAE5; color: var(--primary-dark); padding: 2px 8px; border-radius: 99px; font-weight: 600;">
                        ${att.seniorFriendly ? '👨‍👩‍👧 Family & Senior Friendly' : '👨‍👩‍👧 Family Friendly'}
                      </span>
                    </div>
                  </div>

                  <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">
                    ${att.subtitle}
                  </p>

                  <div style="background: #F1F5F9; border-radius: var(--radius-sm); padding: 8px 10px; font-size: 12px;">
                    <strong>🍴 Famous Local Food:</strong> ${city?.foodSpecialties?.slice(0, 2).join(', ') || 'Authentic treats'}
                  </div>

                  <button class="btn-book-travel" style="width: 100%; justify-content: center; margin-top: 10px; font-size: 12px; padding: 6px;" onclick="window.openBookingModal('${att.id}')">
                    Book Family Pass
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Tool 4: Destination Catalogue -->
      ${activePlannerTool === 'catalogue' ? `
        <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 28px;">
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
      ` : ''}
    </div>
  `;
}
