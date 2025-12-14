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

    const answer = item.querySelector(".faq-answer");
    if (!answer) return;

    if (!isOpen) {
      item.classList.add("open");
      // ensure max-height is large enough for content
      answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
      answer.style.maxHeight = "0";
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

/* =========================================================
   Contact form submit (Formspree) — NO REDIRECT
   Requires in HTML:
     <form id="contactForm"> ... </form>
     <button id="contactSubmitBtn" type="submit">...</button>
     <p id="contactStatus"></p>   (optional but recommended)
   Also keep:
     <input type="text" name="_gotcha" style="display:none" ... />
========================================================= */

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdkqjezv";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const btn =
    document.getElementById("contactSubmitBtn") ||
    form.querySelector('button[type="submit"]');

  // If you didn't add a status <p>, we create one automatically
  let statusEl = document.getElementById("contactStatus");
  if (!statusEl) {
    statusEl = document.createElement("p");
    statusEl.id = "contactStatus";
    statusEl.className = "contact-status";
    statusEl.style.marginTop = "12px";
    statusEl.style.display = "none";
    form.appendChild(statusEl);
  }

  function showStatus(message, ok) {
    statusEl.textContent = message;
    statusEl.style.display = "block";
    // Keep your theme intact; just tweak weight/opacity
    statusEl.style.fontWeight = ok ? "600" : "600";
    statusEl.style.opacity = "0.95";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // stop default redirect

    // honeypot: if filled, silently ignore
    const gotcha = form.querySelector('input[name="_gotcha"]');
    if (gotcha && gotcha.value) return;

    statusEl.style.display = "none";

    const originalText = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Sending...";
    }

    try {
      const formData = new FormData(form);

      const resp = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json", // key thing: stops redirect, returns JSON
        },
      });

      if (resp.ok) {
        showStatus("Message sent successfully!", true);
        form.reset();
      } else {
        const data = await resp.json().catch(() => ({}));
        showStatus(data?.error || "Failed to send. Please try again.", false);
      }
    } catch (err) {
      console.error(err);
      showStatus("Network error. Please try again.", false);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText || "Send Message";
      }
    }
  });
});
