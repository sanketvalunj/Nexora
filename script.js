document.addEventListener("DOMContentLoaded", function () {
  // --- Smooth Scrolling ---
  const navLinks = document.querySelectorAll(".scroll-link");

  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // --- Theme Toggling Logic ---
  const themeToggle = document.getElementById("theme-toggle");
  const htmlRoot = document.getElementById("html-root");

  const switchTheme = (isDark) => {
    if (isDark) {
      htmlRoot.setAttribute("data-theme", "dark");
      localStorage.setItem("linguaquest_theme", "dark");
    } else {
      htmlRoot.setAttribute("data-theme", "light");
      localStorage.setItem("linguaquest_theme", "light");
    }
  };

  themeToggle.addEventListener("change", function() {
    switchTheme(this.checked);
  });

  const savedTheme = localStorage.getItem("linguaquest_theme");
  if (savedTheme === "dark") {
    themeToggle.checked = true;
    switchTheme(true);
  } else {
    themeToggle.checked = false;
    switchTheme(false);
  }

  // --- Scroll Animation for Cards & Sections ---
  const animatedElements = document.querySelectorAll(".language-card, .about-section, .contact-info");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  animatedElements.forEach((el) => {
    observer.observe(el);
  });

  // --- ADDED: Typing Effect for Hero Description ---
  const heroDescription = document.getElementById('hero-description');
  const descriptionText = heroDescription.textContent;
  heroDescription.textContent = ''; // Clear the original text to start the effect

  function typeWriter(element, text, speed) {
    let i = 0;
    element.classList.add('blinking-cursor');
    
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        // Typing is complete, so remove the cursor
        element.classList.remove('blinking-cursor');
      }
    }
    type();
  }

  // Start the typing effect after the title has had time to animate
  setTimeout(() => {
    typeWriter(heroDescription, descriptionText, 50);
  }, 800); // Delay in milliseconds

});
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});
