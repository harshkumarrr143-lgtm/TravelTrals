// Firebase Integration Modal Component
import { getFirebaseConfig, saveFirebaseConfig, isFirebaseConnected } from '../services/firebaseConfig.js';
import { storage } from '../services/storageService.js';

export function renderFirebaseModal() {
  const config = getFirebaseConfig();
  const isConnected = isFirebaseConnected();
  const exportedData = JSON.stringify(storage.exportFirebaseData(), null, 2);

  return `
    <div class="modal-overlay" id="firebaseModalOverlay" onclick="window.handleModalBackdropClick(event, 'firebaseModalOverlay')">
      <div class="modal-card" style="max-width: 650px;">
        <button class="modal-close-btn" onclick="window.closeFirebaseModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div style="padding: 28px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #FFF7ED; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              🔥
            </div>
            <div>
              <h3 style="font-family: var(--font-heading); font-size: 20px; font-weight: 800;">Firebase Realtime Cloud Database</h3>
              <p style="font-size: 13px; color: var(--text-secondary);">Ready-to-connect Firebase Firestore & Authentication schema</p>
            </div>
          </div>

          <div style="background: ${isConnected ? '#ECFDF5' : '#FEF3C7'}; border: 1px solid ${isConnected ? '#A7F3D0' : '#FDE68A'}; border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; font-size: 13px; display: flex; align-items: center; gap: 10px;">
            <span>${isConnected ? '🟢' : '🟡'}</span>
            <span>
              ${isConnected 
                ? '<strong>Live Firebase Config Active:</strong> Data syncs with your Firebase project.' 
                : '<strong>Local Adapter Active:</strong> All user profiles, bookings, and trips are currently persisting in LocalStorage with full Firestore-ready collections.'}
            </span>
          </div>

          <form onsubmit="window.handleSaveFirebaseConfig(event)">
            <div class="form-group">
              <label class="form-label">Firebase Configuration Object (JSON)</label>
              <textarea 
                id="firebaseConfigTextarea" 
                class="form-input" 
                rows="7" 
                style="font-family: monospace; font-size: 12px;"
              >${JSON.stringify(config, null, 2)}</textarea>
              <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                Simply paste your Firebase Console -> Project Settings -> SDK snippet here whenever you're ready!
              </span>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 16px;">
              <button type="submit" class="btn-book-travel">
                Save & Connect Firebase
              </button>
              <button type="button" class="promo-btn" style="background: #F1F5F9; color: var(--text-main);" onclick="window.downloadFirebaseJson()">
                Export Data JSON
              </button>
            </div>
          </form>

          <div style="margin-top: 24px; border-top: 1px solid var(--border-light); padding-top: 16px;">
            <h5 style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">Firestore Collections Preview:</h5>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span class="contact-chip" style="font-size: 11px;">📂 users</span>
              <span class="contact-chip" style="font-size: 11px;">📂 attractions</span>
              <span class="contact-chip" style="font-size: 11px;">📂 bookings</span>
              <span class="contact-chip" style="font-size: 11px;">📂 trips</span>
              <span class="contact-chip" style="font-size: 11px;">📂 favorites</span>
              <span class="contact-chip" style="font-size: 11px;">📂 budget</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
