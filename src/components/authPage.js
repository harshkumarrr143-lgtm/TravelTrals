// Authentication Page Component: Full-Page Login & Registration View
// Default credentials: username: "user", password: "user"
import { storage } from '../services/storageService.js';

let authPageTab = 'login'; // 'login' or 'register'

export function setAuthPageTab(tab) {
  authPageTab = tab;
}

export function renderAuthPage() {
  const user = storage.getUser();

  return `
    <div class="auth-page-container">
      <div class="auth-page-card">
        <!-- Brand Header -->
        <div class="auth-page-brand">
          <img src="./site-icon.png" alt="TravelTales Icon" class="auth-brand-icon" />
          <img src="./traveltales-logo.png" alt="TravelTales Logo" class="auth-brand-logo" />
          <h2 class="auth-page-heading">
            ${authPageTab === 'login' ? 'Welcome Back, Traveler!' : 'Join TravelTales Today'}
          </h2>
          <p class="auth-page-subtext">
            ${authPageTab === 'login' 
              ? 'Access your booked skip-the-line passes, curated trips, and wishlist.' 
              : 'Create an account to unlock location-based attractions and seamless bookings.'}
          </p>
        </div>

        <!-- Tab Toggle: Sign In vs Create Account -->
        <div class="auth-tabs-wrapper">
          <button 
            type="button"
            class="auth-tab-btn ${authPageTab === 'login' ? 'active' : ''}" 
            onclick="window.switchAuthPageTab('login')"
          >
            Sign In
          </button>
          <button 
            type="button"
            class="auth-tab-btn ${authPageTab === 'register' ? 'active' : ''}" 
            onclick="window.switchAuthPageTab('register')"
          >
            Create Account
          </button>
        </div>

        ${authPageTab === 'login' ? `
          <!-- Default Credentials Banner (user / user) -->
          <div class="auth-default-credential-pill" onclick="window.fillDefaultCredentials()" title="Click to auto-fill default user credentials">
            <span class="cred-pill-badge">DEFAULT LOGIN</span>
            <span class="cred-pill-text">Username: <strong>user</strong> &nbsp;•&nbsp; Password: <strong>user</strong></span>
            <span class="cred-pill-action">Auto-fill ⚡</span>
          </div>

          <!-- Fast Google Sign-in -->
          <button type="button" class="auth-google-btn" onclick="window.handleGoogleLogin()">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            Continue with Google
          </button>

          <div class="auth-divider">
            <span>or sign in with credentials</span>
          </div>

          <!-- Sign In Form with user / user as default -->
          <form id="authPageLoginForm" onsubmit="window.handlePageAuthSubmit(event)">
            <div class="form-group">
              <label class="form-label" for="authLoginUser">Username or Email</label>
              <div class="input-icon-group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input 
                  type="text" 
                  class="form-input" 
                  id="authLoginUser" 
                  value="user" 
                  placeholder="Enter 'user' or email" 
                  required 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="authLoginPassword">Password</label>
              <div class="input-icon-group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input 
                  type="password" 
                  class="form-input" 
                  id="authLoginPassword" 
                  value="user" 
                  placeholder="Enter 'user' or password" 
                  required 
                />
              </div>
            </div>

            <div class="auth-options-row">
              <label class="auth-remember-label">
                <input type="checkbox" checked />
                <span>Remember me</span>
              </label>
              <a href="javascript:void(0)" class="auth-forgot-link" onclick="window.fillDefaultCredentials()">Use Default (user/user)</a>
            </div>

            <button type="submit" class="auth-submit-btn">
              <span>Sign In as User</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>
        ` : `
          <!-- Registration Form -->
          <form id="authPageRegisterForm" onsubmit="window.handlePageRegisterSubmit(event)">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <div class="input-icon-group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input type="text" class="form-input" id="authRegFullName" placeholder="e.g. User" value="User" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Username / Email</label>
              <div class="input-icon-group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="text" class="form-input" id="authRegEmail" placeholder="user or user@example.com" value="user@traveltales.com" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Create Password</label>
              <div class="input-icon-group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type="password" class="form-input" id="authRegPassword" placeholder="Enter password (default: user)" value="user" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Preferred Home City</label>
              <select class="form-input" id="authRegCity">
                <option value="Agra, India" selected>Agra, Uttar Pradesh</option>
                <option value="Mathura, India">Mathura, Uttar Pradesh</option>
                <option value="Vrindavan, India">Vrindavan, Uttar Pradesh</option>
              </select>
            </div>

            <button type="submit" class="auth-submit-btn">
              <span>Create Account</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>
        `}

        <div class="auth-page-footer">
          <p>
            Ready to explore? <a href="javascript:void(0)" onclick="window.navigateTo('dashboard')">Continue to Dashboard →</a>
          </p>
        </div>
      </div>
    </div>
  `;
}
