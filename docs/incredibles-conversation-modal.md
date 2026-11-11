# Reverse-Engineered Analysis: https://incredibles.dev/ "Start a Conversation"

> **Target URL:** `https://incredibles.dev/`  
> **Source Authors:** Antoine Wodniack & Olivier Guilleux  
> **Technology Stack:** Nuxt 3, Vue 3, GSAP 3 (Core + Easing), Lenis Smooth Scroll, Custom EventBus  
> **Primary Source Artifacts:**
> - HTML Root: `https://incredibles.dev/`
> - Production Entry Bundle: `/_nuxt/DNBXjO6S.js`
> - Main View & SModal Bundle: `/_nuxt/D5jJLml9.js`
> - Contact Form Component: `/_nuxt/CKJT1Nh5.js`

---

## 1. Trigger Interaction Flow

Across the site, clicking any "Start a conversation" button (or any link pointing to `#triggerSiteContact`) executes a lightweight event emission:

```javascript
// Plausible Analytics tracking
analytics.track("Contact Form Opened", { props: { source: "delivery" } });

// Global EventBus emission
eventBus.emit("siteContactOpen", { source: "delivery" });
```

The `source` string identifies the trigger location:
- `"delivery"`: Header CTA & Primary Hero button
- `"calculator"`: Project scope calculator CTA
- `"recurring"`: Monthly retainer plan CTA
- `"faq"`: Inline links in the FAQ (`a[href="#triggerSiteContact"]`)
- `"finalCTA"`: Footer conversion banner

---

## 2. DOM Architecture of `SModal`

The modal is not rendered into a generic portal wrapper. It lives as an absolute/fixed layout component (`s-modal`) with a dedicated three-tier container structure:

```html
<section 
  ref="block" 
  class="s-modal" 
  :class="{ 'is-open': isOpen, 'is-visible': isVisible }" 
  :inert="!isOpen" 
  role="dialog" 
  aria-modal="true" 
  data-lenis-prevent
>
  <!-- Outer Wrapper: Controls the clipping slit expansion -->
  <div ref="modalOuter" class="s__outer">
    
    <!-- Inner Container: Controls scale & drop translation on close -->
    <div ref="modalInner" class="s__inner">
      
      <!-- Scroller Area: Contains the form layout -->
      <div class="s__scroller">
        <div class="s__form">
          <!-- Contact Form with .js-form-left, .js-form-right, etc. -->
        </div>
      </div>

      <!-- Close Button -->
      <button 
        type="button" 
        class="s__close btn-main btn-main--primary btn-main--white btn-main--sm" 
        aria-label="Close modal"
        @click="closeModal"
      >
        <span class="icon-cross"></span>
      </button>

      <!-- Optional Background Fluid Canvas -->
      <div class="s__fluid" aria-hidden="true"></div>
    </div>
  </div>

  <!-- Backdrop Overlay -->
  <div ref="overlay" class="s__overlay" @click="closeModal"></div>
</section>
```

### Associated CSS Rules

```css
/* Fixed full-screen container */
.s-modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: 100dvh;
  opacity: 0;
  visibility: hidden;
  overflow: hidden;
  overscroll-behavior: contain;
}

.s-modal.is-visible {
  opacity: 1;
  visibility: visible;
}

/* Backdrop Overlay */
.s-modal .s__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: var(--color-white-darker, #f1f1f1);
  opacity: 0;
}

/* Outer Shell (Clip-Path Host) */
.s-modal .s__outer {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  padding: 1.5rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom));
  background: var(--color-white-dark, #fafafa);
}

/* Inner Shell (Border Radius & Drop Transform) */
.s-modal .s__inner {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
}

/* Internal Scroller */
.s-modal .s__scroller {
  margin: auto 0;
  padding: 1.5rem;
  width: 100%;
  max-height: 100%;
  overflow: visible auto;
  scrollbar-width: none;
}

/* Close Button Placement */
.s-modal .s__close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 3;
}
```

---

## 3. Exact Reverse-Engineered GSAP Animation Code

This is the exact de-minified JavaScript code from `_nuxt/D5jJLml9.js`:

