(function () {
  const config = window.SITE_CONFIG || { photos: [] };
  const priorityPhotos = [
    "images/photo_2026-09-20_09-33-18 (2).jpg",
    "images/photo_2025-12-15_21-52-23.jpg",
    "images/photo_2025-12-28_21-01-52.jpg",
    "images/photo_2026-01-04_22-37-28.jpg",
    "images/photo_2026-03-08_18-14-03.jpg",
    "images/photo_2026-03-08_18-14-08 (2).jpg",
    "images/photo_2026-03-28_19-44-56.jpg",
    "images/photo_2026-03-28_19-55-49.jpg",
    "images/photo_2026-03-28_19-55-51.jpg",
    "images/photo_2026-05-31_22-49-26.jpg",
    "images/photo_2026-09-19_19-28-39.jpg",
  ];

  function mediaUrl(path) {
    if (!path) return path;
    return path
      .split("/")
      .map((part, i) => {
        if (!part) return part;
        if (i === 0 && /^[a-zA-Z]:$/i.test(part)) return part;
        try {
          return encodeURI(decodeURIComponent(part));
        } catch {
          return encodeURI(part);
        }
      })
      .join("/");
  }

  function createPlaceholderSvg(label) {
    const safeLabel = (label || "love").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 18);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#ff6b9d" />
            <stop offset="50%" stop-color="#7c3aed" />
            <stop offset="100%" stop-color="#22d3ee" />
          </linearGradient>
        </defs>
        <rect width="800" height="1000" fill="#0b0b18"/>
        <rect x="40" y="40" width="720" height="920" rx="32" fill="url(#g)" opacity="0.14"/>
        <circle cx="400" cy="360" r="170" fill="rgba(255,255,255,0.14)"/>
        <text x="50%" y="58%" text-anchor="middle" font-size="72" fill="#FFFFFF" font-family="Arial, sans-serif" letter-spacing="10">♥</text>
        <text x="50%" y="74%" text-anchor="middle" font-size="28" fill="#F4F0FF" font-family="Arial, sans-serif" opacity="0.8">${safeLabel}</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  const allMedia = (config.photos || [])
    .map((item, index) => ({ ...item, originalIndex: index }))
    .sort((a, b) => {
      const aPriority = priorityPhotos.indexOf(a.src);
      const bPriority = priorityPhotos.indexOf(b.src);
      const aRank = aPriority === -1 ? priorityPhotos.length + a.originalIndex : aPriority;
      const bRank = bPriority === -1 ? priorityPhotos.length + b.originalIndex : bPriority;
      return aRank - bRank;
    })
    .map((item, index) => ({
    ...item,
    index,
    src: mediaUrl(item.src),
    poster: item.poster ? mediaUrl(item.poster) : undefined,
    type: item.type || (item.src && /\.(mp4|webm|mov)$/i.test(item.src) ? "video" : "image"),
    id: item.id || `m-${index}`,
  }));

  const state = {
    filter: "all",
    visibleCount: 0,
    batchSize: 12,
    lightboxIndex: 0,
    favorites: new Set(JSON.parse(localStorage.getItem("love-favs") || "[]")),
    effectsReduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    isMobile: window.matchMedia("(max-width: 768px), (pointer: coarse)").matches,
  };

  state.batchSize = state.isMobile
    ? config.galleryBatchSize || 12
    : config.galleryBatchSizeDesktop || 18;

  applyConfig();
  initScrollProgress();
  initParticles();
  initCursorGlow();
  initTouchRipple();
  initNavigation();
  initMobileMenu();
  initBottomNav();
  initHeroGrid();
  initReel();
  initGallery();
  initGalleryScrollStory();
  initFilters();
  initLoadMore();
  initFlyingSprites();
  initAmbientLove();
  initGalleryTilt();
  initLightbox();
  initHearts();
  initEnterButton();
  initPulseButton();
  initShuffle();
  initEffectsToggle();
  initRevealObserver();
  initParallaxHero();

  function applyConfig() {
    setText("heroTitle", config.heroTitle);
    setText(".hero-sub", config.heroSubtitle, true);
    setText(".logo", config.siteName, true);
    setText("aboutText", config.aboutText);
    setText("loveMessage", config.loveMessage);

    const images = allMedia.filter((m) => m.type === "image").length;
    const videos = allMedia.filter((m) => m.type === "video").length;
    setText("photoCount", String(allMedia.length));
    setText("videoCount", String(videos));
    updateGalleryStatus();
  }

  function setText(sel, text, query) {
    if (!text) return;
    const el = query ? document.querySelector(sel) : document.getElementById(sel);
    if (el) el.textContent = text;
  }

  function filteredMedia() {
    return allMedia.filter((m) => {
      if (state.filter === "image") return m.type === "image";
      if (state.filter === "video") return m.type === "video";
      if (state.filter === "fav") return state.favorites.has(m.id);
      return true;
    });
  }

  function updateGalleryStatus() {
    const el = document.getElementById("galleryStatus");
    if (!el) return;
    const total = allMedia.length;
    const shown = Math.min(state.visibleCount, filteredMedia().length);
    const loaded = allMedia.filter((m) => m._ok !== false).length;
    el.textContent =
      total === 0
        ? "Adaugă poze în folderul images/"
        : `${shown} din ${filteredMedia().length} vizibile · ${loaded} media în univers`;
  }

  function createMediaFrame(item, index) {
    const style = item.style || "neon";
    const tilt = (index % 5) - 2;
    const frame = document.createElement("div");
    frame.className = `photo-frame style-${style} type-${item.type}`;
    frame.dataset.id = item.id;
    if (style === "polaroid") frame.style.setProperty("--tilt", `${tilt}deg`);

    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "fav-btn";
    favBtn.setAttribute("aria-label", "Favorite");
    favBtn.textContent = state.favorites.has(item.id) ? "★" : "☆";
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(item.id);
      favBtn.textContent = state.favorites.has(item.id) ? "★" : "☆";
      frame.classList.toggle("is-fav", state.favorites.has(item.id));
    });
    if (state.favorites.has(item.id)) frame.classList.add("is-fav");

    if (item.type === "video") {
      const wrap = document.createElement("div");
      wrap.className = "video-thumb";
      const video = document.createElement("video");
      video.src = item.src;
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = "metadata";
      if (item.poster) video.poster = item.poster;
      video.addEventListener("loadeddata", () => {
        item._ok = true;
        updateGalleryStatus();
      });
      video.addEventListener("error", () => markMissing(frame, item));
      const badge = document.createElement("span");
      badge.className = "video-badge";
      badge.textContent = "▶";
      wrap.appendChild(video);
      wrap.appendChild(badge);
      frame.appendChild(wrap);
      initVideoPreview(video, frame);
    } else {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || "Amintire";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("load", () => {
        item._ok = true;
        updateGalleryStatus();
      });
      img.addEventListener("error", () => {
        if (!img.dataset.fallback) {
          img.src = createPlaceholderSvg(item.alt || "love");
          img.dataset.fallback = "true";
        }
        item._ok = true;
        updateGalleryStatus();
      });
      frame.appendChild(img);
    }

    frame.appendChild(favBtn);

    if (item.caption) {
      const cap = document.createElement("span");
      cap.className = "photo-caption";
      cap.textContent = item.caption;
      frame.appendChild(cap);
    }

    frame.addEventListener("click", () => openLightboxAt(item.index));
    return frame;
  }

  function markMissing(frame, item) {
    item._ok = false;
    frame.classList.add("is-missing");
    const ph = document.createElement("div");
    ph.className = "missing-label";
    ph.innerHTML = `<span>✦</span><small>${item.src.split("/").pop()}</small>`;
    frame.appendChild(ph);
    updateGalleryStatus();
  }

  function initVideoPreview(video, frame) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !state.effectsReduced) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(frame);
  }

  function initHeroGrid() {
    const grid = document.getElementById("heroGrid");
    if (!grid) return;
    const images = allMedia.filter((m) => m.type === "image");
    const cellCount = state.isMobile ? 6 : 8;

    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement("div");
      cell.className = "hero-grid-cell";
      cell.style.setProperty("--delay", `${i * 0.35}s`);
      const src = images[i]?.src;
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.loading = i < 2 ? "eager" : "lazy";
        cell.appendChild(img);
      } else {
        cell.classList.add("hero-grid-placeholder");
        cell.style.setProperty("--hue", String(280 + i * 18));
      }
      grid.appendChild(cell);
    }
  }

  function initReel() {
    const track = document.getElementById("reelTrack");
    if (!track) return;
    const picks = [...allMedia].slice(0, Math.min(16, allMedia.length));
    picks.forEach((item, i) => {
      const card = document.createElement("article");
      card.className = "reel-card reveal";
      card.style.setProperty("--i", String(i));
      const inner = createMediaFrame(item, i);
      inner.classList.add("reel-inner");
      card.appendChild(inner);
      track.appendChild(card);
    });
  }

  function initGallery() {
    const orbit = document.getElementById("galleryOrbit");
    const masonry = document.getElementById("galleryMasonry");
    if (!orbit || !masonry) return;

    const core = document.createElement("div");
    core.className = "orbit-center";
    orbit.appendChild(core);

    state.masonry = masonry;
    state.orbit = orbit;
    state.orbitBuilt = false;

    renderOrbit();
    state.visibleCount = 0;
    appendGalleryBatch(true);
  }

  function renderOrbit() {
    const orbit = state.orbit;
    if (!orbit || state.orbitBuilt) return;
    orbit.querySelectorAll(".orbit-item").forEach((n) => n.remove());

    const pool = filteredMedia().filter((m) => m.type === "image");
    const max = state.isMobile ? 5 : 8;
    const orbitPhotos = pool.slice(0, max);
    if (!orbitPhotos.length) {
      orbit.classList.add("orbit-empty");
      return;
    }
    orbit.classList.remove("orbit-empty");

    orbitPhotos.forEach((photo, i) => {
      const angle = (360 / orbitPhotos.length) * i;
      const radians = (angle * Math.PI) / 180;
      const radius = Math.min(250, Math.max(80, window.innerWidth * (state.isMobile ? 0.28 : 0.31)));
      const wrap = document.createElement("div");
      wrap.className = "orbit-item";
      wrap.style.left = `calc(50% + ${Math.cos(radians) * radius}px)`;
      wrap.style.top = `calc(50% + ${Math.sin(radians) * radius}px)`;
      wrap.style.setProperty("--delay", `${i * 0.25}s`);
      wrap.appendChild(createMediaFrame(photo, i));
      orbit.appendChild(wrap);
    });
    state.orbitBuilt = true;
  }

  function appendGalleryBatch(reset) {
    const masonry = state.masonry;
    if (!masonry) return;
    if (reset) {
      masonry.innerHTML = "";
      state.visibleCount = 0;
      state.orbitBuilt = false;
      renderOrbit();
    }

    const list = filteredMedia();
    const next = list.slice(state.visibleCount, state.visibleCount + state.batchSize);
    next.forEach((photo, i) => {
      const globalIndex = state.visibleCount + i;
      const item = document.createElement("div");
      item.className = "masonry-item reveal";
      item.dataset.reveal;
      item.dataset.galleryIndex = String(globalIndex);
      item.style.setProperty("--delay", `${(i % 6) * 0.06}s`);
      item.style.setProperty("--tx", `${(globalIndex % 2 ? -1 : 1) * 40}px`);
      item.style.setProperty("--ty", `${-15 - (globalIndex % 4) * 10}px`);
      item.style.setProperty("--rot", `${(globalIndex % 5) - 2}deg`);
      item.appendChild(createMediaFrame(photo, globalIndex));
      masonry.appendChild(item);
    });

    state.visibleCount += next.length;
    updateLoadMore();
    updateGalleryStatus();
    observeReveal(masonry.querySelectorAll(".reveal:not(.is-visible)"));
    state.refreshGalleryScroll?.();
  }

  function updateLoadMore() {
    const btn = document.getElementById("loadMoreBtn");
    const count = document.getElementById("loadCount");
    const total = filteredMedia().length;
    const left = total - state.visibleCount;
    if (btn) btn.hidden = left <= 0;
    if (count) count.textContent = left > 0 ? `+${left} rămase` : "Tot universul e aici ✦";
  }

  function initLoadMore() {
    document.getElementById("loadMoreBtn")?.addEventListener("click", () => {
      appendGalleryBatch(false);
    });
  }

  function initFilters() {
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        state.filter = chip.dataset.filter || "all";
        state.orbitBuilt = false;
        appendGalleryBatch(true);
      });
    });
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    localStorage.setItem("love-favs", JSON.stringify([...state.favorites]));
    syncLightboxFav();
  }

  function syncLightboxFav() {
    const item = allMedia[state.lightboxIndex];
    const button = document.getElementById("lightboxFav");
    if (!button || !item) return;
    button.textContent = state.favorites.has(item.id) ? "★" : "☆";
  }

  function initScrollProgress() {
    const bar = document.getElementById("scrollProgress");
    if (!bar) return;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initParticles() {
    const canvas = document.getElementById("particles");
    if (!canvas || state.effectsReduced) {
      canvas?.remove();
      return;
    }
    const ctx = canvas.getContext("2d");
    let w, h;
    const stars = [];
    const colors = ["#22d3ee", "#ff6b9d", "#a78bfa", "#fbbf24", "#34d399"];
    const maxStars = state.isMobile ? 70 : 160;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function seed() {
      stars.length = 0;
      const n = Math.min(maxStars, Math.floor((w * h) / (state.isMobile ? 12000 : 8000)));
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.3,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          c: colors[i % colors.length],
          a: Math.random() * 0.55 + 0.2,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.c;
        ctx.globalAlpha = s.a;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    resize();
    seed();
    draw();
    window.addEventListener("resize", () => {
      resize();
      seed();
    });
  }

  function initCursorGlow() {
    const glow = document.getElementById("cursorGlow");
    if (!glow || state.isMobile) {
      glow?.remove();
      return;
    }
    window.addEventListener(
      "mousemove",
      (e) => {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      },
      { passive: true }
    );
  }

  function initTouchRipple() {
    const layer = document.getElementById("touchRipple");
    if (!layer) return;
    document.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        if (!t) return;
        const rip = document.createElement("span");
        rip.className = "touch-ripple";
        rip.style.left = `${t.clientX}px`;
        rip.style.top = `${t.clientY}px`;
        layer.appendChild(rip);
        setTimeout(() => rip.remove(), 700);
      },
      { passive: true }
    );
  }

  function initNavigation() {
    document.querySelectorAll("[data-scroll]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        closeMobileMenu();
        const id = el.getAttribute("data-scroll");
        const target =
          id === "top" ? document.querySelector(".hero") : document.getElementById(id);
        target?.scrollIntoView({ behavior: "smooth" });
        setActiveBottomNav(id);
      });
    });
  }

  function initMobileMenu() {
    const toggle = document.getElementById("menuToggle");
    const drawer = document.getElementById("mobileDrawer");
    if (!toggle || !drawer) return;
    toggle.addEventListener("click", () => {
      const open = drawer.hidden;
      drawer.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });
    drawer.querySelectorAll("[data-scroll]").forEach((btn) => {
      btn.addEventListener("click", () => closeMobileMenu());
    });
  }

  function closeMobileMenu() {
    const drawer = document.getElementById("mobileDrawer");
    const toggle = document.getElementById("menuToggle");
    if (drawer) drawer.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  function initBottomNav() {
    document.querySelectorAll(".bottom-nav-btn[data-scroll]").forEach((btn) => {
      btn.addEventListener("click", () => setActiveBottomNav(btn.getAttribute("data-scroll")));
    });
  }

  function setActiveBottomNav(id) {
    document.querySelectorAll(".bottom-nav-btn[data-scroll]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-scroll") === id);
    });
  }

  function initFlyingSprites() {
    if (state.effectsReduced) return;
    const symbols = ["✦", "◈", "♥", "✧", "◇", "❋"];
    const palette = ["#22d3ee", "#ff6b9d", "#fbbf24", "#a78bfa"];
    const interval = state.isMobile ? 3500 : 2200;

    function spawn() {
      if (document.hidden) return;
      const el = document.createElement("div");
      el.className = "fly-sprite";
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.color = palette[Math.floor(Math.random() * palette.length)];
      el.style.setProperty("--y", `${Math.random() * 75 + 8}vh`);
      el.style.animationDuration = `${10 + Math.random() * 8}s`;
      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    }

    setInterval(spawn, interval);
    for (let i = 0; i < 3; i++) setTimeout(spawn, i * 400);
  }

  function initRevealObserver() {
    observeReveal(document.querySelectorAll(".reveal"));
  }

  function initGalleryScrollStory() {
    const masonry = document.getElementById("galleryMasonry");
    const current = document.getElementById("galleryScrollCurrent");
    const total = document.getElementById("galleryScrollTotal");
    const progress = document.getElementById("galleryScrollProgress");
    if (!masonry || !current || !total || !progress) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = masonry.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const items = [...masonry.querySelectorAll(".masonry-item")];
      const itemCount = filteredMedia().length;
      total.textContent = String(itemCount).padStart(2, "0");

      let activeItem = null;
      let nearestDistance = Infinity;
      const focalPoint = window.innerHeight * 0.48;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const visible = itemRect.bottom > 0 && itemRect.top < window.innerHeight;
        if (!visible) return;

        const distance = Math.abs((itemRect.top + itemRect.bottom) / 2 - focalPoint);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          activeItem = item;
        }
      });

      items.forEach((item) => item.classList.toggle("is-focused", item === activeItem));

      if (!activeItem || !itemCount) {
        current.textContent = "00";
        progress.style.transform = "scaleX(0)";
        return;
      }

      const position = Number(activeItem.dataset.galleryIndex) + 1;
      current.textContent = String(position).padStart(2, "0");
      progress.style.transform = `scaleX(${position / itemCount})`;
    };

    state.refreshGalleryScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", state.refreshGalleryScroll, { passive: true });
    window.addEventListener("resize", state.refreshGalleryScroll, { passive: true });
    state.refreshGalleryScroll();
  }

  function initAmbientLove() {
    const target = document.querySelector(".hero");
    if (!target || state.effectsReduced) return;
    let count = 0;
    const interval = setInterval(() => {
      if (!document.body.contains(target)) {
        clearInterval(interval);
        return;
      }
      if (count >= 10) {
        clearInterval(interval);
        return;
      }
      const heart = document.createElement("span");
      heart.className = "floating-heart ambient-heart";
      heart.textContent = ["♥", "✦", "❋", "♡"][Math.floor(Math.random() * 4)];
      heart.style.left = `${10 + Math.random() * 80}%`;
      heart.style.top = `${10 + Math.random() * 70}%`;
      heart.style.animationDuration = `${5 + Math.random() * 6}s`;
      heart.style.color = ["#ff6b9d", "#7c3aed", "#22d3ee", "#fbbf24"][Math.floor(Math.random() * 4)];
      target.appendChild(heart);
      setTimeout(() => heart.remove(), 6500);
      count += 1;
    }, 700);
  }

  function initGalleryTilt() {
    if (state.isMobile) return;
    document.querySelectorAll(".photo-frame").forEach((frame) => {
      frame.addEventListener("pointermove", (event) => {
        const rect = frame.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 12;
        const rotateX = (0.5 - y) * 12;
        frame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      frame.addEventListener("pointerleave", () => {
        frame.style.transform = "";
      });
    });
  }

  function observeReveal(nodes) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    nodes.forEach((n) => io.observe(n));
  }

  function initParallaxHero() {
    const title = document.querySelector(".hero-title-wrap");
    if (!title || state.isMobile) return;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        title.style.transform = `translateY(${y * 0.15}px)`;
      },
      { passive: true }
    );
  }

  function initLightbox() {
    const box = document.getElementById("lightbox");
    const img = document.getElementById("lightboxImg");
    const video = document.getElementById("lightboxVideo");
    const cap = document.getElementById("lightboxCaption");
    const close = document.getElementById("lightboxClose");
    const prev = document.getElementById("lightboxPrev");
    const next = document.getElementById("lightboxNext");
    const fav = document.getElementById("lightboxFav");
    if (!box || !img || !video) return;

    let touchStartX = 0;

    window.openLightboxAt = openLightboxAt;

    function openLightboxAt(index) {
      state.lightboxIndex = index;
      showCurrent();
      box.hidden = false;
      document.body.classList.add("lightbox-open");
    }

    function showCurrent() {
      const item = allMedia[state.lightboxIndex];
      if (!item) return;
      img.hidden = true;
      video.hidden = true;
      video.pause();

      if (item.type === "video") {
        video.src = item.src;
        video.hidden = false;
        video.play().catch(() => {});
      } else {
        img.src = item.src;
        img.alt = item.alt || "";
        img.hidden = false;
      }
      if (cap) cap.textContent = item.caption || item.alt || "";
      syncLightboxFav();
    }

    function shut() {
      box.hidden = true;
      img.src = "";
      video.pause();
      video.src = "";
      document.body.classList.remove("lightbox-open");
    }

    function step(dir) {
      const pool = allMedia;
      state.lightboxIndex = (state.lightboxIndex + dir + pool.length) % pool.length;
      showCurrent();
    }

    close?.addEventListener("click", shut);
    prev?.addEventListener("click", () => step(-1));
    next?.addEventListener("click", () => step(1));
    fav?.addEventListener("click", () => {
      const item = allMedia[state.lightboxIndex];
      if (item) toggleFavorite(item.id);
    });
    box.addEventListener("click", (e) => {
      if (e.target === box) shut();
    });
    document.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") shut();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });

    box.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0]?.clientX || 0;
      },
      { passive: true }
    );
    box.addEventListener(
      "touchend",
      (e) => {
        const dx = (e.changedTouches[0]?.clientX || 0) - touchStartX;
        if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
      },
      { passive: true }
    );
  }

  function openLightboxAt(index) {
    window.openLightboxAt?.(index);
  }

  function initHearts() {
    const btn = document.getElementById("heartBurst");
    const field = document.getElementById("heartField");
    if (!btn || !field) return;
    btn.addEventListener("click", burstHearts);
    field.addEventListener("click", burstHearts);
  }

  function burstHearts() {
    const field = document.getElementById("heartField");
    if (!field) return;
    const hearts = ["♥", "💜", "✨", "🩷", "💫"];
    const n = state.isMobile ? 8 : 14;
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        const h = document.createElement("span");
        h.className = "floating-heart";
        h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        h.style.left = `${15 + Math.random() * 70}%`;
        h.style.color = `hsl(${280 + Math.random() * 80}, 85%, 68%)`;
        field.appendChild(h);
        setTimeout(() => h.remove(), 2600);
      }, i * 70);
    }
  }

  function initEnterButton() {
    document.getElementById("enterBtn")?.addEventListener("click", () => {
      document.getElementById("reel")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function initPulseButton() {
    document.getElementById("pulseBtn")?.addEventListener("click", togglePulse);
  }

  function initEffectsToggle() {
    document.getElementById("effectsToggle")?.addEventListener("click", togglePulse);
  }

  function togglePulse() {
    document.body.classList.toggle("pulse-mode");
    document.getElementById("effectsToggle")?.classList.toggle("active");
  }

  function initShuffle() {
    document.getElementById("shuffleBtn")?.addEventListener("click", () => {
      const pool = filteredMedia().filter((m) => m._ok !== false);
      if (!pool.length) return;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      openLightboxAt(pick.index);
      document.body.classList.add("shuffle-flash");
      setTimeout(() => document.body.classList.remove("shuffle-flash"), 600);
    });
  }
})();
