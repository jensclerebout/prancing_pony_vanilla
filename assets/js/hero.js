(() => {
  const heroApp = {
    /* ================================
     * 1. ELEMENTS & STATE
     * ================================ */

    elements: {
      hero: null,
      pictures: [],
      viewButtons: [],
      subtitleCurrent: null,
      subtitleNext: null,
    },

    state: {
      variants: [],
      currentIndex: 0,
      rotateTimerId: null,
      subtitles: {
        standard: 'Warm hearth. Quiet fields.',
        clouds: 'Low clouds. Soft horizons.',
        sunflare: 'Golden light. Slow mornings.',
      },
      subtitleFadeDuration: 1000, // ms, keep in sync with CSS if needed
    },

    /* ================================
     * 2. INIT & SETUP
     * ================================ */

    init() {
      this.cacheElements();

      const { hero, pictures, viewButtons } = this.elements;
      if (!hero) return;
      if (pictures.length === 0) return;
      if (viewButtons.length === 0) return;

      this.buildVariants();
      this.setInitialState();
      this.bindEvents();

      const initialVariant = this.state.variants[this.state.currentIndex];
      this.setVariant(initialVariant);
      this.startAutoRotate();
    },

    cacheElements() {
      const hero = document.querySelector('.hero');
      if (!hero) {
        this.elements.hero = null;
        return;
      }

      this.elements.hero = hero;
      this.elements.pictures = Array.from(
        hero.querySelectorAll('.hero__picture'),
      );
      this.elements.viewButtons = Array.from(
        hero.querySelectorAll('.hero__view-button'),
      );
      this.elements.subtitleCurrent = hero.querySelector(
        '.hero__subtitle--current',
      );
      this.elements.subtitleNext = hero.querySelector('.hero__subtitle--next');
    },

    buildVariants() {
      const variants = [];

      this.elements.pictures.forEach((picture) => {
        const variant = picture.dataset.variant;
        if (!variant) return;
        variants.push(variant);
      });

      this.state.variants = variants;
    },

    setInitialState() {
      const { hero } = this.elements;
      const { variants } = this.state;

      if (!hero || variants.length === 0) return;

      const dataVariant = hero.dataset.variant;
      const initialVariant = dataVariant || variants[0];

      const initialIndex = variants.indexOf(initialVariant);
      this.state.currentIndex = initialIndex === -1 ? 0 : initialIndex;

      // Ensure data-variant is synced to a valid variant
      hero.dataset.variant = variants[this.state.currentIndex];

      // Also ensure the initial subtitle matches
      const initialSubtitle =
        this.state.subtitles[variants[this.state.currentIndex]];
      if (this.elements.subtitleCurrent && initialSubtitle) {
        this.elements.subtitleCurrent.textContent = initialSubtitle;
      }
    },

    /* ================================
     * 3. CORE BEHAVIOR
     * ================================ */

    setVariant(variant) {
      if (!variant) return;

      const { hero, pictures, viewButtons } = this.elements;

      // Pictures
      pictures.forEach((picture) => {
        if (variant === picture.dataset.variant) {
          picture.classList.add('hero__picture--active');
        } else {
          picture.classList.remove('hero__picture--active');
        }
      });

      // Buttons
      viewButtons.forEach((viewButton) => {
        if (variant === viewButton.dataset.variant) {
          viewButton.classList.add('hero__view-button--active');
          viewButton.setAttribute('aria-pressed', 'true');
        } else {
          viewButton.classList.remove('hero__view-button--active');
          viewButton.setAttribute('aria-pressed', 'false');
        }
      });

      // Mood state for CSS tints
      hero.dataset.variant = variant;

      // Keep currentIndex in sync with the variant name
      const idx = this.state.variants.indexOf(variant);
      if (idx !== -1) {
        this.state.currentIndex = idx;
      }

      // Update subtitle via crossfade
      const text = this.state.subtitles[variant];
      if (text) {
        this.crossfadeSubtitleTo(text);
      }
    },

    crossfadeSubtitleTo(text) {
      const { subtitleCurrent, subtitleNext } = this.elements;
      if (!subtitleCurrent || !subtitleNext) return;

      // Put the new text into the "next" element
      subtitleNext.textContent = text;

      // Make next visible (current style)
      subtitleNext.classList.add('hero__subtitle--current');
      subtitleNext.classList.remove('hero__subtitle--next');

      // Make current fade out (become next)
      subtitleCurrent.classList.remove('hero__subtitle--current');
      subtitleCurrent.classList.add('hero__subtitle--next');

      // Swap references so next time we fade again correctly
      this.elements.subtitleCurrent = subtitleNext;
      this.elements.subtitleNext = subtitleCurrent;
    },

    nextVariant() {
      const { variants } = this.state;
      if (variants.length === 0) return;

      this.state.currentIndex = (this.state.currentIndex + 1) % variants.length;

      const nextName = variants[this.state.currentIndex];
      this.setVariant(nextName);
    },

    startAutoRotate() {
      if (this.state.rotateTimerId !== null) return;

      this.state.rotateTimerId = window.setInterval(
        () => this.nextVariant(),
        4000,
      );
    },

    stopAutoRotate() {
      if (this.state.rotateTimerId !== null) {
        window.clearInterval(this.state.rotateTimerId);
        this.state.rotateTimerId = null;
      }
    },

    /* ================================
     * 4. EVENTS
     * ================================ */

    bindEvents() {
      const { hero, viewButtons } = this.elements;

      if (!hero) return;

      // Buttons: click changes variant + stops autoplay
      viewButtons.forEach((viewButton) => {
        viewButton.addEventListener('click', (e) => this.handleButtonClick(e));

        // Keyboard focus on buttons also stops autoplay
        viewButton.addEventListener('focus', () => this.stopAutoRotate());
      });

      // Hovering the whole hero shows intent → stop autoplay
      hero.addEventListener('mouseenter', () => this.stopAutoRotate());
    },

    handleButtonClick(e) {
      const button = e.currentTarget;
      const variantName = button.dataset.variant;

      if (!variantName) return;

      this.setVariant(variantName);
      this.stopAutoRotate();
    },
  };

  // Boot the app when DOM is ready
  document.addEventListener('DOMContentLoaded', () => heroApp.init());
})();
