/**
 * ANIMEVERSE — Core Application Logic
 * Navigation adaptation, anime collection rendering, spectrum filtering,
 * search, favourites, detailed modal, and ideological clash comparator.
 */

document.addEventListener("DOMContentLoaded", () => {
  // State
  let currentSpectrum = "all";
  let currentGenre = "all";
  let searchQuery = "";
  let sortBy = "spectrum-desc"; // dark to light by default
  let favourites = JSON.parse(localStorage.getItem("animeverse_favourites") || "[]");

  // DOM Elements
  const navbar = document.getElementById("main-nav");
  const audioToggleBtn = document.getElementById("audio-toggle");
  const audioIcon = document.getElementById("audio-icon");
  const animeGrid = document.getElementById("anime-grid");
  const searchInput = document.getElementById("anime-search");
  const spectrumFilters = document.querySelectorAll(".spectrum-btn");
  const genreFiltersContainer = document.getElementById("genre-filters");
  const sortSelect = document.getElementById("sort-select");
  const resultsCount = document.getElementById("results-count");
  const favouritesFilterBtn = document.getElementById("filter-favourites");
  let showFavouritesOnly = false;

  // Modal Elements
  const modal = document.getElementById("anime-modal");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalCloseBtn = document.getElementById("modal-close");
  const modalContent = document.getElementById("modal-body");

  // Dualistic Clash Elements
  const clashSelector = document.getElementById("clash-selector");
  const clashDisplay = document.getElementById("clash-display");

  // ==========================================
  // 1. DYNAMIC NAVBAR CONTRAST ADAPTATION
  // ==========================================
  const handleNavScroll = () => {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;

    // Check if user is in cinematic golden dawn or collection
    const cinematicPinned = document.getElementById("cinematic-pinned");
    const isPastDarkness = scrollY > windowH * 2.8;

    if (scrollY > 60) {
      navbar.classList.add("nav-scrolled");
    } else {
      navbar.classList.remove("nav-scrolled");
    }

    if (isPastDarkness) {
      navbar.classList.add("nav-light-mode");
    } else {
      navbar.classList.remove("nav-light-mode");
    }
  };

  window.addEventListener("scroll", handleNavScroll, { passive: true });
  handleNavScroll();

  // Mobile menu toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const navLinks = document.getElementById("nav-links");
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      navLinks.classList.toggle("nav-open");
      mobileToggle.setAttribute("aria-expanded", navLinks.classList.contains("nav-open"));
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("nav-open");
      });
    });
  }

  // ==========================================
  // 2. AUDIO SYNTHESIZER TOGGLE
  // ==========================================
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      if (window.cinematicAudio) {
        const isPlaying = window.cinematicAudio.toggle();
        if (isPlaying) {
          audioToggleBtn.classList.add("audio-active");
          audioIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
          audioToggleBtn.setAttribute("aria-label", "Mute Atmospheric Sound");
        } else {
          audioToggleBtn.classList.remove("audio-active");
          audioIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
          audioToggleBtn.setAttribute("aria-label", "Play Atmospheric Sound");
        }
      }
    });
  }

  // ==========================================
  // 3. ANIME COLLECTION RENDERING & FILTERS
  // ==========================================

  // Populate Genre Filter Chips dynamically from dataset
  const initGenreFilters = () => {
    if (!genreFiltersContainer) return;
    const genresSet = new Set();
    ANIME_COLLECTION.forEach(a => a.genres.forEach(g => genresSet.add(g)));
    const sortedGenres = Array.from(genresSet).sort();

    genreFiltersContainer.innerHTML = `
      <button class="genre-pill active" data-genre="all">All Genres</button>
      ${sortedGenres.map(g => `<button class="genre-pill" data-genre="${g}">${g}</button>`).join("")}
    `;

    genreFiltersContainer.querySelectorAll(".genre-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        genreFiltersContainer.querySelectorAll(".genre-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentGenre = btn.dataset.genre;
        renderCollection();
      });
    });
  };

  // Spectrum Filter Buttons (All, Eclipse, Twilight, Elysium)
  if (spectrumFilters) {
    spectrumFilters.forEach(btn => {
      btn.addEventListener("click", () => {
        spectrumFilters.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentSpectrum = btn.dataset.spectrum;
        renderCollection();
      });
    });
  }

  // Favourites Filter Toggle
  if (favouritesFilterBtn) {
    favouritesFilterBtn.addEventListener("click", () => {
      showFavouritesOnly = !showFavouritesOnly;
      favouritesFilterBtn.classList.toggle("active", showFavouritesOnly);
      renderCollection();
    });
  }

  // Search input with debounce
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderCollection();
    });
  }

  // Sort select change
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortBy = e.target.value;
      renderCollection();
    });
  }

  // Filter and Sort Data
  const getFilteredData = () => {
    return ANIME_COLLECTION.filter(item => {
      // Spectrum filter
      if (currentSpectrum !== "all" && item.spectrum !== currentSpectrum) {
        return false;
      }
      // Genre filter
      if (currentGenre !== "all" && !item.genres.includes(currentGenre)) {
        return false;
      }
      // Favourites filter
      if (showFavouritesOnly && !favourites.includes(item.id)) {
        return false;
      }
      // Search query
      if (searchQuery) {
        const matchTitle = item.title.toLowerCase().includes(searchQuery);
        const matchJp = item.japaneseTitle.toLowerCase().includes(searchQuery);
        const matchSynopsis = item.synopsis.toLowerCase().includes(searchQuery);
        const matchChar = item.characters.some(c => c.name.toLowerCase().includes(searchQuery));
        if (!matchTitle && !matchJp && !matchSynopsis && !matchChar) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case "spectrum-desc": // Darkest to Lightest
          return b.darknessScore - a.darknessScore;
        case "spectrum-asc": // Lightest to Darkest
          return a.darknessScore - b.darknessScore;
        case "rating-desc": // Highest Rated
          return b.rating - a.rating;
        case "year-desc": // Newest first
          return parseInt(b.year) - parseInt(a.year);
        case "title-asc": // A-Z
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  // Render Collection Cards
  const renderCollection = () => {
    if (!animeGrid) return;
    const data = getFilteredData();

    if (resultsCount) {
      resultsCount.textContent = `Displaying ${data.length} of ${ANIME_COLLECTION.length} works`;
    }

    if (data.length === 0) {
      animeGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-glyph">✦</div>
          <h3 class="empty-title">No Anime Matches Found</h3>
          <p class="empty-desc">Adjust your spectrum filter, search query, or clear your genre selection to explore the full library.</p>
          <button class="btn btn-outline" id="reset-filters-btn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById("reset-filters-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          currentSpectrum = "all";
          currentGenre = "all";
          searchQuery = "";
          showFavouritesOnly = false;
          if (searchInput) searchInput.value = "";
          if (favouritesFilterBtn) favouritesFilterBtn.classList.remove("active");
          spectrumFilters.forEach(b => b.classList.toggle("active", b.dataset.spectrum === "all"));
          if (genreFiltersContainer) {
            genreFiltersContainer.querySelectorAll(".genre-pill").forEach(b => b.classList.toggle("active", b.dataset.genre === "all"));
          }
          renderCollection();
        });
      }
      return;
    }

    animeGrid.innerHTML = data.map((anime, idx) => {
      const isFav = favourites.includes(anime.id);
      const isEclipse = anime.spectrum === "eclipse";
      const isTwilight = anime.spectrum === "twilight";

      const spectrumBadgeClass = isEclipse ? "badge-eclipse" : isTwilight ? "badge-twilight" : "badge-elysium";
      const spectrumGlyph = isEclipse ? "▲" : isTwilight ? "◈" : "✦";
      const spectrumLabel = isEclipse ? "Eclipse / Abyss" : isTwilight ? "Twilight / Liminal" : "Elysium / Dawn";

      return `
        <article class="anime-card card-${anime.spectrum}" data-id="${anime.id}" style="animation-delay: ${idx * 0.05}s">
          <div class="card-media">
            <img src="${anime.poster}" alt="${anime.title} Poster" class="card-poster" loading="lazy" onerror="this.src='${anime.banner}'" />
            <div class="card-overlay-gradient"></div>
            
            <button class="card-fav-btn ${isFav ? 'favorited' : ''}" data-id="${anime.id}" aria-label="Toggle Favourite">
              <svg viewBox="0 0 24 24" fill="${isFav ? '#e62332' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            <div class="card-rating-badge">
              <span class="star-icon">★</span>
              <span class="rating-num">${anime.rating}</span>
            </div>

            <div class="card-spectrum-chip ${spectrumBadgeClass}">
              <span>${spectrumGlyph}</span>
              <span>${spectrumLabel}</span>
            </div>
          </div>

          <div class="card-content">
            <div class="card-header">
              <span class="card-japanese">${anime.japaneseTitle}</span>
              <h3 class="card-title">${anime.title}</h3>
            </div>

            <p class="card-tagline">${anime.tagline}</p>

            <div class="card-genres">
              ${anime.genres.slice(0, 3).map(g => `<span class="genre-tag">${g}</span>`).join("")}
            </div>

            <div class="card-spectrum-meter">
              <div class="meter-labels">
                <span class="label-darkness">Darkness ${anime.darknessScore}%</span>
                <span class="label-light">Light ${100 - anime.darknessScore}%</span>
              </div>
              <div class="meter-track">
                <div class="meter-fill" style="width: ${anime.darknessScore}%"></div>
              </div>
            </div>

            <div class="card-footer">
              <span class="card-meta">${anime.studio} · ${anime.year.split("–")[0]}</span>
              <button class="btn btn-card-details" data-id="${anime.id}">
                <span>Dossier</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    // Attach card event listeners
    animeGrid.querySelectorAll(".btn-card-details").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(btn.dataset.id);
      });
    });

    animeGrid.querySelectorAll(".anime-card").forEach(card => {
      card.addEventListener("click", () => {
        openModal(card.dataset.id);
      });
    });

    animeGrid.querySelectorAll(".card-fav-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavourite(btn.dataset.id);
      });
    });
  };

  // Toggle Favourite
  const toggleFavourite = (id) => {
    if (favourites.includes(id)) {
      favourites = favourites.filter(item => item !== id);
    } else {
      favourites.push(id);
    }
    localStorage.setItem("animeverse_favourites", JSON.stringify(favourites));
    renderCollection();
  };

  // ==========================================
  // 4. ANIME DOSSIER MODAL
  // ==========================================
  const openModal = (id) => {
    const anime = ANIME_COLLECTION.find(a => a.id === id);
    if (!anime || !modal || !modalContent) return;

    const isEclipse = anime.spectrum === "eclipse";
    const isTwilight = anime.spectrum === "twilight";
    const spectrumClass = isEclipse ? "modal-eclipse" : isTwilight ? "modal-twilight" : "modal-elysium";

    modalContent.innerHTML = `
      <div class="modal-dossier ${spectrumClass}">
        <div class="dossier-hero" style="background-image: linear-gradient(to bottom, rgba(5,5,7,0.4), #050507), url('${anime.banner}')">
          <div class="dossier-hero-badge">
            <span>${isEclipse ? '▲ THE ECLIPSE ARCHIVE' : isTwilight ? '◈ THE TWILIGHT AXIS' : '✦ THE ELYSIAN DAWN'}</span>
          </div>
          <div class="dossier-title-group">
            <span class="dossier-jp">${anime.japaneseTitle} · ${anime.romaji}</span>
            <h2 class="dossier-title">${anime.title}</h2>
            <div class="dossier-specs">
              <span>★ Rating: ${anime.rating}/10</span>
              <span>•</span>
              <span>${anime.studio}</span>
              <span>•</span>
              <span>${anime.year}</span>
              <span>•</span>
              <span>${anime.episodes}</span>
            </div>
          </div>
        </div>

        <div class="dossier-layout">
          <div class="dossier-sidebar">
            <img src="${anime.poster}" alt="${anime.title}" class="dossier-poster" onerror="this.src='${anime.banner}'" />
            
            <div class="dossier-quote-box">
              <div class="quote-mark">“</div>
              <p class="dossier-quote">${anime.quote}</p>
              <span class="dossier-quote-author">— ${anime.quoteAuthor}</span>
              <button class="btn btn-audio-quote" id="speak-quote-btn" aria-label="Vocalize Quote">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
                <span>Voice Epigraph</span>
              </button>
            </div>

            <div class="dossier-metrics">
              <h4 class="metrics-title">METAPHYSICAL TELEMETRY</h4>
              <div class="metric-row">
                <span>Tragedy / Despair</span>
                <div class="bar-track"><div class="bar-fill bar-crimson" style="width: ${anime.scores.tragedy}%"></div></div>
                <span class="metric-val">${anime.scores.tragedy}%</span>
              </div>
              <div class="metric-row">
                <span>Hope / Transcendence</span>
                <div class="bar-track"><div class="bar-fill bar-gold" style="width: ${anime.scores.hope}%"></div></div>
                <span class="metric-val">${anime.scores.hope}%</span>
              </div>
              <div class="metric-row">
                <span>Psychological Depth</span>
                <div class="bar-track"><div class="bar-fill bar-silver" style="width: ${anime.scores.psychology}%"></div></div>
                <span class="metric-val">${anime.scores.psychology}%</span>
              </div>
              <div class="metric-row">
                <span>Philosophical Impact</span>
                <div class="bar-track"><div class="bar-fill bar-purple" style="width: ${anime.scores.philosophy}%"></div></div>
                <span class="metric-val">${anime.scores.philosophy}%</span>
              </div>
            </div>
          </div>

          <div class="dossier-main">
            <section class="dossier-section">
              <h3 class="section-heading">NARRATIVE SYNOPSIS</h3>
              <p class="section-text">${anime.synopsis}</p>
            </section>

            <section class="dossier-section">
              <h3 class="section-heading">THEMATIC & PHILOSOPHICAL ANALYSIS</h3>
              <div class="philosophy-card">
                <p class="section-text">${anime.philosophy}</p>
              </div>
            </section>

            <section class="dossier-section">
              <h3 class="section-heading">CENTRAL ARCHETYPES</h3>
              <div class="characters-grid">
                ${anime.characters.map(char => `
                  <div class="character-card">
                    <h5 class="char-name">${char.name}</h5>
                    <span class="char-role">${char.role}</span>
                    <p class="char-quote">“${char.quote}”</p>
                  </div>
                `).join("")}
              </div>
            </section>

            <section class="dossier-section">
              <h3 class="section-heading">CLASSIFICATION & GENRES</h3>
              <div class="dossier-tags">
                ${anime.genres.map(g => `<span class="dossier-tag">${g}</span>`).join("")}
              </div>
            </section>
          </div>
        </div>
      </div>
    `;

    // Speech Synthesis for Quote
    const speakBtn = document.getElementById("speak-quote-btn");
    if (speakBtn && "speechSynthesis" in window) {
      speakBtn.addEventListener("click", () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(anime.quote);
        utterance.rate = 0.88;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      });
    }

    modal.classList.add("modal-open");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("modal-open");
    document.body.style.overflow = "";
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // ==========================================
  // 5. DUALISTIC CLASH COMPARATOR
  // ==========================================
  const renderClash = (clashIndex = 0) => {
    if (!clashDisplay || !PHILOSOPHICAL_CLASHES[clashIndex]) return;
    const clash = PHILOSOPHICAL_CLASHES[clashIndex];
    const anime1 = ANIME_COLLECTION.find(a => a.id === clash.anime1);
    const anime2 = ANIME_COLLECTION.find(a => a.id === clash.anime2);

    clashDisplay.innerHTML = `
      <div class="clash-container">
        <div class="clash-header">
          <span class="clash-concept-badge">${clash.concept}</span>
          <h3 class="clash-title">${clash.title}</h3>
        </div>

        <div class="clash-arena">
          <!-- Side 1: Darkness / Thesis -->
          <div class="clash-side clash-left" style="--accent: ${clash.side1.color}">
            <div class="clash-card-media" style="background-image: url('${anime1 ? anime1.banner : ''}')">
              <div class="clash-media-tint"></div>
            </div>
            <div class="clash-side-body">
              <span class="clash-keyterm">${clash.side1.keyTerm}</span>
              <h4 class="clash-char">${clash.side1.character}</h4>
              <span class="clash-world">${clash.side1.world}</span>
              <blockquote class="clash-thesis">“${clash.side1.thesis}”</blockquote>
            </div>
          </div>

          <!-- The Central Energy Divider -->
          <div class="clash-center-axis">
            <div class="clash-spark-pulse">VS</div>
          </div>

          <!-- Side 2: Light / Antithesis -->
          <div class="clash-side clash-right" style="--accent: ${clash.side2.color}">
            <div class="clash-card-media" style="background-image: url('${anime2 ? anime2.banner : ''}')">
              <div class="clash-media-tint"></div>
            </div>
            <div class="clash-side-body">
              <span class="clash-keyterm">${clash.side2.keyTerm}</span>
              <h4 class="clash-char">${clash.side2.character}</h4>
              <span class="clash-world">${clash.side2.world}</span>
              <blockquote class="clash-thesis">“${clash.side2.thesis}”</blockquote>
            </div>
          </div>
        </div>

        <div class="clash-synthesis-card">
          <div class="synthesis-badge">✦ METAPHYSICAL SYNTHESIS</div>
          <p class="synthesis-text">${clash.synthesis}</p>
        </div>
      </div>
    `;
  };

  const initClashSelector = () => {
    if (!clashSelector) return;
    clashSelector.innerHTML = PHILOSOPHICAL_CLASHES.map((c, idx) => `
      <button class="clash-nav-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <span>${c.title.split(":")[0]}</span>
      </button>
    `).join("");

    clashSelector.querySelectorAll(".clash-nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        clashSelector.querySelectorAll(".clash-nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderClash(parseInt(btn.dataset.index, 10));
      });
    });

    renderClash(0);
  };

  // Initialize all subsystems
  initGenreFilters();
  renderCollection();
  initClashSelector();
});
