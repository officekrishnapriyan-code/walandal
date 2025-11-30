// Smooth scrolling for internal anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    event.preventDefault();
    const headerOffset = 70;
    const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  });
});

// Mobile nav toggle
const nav = document.querySelector(".main-nav");
const navToggle = document.querySelector(".nav-toggle");
if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });
}

// Tabs for Water / Air / Land
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("aria-controls");
    if (!targetId) return;

    tabButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });
    tabPanels.forEach((panel) => {
      panel.classList.remove("active");
    });

    button.classList.add("active");
    button.setAttribute("aria-selected", "true");

    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }
  });
});

// FAQ accordion
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const questionButton = item.querySelector(".faq-question");
  if (!questionButton) return;

  questionButton.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    faqItems.forEach((el) => el.classList.remove("open"));

    if (!isOpen) {
      item.classList.add("open");
      const answer = item.querySelector(".faq-answer");
      if (answer) {
        // ensure max-height is large enough for content
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    } else {
      const answer = item.querySelector(".faq-answer");
      if (answer) {
        answer.style.maxHeight = "0";
      }
    }
  });
});

// IntersectionObserver for reveal-on-scroll
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  // Fallback: make all elements visible if IntersectionObserver is not supported
  revealElements.forEach((el) => el.classList.add("visible"));
}

// Animated numbers in hero stats
const statNumbers = document.querySelectorAll(".stat-number");

function animateNumber(el) {
  const target = parseInt(el.getAttribute("data-target") || "0", 10);
  let current = 0;
  const duration = 1200;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    current = Math.floor(target * eased);
    el.textContent = current.toString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toString();
    }
  }

  requestAnimationFrame(update);
}

if (statNumbers.length > 0) {
  const statsContainer = document.querySelector(".hero-stats-card");
  if (statsContainer && "IntersectionObserver" in window) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            statNumbers.forEach(animateNumber);
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    statsObserver.observe(statsContainer);
  } else {
    // Fallback: animate immediately
    statNumbers.forEach(animateNumber);
  }
}
