(() => {
  const navigationApp = {
    /* ================================
     * 1. ELEMENTS & STATE
     * ================================ */
    elements: {
      header: null,
      hero: null,
      toggleButton: null,
      navList: null,
      navLinks: [],
      toggleLabel: null,
    },

    state: {
      scrollThresholdRatio: 0.25, // 25% of viewport height (same style as hero)
      hasScrolledPastThreshold: false,
    },

    /* ================================
     * 2. INIT & SETUP
     * ================================ */
    init() {
      this.cacheElements();
      if (!this.elements.header || !this.elements.hero) return;
      this.highlightActiveLink();
      this.bindEvents();
      this.handleScroll(); // run once on load
    },

    cacheElements() {
      this.elements.header = document.querySelector('.header');
      this.elements.hero = document.querySelector('.hero');
      this.elements.toggleButton = document.querySelector('.main-nav__toggle');
      this.elements.navList = document.querySelector('.main-nav__list');
      this.elements.navLinks = Array.from(
        document.querySelectorAll('.main-nav__link'),
      );
      this.elements.toggleLabel = document.querySelector(
        '.main-nav__toggle-label',
      );
    },

    /* ================================
     * 3. CORE BEHAVIOR
     * ================================ */

    handleScroll() {
      // 1. If the mobile menu is open, do not auto-hide or show the header.
      if (document.body.classList.contains('site--nav-open')) {
        return;
      }

      const { hero } = this.elements;
      if (!hero) return;

      // 2. Measure how far we've scrolled *through the hero itself*.
      const heroRect = hero.getBoundingClientRect();
      const heroHeight = heroRect.height;

      // When you're at the very top, heroRect.top is 0.
      // As you scroll down, heroRect.top becomes negative.
      const amountScrolledThroughHero = -heroRect.top; // 0 → heroHeight → ...

      // 3. Decide the threshold as a fraction of hero height.
      // For example: show nav when you've scrolled past 60% of the hero.
      const threshold = heroHeight * 0.25;
      const pastThreshold = amountScrolledThroughHero > threshold;

      // 4. Only update DOM if something actually changed.
      if (pastThreshold !== this.state.hasScrolledPastThreshold) {
        this.state.hasScrolledPastThreshold = pastThreshold;
        this.updateBodyState(pastThreshold);
      }
    },

    handleToggleClick() {
      const isOpen = document.body.classList.toggle('site--nav-open');

      const { toggleButton, toggleLabel } = this.elements;
      if (toggleButton) {
        toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      if (toggleLabel) {
        toggleLabel.textContent = isOpen ? 'Close' : 'Menu';
      }
    },

    updateBodyState(isPast) {
      if (isPast) {
        document.body.classList.add('site--nav-visible');
      } else {
        document.body.classList.remove('site--nav-visible');
      }
    },

    handleNavLinkClick() {
      // 1) Remove the open class
      document.body.classList.remove('site--nav-open');

      // 2) Keep aria state correct for accessibility
      const { toggleButton } = this.elements;
      if (toggleButton) {
        toggleButton.setAttribute('aria-expanded', 'false');
      }
    },

    highlightActiveLink() {
      const current = window.location.pathname.replace(/\/$/, '');
      // removes trailing slash so "/" becomes ""

      this.elements.navLinks.forEach((link) => {
        let href = link.getAttribute('href');
        href = href.replace(/\/$/, ''); // normalize too

        // Handle home page
        if (current === '' && (href === '' || href.includes('index'))) {
          link.classList.add('main-nav__link--active');
          return;
        }

        // All other pages
        if (href !== '' && current.endsWith(href)) {
          link.classList.add('main-nav__link--active');
        }
      });
    },

    /* ================================
     * 4. EVENTS
     * ================================ */

    bindEvents() {
      window.addEventListener('scroll', () => this.handleScroll());
      window.addEventListener('resize', () => this.handleScroll());

      const { toggleButton, navLinks } = this.elements;
      if (toggleButton) {
        toggleButton.addEventListener('click', () => this.handleToggleClick());
      }

      navLinks.forEach((link) => {
        link.addEventListener('click', () => this.handleNavLinkClick());
      });
    },
  };

  /* ================================
   * 5. BOOT APP
   * ================================ */
  document.addEventListener('DOMContentLoaded', () => {
    navigationApp.init();
  });
})();
