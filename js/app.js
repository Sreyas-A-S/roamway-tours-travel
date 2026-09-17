/**
 * TRIPVANTA LUXURY EXPEDITIONS - INTERACTIVE & MOTION ENGINE
 * Features:
 * - 3D Gyroscopic & Mouse Parallax Physics for Floating Cards
 * - Smooth Custom Magnetic Cursor
 * - Dynamic Live Price Calculator for Custom Itinerary Planner
 * - Bento Grid Filtering & Modal Lightbox
 * - Animated Counter Tickers
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCustomCursor();
  initScrollParallaxPlane();
  initMouseParallax();
  initHeaderScroll();
  initHeroVideoControls();
  initCounters();
  initPlannerCalculator();
  initBentoFilters();
  initModals();
  initBookingSearch();
  initTestimonialsSlider();
  initMobileMenu();
});

/* ==========================================================================
   SMOOTH SCROLL PARALLAX AIRPLANE ENGINE
   ========================================================================== */
function initScrollParallaxPlane() {
  const planeWrap = document.getElementById('scrollPlaneWrap');
  const planeIcon = document.getElementById('parallaxPlaneIcon');
  if (!planeWrap || !planeIcon) return;

  let lastScrollY = window.scrollY || 0;
  let targetY = 0;
  let currentY = 0;
  let targetAngle = 45;
  let currentAngle = 45;

  function updatePlaneScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

    // Smoothly traverse from top (10% viewport height) to bottom (70% viewport height)
    targetY = scrollFraction * (window.innerHeight * 0.65);

    // Calculate dynamic flight tilt based on scrolling direction and velocity
    const deltaY = scrollY - lastScrollY;
    if (Math.abs(deltaY) > 0.5) {
      if (deltaY > 0) {
        // Diving down smoothly
        targetAngle = Math.min(135, 45 + Math.min(deltaY * 3, 50));
      } else {
        // Climbing up smoothly
        targetAngle = Math.max(-20, 45 - Math.min(Math.abs(deltaY) * 3, 50));
      }
    } else {
      targetAngle = 45; // Default cruise angle
    }

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', updatePlaneScroll, { passive: true });
  updatePlaneScroll();

  // 60FPS Lerp loop for silky spring damping
  function renderPlane() {
    currentY += (targetY - currentY) * 0.12;
    currentAngle += (targetAngle - currentAngle) * 0.14;

    // Add subtle floating sine-wave turbulence
    const time = performance.now() * 0.002;
    const waveX = Math.sin(time) * 4;
    const waveY = Math.cos(time * 1.5) * 3;

    planeWrap.style.transform = `translate3d(${waveX}px, ${currentY + waveY}px, 0)`;
    planeIcon.style.transform = `rotate(${currentAngle}deg)`;

    requestAnimationFrame(renderPlane);
  }
  requestAnimationFrame(renderPlane);
}

/* ==========================================================================
   PRELOADER ANIMATION ENGINE
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('sitePreloader');
  const bar = document.getElementById('preloaderBar');
  const percentText = document.getElementById('preloaderPercent');
  if (!preloader) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 14) + 6;
    if (progress > 100) progress = 100;

    if (bar) bar.style.width = `${progress}%`;
    if (percentText) percentText.textContent = `${progress}%`;

    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('loaded');
      }, 350);
    }
  }, 45);

  // Safety fallback
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (bar) bar.style.width = '100%';
      if (percentText) percentText.textContent = '100%';
      preloader.classList.add('loaded');
    }, 600);
  });
}

/* ==========================================================================
   0. HERO VIDEO AUTOPLAY ENGINE (SEAMLESS AMBIENT PLAYBACK)
   ========================================================================== */
