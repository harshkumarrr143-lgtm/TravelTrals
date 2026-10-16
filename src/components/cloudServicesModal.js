// Cloud Services Configuration Modal (Cloudinary & Firebase Firestore)
import { getCloudinaryConfig, saveCloudinaryConfig, isCloudinaryConfigured } from '../services/cloudinaryService.js';
import { getFirebaseConfig, saveFirebaseConfig, isFirebaseConnected } from '../services/firebaseConfig.js';

export function renderCloudServicesModal() {
  const cldConfig = getCloudinaryConfig();
  const fbConfig = getFirebaseConfig();
  const cldReady = isCloudinaryConfigured();
  const fbReady = isFirebaseConnected();

  return `
    <div class="modal-overlay open" id="cloudServicesModalOverlay" onclick="window.handleModalBackdropClick(event, 'cloudServicesModalOverlay')">
      <div class="modal-card" style="max-width: 680px; max-height: 85vh; overflow-y: auto;">
        <button class="modal-close-btn" onclick="window.closeCloudServicesModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div style="padding: 28px;">
          <!-- Header -->
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #0284C7 0%, #FA8223 100%); display: flex; align-items: center; justify-content: center; font-size: 22px; color: white;">
              ☁️
            </div>
            <div>
              <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 800; color: var(--text-main);">
                Cloudinary & Firestore Setup
              </h3>
              <p style="font-size: 13px; color: var(--text-secondary);">
                Configure cloud storage for local gallery photos & Firestore database
              </p>
            </div>
          </div>

          <!-- Section 1: Cloudinary (Photos) -->
          <div style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 18px; margin-bottom: 22px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">☁️</span>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main);">Cloudinary Image Hosting</h4>
              </div>
              <span class="status-pill ${cldReady ? 'status-pill-green' : 'status-pill-orange'}">
                ${cldReady ? '🟢 Connected' : '🟡 Setup Required'}
              </span>
            </div>

            <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">
              Allows uploading photos directly from your local device/gallery into Cloudinary with instant CDN optimization.
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-size: 12px;">Cloud Name</label>
                <input 
                  type="text" 
                  id="cldModalCloudName" 
                  class="form-input" 
                  placeholder="e.g. dxyz123abc" 
                  value="${cldConfig.cloudName || ''}" 
                />
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 12px;">Unsigned Upload Preset</label>
                <input 
                  type="text" 
                  id="cldModalUploadPreset" 
                  class="form-input" 
                  placeholder="e.g. traveltales_preset" 
                  value="${cldConfig.uploadPreset || ''}" 
                />
              </div>
            </div>

            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 8px; line-height: 1.4;">
              💡 <em>How to get preset:</em> Log in to Cloudinary → Settings (⚙️) → Upload → Scroll to <strong>Upload presets</strong> → Click <strong>Add upload preset</strong> → Set Signing Mode to <strong>Unsigned</strong> → Save.
            </div>
          </div>

          <!-- Section 2: Firebase Firestore (Data) -->
          <div style="background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 18px; margin-bottom: 22px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">🔥</span>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main);">Firebase Firestore Database</h4>
              </div>
              <span class="status-pill ${fbReady ? 'status-pill-green' : 'status-pill-orange'}">
                ${fbReady ? '🟢 Connected' : '🟡 Local Fallback Active'}
              </span>
            </div>

            <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">
              Syncs profile edits, uploaded photo URLs, trips, and saved favorites to your Google Cloud Firestore database.
            </p>

            <div class="form-group">
              <label class="form-label" style="font-size: 12px;">Firebase Config JSON</label>
              <textarea 
                id="fbModalConfigJson" 
                class="form-input" 
                rows="6" 
                style="font-family: monospace; font-size: 12px;"
              >${JSON.stringify(fbConfig, null, 2)}</textarea>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 6px;">
                💡 <em>How to get config:</em> Firebase Console → Project Settings → Web App (&lt;/&gt;) → Copy the <code>firebaseConfig</code> object.
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="promo-btn" style="background: #F1F5F9; color: var(--text-secondary);" onclick="window.closeCloudServicesModal()">
              Close
            </button>
            <button type="button" class="btn-book-travel" onclick="window.saveAllCloudSettings()">
              Save Cloud Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
