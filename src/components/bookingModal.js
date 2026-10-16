// Booking & Payment Modal Component with Skip-The-Line Checkout and Confetti
import { travelData } from '../data/travelData.js';
import { storage } from '../services/storageService.js';
import confetti from 'canvas-confetti';

let currentBookingState = {
  attractionId: null,
  selectedTierIndex: 0,
  date: new Date().toISOString().split('T')[0],
  timeSlot: '08:00 AM - 10:00 AM (Skip-the-line Priority)',
  adults: 2,
  children: 0,
  paymentMethod: 'upi',
  step: 1, // 1: details, 2: payment, 3: ticket voucher
  confirmedBooking: null
};

export function setBookingAttraction(attractionId) {
  const att = travelData.attractions.find(a => a.id === attractionId) || travelData.attractions[0];
  currentBookingState = {
    attractionId: att.id,
    selectedTierIndex: att.prices.tiers.length - 1, // default to skip-the-line VIP
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '08:00 AM - 10:30 AM (Priority Morning Entry)',
    adults: 2,
    children: 0,
    paymentMethod: 'upi',
    step: 1,
    confirmedBooking: null
  };
}

export function renderBookingModal() {
  const att = travelData.attractions.find(a => a.id === currentBookingState.attractionId) || travelData.attractions[0];
  const tier = att.prices.tiers[currentBookingState.selectedTierIndex] || att.prices.tiers[0];
  const totalPrice = (tier.price * currentBookingState.adults) + (Math.round(tier.price * 0.5) * currentBookingState.children);

  return `
    <div class="modal-overlay" id="bookingModalOverlay" onclick="window.handleModalBackdropClick(event, 'bookingModalOverlay')">
      <div class="modal-card" style="max-width: 600px;">
        <button class="modal-close-btn" onclick="window.closeBookingModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Stepper Indicator -->
        <div class="booking-steps-nav">
          <div class="booking-step-indicator ${currentBookingState.step >= 1 ? 'active' : ''}">
            <div class="step-num-bubble">1</div>
            <span>Tickets & Slot</span>
          </div>
          <div style="width: 30px; height: 1px; background: var(--border-card);"></div>
          <div class="booking-step-indicator ${currentBookingState.step >= 2 ? 'active' : ''}">
            <div class="step-num-bubble">2</div>
            <span>Payment</span>
          </div>
          <div style="width: 30px; height: 1px; background: var(--border-card);"></div>
          <div class="booking-step-indicator ${currentBookingState.step === 3 ? 'active' : ''}">
            <div class="step-num-bubble">3</div>
            <span>Ticket Voucher</span>
          </div>
        </div>

        <div style="padding: 24px;">
          ${currentBookingState.step === 1 ? `
            <!-- Step 1: Select Tier, Date & Guests -->
            <div style="display: flex; gap: 14px; margin-bottom: 20px; align-items: center;">
              <img src="${att.image}" alt="${att.name}" style="width: 60px; height: 60px; border-radius: var(--radius-md); object-fit: cover;" />
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">${att.name}</h3>
                <p style="font-size: 13px; color: var(--text-secondary);">${att.cityName} • Skip-the-line Direct Pass</p>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Select Ticket Tier</label>
              <div class="pricing-tiers-list">
                ${att.prices.tiers.map((t, idx) => `
                  <div 
                    class="pricing-tier-option ${currentBookingState.selectedTierIndex === idx ? 'selected' : ''}" 
                    onclick="window.updateBookingTier(${idx})"
                  >
                    <div class="tier-left">
                      <h5>${t.name}</h5>
                      <p>${t.desc}</p>
                    </div>
                    <div class="tier-price-val">${att.prices.currency}${t.price}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="form-group">
                <label class="form-label">Visit Date</label>
                <input 
                  type="date" 
                  class="form-input" 
                  value="${currentBookingState.date}" 
                  min="${new Date().toISOString().split('T')[0]}" 
                  onchange="window.updateBookingDate(this.value)"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Entry Time Slot</label>
                <select class="form-input" onchange="window.updateBookingSlot(this.value)">
                  <option value="06:00 AM - 08:30 AM (Sunrise Fast Track)">06:00 AM - 08:30 AM (Sunrise Fast Track)</option>
                  <option value="08:30 AM - 11:30 AM (Morning VIP Access)" selected>08:30 AM - 11:30 AM (Morning VIP Access)</option>
                  <option value="12:00 PM - 03:00 PM (Afternoon Express)">12:00 PM - 03:00 PM (Afternoon Express)</option>
                  <option value="03:30 PM - 06:30 PM (Golden Hour Sunset)">03:30 PM - 06:30 PM (Golden Hour Sunset)</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
              <div class="form-group">
                <label class="form-label">Adults (Age 12+)</label>
                <div style="display: flex; align-items: center; gap: 12px; background: #F8FAFC; padding: 6px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-card);">
                  <button class="icon-btn-circle" style="width: 28px; height: 28px;" onclick="window.updateGuests('adults', -1)">-</button>
                  <span style="font-weight: 700; flex: 1; text-align: center;">${currentBookingState.adults}</span>
                  <button class="icon-btn-circle" style="width: 28px; height: 28px;" onclick="window.updateGuests('adults', 1)">+</button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Children (Age 3-11)</label>
                <div style="display: flex; align-items: center; gap: 12px; background: #F8FAFC; padding: 6px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-card);">
                  <button class="icon-btn-circle" style="width: 28px; height: 28px;" onclick="window.updateGuests('children', -1)">-</button>
                  <span style="font-weight: 700; flex: 1; text-align: center;">${currentBookingState.children}</span>
                  <button class="icon-btn-circle" style="width: 28px; height: 28px;" onclick="window.updateGuests('children', 1)">+</button>
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--border-light);">
              <div>
                <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Total Payable:</span>
                <div style="font-size: 24px; font-weight: 800; color: var(--primary-dark); font-family: var(--font-heading);">
                  ${att.prices.currency}${totalPrice}
                </div>
              </div>
              <button class="btn-book-travel" onclick="window.proceedToPayment()">
                Continue to Payment
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          ` : currentBookingState.step === 2 ? `
            <!-- Step 2: Payment Gateway Simulation -->
            <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; margin-bottom: 6px;">Choose Payment Method</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
              Total amount: <strong style="color: var(--primary-dark);">${att.prices.currency}${totalPrice}</strong>
            </p>

            <div class="payment-methods-grid">
              <div 
                class="payment-method-card ${currentBookingState.paymentMethod === 'upi' ? 'selected' : ''}" 
                onclick="window.selectPaymentMethod('upi')"
              >
                <div style="font-size: 24px;">📱</div>
                <div class="payment-method-name">UPI / GPay</div>
              </div>
              <div 
                class="payment-method-card ${currentBookingState.paymentMethod === 'card' ? 'selected' : ''}" 
                onclick="window.selectPaymentMethod('card')"
              >
                <div style="font-size: 24px;">💳</div>
                <div class="payment-method-name">Credit Card</div>
              </div>
              <div 
                class="payment-method-card ${currentBookingState.paymentMethod === 'netbanking' ? 'selected' : ''}" 
                onclick="window.selectPaymentMethod('netbanking')"
              >
                <div style="font-size: 24px;">🏦</div>
                <div class="payment-method-name">NetBanking</div>
              </div>
            </div>

            ${currentBookingState.paymentMethod === 'upi' ? `
              <div class="form-group">
                <label class="form-label">Virtual Payment Address (VPA / UPI ID)</label>
                <input type="text" class="form-input" id="upiInput" value="alex@okaxis" placeholder="username@upi" />
                <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Supports Google Pay, PhonePe, Paytm, and BHIM</span>
              </div>
            ` : `
              <div class="form-group">
                <label class="form-label">Card Number</label>
                <input type="text" class="form-input" value="4532 •••• •••• 8821" />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Expiry (MM/YY)</label>
                  <input type="text" class="form-input" value="08/28" />
                </div>
                <div class="form-group">
                  <label class="form-label">CVV</label>
                  <input type="password" class="form-input" value="789" />
                </div>
              </div>
            `}

            <div style="display: flex; gap: 12px; margin-top: 24px;">
              <button class="promo-btn" style="background: #F1F5F9; color: var(--text-secondary);" onclick="window.backToBookingDetails()">
                Back
              </button>
              <button 
                class="btn-book-travel" 
                style="flex: 1; justify-content: center;" 
                id="btnConfirmPay"
                onclick="window.processPaymentExecution('${att.id}', ${totalPrice}, '${tier.name}', '${att.prices.currency}')"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                </svg>
                Authorize & Pay ${att.prices.currency}${totalPrice}
              </button>
            </div>
          ` : `
            <!-- Step 3: Ticket Confirmation Voucher -->
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="width: 50px; height: 50px; background: #D1FAE5; color: var(--primary-dark); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 8px;">
                ✓
              </div>
              <h3 style="font-family: var(--font-heading); font-size: 22px; font-weight: 800; color: var(--text-main);">
                Booking Confirmed!
              </h3>
              <p style="font-size: 13px; color: var(--text-secondary);">Your skip-the-line VIP pass is issued and saved to your account.</p>
            </div>

            <!-- Printable Voucher -->
            <div class="ticket-voucher" id="printableTicketArea">
              <div class="ticket-header-strip">
                <div>
                  <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Reference No.</div>
                  <div class="ticket-booking-ref">${currentBookingState.confirmedBooking?.id || 'TT-BK-9821'}</div>
                </div>
                <div style="background: #D1FAE5; color: var(--primary-dark); padding: 4px 10px; border-radius: var(--radius-full); font-size: 12px; font-weight: 700;">
                  Confirmed • Priority Fast-Track
                </div>
              </div>

              <div class="ticket-qr-section">
                <div>
                  <h4 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">${att.name}</h4>
                  <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${att.cityName}</div>
                  <div style="margin-top: 8px; font-size: 13px;">
                    <div><strong>Date:</strong> ${currentBookingState.date}</div>
                    <div><strong>Slot:</strong> ${currentBookingState.timeSlot}</div>
                    <div><strong>Guests:</strong> ${currentBookingState.adults} Adults ${currentBookingState.children > 0 ? `, ${currentBookingState.children} Children` : ''}</div>
                    <div><strong>Total Paid:</strong> ${att.prices.currency}${totalPrice}</div>
                  </div>
                </div>

                <img 
                  src="${currentBookingState.confirmedBooking?.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TT-BK-DEMO'}" 
                  alt="Entry QR" 
                  class="ticket-qr-img" 
                />
              </div>

              <div style="font-size: 11px; color: var(--text-muted); border-top: 1px dashed var(--border-card); padding-top: 10px;">
                * Present this QR pass on your smartphone screen at the designated Skip-The-Line VIP entrance gate. Government photo ID required.
              </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 20px;">
              <button class="promo-btn" style="flex: 1; text-align: center; background: #F1F5F9; color: var(--text-main);" onclick="window.printTicketVoucher()">
                🖨 Print / Save Voucher
              </button>
              <button class="btn-book-travel" style="flex: 1; justify-content: center;" onclick="window.navigateTo('tickets'); window.closeBookingModal();">
                View My Tickets
              </button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

// Function to trigger Confetti celebration
export function triggerSuccessConfetti() {
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00C07F', '#059669', '#FFB800', '#3B82F6', '#8B5CF6']
    });
  } catch (e) {
    console.log('Confetti triggered');
  }
}

export function updateBookingField(key, val) {
  currentBookingState[key] = val;
}

export function getBookingState() {
  return currentBookingState;
}
