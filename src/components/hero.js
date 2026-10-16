// Hero Component: Full-Screen 16:9 Video Cover with Centered Hero Text
// Uses local agra.mp4 video, rotated and fitted to 16:9 screen cover

export function setHeroAttraction() {}
export function getHeroAttraction() { return null; }

export function renderHero() {
  return `
    <section class="hero-screen-cover" id="heroSection">
      <!-- 16:9 Video Background Layer with Rotated agra.mp4 -->
      <div class="hero-video-viewport">
        <video
          class="hero-agra-video"
          id="heroBgVideo"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
        >
          <source src="./agra.mp4" type="video/mp4" />
        </video>
        <!-- Cinematic Gradient Overlay for text readability -->
        <div class="hero-screen-overlay"></div>
      </div>

      <!-- Hero Text Directly Placed on Video BG (No Cards) -->
      <div class="hero-direct-content">
        <div class="hero-eyebrow-tag">
          <span class="hero-eyebrow-dot"></span>
          DISCOVER INCREDIBLE INDIA
        </div>

        <h1 class="hero-main-title">
          Every Journey Begins<br/>
          with a <span class="hero-title-accent">Single Step</span>
        </h1>

        <p class="hero-main-desc">
          Explore iconic monuments, ancient forts, serene temples, and hidden wonders.<br/>
          Your next unforgettable adventure is just around the corner.
        </p>

        <div class="hero-cta-group">
          <button class="hero-cta-primary" onclick="window.navigateTo('discover')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Start Exploring
          </button>
          <button class="hero-cta-secondary" onclick="window.navigateTo('planner')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Plan Your Trip
          </button>
        </div>
      </div>
    </section>
  `;
}

// Ensure video starts playing when rendered
export function initHeroVideoCycle() {
  const video = document.getElementById('heroBgVideo');
  if (video) {
    video.play().catch(() => {
      // Browsers allow muted autoplay
      video.muted = true;
      video.play().catch(() => {});
    });
  }
}
