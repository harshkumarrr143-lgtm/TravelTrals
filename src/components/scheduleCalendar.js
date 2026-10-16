// Schedule & Calendar Component (Matching Right Panel in Reference Mockup)
import { storage } from '../services/storageService.js';

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

  // Use today as the default active day if not changed
  if (activeCalendarDay === _today.getDate()) {
    activeCalendarDay = calData.today;
  }

  return `
    <aside class="right-panel">
      <!-- Calendar Card with live today's date -->
      <div class="calendar-card">
        <div class="calendar-header">
          <button class="calendar-nav-btn" onclick="window.changeCalendarMonth(-1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div class="calendar-month-title" id="calendarMonthTitle">${calData.title}</div>
          <button class="calendar-nav-btn" onclick="window.changeCalendarMonth(1)">
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

      <!-- My Schedule Card -->
      <div class="schedule-card">
        <div class="schedule-header">
          <div class="schedule-title">My Schedule</div>
          <a class="section-see-all" onclick="window.navigateTo('planner')">See all</a>
        </div>

        <div class="schedule-items-list">
          ${trips.length === 0 ? `
            <div style="text-align:center; padding: 24px 16px; color: var(--text-muted); font-size: 13px;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 8px; display: block; opacity: 0.4;">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
              </svg>
              No trips planned yet.<br/>
              <a onclick="window.navigateTo('planner')" style="color: var(--primary); cursor: pointer; text-decoration: underline;">Plan your first trip →</a>
            </div>
          ` : trips.map(trip => `
            <div class="schedule-item" onclick="window.openTripPresentation('${trip.id}')" title="Click to view trip presentation">
              <img src="${trip.image}" alt="${trip.title}" class="schedule-thumb" />
              <div class="schedule-info">
                <div class="schedule-name">${trip.title}</div>
                <div class="schedule-date-range">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                  </svg>
                  ${trip.dateRange}
                </div>
                <div class="schedule-avatars-row">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" class="mini-avatar-stack" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" class="mini-avatar-stack" />
                  <span class="mini-avatar-more">+${trip.attendees}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Quick Planner Tools -->
      <div class="planner-tools-card">
        <div class="planner-tools-title">Smart Trip Tools</div>
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
            <line x1="12" x2="12" y1="8" y2="12"/>
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

        <button class="planner-tool-btn" onclick="window.openTripPresentation()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Trip Presentation View
        </button>
      </div>
    </aside>
  `;
}