function initHeroVideoControls() {
  const video = document.getElementById('heroBgVideo');
  if (!video) return;

  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      const playOnInteract = () => {
        video.play();
        window.removeEventListener('click', playOnInteract);
        window.removeEventListener('scroll', playOnInteract);
        window.removeEventListener('touchstart', playOnInteract);
      };
      window.addEventListener('click', playOnInteract);
      window.addEventListener('scroll', playOnInteract);
      window.addEventListener('touchstart', playOnInteract);
    });
  }
}

/* ==========================================================================
   1. CUSTOM MAGNETIC CURSOR
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  const trail = document.getElementById('cursorTrail');
  if (!cursor || !trail) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let trailX = mouseX;
  let trailY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Smooth trailing ring physics with lerp
  function renderCursor() {
    trailX += (mouseX - trailX) * 0.18;
    trailY += (mouseY - trailY) * 0.18;
    trail.style.left = `${trailX}px`;
    trail.style.top = `${trailY}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states on interactive elements
  const hoverElements = document.querySelectorAll('a, button, input, select, .floating-card, .bento-card, .choice-card, .tier-card, .addon-checkbox-label');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
      trail.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
      trail.classList.remove('hovered');
    });
  });
}

/* ==========================================================================
   2. 3D MOUSE PARALLAX & FLOATING PHYSICS ENGINE
   ========================================================================== */