```javascript
import gsap from "gsap";

// State refs
const isOpen = ref(false);
const isVisible = ref(false);
const isAnimating = ref(false);
let activeCloseTimeline = null;
let lastActiveElement = null;

// DOM refs
const modalOuter = ref(null);
const modalInner = ref(null);
const overlay = ref(null);
const modalBlock = ref(null);

function getBorderRadius() {
  return window.getComputedStyle(modalInner.value).borderRadius || "1.5rem";
}

function getContentTargets() {
  const root = modalBlock.value;
  if (!root) return [];
  const title = root.querySelector(".js-form-title");
  if (!title) return [];
  const pt = parseFloat(window.getComputedStyle(title).paddingTop) || 0;
  return [...root.querySelectorAll(
    pt > 0 ? ".js-form-title, .js-form-texts, .js-form-right" : ".js-form-left, .js-form-right"
  )];
}

function clearInlineStyles() {
  if (modalInner.value) modalInner.value.style = "";
  if (modalOuter.value) modalOuter.value.style = "";
  if (overlay.value) overlay.value.style = "";
}

/**
 * OPEN ANIMATION
 * Triggered on: eventBus.on("siteContactOpen", openModal)
 */
function openModal(eventPayload) {
  if (!modalBlock.value) return;

  // Kill in-flight close animation if user reopened immediately
  if (activeCloseTimeline && activeCloseTimeline.isActive()) {
    activeCloseTimeline.kill();
    activeCloseTimeline = null;
    clearInlineStyles();
    eventBus.emit("modalClose");
  }

  // 1. Record trigger source & active focused element
  lastActiveElement = document.activeElement;
  isOpen.value = true;

  // 2. Freeze background fluid canvas & pause smooth scrolling
  eventBus.emit("pauseCanvas", { paused: true, source: "site-modal" });
  if (window.lenis) window.lenis.stop();

  // 3. Mark visible and focus the first interactive input field
  nextTick(() => {
    isVisible.value = true;
    modalBlock.value?.querySelector("input, select, textarea")?.focus();
  });

  const contentTargets = getContentTargets();
  const radius = getBorderRadius();
  const tl = gsap.timeline();
  isAnimating.value = true;

  // Optimization hints
  tl.set(modalOuter.value, { willChange: "clip-path" }, 0);
  if (contentTargets.length) {
    tl.set(contentTargets, { willChange: "clip-path, transform" });
  }

  // [Animation 1]: Overlay fades in smoothly (0 -> 1 over 1.25s)
  tl.fromTo(
    overlay.value,
    { opacity: 0 },
    { opacity: 1, duration: 1.25, ease: "power3.out" },
    0
  );

  // [Animation 2]: Outer card expands outward from a bottom-center slit:
  // Starts as: inset(100% 20% 0% 20% round 1.5rem)
  // Expands to: inset(0% 0% 0% 0% round 1.5rem)
  tl.fromTo(
    modalOuter.value,
    { clipPath: `inset( 100% 20% 0% 20% round ${radius} )` },
    { clipPath: `inset( 0% 0% 0% 0% round ${radius} )`, duration: 1.5, ease: "expo.inOut" },
    0
  );

  // [Animation 3]: Staggered content reveal starting halfway through (at t = 0.75s)
  if (contentTargets.length) {
    // Unmasks from bottom to top
    tl.fromTo(
      contentTargets,
      { clipPath: `inset( 0% 0% 100% 0% round ${radius} )` },
      { clipPath: `inset( 0% 0% 0% 0% round ${radius} )`, duration: 1, ease: "expo.out", stagger: -0.025 },
      0.75
    );

    // Translates upward into place from y: 50
    tl.fromTo(
      contentTargets,
      { y: 50 },
      { y: 0, duration: 1.5, ease: "expo.out", stagger: -0.025 },
      0.75
    );
  }

  // On Complete: Clean up will-change and clip-path styles to restore GPU resources
  tl.call(() => {
    isAnimating.value = false;
    modalOuter.value.style.clipPath = "";
    modalOuter.value.style.willChange = "";
    overlay.value.style.opacity = "";
    contentTargets.forEach((el) => {
      el.style.clipPath = "";
      el.style.willChange = "";
    });
  });
}

/**
 * CLOSE ANIMATION
 * Triggered on: Escape key, Close button click, or Backdrop click
 */
function closeModal() {
  if (isAnimating.value) return; // Prevent closing while open animation is active

  eventBus.emit("pauseCanvas", { paused: false, source: "site-modal" });

  const radius = getBorderRadius();
  const tl = gsap.timeline();
  activeCloseTimeline = tl;

  tl.set(modalOuter.value, { willChange: "clip-path" }, 0);

  // [Animation 1]: Overlay fades out (1 -> 0 over 1s)
  tl.fromTo(
    overlay.value,
    { opacity: 1 },
    { opacity: 0, duration: 1, ease: "power1.out" },
    0
  );

  // [Animation 2]: Modal inner scales down and slides down (y: 0, scale: 1 -> y: 100%, scale: 0.75)
  tl.fromTo(
    modalInner.value,
    { y: 0, scale: 1 },
    { y: "100%", scale: 0.75, duration: 1, ease: "expo.inOut" },
    0
  );

  // [Animation 3]: Outer card clips back down to bottom-center slit
  tl.fromTo(
    modalOuter.value,
    { clipPath: `inset( 0% 0% 0% 0% round ${radius} )` },
    { clipPath: `inset( 100% 20% 0% 20% round ${radius} )`, duration: 1, ease: "expo.inOut" },
    0
  );

  // On Complete: Reset flags, unmount, resume Lenis, and return focus
  tl.call(() => {
    activeCloseTimeline = null;
    isVisible.value = false;
    isOpen.value = false;
    eventBus.emit("modalClose");
    clearInlineStyles();
    if (window.lenis) window.lenis.start();

    // Restore focus to button that opened modal
    if (lastActiveElement instanceof HTMLElement) {
      lastActiveElement.focus();
    } else if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    lastActiveElement = null;
  });
}
```

---

## 4. Key Takeaways & Physics

1. **Curvature Preserving Slit:** The clip-path expansion always includes `round ${radius}`. This ensures that as the clip boundary travels from `100% 20% 0% 20%` to `0% 0% 0% 0%`, the 24px (1.5rem) rounded squircle curvature remains perfectly intact throughout the motion.
2. **Dual-Phase Easing:**
   - Outer shell uses **`expo.inOut`** (`cubic-bezier(0.87, 0, 0.13, 1)`), creating a rapid burst in the middle with a feather-soft landing.
   - Content elements use **`expo.out`** (`cubic-bezier(0.16, 1, 0.3, 1)`), smoothly braking into position without bounce or overshoot.
3. **Negative Stagger:** Stagger of `-0.025` means elements reveal in reverse DOM order (or bottom-up slightly), giving a natural physical inertia.
4. **Asymmetric Exit:** The exit does NOT play the entrance backwards:
   - Entrance expands from a slit while content slides up.
   - Exit scales the interior down to `0.75` and drops it down to `100%` while the outer shell simultaneously clips back into the bottom rim.
