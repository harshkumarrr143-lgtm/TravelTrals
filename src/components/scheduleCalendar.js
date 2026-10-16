// Schedule & Calendar Component (Matching Right Panel in Reference Mockup)
import { storage } from '../services/storageService.js';
import { isFirebaseConnected } from '../services/firebaseConfig.js';

// Compute today's date dynamically
const _today = new Date();
let activeCalendarDay = _today.getDate();

export function setActiveCalendarDay(day) {
  activeCalendarDay = day;
}

function getTodayCalendarData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const today = now.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate a strip of 5 days centered around today
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const pills = [];
  for (let offset = -2; offset <= 2; offset++) {
    let d = today + offset;
    if (d < 1) d = daysInMonth + d;
    if (d > daysInMonth) d = d - daysInMonth;
    const date = new Date(year, month, d);
    pills.push({
      dayName: dayNames[date.getDay()],
      dayNum: d,
      isToday: d === today
    });
  }

  return {
    title: `${monthNames[month]} ${year}`,
    today,
    pills
  };
}

export function renderScheduleCalendar() {
  const trips = storage.getTrips();
  const calData = getTodayCalendarData();
  const hasCloudDb = isFirebaseConnected();

  // Use today as the default active day if not changed
  if (activeCalendarDay === _today.getDate()) {
    activeCalendarDay = calData.today;
  }

  return `
    <aside class="right-panel">
      <!-- Calendar Card with live today's date -->
      <div class="calendar-card">
        <div class="calendar-header">
          <button class="calendar-nav-btn" onclick="window.changeCalendarMonth(-1)" aria-label="Previous Month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div class="calendar-month-title" id="calendarMonthTitle">${calData.title}</div>
          <button class="calendar-nav-btn" onclick="window.changeCalendarMonth(1)" aria-label="Next Month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

        <div class="calendar-strip">
          ${calData.pills.map(d => `
            <div 
              class="day-pill ${d.dayNum === activeCalendarDay ? 'active' : ''} ${d.isToday ? 'today-marker' : ''}" 
              onclick="window.selectCalendarDay(${d.dayNum})"
              title="${d.isToday ? 'Today' : ''}"
            >
              <span class="day-pill-name">${d.dayName}</span>
              <span class="day-pill-num">${d.dayNum < 10 ? '0' + d.dayNum : d.dayNum}</span>
              ${d.isToday ? '<span class="today-dot"></span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- My Schedule Card (Connected with Firestore DB & GoCity Planner) -->
      <div class="schedule-card" id="myScheduleCardContainer">
        <div class="schedule-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="schedule-title">My Schedule</div>
            <span class="schedule-cloud-sync-tag" title="Connected to Cloud Database">
              <span class="status-dot-pulse"></span>
              <span>${hasCloudDb ? 'Cloud DB Active' : 'DB Ready'}</span>
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${trips.length > 0 ? `
              <button 
                class="schedule-clear-all-btn" 
                onclick="window.clearAllTripPlans()" 
                title="Clear all planned trip cards"
                style="background: #fff1f2; border: 1px solid #fecdd3; color: #e11d48; border-radius: var(--radius-full); padding: 5px 11px; font-size: 11.5px; cursor: pointer; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s ease;"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Clear All
              </button>
            ` : ''}
            <button class="schedule-new-plan-btn" onclick="window.startNewGoCityPlan()" title="Create new trip itinerary">
              + Plan Trip
            </button>
          </div>
        </div>

        <div class="schedule-items-list">
          ${trips.length === 0 ? `
            <div style="text-align:center; padding: 28px 16px; color: var(--text-muted); font-size: 13px;">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 10px; display: block; opacity: 0.4;">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
              </svg>
              <strong>No scheduled trips yet.</strong><br/>
              <p style="margin: 6px 0 12px; font-size: 12px; color: var(--text-secondary);">
                Build a tailored multi-day itinerary with our GoCity-style AI Planner.
              </p>
              <button class="btn-book-travel" style="font-size: 12px; padding: 6px 14px; margin: 0 auto;" onclick="window.startNewGoCityPlan()">
                + Create Itinerary Now
              </button>
            </div>
          ` : trips.map(trip => `
            <div class="schedule-item-card" onclick="window.viewTripItinerary('${trip.id}')" title="Click to view details & timetable">
              <div class="schedule-item-main">
                <img src="${trip.image}" alt="${trip.title}" class="schedule-thumb" />
                
                <div class="schedule-info">
                  <div class="schedule-top-row">
                    <div class="schedule-name" title="${trip.title}">${trip.title}</div>
                    <button 
                      class="schedule-delete-btn" 
                      title="Delete trip from Schedule & Database"
                      onclick="event.stopPropagation(); window.deleteTripPlan('${trip.id}')"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>

                  <div class="schedule-date-range">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
                    </svg>
                    <span>${trip.dateRange}</span>
                  </div>

                  <div class="schedule-badges-row">
                    <span class="schedule-pill-tag">📍 ${trip.attractionCount || trip.attractionIds?.length || 3} Stops</span>
                    <span class="schedule-pill-tag">👥 ${trip.attendees || 2} Travelers</span>
                    <span class="schedule-db-pill" title="Synchronized with Cloud Database">☁️ Synced</span>
                  </div>
                </div>
              </div>

              <!-- Card Action Bar -->
              <div class="schedule-card-footer">
                <button 
                  class="schedule-card-btn primary" 
                  onclick="event.stopPropagation(); window.viewTripItinerary('${trip.id}')"
                >
                  View Itinerary
                </button>
                <button 
                  class="schedule-card-btn secondary" 
                  onclick="event.stopPropagation(); window.openTripPresentation('${trip.id}')"
                >
                  Present
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Quick Planner Tools -->
      <div class="planner-tools-card">
        <div class="planner-tools-title">Smart Trip Tools</div>
        <button class="planner-tool-btn" onclick="window.startNewGoCityPlan()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          GoCity AI Trip Planner
        </button>

        <button class="planner-tool-btn" onclick="window.openTripTool('budget')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" x2="12" y1="2" y2="22"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Budget-Sharing Calculator
        </button>

        <button class="planner-tool-btn" onclick="window.openTripTool('conflict')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          Itinerary Conflict Checker
        </button>

        <button class="planner-tool-btn" onclick="window.openTripTool('family')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Family Trip Planner
        </button>
      </div>
    </aside>
  `;
}