function initMouseParallax() {
  const hero = document.getElementById('heroSection');
  const parallaxItems = document.querySelectorAll('.parallax-item');
  if (!hero || parallaxItems.length === 0) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  // Track mouse coordinates normalized between -1 and 1
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    targetX = x / (rect.width / 2);
    targetY = y / (rect.height / 2);
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  let scrollYProgress = 0;

  window.addEventListener('scroll', () => {
    scrollYProgress = window.scrollY || window.pageYOffset;
  }, { passive: true });

  // Animation frame loop with smooth spring damping combining mouse and scroll physics
  function updateParallax() {
    if (window.innerWidth <= 860) {
      // On mobile, reset any stray inline transforms so cards flow cleanly in document normal flow
      parallaxItems.forEach(item => {
        item.style.transform = '';
      });
      requestAnimationFrame(updateParallax);
      return;
    }

    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    parallaxItems.forEach(item => {
      const speed = parseFloat(item.getAttribute('data-speed') || 1);
      const baseRotate = parseFloat(item.getAttribute('data-rotate') || 0);

      // Multi-depth scroll parallax offset: cards float upwards/downwards at differential speeds
      const scrollOffset = scrollYProgress * (speed * 0.35);

      const moveX = currentX * speed * 25;
      const moveY = (currentY * speed * 25) - scrollOffset;
      const tiltX = -currentY * 12;
      const tiltY = currentX * 12;

      // Apply transform preserving base rotation and 3D perspective
      item.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${baseRotate}deg)`;
    });

    // Also apply smooth differential flight path scroll parallax to the hero airplane
    const flightTrack = document.querySelector('.airplane-flight-track');
    if (flightTrack) {
      const flightScrollY = scrollYProgress * 0.45;
      flightTrack.style.transform = `translate3d(0, ${-flightScrollY}px, 0)`;
    }

    requestAnimationFrame(updateParallax);
  }

  requestAnimationFrame(updateParallax);
}

/* ==========================================================================
   3. STICKY HEADER SCROLL BLUR
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ==========================================================================
   4. ANIMATED COUNTER TICKERS
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        counters.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const duration = 2000;
          const steps = 60;
          const stepValue = target / steps;
          let current = 0;
          let count = 0;

          const timer = setInterval(() => {
            count++;
            current += stepValue;
            if (count >= steps) {
              counter.textContent = target;
              clearInterval(timer);
            } else {
              counter.textContent = target % 1 === 0 ? Math.floor(current) : current.toFixed(1);
            }
          }, duration / steps);
        });
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.hero-live-stats');
  if (statsSection) observer.observe(statsSection);
}

/* ==========================================================================
   5. INTERACTIVE BESPOKE TRIP PLANNER / ESTIMATOR
   ========================================================================== */
function initPlannerCalculator() {
  const regionButtons = document.querySelectorAll('#regionSelector .choice-card');
  const durationSlider = document.getElementById('durationSlider');
  const durationDisplay = document.getElementById('durationValue');
  const tierCards = document.querySelectorAll('#tierSelector .tier-card');
  const addonCheckboxes = document.querySelectorAll('#addonsSelector input[type="checkbox"]');
  const priceDisplay = document.getElementById('estimatedPrice');
  const confirmBtn = document.getElementById('confirmCustomTripBtn');

  if (!durationSlider || !priceDisplay) return;

  let selectedMultiplier = 1.15;
  let selectedDuration = parseInt(durationSlider.value, 10);
  let selectedTierDaily = 650;

  function calculateTotal() {
    let addonsTotal = 0;
    addonCheckboxes.forEach(cb => {
      if (cb.checked) addonsTotal += parseFloat(cb.value);
    });

    const baseCost = (selectedDuration * selectedTierDaily) * selectedMultiplier;
    const finalTotal = Math.round(baseCost + addonsTotal);

    animatePriceNumber(finalTotal);
  }

  function animatePriceNumber(newPrice) {
    const currentPrice = parseInt(priceDisplay.textContent.replace(/,/g, ''), 10) || 5400;
    const diff = newPrice - currentPrice;
    const steps = 25;
    let stepCount = 0;

    const interval = setInterval(() => {
      stepCount++;
      const val = Math.round(currentPrice + (diff * (stepCount / steps)));
      priceDisplay.textContent = val.toLocaleString();
      if (stepCount >= steps) {
        priceDisplay.textContent = newPrice.toLocaleString();
        clearInterval(interval);
      }
    }, 15);
  }

  // Region click
  regionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      regionButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMultiplier = parseFloat(btn.getAttribute('data-multiplier') || 1);
      calculateTotal();
    });
  });

  // Duration Slider
  durationSlider.addEventListener('input', (e) => {
    selectedDuration = parseInt(e.target.value, 10);
    durationDisplay.textContent = `${selectedDuration} Days`;
    calculateTotal();
  });

  // Tier selection
  tierCards.forEach(card => {
    card.addEventListener('click', () => {
      tierCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTierDaily = parseFloat(card.getAttribute('data-base') || 650);
      calculateTotal();
    });
  });

  // Addons toggle
  addonCheckboxes.forEach(cb => {
    cb.addEventListener('change', calculateTotal);
  });

  // Confirm custom trip button
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      showToast('Custom Expedition Confirmed!', `Estimated at $${priceDisplay.textContent}. Our senior concierge will reach out within 2 hours.`);
    });
  }

  calculateTotal();
}

/* ==========================================================================
   6. BENTO GRID FILTERING
   ========================================================================== */
function initBentoFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const bentoCards = document.querySelectorAll('.bento-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter');

      bentoCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   7. TRIP DATA & MODAL SYSTEM
   ========================================================================== */
const tripDatabase = {
  santorini: {
    title: "Aegean Sunset Caldera & Private Yacht Regatta",
    location: "Santorini & Mykonos, Greece",
    heroImg: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1000&auto=format&fit=crop",
    duration: "8 Days / 7 Nights",
    price: "$3,450 / guest",
    rating: "4.98 (124 reviews)",
    description: "Experience the romance of the Cyclades from your private cliffside infinity villa in Oia. Includes private helicopter transfers from Athens, private catamaran sunset sail, private sommelier wine tastings, and secluded beach access.",
    highlights: [
      "Private cliffside plunge pool suite with caldera panorama",
      "Sunset champagne charter aboard a 52ft Lagoon Catamaran",
      "Private archaeological tour of Akrotiri ruins with lead historian",
      "Daily gourmet breakfasts and two private chef dinners"
    ]
  },
  alps: {
    title: "Alpine High-Peaks & Michelin Gourmet Tour",
    location: "Dolomites & Cortina d'Ampezzo, Italy",
    heroImg: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1000&auto=format&fit=crop",
    duration: "6 Days / 5 Nights",
    price: "$2,900 / guest",
    rating: "4.95 (98 reviews)",
    description: "Immerse yourself in dramatic dolomite spires, heated mountain spas, and private ski passes with exclusive mountain-refuge culinary dinners.",
    highlights: [
      "Ski-in/ski-out glass chalet with outdoor thermal hot tub",
      "Helicopter sightseeing flight around Tre Cime di Lavaredo",
      "Private snowmobile safari and glacier fondue tasting",
      "3-Star Michelin tasting menu pairing with regional Amarone wines"
    ]
  },
  kyoto: {
    title: "Ancient Shrines, Onsen Sanctuary & Tea Rituals",
    location: "Kyoto & Hakone, Japan",
    heroImg: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop",
    duration: "10 Days / 9 Nights",
    price: "$4,120 / guest",
    rating: "5.0 (310 reviews)",
    description: "A contemplative journey through centuries of heritage. Enjoy private early-morning access to Arashiyama, stay in a 200-year-old renovated Ryokan with natural hot springs, and partake in private zen meditation.",
    highlights: [
      "Exclusive private tea ceremony with 15th-generation Master",
      "Ryokan suite with private Hinoki cedar hot-spring bath",
      "Shinkansen First-Class Gran Class rail passes",
      "Private guided Kaiseki dining experience in Gion"
    ]
  },
  safari: {
    title: "The Great Migration & Starlit Luxury Tents",
    location: "Serengeti & Ngorongoro, Tanzania",
    heroImg: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop",
    duration: "7 Days / 6 Nights",
    price: "$5,250 / guest",
    rating: "4.99 (88 reviews)",
    description: "Follow the majestic herds of the Serengeti from ultra-luxurious mobile tented camps that move with the wildlife, combined with private 4x4 safaris and hot-air balloon flights.",
    highlights: [
      "Private dawn hot-air balloon safari followed by bush breakfast",
      "Custom open-sided 4x4 cruiser with dedicated master naturalist",
      "Sundowners on private kopje rock overlooks",
      "Luxury canvas suites with king beds and solar-heated rain showers"
    ]
  },
  maldives: {
    title: "Private Island Sanctuary & Reef Discovery",
    location: "Noonu Atoll, Maldives",
    heroImg: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1000&auto=format&fit=crop",
    duration: "9 Days / 8 Nights",
    price: "$6,400 / guest",
    rating: "5.0 (420 reviews)",
    description: "An unparalleled sanctuary in the Indian Ocean. Overwater residence with direct lagoon slide, 24-hour dedicated butler, and private underwater dining.",
    highlights: [
      "Two-story overwater villa with retractable roof for stargazing",
      "Private marine biologist guided night snorkel with bioluminescence",
      "Sandbank sunset picnic with Krug champagne and caviar",
      "Unlimited spa wellness treatments and seaplane transfers"
    ]
  },
  cappadocia: {
    title: "Sunrise Hot Air Balloon Flight & Cave Suite",
    location: "Goreme & Fairy Chimneys, Turkey",
    heroImg: "https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=1000&auto=format&fit=crop",
    duration: "5 Days / 4 Nights",
    price: "$2,350 / guest",
    rating: "4.97 (210 reviews)",
    description: "Float above fairy chimneys at sunrise in a private hot-air balloon, followed by champagne breakfast and luxury volcanic cave hotel stays.",
    highlights: [
      "Exclusive private basket sunrise balloon flight",
      "Historical stone cave suite with panoramic rooftop terrace",
      "Private guided ATV quad safari through Rose Valley",
      "Anatolian gourmet pottery kebab dining and local wine tasting"
    ]
  }
};

window.openTripModal = function(tripId) {
  const trip = tripDatabase[tripId] || tripDatabase.santorini;
  const modalBackdrop = document.getElementById('tripModalBackdrop');
  const dynamicContent = document.getElementById('modalDynamicContent');

  dynamicContent.innerHTML = `
    <div class="modal-trip-header">
      <div class="modal-trip-img" style="width:100%; height:280px; border-radius:18px; overflow:hidden; margin-bottom:20px; position:relative;">
        <img src="${trip.heroImg}" alt="${trip.title}" style="width:100%; height:100%; object-fit:cover;">
        <span style="position:absolute; bottom:16px; left:16px; background:rgba(15,23,42,0.85); backdrop-filter:blur(8px); padding:6px 14px; border-radius:20px; font-size:0.85rem; font-weight:700; color:#fef08a;">
          <i class="fa-solid fa-location-dot"></i> ${trip.location}
        </span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
        <div>
          <h2 style="font-size:1.8rem; font-weight:800; line-height:1.2; margin-bottom:6px; color:#0f172a;">${trip.title}</h2>
          <div style="display:flex; gap:16px; font-size:0.85rem; color:#64748b;">
            <span><i class="fa-regular fa-clock"></i> ${trip.duration}</span>
            <span><i class="fa-solid fa-star" style="color:#eab308;"></i> ${trip.rating}</span>
          </div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; display:block;">Investment</span>
          <span style="font-size:1.6rem; font-weight:800; color:#0f172a;">${trip.price}</span>
        </div>
      </div>

      <p style="font-size:0.95rem; color:#475569; line-height:1.6; margin-bottom:24px;">${trip.description}</p>

      <div style="background:#f8fafc; border:1px solid rgba(15,23,42,0.08); border-radius:16px; padding:20px; margin-bottom:28px;">
        <h4 style="font-size:0.95rem; font-weight:700; color:#0f172a; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.05em;">Curated Inclusions</h4>
        <ul style="list-style:none; display:flex; flex-direction:column; gap:10px; font-size:0.88rem; color:#334155;">
          ${trip.highlights.map(h => `<li style="display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-circle-check" style="color:#059669;"></i> ${h}</li>`).join('')}
        </ul>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:14px; flex-wrap:wrap;">
        <button class="btn-secondary" onclick="document.getElementById('tripModalBackdrop').classList.remove('open')">Close</button>
        <button class="btn-primary" onclick="reserveTrip('${trip.title}')">
          <span>Book This Itinerary</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;

  modalBackdrop.classList.add('open');
};

function initModals() {
  const tripBackdrop = document.getElementById('tripModalBackdrop');
  const closeTripBtn = document.getElementById('closeTripModalBtn');
  const videoBackdrop = document.getElementById('videoModalBackdrop');
  const openVideoBtn = document.getElementById('openVideoBtn');
  const closeVideoBtn = document.getElementById('closeVideoModalBtn');

  if (closeTripBtn && tripBackdrop) {
    closeTripBtn.addEventListener('click', () => tripBackdrop.classList.remove('open'));
    tripBackdrop.addEventListener('click', (e) => {
      if (e.target === tripBackdrop) tripBackdrop.classList.remove('open');
    });
  }

  if (openVideoBtn && videoBackdrop && closeVideoBtn) {
    openVideoBtn.addEventListener('click', () => videoBackdrop.classList.add('open'));
    closeVideoBtn.addEventListener('click', () => videoBackdrop.classList.remove('open'));
    videoBackdrop.addEventListener('click', (e) => {
      if (e.target === videoBackdrop) videoBackdrop.classList.remove('open');
    });
  }
}

window.reserveTrip = function(tripTitle) {
  const tripBackdrop = document.getElementById('tripModalBackdrop');
  if (tripBackdrop) tripBackdrop.classList.remove('open');
  showToast('Reservation Requested', `Your booking inquiry for "${tripTitle}" is being processed with priority.`);
};

/* ==========================================================================
   8. QUICK BOOKING SEARCH & TOAST NOTIFICATION
   ========================================================================== */
/* ==========================================================================
   8. CUSTOM INTERACTIVE DROPDOWNS & FUNCTIONAL SEARCH DOCK
   ========================================================================== */

let activeSearchCriteria = {
  destKey: 'all',
  destTitle: 'Where to? (All Destinations)',
  month: 'Next 30 Days (Immediate)',
  serviceKey: 'tour',
  serviceTitle: 'Tour Packages'
};

window.toggleCustomDropdown = function(dropdownId) {
  const panel = document.getElementById(dropdownId);
  if (!panel) return;

  const isAlreadyOpen = panel.classList.contains('show');

  // Close all other dropdowns
  document.querySelectorAll('.custom-dropdown-panel').forEach(p => p.classList.remove('show'));
  document.querySelectorAll('.custom-dropdown-wrap').forEach(w => w.classList.remove('open'));

  if (!isAlreadyOpen) {
    panel.classList.add('show');
    const wrap = panel.closest('.custom-dropdown-wrap');
    if (wrap) wrap.classList.add('open');
  }
};

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-dropdown-wrap')) {
    document.querySelectorAll('.custom-dropdown-panel').forEach(p => p.classList.remove('show'));
    document.querySelectorAll('.custom-dropdown-wrap').forEach(w => w.classList.remove('open'));
  }
});

