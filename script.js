// ============================================
// WAL & AL - Interactive Behaviors
// ============================================

// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    
    e.preventDefault();
    
    const navHeight = document.querySelector('.nav-glass').offsetHeight;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  });
});

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => {
  revealObserver.observe(el);
});

// Navigation Background on Scroll
const nav = document.querySelector('.nav-glass');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    nav.style.background = 'rgba(10, 14, 26, 0.95)';
    nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
  } else {
    nav.style.background = 'rgba(10, 14, 26, 0.8)';
    nav.style.boxShadow = 'none';
  }
  
  lastScroll = currentScroll;
});

// Contact Form Submission (Formspree)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdkqjezv';

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitBtn = document.getElementById('contactSubmitBtn');
  const statusEl = document.getElementById('contactStatus');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot check
    const gotcha = contactForm.querySelector('input[name="_gotcha"]');
    if (gotcha && gotcha.value) return;

    statusEl.style.display = 'none';
    statusEl.classList.remove('show');

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const formData = new FormData(contactForm);
      
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        statusEl.textContent = 'Message sent successfully! We\'ll be in touch soon.';
        statusEl.style.background = 'rgba(127, 176, 105, 0.1)';
        statusEl.style.border = '1px solid rgba(127, 176, 105, 0.3)';
        statusEl.style.color = '#7fb069';
        statusEl.classList.add('show');
        statusEl.style.display = 'block';
        contactForm.reset();
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      statusEl.textContent = 'Failed to send message. Please try again.';
      statusEl.style.background = 'rgba(239, 68, 68, 0.1)';
      statusEl.style.border = '1px solid rgba(239, 68, 68, 0.3)';
      statusEl.style.color = '#ef4444';
      statusEl.classList.add('show');
      statusEl.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Parallax Effect on Hero
const heroGlow = document.querySelector('.hero-glow');
if (heroGlow) {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroHeight = document.querySelector('.hero-cinematic').offsetHeight;
    
    if (scrolled < heroHeight) {
      const parallaxAmount = scrolled * 0.3;
      heroGlow.style.transform = `translate(-50%, calc(-50% + ${parallaxAmount}px))`;
    }
  });
}

// Add hover effect to cards
const cards = document.querySelectorAll('.domain-card, .bento-card, .capability-card');
cards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  });
});

