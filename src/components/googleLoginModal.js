// Custom Branded Google Sign-In Modal (No browser alerts / prompts)
export function renderGoogleLoginModal() {
  return `
    <div class="modal-overlay open" id="googleAuthModalOverlay" onclick="if(event.target === this) window.closeGoogleLoginModal()">
      <div class="google-auth-card" onclick="event.stopPropagation()">
        <!-- Google Header -->
        <div class="google-auth-header">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <svg width="28" height="28" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <button class="modal-close-btn" onclick="window.closeGoogleLoginModal()" title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #202124; margin: 0 0 6px 0;">Sign in with Google</h2>
          <p style="font-size: 13.5px; color: #5f6368; margin: 0;">to continue to TravelTales</p>
        </div>

        <form id="googleAuthForm" onsubmit="window.handleCustomGoogleSubmit(event)" style="margin-top: 22px;">
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="color: #202124; font-size: 13px; font-weight: 600;">Gmail or Google Email Address</label>
            <input 
              type="email" 
              class="form-input" 
              id="googleInputEmail" 
              placeholder="e.g. yourname@gmail.com" 
              required 
              style="padding: 12px 14px; border: 1px solid #dadce0; border-radius: 8px; font-size: 14px; width: 100%;"
              autocomplete="email"
              autofocus
            />
          </div>

          <div class="form-group" style="margin-bottom: 18px;">
            <label class="form-label" style="color: #202124; font-size: 13px; font-weight: 600;">Full Name (optional)</label>
            <input 
              type="text" 
              class="form-input" 
              id="googleInputName" 
              placeholder="e.g. Harsh Kumar" 
              style="padding: 12px 14px; border: 1px solid #dadce0; border-radius: 8px; font-size: 14px; width: 100%;"
              autocomplete="name"
            />
          </div>

          <div style="font-size: 12px; color: #5f6368; line-height: 1.5; margin-bottom: 22px; background: #f8f9fa; padding: 12px 14px; border-radius: 8px; border: 1px solid #edf0f2;">
            🔒 By continuing, Google will securely link your Gmail account with your TravelTales profile and sync your bookings directly to Cloud Firestore.
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; align-items: center;">
            <button type="button" class="promo-btn" style="background: transparent; color: #1a73e8; font-weight: 600; padding: 10px 18px; border: none; cursor: pointer;" onclick="window.closeGoogleLoginModal()">
              Cancel
            </button>
            <button type="submit" class="btn-book-travel" style="background: #1a73e8; color: white; font-weight: 700; border-radius: 8px; padding: 10px 22px; font-size: 14px; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);">
              Continue with Gmail
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
