/* ==========================================================================
   BOOKING.JS — Golden Grand Royal Hotel
   Handles the Booking Request form: validation, date logic,
   reference number generation, and WhatsApp handoff.
   This is a FRONTEND-ONLY booking request. No room is actually reserved
   until the hotel confirms — there is no backend or database here.
   ========================================================================== */

(function () {
  "use strict";

  var form = document.querySelector("#booking-form");
  if (!form) return;

  function generateReference() {
    var now = new Date();
    var stamp = now.getFullYear().toString().slice(-2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    var rand = Math.floor(1000 + Math.random() * 9000);
    return "GGRH-" + stamp + "-" + rand;
  }

  function field(id) { return form.querySelector("#" + id); }

  function showError(inputEl, show) {
    var wrap = inputEl.closest(".form-field");
    if (!wrap) return;
    wrap.classList.toggle("error", show);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = field("b-name");
    var email = field("b-email");
    var phone = field("b-phone");
    var checkin = field("b-checkin");
    var checkout = field("b-checkout");
    var adults = field("b-adults");
    var children = field("b-children");
    var roomType = field("b-roomtype");
    var requests = field("b-requests");

    var valid = true;
    [name, email, phone, checkin, checkout, adults, roomType].forEach(function (el) {
      showError(el, false);
    });

    if (!name.value.trim()) { showError(name, true); valid = false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError(email, true); valid = false;
    }
    if (!phone.value.trim() || phone.value.trim().length < 7) { showError(phone, true); valid = false; }
    if (!checkin.value) { showError(checkin, true); valid = false; }
    if (!checkout.value) { showError(checkout, true); valid = false; }
    if (!roomType.value) { showError(roomType, true); valid = false; }

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkin.value) {
      var checkinDate = new Date(checkin.value);
      if (checkinDate < today) { showError(checkin, true); valid = false; }
    }
    if (checkin.value && checkout.value) {
      if (new Date(checkout.value) <= new Date(checkin.value)) {
        showError(checkout, true);
        valid = false;
      }
    }

    if (!valid) {
      var firstError = form.querySelector(".form-field.error");
      firstError && firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    var reference = generateReference();

    var refBox = form.querySelector("#booking-reference");
    var successBox = form.querySelector(".form-success");
    if (refBox) refBox.textContent = "Booking Request Reference: " + reference;
    if (successBox) {
      successBox.classList.add("show");
      successBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    var waMessage = "Hello Golden Grand Royal Hotel, I would like to submit a booking request." +
      "\nReference: " + reference +
      "\nName: " + name.value.trim() +
      "\nPhone: " + phone.value.trim() +
      "\nRoom type: " + roomType.options[roomType.selectedIndex].text +
      "\nCheck-in: " + checkin.value +
      "\nCheck-out: " + checkout.value +
      "\nAdults: " + (adults.value || "1") +
      "\nChildren: " + (children.value || "0") +
      (requests.value.trim() ? "\nSpecial requests: " + requests.value.trim() : "");

    var waBtn = form.querySelector("#booking-whatsapp-btn");
    if (waBtn) {
      waBtn.style.display = "inline-flex";
      waBtn.onclick = function () {
        window.openWhatsApp(waMessage);
      };
    }

    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.setAttribute("data-submitted", "true");
    });
  });

  /* Prevent picking a check-out date before check-in */
  var checkinInput = field("b-checkin");
  var checkoutInput = field("b-checkout");
  if (checkinInput && checkoutInput) {
    var todayStr = new Date().toISOString().split("T")[0];
    checkinInput.setAttribute("min", todayStr);
    checkinInput.addEventListener("change", function () {
      checkoutInput.setAttribute("min", checkinInput.value);
      if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = "";
      }
    });
  }

})();

/* ==========================================================================
   MAIN.JS — Golden Grand Royal Hotel
   Handles: mobile nav, sticky header, smooth scroll, scroll-to-top,
   reveal-on-scroll, gallery lightbox + filters, FAQ accordion,
   contact form validation, WhatsApp helper, dynamic year, menu tabs,
   room detail thumbnail swap.
   ========================================================================== */