// Animate stats on scroll
const statsSection = document.querySelector('.hero-stats');
if (statsSection) {
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach((stat, index) => {
          const text = stat.textContent;
          if (text.includes('/')) return; // Skip "24/7"
          
          // Check if it's the 100% stat
          const isPercentage = text.includes('%');
          const target = parseInt(text);
          if (isNaN(target)) return;
          
          // Hide the stat initially
          stat.style.opacity = '0';
          
          setTimeout(() => {
            stat.style.opacity = '1';
            let current = 0;
            const increment = target / 50;
            const duration = 1500;
            const stepTime = duration / 50;
            
            const counter = setInterval(() => {
              current += increment;
              if (current >= target) {
                stat.textContent = isPercentage ? target + '%' : target;
                clearInterval(counter);
              } else {
                stat.textContent = Math.floor(current);
              }
            }, stepTime);
          }, index * 100);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  statsObserver.observe(statsSection);
}

// Console Easter Egg
console.log('%c WAL & AL ', 'background: linear-gradient(135deg, #0fb9b1, #7fb069); color: #0a0e1a; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
console.log('%c Engineering for a Regenerative Planet ', 'color: #0fb9b1; font-size: 14px; font-family: monospace;');
console.log('%c Interested in joining our mission? Reach out at the contact form! ', 'color: #94a3b8; font-size: 12px;');

// ============================================
// Bento Grid Carousel
// ============================================

class BentoCarousel {
  constructor() {
    this.carousel = document.getElementById('bentoCarousel');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.dotsContainer = document.getElementById('carouselDots');
    
    if (!this.carousel) return;
    
    this.currentIndex = 0;
    this.cardsPerView = window.innerWidth > 1024 ? 2 : 1;
    this.originalCards = Array.from(this.carousel.children).filter(card => !card.classList.contains('clone'));
    this.totalCards = this.originalCards.length;
    this.totalPages = Math.ceil(this.totalCards / this.cardsPerView);
    this.isTransitioning = false;
    
    this.init();
  }
  
  init() {
    // Clear any existing clones first
    const existingClones = this.carousel.querySelectorAll('.clone');
    existingClones.forEach(clone => clone.remove());
    
    // Clone cards for infinite loop
    this.cloneCards();
    
    this.createDots();
    this.updateCarousel(false);
    this.attachEvents();
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newCardsPerView = window.innerWidth > 1024 ? 2 : 1;
        if (newCardsPerView !== this.cardsPerView) {
          this.cardsPerView = newCardsPerView;
          this.totalPages = Math.ceil(this.totalCards / this.cardsPerView);
          this.currentIndex = Math.min(this.currentIndex, this.totalPages - 1);
          
          // Remove clones and recreate
          this.carousel.innerHTML = '';
          this.originalCards.forEach(card => this.carousel.appendChild(card.cloneNode(true)));
          this.originalCards = Array.from(this.carousel.children);
          this.cloneCards();
          
          this.createDots();
          this.updateCarousel(false);
        }
      }, 250);
    });
    
    // Touch/Swipe support
    this.addSwipeSupport();
  }
  
  cloneCards() {
    // Clone first set at the end
    this.originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('clone');
      this.carousel.appendChild(clone);
    });
    
    // Clone last set at the beginning
    for (let i = this.originalCards.length - 1; i >= 0; i--) {
      const clone = this.originalCards[i].cloneNode(true);
      clone.classList.add('clone');
      this.carousel.insertBefore(clone, this.carousel.firstChild);
    }
    
    // Set initial position to show original first cards
    this.currentIndex = 0;
    const containerWidth = this.carousel.parentElement.offsetWidth;
    const offset = -(this.totalCards * containerWidth);
    this.carousel.style.transform = `translateX(${offset}px)`;
    this.carousel.style.transition = 'none';
  }
  
  createDots() {
    this.dotsContainer.innerHTML = '';
    for (let i = 0; i < this.totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Go to page ${i + 1}`);
      if (i === this.currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToPage(i));
      this.dotsContainer.appendChild(dot);
    }
  }
  
  attachEvents() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
    
    // Handle transition end for infinite loop
    this.carousel.addEventListener('transitionend', () => {
      this.isTransitioning = false;
      
      // Reset position for infinite loop
      if (this.currentIndex >= this.totalPages) {
        this.currentIndex = 0;
        this.updateCarousel(false);
      } else if (this.currentIndex < 0) {
        this.currentIndex = this.totalPages - 1;
        this.updateCarousel(false);
      }
    });
  }
  
  addSwipeSupport() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    this.carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });
    
    this.carousel.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diff = startX - currentX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
    
    // Mouse drag support for desktop
    this.carousel.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      isDragging = true;
      this.carousel.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      currentX = e.clientX;
    });
    
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      this.carousel.style.cursor = 'grab';
      
      const diff = startX - currentX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
  }
  
  updateCarousel(animate = true) {
    if (this.isTransitioning) return;
    
    const cardWidth = this.carousel.children[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(this.carousel).gap) || 0;
    
    // Calculate offset including the cloned cards at the beginning
    const actualIndex = this.currentIndex + this.totalPages;
    const offset = -(actualIndex * this.cardsPerView * (cardWidth + gap));
    
    if (animate) {
      this.carousel.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      this.isTransitioning = true;
    } else {
      this.carousel.style.transition = 'none';
    }
    
    this.carousel.style.transform = `translateX(${offset}px)`;
    
    // Update dots
    const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      const normalizedIndex = ((this.currentIndex % this.totalPages) + this.totalPages) % this.totalPages;
      dot.classList.toggle('active', index === normalizedIndex);
    });
  }
  
  next() {
    if (this.isTransitioning) return;
    this.currentIndex++;
    this.updateCarousel(true);
  }
  
  prev() {
    if (this.isTransitioning) return;
    this.currentIndex--;
    this.updateCarousel(true);
  }
  
  goToPage(index) {
    if (this.isTransitioning) return;
    
    // Calculate the shortest path to the target page
    const normalizedCurrent = ((this.currentIndex % this.totalPages) + this.totalPages) % this.totalPages;
    const diff = index - normalizedCurrent;
    
    // Determine direction for shortest path
    if (Math.abs(diff) <= this.totalPages / 2) {
      // Direct path is shorter
      this.currentIndex += diff;
    } else {
      // Wrap around is shorter
      if (diff > 0) {
        this.currentIndex -= (this.totalPages - diff);
      } else {
        this.currentIndex += (this.totalPages + diff);
      }
    }
    
    this.updateCarousel(true);
  }
}

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BentoCarousel();
  });
} else {
  new BentoCarousel();
}


// ============================================
// Domains Carousel (Mobile Only)
// ============================================

class DomainsCarousel {
  constructor() {
    // Only initialize on mobile
    if (window.innerWidth > 768) return;
    
    this.carousel = document.getElementById('domainsCarousel');
    this.prevBtn = document.getElementById('domainsPrevBtn');
    this.nextBtn = document.getElementById('domainsNextBtn');
    this.dotsContainer = document.getElementById('domainsDots');
    
    if (!this.carousel || !this.prevBtn || !this.nextBtn || !this.dotsContainer) return;
    
    this.currentIndex = 0;
    this.originalCards = Array.from(this.carousel.children).filter(card => !card.classList.contains('clone'));
    this.totalCards = this.originalCards.length;
    this.totalPages = this.totalCards;
    this.isTransitioning = false;
    
    this.init();
  }
  
  init() {
    // Clear any existing clones first
    const existingClones = this.carousel.querySelectorAll('.clone');
    existingClones.forEach(clone => clone.remove());
    
    this.cloneCards();
    this.createDots();
    this.updateCarousel(false);
    this.attachEvents();
    this.addSwipeSupport();
  }
  
  cloneCards() {
    this.originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('clone');
      this.carousel.appendChild(clone);
    });
    
    for (let i = this.originalCards.length - 1; i >= 0; i--) {
      const clone = this.originalCards[i].cloneNode(true);
      clone.classList.add('clone');
      this.carousel.insertBefore(clone, this.carousel.firstChild);
    }
    
    this.currentIndex = 0;
    const containerWidth = this.carousel.parentElement.offsetWidth;
    const offset = -(this.totalCards * containerWidth);
    this.carousel.style.transform = `translateX(${offset}px)`;
    this.carousel.style.transition = 'none';
  }
  
  createDots() {
    this.dotsContainer.innerHTML = '';
    for (let i = 0; i < this.totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Go to card ${i + 1}`);
      if (i === this.currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToPage(i));
      this.dotsContainer.appendChild(dot);
    }
  }
  
  attachEvents() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    this.carousel.addEventListener('transitionend', () => {
      this.isTransitioning = false;
      
      if (this.currentIndex >= this.totalPages) {
        this.currentIndex = 0;
        this.updateCarousel(false);
      } else if (this.currentIndex < 0) {
        this.currentIndex = this.totalPages - 1;
        this.updateCarousel(false);
      }
    });
  }
  
  addSwipeSupport() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    this.carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });
    
    this.carousel.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diff = startX - currentX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
  }
  
  updateCarousel(animate = true) {
    if (this.isTransitioning) return;
    
    const containerWidth = this.carousel.parentElement.offsetWidth;
    const actualIndex = this.currentIndex + this.totalPages;
    const offset = -(actualIndex * containerWidth);
    
    if (animate) {
      this.carousel.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      this.isTransitioning = true;
    } else {
      this.carousel.style.transition = 'none';
    }
    
    this.carousel.style.transform = `translateX(${offset}px)`;
    
    const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      const normalizedIndex = ((this.currentIndex % this.totalPages) + this.totalPages) % this.totalPages;
      dot.classList.toggle('active', index === normalizedIndex);
    });
  }
  
  next() {
    if (this.isTransitioning) return;
    this.currentIndex++;
    this.updateCarousel(true);
  }
  
  prev() {
    if (this.isTransitioning) return;
    this.currentIndex--;
    this.updateCarousel(true);
  }
  
  goToPage(index) {
    if (this.isTransitioning) return;
    const normalizedCurrent = ((this.currentIndex % this.totalPages) + this.totalPages) % this.totalPages;
    const diff = index - normalizedCurrent;
    
    if (Math.abs(diff) <= this.totalPages / 2) {
      this.currentIndex += diff;
    } else {
      if (diff > 0) {
        this.currentIndex -= (this.totalPages - diff);
      } else {
        this.currentIndex += (this.totalPages + diff);
      }
    }
    
    this.updateCarousel(true);
  }
}

