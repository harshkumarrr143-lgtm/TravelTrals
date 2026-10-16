// Authentication Modal Component: Email/Password, Phone Number, and Google Sign-in
import { storage } from '../services/storageService.js';
import siteIcon from '../assets/site-icon.png';
import traveltalesLogo from '../assets/traveltales-logo.png';

let activeAuthTab = 'login'; // 'login' or 'register'
let activeLoginMethod = 'email'; // 'email' or 'phone'

export function setAuthModalState(tab = 'login', method = 'email') {
  activeAuthTab = tab;
  activeLoginMethod = method;
}

export function renderAuthModal() {
  return `
    <div class="modal-overlay" id="authModalOverlay" onclick="window.handleModalBackdropClick(event, 'authModalOverlay')">
      <div class="modal-card" style="max-width: 480px;">
        <button class="modal-close-btn" onclick="window.closeAuthModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div style="padding: 32px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${siteIcon}" alt="TravelTales" style="width: 52px; height: 52px; border-radius: 50%; object-fit: contain; margin: 0 auto 10px auto; display: block; box-shadow: var(--shadow-sm); background: transparent;" onerror="this.onerror=null; this.src='./site-icon.png';" />
            <img src="${traveltalesLogo}" alt="TravelTales Logo" style="height: 36px; object-fit: contain; margin-bottom: 6px; background: transparent;" onerror="this.onerror=null; this.src='./traveltales-logo.png';" />
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
              ${activeAuthTab === 'login' ? 'Sign in to access your planned trips and passes.' : 'Create an account to book skip-the-line passes.'}
            </p>
          </div>

          <!-- Auth Mode Toggle (Login vs Register) -->
          <div style="display: flex; background: #F1F5F9; border-radius: var(--radius-full); padding: 4px; margin-bottom: 20px;">
            <button 
              class="content-tab-btn ${activeAuthTab === 'login' ? 'active' : ''}" 
              style="flex: 1; text-align: center; border-radius: var(--radius-full); padding: 8px; font-size: 13px; ${activeAuthTab === 'login' ? 'background: white; box-shadow: var(--shadow-sm); border-bottom: none;' : ''}"
              onclick="window.switchAuthTab('login')"
            >
              Sign In
            </button>
            <button 
              class="content-tab-btn ${activeAuthTab === 'register' ? 'active' : ''}" 
              style="flex: 1; text-align: center; border-radius: var(--radius-full); padding: 8px; font-size: 13px; ${activeAuthTab === 'register' ? 'background: white; box-shadow: var(--shadow-sm); border-bottom: none;' : ''}"
              onclick="window.switchAuthTab('register')"
            >
              Create Account
            </button>
          </div>

          <!-- Login Method Selector: Email vs Phone -->
          ${activeAuthTab === 'login' ? `
            <div style="display: flex; gap: 10px; margin-bottom: 16px;">
              <button 
                class="mode-toggle-btn ${activeLoginMethod === 'email' ? 'active' : ''}" 
                style="flex: 1; justify-content: center;"
                onclick="window.switchLoginMethod('email')"
              >
                ✉ Email & Password
              </button>
              <button 
                class="mode-toggle-btn ${activeLoginMethod === 'phone' ? 'active' : ''}" 
                style="flex: 1; justify-content: center;"
                onclick="window.switchLoginMethod('phone')"
              >
                📱 Phone Number
              </button>
            </div>
          ` : ''}

          <!-- Google Fast Sign-In (Opens custom Gmail modal) -->
          <button 
            type="button" 
            class="form-input" 
            style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: white; font-weight: 600; cursor: pointer; margin-bottom: 16px; border: 1px solid #dadce0;"
            onclick="window.openGoogleLoginModal()"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            Continue with Gmail / Google
          </button>

          <div style="display: flex; align-items: center; gap: 12px; margin: 16px 0; color: var(--text-muted); font-size: 12px;">
            <div style="flex: 1; height: 1px; background: var(--border-light);"></div>
            <span>or continue with credentials</span>
            <div style="flex: 1; height: 1px; background: var(--border-light);"></div>
          </div>

          <!-- Form Area -->
          <form id="authMainForm" onsubmit="window.handleAuthSubmit(event)">
            ${activeAuthTab === 'register' ? `
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="authRegName" placeholder="e.g. Harsh Kumar" required />
              </div>
            ` : ''}

            ${activeLoginMethod === 'phone' && activeAuthTab === 'login' ? `
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" class="form-input" id="authPhone" placeholder="+91 9876543210" required />
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" id="authPhonePass" placeholder="Enter your password" required />
              </div>
            ` : `
              <div class="form-group">
                <label class="form-label">Username or Email</label>
                <input type="text" class="form-input" id="authEmail" placeholder="Enter your email or username" required />
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" id="authPassword" placeholder="Enter your password" required />
              </div>
            `}

            <button type="submit" class="btn-book-travel" style="width: 100%; justify-content: center; margin-top: 14px; font-size: 15px;">
              ${activeAuthTab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style="text-align: center; margin-top: 18px; font-size: 12px; color: var(--text-muted);">
            Data saved securely with Firebase-ready schema.
          </div>
        </div>
      </div>
    </div>
  `;
}