(function () {
  "use strict";

  var HOTEL_PHONE_INTL = "2348145703890"; // WhatsApp E.164 without '+' or leading zero

  /* ---------------------------------------------------------------------
     WhatsApp helper — exposed globally so booking.js can reuse it
     --------------------------------------------------------------------- */
  window.openWhatsApp = function (message) {
    var url = "https://wa.me/" + HOTEL_PHONE_INTL + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener");
  };

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-whatsapp]");
    if (!trigger) return;
    e.preventDefault();
    var msg = trigger.getAttribute("data-whatsapp") ||
      "Hello Golden Grand Royal Hotel, I would like to enquire about room availability.";
    window.openWhatsApp(msg);
  });

  /* ---------------------------------------------------------------------
     Dynamic year in footer
     --------------------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  var navScrim = document.querySelector(".nav-scrim");

  function closeNav() {
    if (!mainNav) return;
    mainNav.classList.remove("open");
    navScrim && navScrim.classList.remove("open");
    navToggle && navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navScrim && navScrim.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    navScrim && navScrim.addEventListener("click", closeNav);
    mainNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------------------------------------------------------------------
     Sticky header background on scroll
     --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  handleHeaderScroll();
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });

  /* ---------------------------------------------------------------------
     Scroll-to-top button
     --------------------------------------------------------------------- */
  var topBtn = document.querySelector(".float-top");
  function handleTopBtn() {
    if (!topBtn) return;
    topBtn.classList.toggle("show", window.scrollY > 500);
  }
  handleTopBtn();
  window.addEventListener("scroll", handleTopBtn, { passive: true });
  topBtn && topBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------------------------------------------------------------------
     Reveal-on-scroll (Intersection Observer)
     --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------------------- */
  document.querySelectorAll(".accordion-item").forEach(function (item) {
    var trigger = item.querySelector(".accordion-trigger");
    var panel = item.querySelector(".accordion-panel");
    if (!trigger || !panel) return;
    trigger.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".accordion-item.open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".accordion-panel").style.maxHeight = 0;
          openItem.querySelector(".accordion-trigger").setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : 0;
    });
  });

  /* ---------------------------------------------------------------------
     Menu tabs (restaurant page)
     --------------------------------------------------------------------- */
  var menuTabs = document.querySelectorAll(".menu-tabs [data-menu-tab]");
  menuTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      menuTabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var target = tab.getAttribute("data-menu-tab");
      document.querySelectorAll(".menu-panel").forEach(function (panel) {
        panel.classList.toggle("active", panel.getAttribute("data-menu-panel") === target);
      });
    });
  });

  /* ---------------------------------------------------------------------
     Gallery: filters + lightbox
     --------------------------------------------------------------------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var cat = btn.getAttribute("data-filter");
      galleryItems.forEach(function (item) {
        var show = cat === "all" || item.getAttribute("data-category") === cat;
        item.classList.toggle("hidden", !show);
      });
    });
  });

  var lightbox = document.querySelector(".lightbox");
  if (lightbox && galleryItems.length) {
    var lbImg = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector(".lightbox-caption");
    var visibleItems = function () {
      return galleryItems.filter(function (i) { return !i.classList.contains("hidden"); });
    };
    var currentIndex = 0;

    function openLightboxAt(index) {
      var items = visibleItems();
      if (!items.length) return;
      currentIndex = (index + items.length) % items.length;
      var img = items[currentIndex].querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt || "";
      lbCaption.textContent = img.alt || "";
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }

    galleryItems.forEach(function (item, idx) {
      item.addEventListener("click", function () {
        var items = visibleItems();
        var visIdx = items.indexOf(item);
        openLightboxAt(visIdx);
      });
    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { openLightboxAt(currentIndex - 1); });
    lightbox.querySelector(".lightbox-next").addEventListener("click", function () { openLightboxAt(currentIndex + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") openLightboxAt(currentIndex + 1);
      if (e.key === "ArrowLeft") openLightboxAt(currentIndex - 1);
    });
  }

  /* ---------------------------------------------------------------------
     Room details: thumbnail swap
     --------------------------------------------------------------------- */
  var mainRoomImg = document.querySelector(".room-gallery-main img");
  var thumbs = document.querySelectorAll(".room-thumbs img");
  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      if (!mainRoomImg) return;
      mainRoomImg.src = thumb.src.replace(/w=\d+/, "w=1200");
      mainRoomImg.alt = thumb.alt;
      thumbs.forEach(function (t) { t.classList.remove("active"); });
      thumb.classList.add("active");
    });
  });

  /* ---------------------------------------------------------------------
     Generic form validation helper (contact form + homepage search)
     --------------------------------------------------------------------- */
  function showFieldError(field, message) {
    field.classList.add("error");
    var errorEl = field.querySelector(".field-error");
    if (errorEl && message) errorEl.textContent = message;
  }
  function clearFieldError(field) {
    field.classList.remove("error");
  }

  /* Contact form */
  var contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      contactForm.querySelectorAll(".form-field").forEach(clearFieldError);

      var name = contactForm.querySelector("#c-name");
      var email = contactForm.querySelector("#c-email");
      var phone = contactForm.querySelector("#c-phone");
      var message = contactForm.querySelector("#c-message");

      if (!name.value.trim()) { showFieldError(name.closest(".form-field")); valid = false; }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showFieldError(email.closest(".form-field")); valid = false;
      }
      if (!phone.value.trim()) { showFieldError(phone.closest(".form-field")); valid = false; }
      if (!message.value.trim()) { showFieldError(message.closest(".form-field")); valid = false; }

      if (!valid) return;

      var successBox = contactForm.querySelector(".form-success");
      successBox && successBox.classList.add("show");
      contactForm.reset();
      if (successBox) successBox.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* Homepage availability search (frontend-only confirmation) */
  var searchForm = document.querySelector("#availability-form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var checkin = searchForm.querySelector("#s-checkin");
      var checkout = searchForm.querySelector("#s-checkout");
      var msgBox = document.querySelector("#availability-msg");

      if (checkin.value && checkout.value && checkout.value <= checkin.value) {
        alert("Check-out date must be after the check-in date.");
        return;
      }
      if (msgBox) {
        msgBox.textContent = "Thank you! We've noted your requested dates. Please continue to Book a Room, or chat with us on WhatsApp to confirm availability.";
        msgBox.classList.add("show");
      }
    });
  }

})();
