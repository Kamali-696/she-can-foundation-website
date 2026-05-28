/* ========================================================================
   She Can Foundation — Main JavaScript
   Vanilla JS · ES6+ · No frameworks
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------
     1. NAVBAR SCROLL EFFECT
     - Adds 'scrolled' class when page is scrolled past 50px
     - Throttled via requestAnimationFrame for performance
  -------------------------------------------------------------------- */
  (() => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;

    const handleNavbarScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(handleNavbarScroll);
        ticking = true;
      }
    }, { passive: true });

    // Set initial state on load
    handleNavbarScroll();
  })();


  /* --------------------------------------------------------------------
     2. MOBILE NAVIGATION
     - Hamburger toggle
     - Close on link click, close on outside click
     - Lock body scroll when menu is open
  -------------------------------------------------------------------- */
  (() => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks  = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;

    const toggleMenu = (open) => {
      const shouldOpen = typeof open === 'boolean' ? open : !navLinks.classList.contains('active');
      hamburger.classList.toggle('active', shouldOpen);
      navLinks.classList.toggle('active', shouldOpen);
      document.body.style.overflow = shouldOpen ? 'hidden' : '';
    };

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close when clicking outside the nav
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') &&
          !navLinks.contains(e.target) &&
          !hamburger.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        toggleMenu(false);
      }
    });
  })();


  /* --------------------------------------------------------------------
     3. SMOOTH SCROLLING
     - Intercepts all anchor links starting with '#'
     - Offsets for fixed navbar height (80px)
  -------------------------------------------------------------------- */
  (() => {
    const NAVBAR_OFFSET = 80;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return; // skip bare '#' links

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const targetPosition = target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  })();


  /* --------------------------------------------------------------------
     4. SCROLL ANIMATIONS — Intersection Observer
     - Watches .fade-in and .slide-up elements
     - Adds 'visible' class once they enter the viewport
     - Supports staggered delay via data-delay attribute
  -------------------------------------------------------------------- */
  (() => {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseInt(el.dataset.delay, 10) || 0;

          if (delay > 0) {
            setTimeout(() => el.classList.add('visible'), delay);
          } else {
            el.classList.add('visible');
          }

          obs.unobserve(el);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  })();


  /* --------------------------------------------------------------------
     5. IMAGE CAROUSEL
     - Prev / Next buttons, dot indicators
     - Touch / swipe support for mobile
     - Auto-play with pause on hover
     - Infinite loop wrapping
  -------------------------------------------------------------------- */
  (() => {
    const carousel      = document.getElementById('carousel');
    const track         = carousel?.querySelector('.carousel-track');
    const slides        = carousel?.querySelectorAll('.carousel-slide');
    const prevBtn       = carousel?.querySelector('.carousel-prev');
    const nextBtn       = carousel?.querySelector('.carousel-next');
    const dotsContainer = carousel?.querySelector('.carousel-dots');

    if (!carousel || !track || !slides?.length) return;

    let currentIndex   = 0;
    let autoPlayTimer  = null;
    let slideWidth     = 0;
    let touchStartX    = 0;
    let touchEndX      = 0;
    let isDragging     = false;

    const totalSlides = slides.length;

    /* — Build dot indicators (clear any hardcoded ones first) — */
    const dots = [];
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
    }

    /* — Helpers — */
    const calcSlideWidth = () => {
      slideWidth = slides[0].offsetWidth;
    };

    const updateDots = () => {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    };

    const moveTrack = () => {
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    };

    const goToSlide = (index) => {
      if (index >= totalSlides) {
        currentIndex = 0;
      } else if (index < 0) {
        currentIndex = totalSlides - 1;
      } else {
        currentIndex = index;
      }
      moveTrack();
      updateDots();
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    /* — Button listeners — */
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    /* — Touch / Swipe support — */
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      isDragging  = true;
      pauseAutoPlay();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      touchEndX = e.changedTouches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const swipeDistance = touchStartX - touchEndX;
      const SWIPE_THRESHOLD = 50;

      if (swipeDistance > SWIPE_THRESHOLD) {
        nextSlide();
      } else if (swipeDistance < -SWIPE_THRESHOLD) {
        prevSlide();
      }
      startAutoPlay();
    });

    /* — Auto-play — */
    const startAutoPlay = () => {
      pauseAutoPlay();
      autoPlayTimer = setInterval(nextSlide, 5000);
    };

    const pauseAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    carousel.addEventListener('mouseenter', pauseAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    /* — Resize handling — */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calcSlideWidth();
        moveTrack();
      }, 150);
    });

    /* — Keyboard support — */
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    });

    /* — Initialise — */
    calcSlideWidth();
    moveTrack();
    startAutoPlay();
  })();


  /* --------------------------------------------------------------------
     6. COUNTER ANIMATION
     - Animates numbers from 0 → data-target
     - Uses requestAnimationFrame for smoothness (~2s duration)
     - Formats in Indian numbering (e.g. 1,20,000+)
     - Triggered once via IntersectionObserver
  -------------------------------------------------------------------- */
  (() => {
    const counters = document.querySelectorAll('.counter[data-target]');
    if (!counters.length) return;

    /**
     * Format a number using Indian numbering system.
     * 1000      → 1,000
     * 120000    → 1,20,000
     * 10000000  → 1,00,00,000
     */
    const formatIndian = (num) => {
      const str   = Math.floor(num).toString();
      let   last3 = str.slice(-3);
      let   rest  = str.slice(0, -3);

      if (rest.length > 0) {
        rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
        return `${rest},${last3}`;
      }
      return last3;
    };

    const animateCounter = (el) => {
      const target   = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      const duration = 2000; // milliseconds
      const suffix   = el.dataset.suffix || '';
      let   start    = null;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed  = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic for a natural deceleration feel
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        el.textContent = formatIndian(current) + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = formatIndian(target) + suffix;
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(counter => observer.observe(counter));
  })();


  /* --------------------------------------------------------------------
     7. ACTIVE NAVIGATION HIGHLIGHT
     - Watches each section and highlights the matching nav link
  -------------------------------------------------------------------- */
  (() => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, {
      rootMargin: '-80px 0px -50% 0px',
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
  })();


  /* --------------------------------------------------------------------
     8. PARALLAX-LITE EFFECT (hero background)
     - Subtle translateY on scroll (factor 0.3)
     - Desktop only — disabled on mobile via matchMedia
  -------------------------------------------------------------------- */
  (() => {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const desktopQuery = window.matchMedia('(min-width: 769px)');
    let ticking = false;

    const applyParallax = () => {
      if (!desktopQuery.matches) {
        hero.style.backgroundPositionY = '';
        return;
      }
      const offset = window.scrollY * 0.3;
      hero.style.backgroundPositionY = `${offset}px`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    };

    // Listen only on desktop; toggle listener when breakpoint changes
    const handleMediaChange = (e) => {
      if (e.matches) {
        window.addEventListener('scroll', onScroll, { passive: true });
        applyParallax();
      } else {
        window.removeEventListener('scroll', onScroll);
        hero.style.backgroundPositionY = '';
      }
    };

    desktopQuery.addEventListener('change', handleMediaChange);
    handleMediaChange(desktopQuery); // initial check
  })();

});