// Destination Selection
window.selectDest = function(destKey, destTitle) {
  activeSearchCriteria.destKey = destKey;
  activeSearchCriteria.destTitle = destTitle;

  const textEl = document.getElementById('selectedDestText');
  if (textEl) textEl.textContent = destTitle;

  // Highlight active tags
  document.querySelectorAll('#destDropdown .d-tag').forEach(tag => {
    tag.classList.toggle('active', tag.textContent.toLowerCase() === destKey.toLowerCase() || (destKey === 'all' && tag.textContent === 'All'));
  });

  // Close dropdown
  document.querySelectorAll('.custom-dropdown-panel').forEach(p => p.classList.remove('show'));
  document.querySelectorAll('.custom-dropdown-wrap').forEach(w => w.classList.remove('open'));
};

// Destination Filter live search
window.filterDestList = function(query) {
  const items = document.querySelectorAll('#destOptionsList .dropdown-opt-item');
  const q = query.toLowerCase().trim();

  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(q) ? 'flex' : 'none';
  });
};

// Month Selection
window.selectMonth = function(monthText) {
  activeSearchCriteria.month = monthText;
  const textEl = document.getElementById('selectedMonthText');
  if (textEl) textEl.textContent = monthText;

  document.querySelectorAll('#monthDropdown .dropdown-opt-item').forEach(item => {
    item.classList.toggle('active', item.textContent.includes(monthText));
  });

  // Close dropdown
  document.querySelectorAll('.custom-dropdown-panel').forEach(p => p.classList.remove('show'));
  document.querySelectorAll('.custom-dropdown-wrap').forEach(w => w.classList.remove('open'));
};

