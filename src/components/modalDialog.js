// Custom On-Screen Modal Dialogs (Replaces native browser alert, confirm, and prompt)
// Renders beautiful glassmorphic dialogs right inside the web page

function getOrCreateDialogContainer() {
  let container = document.getElementById('customDialogContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'customDialogContainer';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * On-Screen Alert Modal
 * @param {object} options - { title, message, icon, buttonText }
 * @returns {Promise<void>}
 */
export function showAlertModal({
  title = 'Notification',
  message = '',
  icon = '✨',
  buttonText = 'Got It'
} = {}) {
  return new Promise((resolve) => {
    const container = getOrCreateDialogContainer();
    const formattedMessage = (message || '').replace(/\n/g, '<br/>');

    container.innerHTML = `
      <div class="custom-modal-overlay open" id="customAlertOverlay">
        <div class="custom-dialog-card alert-card">
          <div class="dialog-icon-badge">${icon}</div>
          <h3 class="dialog-title">${title}</h3>
          <div class="dialog-message">${formattedMessage}</div>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn-primary" id="customAlertBtn">
              ${buttonText}
            </button>
          </div>
        </div>
      </div>
    `;

    const closeAlert = () => {
      const overlay = document.getElementById('customAlertOverlay');
      if (overlay) overlay.classList.remove('open');
      setTimeout(() => {
        container.innerHTML = '';
        resolve();
      }, 200);
    };

    document.getElementById('customAlertBtn')?.addEventListener('click', closeAlert);
    document.getElementById('customAlertOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'customAlertOverlay') closeAlert();
    });
  });
}

/**
 * On-Screen Confirmation Modal
 * @param {object} options - { title, message, confirmText, cancelText, icon, isDanger }
 * @returns {Promise<boolean>} Resolves true if confirmed, false if cancelled
 */
export function showConfirmModal({
  title = 'Please Confirm',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = '⚠️',
  isDanger = false
} = {}) {
  return new Promise((resolve) => {
    const container = getOrCreateDialogContainer();
    const formattedMessage = (message || '').replace(/\n/g, '<br/>');

    container.innerHTML = `
      <div class="custom-modal-overlay open" id="customConfirmOverlay">
        <div class="custom-dialog-card ${isDanger ? 'danger-dialog' : ''}">
          <div class="dialog-icon-badge ${isDanger ? 'icon-danger' : ''}">${icon}</div>
          <h3 class="dialog-title">${title}</h3>
          <div class="dialog-message">${formattedMessage}</div>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn-ghost" id="customConfirmCancelBtn">
              ${cancelText}
            </button>
            <button class="dialog-btn ${isDanger ? 'dialog-btn-danger' : 'dialog-btn-primary'}" id="customConfirmOkBtn">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
    `;

    const cleanup = (result) => {
      const overlay = document.getElementById('customConfirmOverlay');
      if (overlay) overlay.classList.remove('open');
      setTimeout(() => {
        container.innerHTML = '';
        resolve(result);
      }, 200);
    };

    document.getElementById('customConfirmOkBtn')?.addEventListener('click', () => cleanup(true));
    document.getElementById('customConfirmCancelBtn')?.addEventListener('click', () => cleanup(false));
    document.getElementById('customConfirmOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'customConfirmOverlay') cleanup(false);
    });
  });
}

/**
 * On-Screen Text Input Modal (replaces browser prompt)
 * @param {object} options - { title, message, placeholder, defaultValue, confirmText, cancelText }
 * @returns {Promise<string|null>} Resolves entered value or null if cancelled
 */
export function showPromptModal({
  title = 'Enter Details',
  message = '',
  placeholder = '',
  defaultValue = '',
  confirmText = 'Submit',
  cancelText = 'Cancel'
} = {}) {
  return new Promise((resolve) => {
    const container = getOrCreateDialogContainer();

    container.innerHTML = `
      <div class="custom-modal-overlay open" id="customPromptOverlay">
        <div class="custom-dialog-card prompt-card">
          <div class="dialog-icon-badge">✍️</div>
          <h3 class="dialog-title">${title}</h3>
          ${message ? `<div class="dialog-message">${message}</div>` : ''}
          <form id="customPromptForm" style="margin-top: 14px; width: 100%;">
            <input 
              type="text" 
              id="customPromptInput" 
              class="form-input" 
              placeholder="${placeholder}" 
              value="${defaultValue}"
              style="width: 100%; padding: 12px 14px; border-radius: 8px; border: 1.5px solid var(--border); font-size: 14px; margin-bottom: 18px;"
              autofocus 
            />
            <div class="dialog-actions">
              <button type="button" class="dialog-btn dialog-btn-ghost" id="customPromptCancelBtn">
                ${cancelText}
              </button>
              <button type="submit" class="dialog-btn dialog-btn-primary" id="customPromptSubmitBtn">
                ${confirmText}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const input = document.getElementById('customPromptInput');
    setTimeout(() => {
      input?.focus();
      if (input && defaultValue) input.select();
    }, 100);

    const cleanup = (result) => {
      const overlay = document.getElementById('customPromptOverlay');
      if (overlay) overlay.classList.remove('open');
      setTimeout(() => {
        container.innerHTML = '';
        resolve(result);
      }, 200);
    };

    document.getElementById('customPromptForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      cleanup(input?.value?.trim() || '');
    });

    document.getElementById('customPromptCancelBtn')?.addEventListener('click', () => cleanup(null));
    document.getElementById('customPromptOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'customPromptOverlay') cleanup(null);
    });
  });
}

// Expose directly to window for global access
if (typeof window !== 'undefined') {
  window.showAlertModal = showAlertModal;
  window.showConfirmModal = showConfirmModal;
  window.showPromptModal = showPromptModal;
}
