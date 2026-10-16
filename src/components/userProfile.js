import { storage } from '../services/storageService.js';
import { travelData } from '../data/travelData.js';
import { isCloudinaryConfigured } from '../services/cloudinaryService.js';
import { isFirebaseConnected } from '../services/firebaseConfig.js';

let profileTab = 'trips'; // 'trips', 'favorites', 'tickets', 'edit'

export function setProfileTab(tab) {
  profileTab = tab;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
];

export function renderUserProfile() {
  const user = storage.getUser() || {
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 234-5678',
    photoUrl: PRESET_AVATARS[0],
    bio: 'Avid traveler and architecture lover.',
    homeCity: 'San Francisco, CA'
  };

  const trips = storage.getTrips();
  const favorites = storage.getFavorites();
  const favoriteAttractions = travelData.attractions.filter(a => favorites.includes(a.id));
  const bookings = storage.getBookings();

  return `
    <div class="profile-view-container">
      <!-- Profile Header Hero Card -->
      <div class="profile-hero-card">
        <div class="profile-avatar-wrapper">
          <img src="${user.photoUrl}" alt="${user.name}" class="profile-main-avatar" id="profileHeaderAvatar" />
          <button class="avatar-edit-overlay" onclick="window.switchProfileTab('edit')" title="Change Avatar Photo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
          </button>
        </div>

        <div class="profile-meta-info">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h2 class="profile-meta-name">${user.name}</h2>
            <button class="promo-btn" style="background: #F1F5F9; color: var(--text-main);" onclick="window.switchProfileTab('edit')">
              ✏ Edit Profile
            </button>
          </div>

          <p class="profile-meta-bio">${user.bio || 'Exploring world heritage sites and mountain escapes.'}</p>

          <div class="profile-contact-chips">
            <div class="contact-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              ${user.email}
            </div>

            <div class="contact-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              ${user.phone || '+1 (555) 234-5678'}
            </div>

            <div class="contact-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              ${user.homeCity || 'San Francisco, CA'}
            </div>

            <div class="contact-chip" style="background: #E8FBF4; color: var(--primary-dark); font-weight: 700;">
              ✓ Firebase Connected Ready
            </div>
            <div class="contact-chip" style="cursor: pointer; background: #FFF1F2; color: #E11D48; border: 1px solid #FECDD3; font-weight: 700;" onclick="window.navigateTo('favorites')" title="Open Dedicated Wishlist">
              ❤️ Wishlist (${favorites.length}) →
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="content-tabs-nav">
        <button class="content-tab-btn ${profileTab === 'trips' ? 'active' : ''}" onclick="window.switchProfileTab('trips')">
          Planned Trips (${trips.length})
        </button>
        <button class="content-tab-btn ${profileTab === 'edit' ? 'active' : ''}" onclick="window.switchProfileTab('edit')">
          Account Settings
        </button>
      </div>

      <!-- Tab 1: Planned Trips -->
      ${profileTab === 'trips' ? `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">My Planned Journeys</h3>
          <button class="btn-book-travel" onclick="window.openNewTripModal()">
            + Plan New Trip
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${trips.map(trip => `
            <div class="travel-card" style="cursor: default;">
              <div class="card-img-wrapper" style="height: 160px;">
                <img src="${trip.image}" alt="${trip.title}" class="card-img" />
                <span class="card-category-tag">${trip.location}</span>
                <button 
                  class="card-fav-btn" 
                  style="right: 12px; top: 12px;" 
                  title="Remove trip" 
                  onclick="window.deleteTripPlan('${trip.id}')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>

              <div class="card-content">
                <h4 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700;">${trip.title}</h4>
                <div style="font-size: 13px; color: var(--text-secondary); margin: 4px 0;">
                  📅 ${trip.dateRange} • 👥 ${trip.attendees} Travelers
                </div>
                <p style="font-size: 12.5px; color: var(--text-muted);">${trip.highlight || 'Curated journey highlight.'}</p>

                <div class="card-footer">
                  <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">
                    Budget: $${trip.budgetTotal || 1200}
                  </div>
                  <button class="btn-book-travel" style="padding: 6px 14px; font-size: 12px;" onclick="window.openTripPresentation('${trip.id}')">
                    Present Trip
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Tab 4: Account Settings -->
      ${profileTab === 'edit' ? `
        <div style="background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-card); padding: 28px; max-width: 680px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--text-main); margin: 0;">
              Edit Personal Profile
            </h3>
          </div>



          <form id="editProfileForm" onsubmit="window.handleSaveProfile(event)">
            <!-- Photo Manager: Local Gallery Upload & Presets -->
            <div class="profile-photo-manager">
              <label class="form-label" style="margin: 0; font-size: 13.5px;">
                Choose Profile Avatar / Upload From Local Gallery
              </label>

              <!-- Local Upload & Avatar Preview Row -->
              <div class="profile-avatar-preview-row">
                <div class="avatar-preview-wrapper" onclick="document.getElementById('localPhotoInput').click()" title="Click to choose a photo from your computer or gallery">
                  <img id="avatarPreviewImg" src="${user.photoUrl}" alt="Avatar Preview" class="avatar-preview-img" />
                  <div class="avatar-preview-overlay">
                    <span>📷 Change</span>
                  </div>
                </div>

                <div class="upload-action-box">
                  <!-- Hidden File Input for Local Files / Device Gallery -->
                  <input 
                    type="file" 
                    id="localPhotoInput" 
                    accept="image/*" 
                    style="display: none;" 
                    onchange="window.handleLocalPhotoSelect(event)" 
                  />

                  <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <button 
                      type="button" 
                      class="btn-gallery-upload" 
                      onclick="document.getElementById('localPhotoInput').click()"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      📁 Add Photo from Local Gallery
                    </button>
                    <span style="font-size: 12px; color: var(--text-muted);">
                      Select any photo from your device
                    </span>
                  </div>

                  <!-- Cloudinary Upload Progress / Status -->
                  <div id="cloudinaryUploadProgress" class="cloudinary-upload-progress">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600;">
                      <span id="cldStatusText" style="color: var(--primary);">Uploading image to Cloudinary... ☁️</span>
                      <span id="cldPercentText" style="color: var(--accent-orange);">0%</span>
                    </div>
                    <div class="progress-track">
                      <div id="cldProgressFill" class="progress-fill"></div>
                    </div>
                    <span id="cldDetailMessage" style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;"></span>
                  </div>
                </div>
              </div>

              <!-- Preset Avatars -->
              <div style="margin-top: 6px;">
                <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 8px;">
                  Or choose a preset traveler avatar:
                </span>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  ${PRESET_AVATARS.map(avatar => `
                    <img 
                      src="${avatar}" 
                      alt="Preset" 
                      style="width: 44px; height: 44px; border-radius: 50%; cursor: pointer; object-fit: cover; border: ${user.photoUrl === avatar ? '3px solid var(--accent-orange)' : '2px solid transparent'}; transition: all 0.2s;"
                      onclick="window.selectProfileAvatar('${avatar}')" 
                    />
                  `).join('')}
                </div>
              </div>

              <!-- Hosted Image URL Field (populated automatically) -->
              <div>
                <label style="font-size: 11.5px; color: var(--text-muted); display: block; margin-bottom: 4px;">
                  Image URL (Auto-updated when uploaded to Cloudinary):
                </label>
                <input 
                  type="url" 
                  class="form-input" 
                  id="editPhotoUrl" 
                  value="${user.photoUrl}" 
                  placeholder="https://res.cloudinary.com/... or paste custom image link" 
                  style="font-size: 12.5px; padding: 8px 12px; width: 100%;"
                  oninput="window.handleManualUrlInput(this.value)"
                />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Display Name</label>
                <input type="text" class="form-input" id="editName" value="${user.name}" required />
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" class="form-input" id="editPhone" value="${user.phone || ''}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" id="editEmail" value="${user.email}" required />
              </div>

              <div class="form-group">
                <label class="form-label">Home City & Country</label>
                <input type="text" class="form-input" id="editHomeCity" value="${user.homeCity || 'San Francisco, CA'}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Short Bio / Travel Style</label>
              <textarea class="form-input" id="editBio" rows="3">${user.bio || ''}</textarea>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 14px;">
              <button type="submit" class="btn-book-travel">
                Save Profile Changes
              </button>
              <button type="button" class="promo-btn" style="background: #F1F5F9; color: var(--text-secondary);" onclick="window.switchProfileTab('trips')">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ` : ''}
    </div>
  `;
}