// Service Selection
window.selectService = function(serviceKey, serviceTitle) {
  activeSearchCriteria.serviceKey = serviceKey;
  activeSearchCriteria.serviceTitle = serviceTitle;

  const textEl = document.getElementById('selectedServiceText');
  if (textEl) textEl.textContent = serviceTitle;

  document.querySelectorAll('#serviceDropdown .dropdown-opt-item').forEach(item => {
    item.classList.toggle('active', item.textContent.includes(serviceTitle));
  });

  // Close dropdown
  document.querySelectorAll('.custom-dropdown-panel').forEach(p => p.classList.remove('show'));
  document.querySelectorAll('.custom-dropdown-wrap').forEach(w => w.classList.remove('open'));
};

// Functional Search Execution
window.executeSearchTrips = function() {
  const { destKey, destTitle, month, serviceTitle } = activeSearchCriteria;

  showToast(`Filtering for: ${destTitle}`, `Service: ${serviceTitle} • Departures: ${month}`);

  // Filter the bento grid cards dynamically
  const bentoCards = document.querySelectorAll('#destinationsGrid .bento-card');
  const filterPills = document.querySelectorAll('.filter-pill');

  let matchFound = false;

  bentoCards.forEach(card => {
    const cardId = card.getAttribute('data-id');
    const category = card.getAttribute('data-category');

    if (destKey === 'all' || cardId === destKey || (destKey === 'kashmir' && category === 'alpine')) {
      card.style.display = 'flex';
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
      matchFound = true;
    } else {
      card.style.display = 'none';
    }
  });

  // If filtered down to a specific package, reset pills
  if (destKey !== 'all') {
    filterPills.forEach(p => p.classList.remove('active'));
  }

  // Smooth scroll to destinations section
  const target = document.getElementById('destinations');
  if (target) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
};