// ============================================
// Capabilities Carousel (Mobile Only)
// ============================================

class CapabilitiesCarousel {
  constructor() {
    // Only initialize on mobile
    if (window.innerWidth > 768) return;
    
    this.carousel = document.getElementById('capabilitiesCarousel');
    this.prevBtn = document.getElementById('capabilitiesPrevBtn');
    this.nextBtn = document.getElementById('capabilitiesNextBtn');
    this.dotsContainer = document.getElementById('capabilitiesDots');
    
    if (!this.carousel || !this.prevBtn || !this.nextBtn || !this.dotsContainer) return;
    
    this.currentIndex = 0;
    this.originalCards = Array.from(this.carousel.children).filter(card => !card.classList.contains('clone'));
    this.totalCards = this.originalCards.length;
    this.totalPages = this.totalCards;
    this.isTransitioning = false;
    
    this.init();
  }
  
  init() {
    // Clear any existing clones first
    const existingClones = this.carousel.querySelectorAll('.clone');
    existingClones.forEach(clone => clone.remove());
    
    this.cloneCards();
    this.createDots();
    this.updateCarousel(false);
    this.attachEvents();
    this.addSwipeSupport();
  }
  
  cloneCards() {
    this.originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('clone');
      this.carousel.appendChild(clone);
    });
    
    for (let i = this.originalCards.length - 1; i >= 0; i--) {
      const clone = this.originalCards[i].cloneNode(true);
      clone.classList.add('clone');
      this.carousel.insertBefore(clone, this.carousel.firstChild);
    }
    
    this.currentIndex = 0;
    const containerWidth = this.carousel.parentElement.offsetWidth;
    const offset = -(this.totalCards * containerWidth);
    this.carousel.style.transform = `translateX(${offset}px)`;
    this.carousel.style.transition = 'none';
  }
  
  createDots() {
    this.dotsContainer.innerHTML = '';
    for (let i = 0; i < this.totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Go to card ${i + 1}`);
      if (i === this.currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToPage(i));
      this.dotsContainer.appendChild(dot);
    }
  }
  
  attachEvents() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    this.carousel.addEventListener('transitionend', () => {
      this.isTransitioning = false;
      
      if (this.currentIndex >= this.totalPages) {
        this.currentIndex = 0;
        this.updateCarousel(false);
      } else if (this.currentIndex < 0) {
        this.currentIndex = this.totalPages - 1;
        this.updateCarousel(false);
      }
    });
  }
  
  addSwipeSupport() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    this.carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });
    
    this.carousel.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diff = startX - currentX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
  }
  
  updateCarousel(animate = true) {
    if (this.isTransitioning) return;
    
    const containerWidth = this.carousel.parentElement.offsetWidth;
    const actualIndex = this.currentIndex + this.totalPages;
    const offset = -(actualIndex * containerWidth);
    
    if (animate) {
      this.carousel.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      this.isTransitioning = true;
    } else {
      this.carousel.style.transition = 'none';
    }
    
    this.carousel.style.transform = `translateX(${offset}px)`;
    
    const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      const normalizedIndex = ((this.currentIndex % this.totalPages) + this.totalPages) % this.totalPages;
      dot.classList.toggle('active', index === normalizedIndex);
    });
  }
  
  next() {
    if (this.isTransitioning) return;
    this.currentIndex++;
    this.updateCarousel(true);
  }
  
  prev() {
    if (this.isTransitioning) return;
    this.currentIndex--;
    this.updateCarousel(true);
  }
  
  goToPage(index) {
    if (this.isTransitioning) return;
    const normalizedCurrent = ((this.currentIndex % this.totalPages) + this.totalPages) % this.totalPages;
    const diff = index - normalizedCurrent;
    
    if (Math.abs(diff) <= this.totalPages / 2) {
      this.currentIndex += diff;
    } else {
      if (diff > 0) {
        this.currentIndex -= (this.totalPages - diff);
      } else {
        this.currentIndex += (this.totalPages + diff);
      }
    }
    
    this.updateCarousel(true);
  }
}

// Initialize all carousels when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BentoCarousel();
    new DomainsCarousel();
    new CapabilitiesCarousel();
  });
} else {
  new BentoCarousel();
  new DomainsCarousel();
  new CapabilitiesCarousel();
}


// ============================================
// Contact Details Carousel (Mobile Only)
// ============================================

class ContactDetailsCarousel {
  constructor() {
    // Only initialize on mobile
    if (window.innerWidth > 768) return;
    
    this.carousel = document.getElementById('contactDetailsCarousel');
    this.prevBtn = document.getElementById('contactPrevBtn');
    this.nextBtn = document.getElementById('contactNextBtn');
    this.dotsContainer = document.getElementById('contactDots');
    
    if (!this.carousel || !this.prevBtn || !this.nextBtn || !this.dotsContainer) return;
    
    this.currentIndex = 0;
    this.originalCards = Array.from(this.carousel.children).filter(card => !card.classList.contains('clone'));
    this.totalCards = this.originalCards.length;
    this.totalPages = this.totalCards;
    this.isTransitioning = false;
    
    this.init();
  }
  
  init() {
    // Clear any existing clones first
    const existingClones = this.carousel.querySelectorAll('.clone');
    existingClones.forEach(clone => clone.remove());
    
    this.cloneCards();
    this.createDots();
    this.updateCarousel(false);
    this.attachEvents();
    this.addSwipeSupport();
  }
  
  cloneCards() {
    this.originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('clone');
      this.carousel.appendChild(clone);
    });
    
    for (let i = this.originalCards.length - 1; i >= 0; i--) {
      const clone = this.originalCards[i].cloneNode(true);
      clone.classList.add('clone');
      this.carousel.insertBefore(clone, this.carousel.firstChild);
    }
    
    this.currentIndex = 0;
    const containerWidth = this.carousel.parentElement.offsetWidth;
    const offset = -(this.totalCards * containerWidth);
    this.carousel.style.transform = `translateX(${offset}px)`;
    this.carousel.style.transition = 'none';
  }
  
  createDots() {
    this.dotsContainer.innerHTML = '';
    for (let i = 0; i < this.totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Go to info ${i + 1}`);
      if (i === this.currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToPage(i));
      this.dotsContainer.appendChild(dot);
    }
  }
  
  attachEvents() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    this.carousel.addEventListener('transitionend', () => {
      this.isTransitioning = false;
      
      if (this.currentIndex >= this.totalPages) {
        this.currentIndex = 0;
        this.updateCarousel(false);
      } else if (this.currentIndex < 0) {
        this.currentIndex = this.totalPages - 1;
        this.updateCarousel(false);
      }
    });
  }
  
  addSwipeSupport() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    this.carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });
    
    this.carousel.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diff = startX - currentX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
  }
  
  updateCarousel(animate = true) {
    if (this.isTransitioning) return;
    
    const containerWidth = this.carousel.parentElement.offsetWidth;
    const actualIndex = this.currentIndex + this.totalPages;
    const offset = -(actualIndex * containerWidth);
    
    if (animate) {
      this.carousel.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      this.isTransitioning = true;
    } else {
      this.carousel.style.transition = 'none';
    }
    
    this.carousel.style.transform = `translateX(${offset}px)`;
    
    const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      const normalizedIndex = ((this.currentIndex % this.totalPages) + this.totalPages) % this.totalPages;
      dot.classList.toggle('active', index === normalizedIndex);
    });
  }
  
  next() {
    if (this.isTransitioning) return;
    this.currentIndex++;
    this.updateCarousel(true);
  }
  
  prev() {
    if (this.isTransitioning) return;
    this.currentIndex--;
    this.updateCarousel(true);
  }
  
  goToPage(index) {
    if (this.isTransitioning) return;
    const normalizedCurrent = ((this.currentIndex % this.totalPages) + this.totalPages) % this.totalPages;
    const diff = index - normalizedCurrent;
    
    if (Math.abs(diff) <= this.totalPages / 2) {
      this.currentIndex += diff;
    } else {
      if (diff > 0) {
        this.currentIndex -= (this.totalPages - diff);
      } else {
        this.currentIndex += (this.totalPages + diff);
      }
    }
    
    this.updateCarousel(true);
  }
}

// Initialize all carousels when DOM is ready
// Note: ContactDetailsCarousel disabled - using stacked layout on mobile
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BentoCarousel();
    new DomainsCarousel();
    new CapabilitiesCarousel();
  });
} else {
  new BentoCarousel();
  new DomainsCarousel();
  new CapabilitiesCarousel();
}
