import { storage } from '../services/storageService.js';
import { travelData } from '../data/travelData.js';
import { isCloudinaryConfigured } from '../services/cloudinaryService.js';
import { isFirebaseConnected } from '../services/firebaseConfig.js';

let profileTab = 'trips'; // 'trips', 'favorites', 'tickets', 'edit', 'security'

export function setProfileTab(tab) {
  profileTab = tab;
}

export function renderUserProfile() {
  const user = storage.getUser();

  // If user is not logged in, prompt to register or sign in
  if (!user || !user.isLoggedIn) {
    return `
      <div class="profile-view-container" style="max-width: 620px; margin: 40px auto; text-align: center;">
        <div class="profile-hero-card" style="padding: 44px 28px; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: #FFF7ED; color: var(--accent-orange); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; font-size: 32px;">
            👤
          </div>
          <h2 style="font-family: var(--font-heading); font-size: 24px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
            Traveler Profile
          </h2>
          <p style="color: var(--text-secondary); font-size: 14px; max-width: 420px; margin: 0 auto 24px auto; line-height: 1.6;">
            Create an account or sign in with your email or Google account to access your personalized travel dashboard, view bookings, and plan trips.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="btn-book-travel" onclick="window.navigateTo('auth')">
              Sign In or Register
            </button>
            <button class="promo-btn" style="background: white; border: 1px solid #dadce0; color: #3c4043; font-weight: 600; padding: 10px 18px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer;" onclick="window.openGoogleLoginModal()">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              Sign In with Google
            </button>
          </div>
        </div>
      </div>
    `;
  }

  const trips = storage.getTrips();
  const favorites = storage.getFavorites();
  const bookings = storage.getBookings();

  return `
    <div class="profile-view-container">
      <!-- Profile Header Hero Card -->
      <div class="profile-hero-card">
        <div class="profile-avatar-wrapper">
          <img 
            src="${user.photoUrl || ''}" 
            alt="${user.name}" 
            class="profile-main-avatar" 
            id="profileHeaderAvatar" 
            style="${user.photoUrl ? 'display: block;' : 'display: none;'}" 
          />
          <div 
            class="profile-main-avatar-initials" 
            id="profileHeaderAvatarInitials" 
            style="${user.photoUrl ? 'display: none;' : 'display: flex;'}"
          >
            ${user.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <button class="avatar-edit-overlay" onclick="window.switchProfileTab('edit')" title="Upload / Change Profile Photo">
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

          <p class="profile-meta-bio">${user.bio || 'Traveler exploring world heritage sites and cultural landmarks.'}</p>

          <div class="profile-contact-chips">
            ${user.email ? `
              <div class="contact-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                ${user.email}
              </div>
            ` : ''}

            ${user.phone ? `
              <div class="contact-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                ${user.phone}
              </div>
            ` : ''}

            ${user.homeCity ? `
              <div class="contact-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                ${user.homeCity}
              </div>
            ` : ''}

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
        <button class="content-tab-btn ${profileTab === 'security' ? 'active' : ''}" onclick="window.switchProfileTab('security')">
          🔒 Change Password
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
            <!-- Photo Manager: Upload From Local Device & Remove Photo -->
            <div class="profile-photo-manager">
              <label class="form-label" style="margin: 0; font-size: 13.5px;">
                Profile Photo (Device Gallery / Cloudinary)
              </label>

              <!-- Local Upload & Avatar Preview Row -->
              <div class="profile-avatar-preview-row">
                <div class="avatar-preview-wrapper" onclick="document.getElementById('localPhotoInput').click()" title="Click to choose a photo from your computer or gallery">
                  <img 
                    id="avatarPreviewImg" 
                    src="${user.photoUrl || ''}" 
                    alt="Avatar Preview" 
                    class="avatar-preview-img" 
                    style="${user.photoUrl ? 'width: 72px; height: 72px; object-fit: cover; border-radius: 50%; display: block;' : 'display: none; width: 72px; height: 72px; object-fit: cover; border-radius: 50%;'}" 
                  />
                  <div 
                    id="avatarFallbackInitials" 
                    class="profile-main-avatar-initials" 
                    style="width: 72px; height: 72px; font-size: 26px; ${user.photoUrl ? 'display: none;' : 'display: flex;'}"
                  >
                    ${user.name ? user.name.charAt(0).toUpperCase() : '📷'}
                  </div>
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
                      📁 Upload Photo from Device
                    </button>

                    ${user.photoUrl ? `
                      <button 
                        type="button" 
                        class="promo-btn" 
                        style="background: #FEE2E2; color: #DC2626; border: 1px solid #FECACA; font-weight: 600; padding: 8px 14px; font-size: 12.5px;"
                        onclick="window.removeProfilePhoto()"
                      >
                        🗑️ Remove Photo
                      </button>
                    ` : ''}

                    <span style="font-size: 12px; color: var(--text-muted);">
                      JPG, PNG, WebP up to 5MB
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

              <!-- Hidden Hosted Image URL Field (populated automatically on upload) -->
              <input 
                type="hidden" 
                id="editPhotoUrl" 
                value="${user.photoUrl || ''}" 
              />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="editName" value="${user.name || ''}" placeholder="e.g. Harsh Kumar" required />
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" class="form-input" id="editPhone" value="${user.phone || ''}" placeholder="e.g. +91 9876543210" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" id="editEmail" value="${user.email || ''}" placeholder="yourname@gmail.com" required />
              </div>

              <div class="form-group">
                <label class="form-label">Home City & Country</label>
                <input type="text" class="form-input" id="editHomeCity" value="${user.homeCity || ''}" placeholder="e.g. Agra, India" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Short Bio / Travel Style</label>
              <textarea class="form-input" id="editBio" rows="3">${user.bio || ''}</textarea>
            </div>

            <!-- Password & Security Shortcut Banner inside Edit Tab -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 16px; margin: 20px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: #FFF7ED; color: var(--accent-orange); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <div style="font-size: 13.5px; font-weight: 700; color: var(--text-main);">Password & Account Security</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">Looking to update your account password? Change it in the dedicated security panel.</div>
                </div>
              </div>
              <button type="button" class="promo-btn" style="background: #FFF7ED; color: var(--accent-orange); border: 1px solid #FED7AA; font-weight: 700; padding: 7px 14px; font-size: 13px;" onclick="window.switchProfileTab('security')">
                Change Password →
              </button>
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

      <!-- Tab 3: Security & Password Management -->
      ${profileTab === 'security' ? `
        <div class="profile-card" style="margin-top: 10px; max-width: 680px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; border-bottom: 1px solid var(--border-card); padding-bottom: 16px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 10px;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: #FFF7ED; color: var(--accent-orange);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                Change Account Password
              </h3>
              <p style="font-size: 13px; color: var(--text-secondary); margin: 4px 0 0 0;">
                Update your login password to safeguard your travel bookings and profile.
              </p>
            </div>
            <span class="security-status-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Password Protected
            </span>
          </div>

          <!-- Real-time Alert box (rendered dynamically on submit) -->
          <div id="passwordAlertBox" style="display: none; padding: 12px 16px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; margin-bottom: 20px;"></div>

          <form id="changePasswordForm" onsubmit="window.handleChangePassword(event)">
            <!-- Current Password -->
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <label class="form-label" for="currentPassword">Current Password</label>
                <span style="font-size: 11.5px; color: var(--text-muted);">Default demo password: <strong style="color: var(--primary);">user</strong></span>
              </div>
              <div class="password-input-wrapper">
                <input 
                  type="password" 
                  class="form-input password-input-field" 
                  id="currentPassword" 
                  placeholder="Enter current password (default: user)" 
                  required 
                  autocomplete="current-password"
                />
                <button 
                  type="button" 
                  class="password-toggle-btn" 
                  onclick="window.togglePasswordVisibility('currentPassword', this)" 
                  title="Show / Hide password"
                >
                  👁️
                </button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <!-- New Password -->
              <div class="form-group">
                <label class="form-label" for="newPassword">New Password</label>
                <div class="password-input-wrapper">
                  <input 
                    type="password" 
                    class="form-input password-input-field" 
                    id="newPassword" 
                    placeholder="Min. 4 characters" 
                    required 
                    autocomplete="new-password"
                    oninput="window.handlePasswordStrengthCheck(this.value)"
                  />
                  <button 
                    type="button" 
                    class="password-toggle-btn" 
                    onclick="window.togglePasswordVisibility('newPassword', this)" 
                    title="Show / Hide password"
                  >
                    👁️
                  </button>
                </div>
                <!-- Password Strength Meter -->
                <div class="password-strength-container" style="margin-top: 6px;">
                  <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                    <span style="color: var(--text-muted);">Strength:</span>
                    <span id="strengthLabel" style="font-weight: 700; color: var(--text-muted);">None</span>
                  </div>
                  <div style="height: 4px; background: #E2E8F0; border-radius: 2px; overflow: hidden;">
                    <div id="strengthBar" style="height: 100%; width: 0%; transition: all 0.3s; background: #94A3B8;"></div>
                  </div>
                </div>
              </div>

              <!-- Confirm New Password -->
              <div class="form-group">
                <label class="form-label" for="confirmPassword">Confirm New Password</label>
                <div class="password-input-wrapper">
                  <input 
                    type="password" 
                    class="form-input password-input-field" 
                    id="confirmPassword" 
                    placeholder="Re-type new password" 
                    required 
                    autocomplete="new-password"
                    oninput="window.handlePasswordMatchCheck()"
                  />
                  <button 
                    type="button" 
                    class="password-toggle-btn" 
                    onclick="window.togglePasswordVisibility('confirmPassword', this)" 
                    title="Show / Hide password"
                  >
                    👁️
                  </button>
                </div>
                <span id="matchFeedback" style="font-size: 11.5px; color: var(--text-muted); display: block; margin-top: 4px;">
                  Must match new password
                </span>
              </div>
            </div>

            <!-- Security Info Banner -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 14px 16px; margin: 18px 0 22px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">🛡️</span>
                <div>
                  <div style="font-size: 12.5px; font-weight: 700; color: var(--text-main);">Security Advisory</div>
                  <div style="font-size: 11.5px; color: var(--text-secondary);">Passwords are encrypted locally and required for login and booking access.</div>
                </div>
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted);">
                ${storage.getPasswordUpdatedAt() ? `Last updated: ${new Date(storage.getPasswordUpdatedAt()).toLocaleDateString()}` : 'Default credential active'}
              </div>
            </div>

            <div style="display: flex; gap: 12px;">
              <button type="submit" class="btn-book-travel" id="submitChangePasswordBtn" style="display: inline-flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Update Password
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