function initBookingSearch() {
  // Legacy handler hook replaced by executeSearchTrips
}

function showToast(title, desc) {
  const toast = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastDesc = document.getElementById('toastDesc');
  if (!toast) return;

  toastTitle.textContent = title;
  toastDesc.textContent = desc;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/* ==========================================================================
   9. MOBILE DRAWER & NEWSLETTER
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    });
  }
}

window.handleNewsletter = function(e) {
  e.preventDefault();
  const status = document.getElementById('newsletterStatus');
  if (status) {
    status.innerHTML = '<span style="color:#059669;"><i class="fa-solid fa-circle-check"></i> You are on the VIP Voyager List. Check your inbox for private escapes.</span>';
  }
};

/* ==========================================================================
   9. MULTI-CARD AUTOSLIDING TESTIMONIALS ENGINE
   ========================================================================== */
function initTestimonialsSlider() {
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevTestimonialBtn');
  const nextBtn = document.getElementById('nextTestimonialBtn');
  const dots = document.querySelectorAll('.t-dot');
  const cards = document.querySelectorAll('.testimonial-slide-card');
  const wrapper = document.querySelector('.testimonials-carousel-wrapper');

  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  let autoSlideTimer = null;
  const slideInterval = 4000; // 4 seconds auto-advance

  function getStepWidth() {
    const cardWidth = cards[0].offsetWidth;
    const gap = 20;
    return cardWidth + gap;
  }

  function getVisibleCount() {
    if (window.innerWidth <= 720) return 1;
    if (window.innerWidth <= 1080) return 2;
    return 3;
  }

  function getMaxIndex() {
    const visibleCount = getVisibleCount();
    return Math.max(0, cards.length - visibleCount);
  }

  function updateSlider() {
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = 0;
    if (currentIndex < 0) currentIndex = maxIdx;

    const step = getStepWidth();
    const translateX = -(currentIndex * step);
    track.style.transform = `translateX(${translateX}px)`;

    // Update active pagination dots
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function nextSlide() {
    const maxIdx = getMaxIndex();
    currentIndex = (currentIndex >= maxIdx) ? 0 : currentIndex + 1;
    updateSlider();
  }

  function prevSlide() {
    const maxIdx = getMaxIndex();
    currentIndex = (currentIndex <= 0) ? maxIdx : currentIndex - 1;
    updateSlider();
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(nextSlide, slideInterval);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  // Event Listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoSlide();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      currentIndex = parseInt(dot.getAttribute('data-index') || 0, 10);
      updateSlider();
      startAutoSlide();
    });
  });

  // Pause on hover
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAutoSlide);
    wrapper.addEventListener('mouseleave', startAutoSlide);
  }

  // Resize recalculation
  window.addEventListener('resize', () => {
    updateSlider();
  });

  // Touch swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    stopAutoSlide();
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      nextSlide();
    } else if (touchEndX - touchStartX > 50) {
      prevSlide();
    }
    startAutoSlide();
  }, { passive: true });

  // Initial Start
  updateSlider();
  startAutoSlide();
}
