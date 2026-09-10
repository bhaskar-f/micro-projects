// ============================================================
// MovieMatch
// Movie Explorer + Genre Filters + Likes + Details + Pagination
// ============================================================

// IMPORTANT:
// Put your NEW OMDb API key here.
// Do NOT use the old key that was exposed previously.
const API_KEY = "b7d80182";
const API_URL = "https://www.omdbapi.com/";

// OMDb has no "search by genre" endpoint.
// These searches create a small, curated homepage catalog.
const HOME_SEARCHES = [
  "batman",
  "avengers",
  "interstellar",
  "inception",
  "toy story",
  "frozen",
  "conjuring",
  "godfather",
  "titanic",
  "jurassic",
  "shrek",
  "oppenheimer"
];

const GENRES = [
  "All Genres",
  "♥ Liked Movies",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
  "Family",
  "Musical"
];

// ------------------------------------------------------------
// State
// ------------------------------------------------------------

let homeMovies = [];
let searchMovies = [];
let baseMovies = [];
let currentMovies = [];

let activeFilter = "All Genres";

let currentSearchQuery = "";
let currentPage = 1;
let totalResults = 0;

let likedMovies = loadLikedMovies();

let searchRequestId = 0;

// ------------------------------------------------------------
// DOM
// ------------------------------------------------------------

const keywords = document.querySelector("#keywords");
const movieContainer = document.querySelector("#movieContainer");
const searchBar = document.querySelector("#searchBar");
const searchButton = document.querySelector("#searchButton");

const leftArrow = document.querySelector("#left-arrow");
const rightArrow = document.querySelector("#right-arrow");

const resultsTitle = document.querySelector("#results-title");
const resultsCount = document.querySelector("#results-count");

const pagination = document.querySelector("#pagination");
const loading = document.querySelector("#loading");
const statusBox = document.querySelector("#status");
const emptyState = document.querySelector("#emptyState");

const movieModal = document.querySelector("#movieModal");
const modalBody = document.querySelector("#modalBody");
const closeModal = document.querySelector("#closeModal");
const modalBackdrop = document.querySelector("#modalBackdrop");

// ------------------------------------------------------------
// Initialisation
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  createGenreButtons();
  setupGenreScrolling();
  setupSearch();

  if (!hasApiKey()) {
    showStatus(
      "Add your new OMDb API key to script.js first. Replace YOUR_NEW_OMDB_API_KEY with the key from omdbapi.com.",
      true
    );

    renderMovies([]);
    return;
  }

  await loadHomeMovies();
}

// ------------------------------------------------------------
// API helpers
// ------------------------------------------------------------

function hasApiKey() {
  return API_KEY && API_KEY !== "b7d80182";
}

async function apiRequest(params) {
  const query = new URLSearchParams({
    apikey: API_KEY,
    ...params
  });

  const response = await fetch(`${API_URL}?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();

  if (data.Response === "False") {
    throw new Error(data.Error || "OMDb request failed.");
  }

  return data;
}

// Search endpoint.
// Returns summaries: Title, Year, imdbID, Type, Poster.
async function fetchMovieSearch(query, page = 1) {
  return apiRequest({
    s: query,
    page: String(page)
  });
}

// Detail endpoint.
// Used only for the current page / selected movie.
async function fetchMovieDetails(imdbID) {
  return apiRequest({
    i: imdbID,
    plot: "full"
  });
}

// ------------------------------------------------------------
// Homepage
// ------------------------------------------------------------

async function loadHomeMovies() {
  setLoading(true);
  hideStatus();

  try {
    const responses = await Promise.all(
      HOME_SEARCHES.map((query) =>
        fetchMovieSearch(query).catch(() => null)
      )
    );

    const summaries = responses
      .filter(Boolean)
      .flatMap((data) => data.Search || []);

    const uniqueMovies = dedupeMovies(summaries);

    // Keep the homepage deliberately small.
    // This prevents hundreds of detail requests.
    const selectedMovies = uniqueMovies.slice(0, 18);

    // Enrich ONLY these 18 movies so homepage genre filtering works.
    homeMovies = await enrichMovies(selectedMovies);

    baseMovies = homeMovies;
    activeFilter = "All Genres";
    currentMovies = [...homeMovies];

    currentSearchQuery = "";
    currentPage = 1;
    totalResults = homeMovies.length;

    updateResultsHeader("All Movies", currentMovies.length);
    renderMovies(currentMovies);
    renderPagination();

    if (homeMovies.length === 0) {
      showStatus("No homepage movies could be loaded. Check your OMDb API key.", true);
    }
  } catch (error) {
    console.error("Homepage error:", error);
    showStatus(error.message, true);
    renderMovies([]);
  } finally {
    setLoading(false);
  }
}

// ------------------------------------------------------------
// Search + Pagination
// ------------------------------------------------------------

async function searchMoviesFromAPI(query, page = 1) {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    return;
  }

  if (!hasApiKey()) {
    showStatus("Add your new OMDb API key to script.js first.", true);
    return;
  }

  const requestId = ++searchRequestId;

  setLoading(true);
  hideStatus();

  try {
    const data = await fetchMovieSearch(cleanQuery, page);

    if (requestId !== searchRequestId) {
      return;
    }

    currentSearchQuery = cleanQuery;
    currentPage = page;
    totalResults = Number(data.totalResults) || 0;

    const summaries = data.Search || [];

    // IMPORTANT:
    // OMDb gives at most 10 search results per page.
    // We enrich only these 10, NOT every movie in the search.
    searchMovies = await enrichMovies(summaries);

    if (requestId !== searchRequestId) {
      return;
    }

    baseMovies = searchMovies;

    // A new page keeps the selected genre if it is a real genre.
    // Liked Movies is kept separate because it is not a page filter.
    if (activeFilter === "♥ Liked Movies") {
      activeFilter = "All Genres";
    }

    applyActiveFilter();

    updateResultsHeader(
      `"${escapeTextForHeader(cleanQuery)}"`,
      currentMovies.length,
      totalResults
    );

    renderPagination();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  } catch (error) {
    console.error("Search error:", error);
    searchMovies = [];
    baseMovies = [];
    currentMovies = [];

    renderMovies([]);
    renderPagination();
    showStatus(error.message, true);
  } finally {
    if (requestId === searchRequestId) {
      setLoading(false);
    }
  }
}

function renderPagination() {
  pagination.innerHTML = "";

  // Pagination only makes sense for API search results.
  if (!currentSearchQuery || totalResults <= 10) {
    pagination.classList.add("hidden");
    return;
  }

  const totalPages = Math.ceil(totalResults / 10);

  const previousButton = createPaginationButton(
    "←",
    currentPage > 1,
    () => searchMoviesFromAPI(currentSearchQuery, currentPage - 1)
  );

  pagination.appendChild(previousButton);

  const pages = getVisiblePageNumbers(currentPage, totalPages);

  pages.forEach((pageNumber) => {
    if (pageNumber === "...") {
      const dots = document.createElement("span");
      dots.className = "page-info";
      dots.textContent = "…";
      pagination.appendChild(dots);
      return;
    }

    const button = createPaginationButton(
      String(pageNumber),
      true,
      () => searchMoviesFromAPI(currentSearchQuery, pageNumber)
    );

    if (pageNumber === currentPage) {
      button.classList.add("active");
      button.setAttribute("aria-current", "page");
    }

    pagination.appendChild(button);
  });

  const nextButton = createPaginationButton(
    "→",
    currentPage < totalPages,
    () => searchMoviesFromAPI(currentSearchQuery, currentPage + 1)
  );

  pagination.appendChild(nextButton);
}

function createPaginationButton(label, enabled, handler) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "page-button";
  button.textContent = label;
  button.disabled = !enabled;

  if (enabled) {
    button.addEventListener("click", handler);
  }

  return button;
}

function getVisiblePageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

// ------------------------------------------------------------
// Genre buttons + filtering
// ------------------------------------------------------------

function createGenreButtons() {
  keywords.innerHTML = "";

  GENRES.forEach((genre) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "genre-button";

    if (genre === "♥ Liked Movies") {
      button.classList.add("liked");
    }

    if (genre === activeFilter) {
      button.classList.add("active");
    }

    button.textContent = genre;

    button.addEventListener("click", () => {
      activeFilter = genre;

      document
        .querySelectorAll(".genre-button")
        .forEach((item) => item.classList.remove("active"));

      button.classList.add("active");

      applyActiveFilter();
    });

    keywords.appendChild(button);
  });
}

function applyActiveFilter() {
  if (activeFilter === "♥ Liked Movies") {
    currentMovies = [...likedMovies];

    updateResultsHeader("Liked Movies", currentMovies.length);
    renderMovies(currentMovies);

    // Liked movies are a local collection, not an OMDb search.
    pagination.classList.add("hidden");
    return;
  }

  if (activeFilter === "All Genres") {
    currentMovies = [...baseMovies];
  } else {
    currentMovies = baseMovies.filter((movie) =>
      movieMatchesGenre(movie, activeFilter)
    );
  }

  const title = currentSearchQuery
    ? `"${escapeTextForHeader(currentSearchQuery)}" · ${activeFilter}`
    : activeFilter;

  updateResultsHeader(title, currentMovies.length, currentSearchQuery ? totalResults : null);

  renderMovies(currentMovies);
  renderPagination();
}

function movieMatchesGenre(movie, genre) {
  if (!movie.Genre || movie.Genre === "N/A") {
    return false;
  }

  const movieGenres = movie.Genre
    .split(",")
    .map((item) => item.trim().toLowerCase());

  return movieGenres.includes(genre.toLowerCase());
}

// ------------------------------------------------------------
// Movie enrichment
// ------------------------------------------------------------

async function enrichMovies(movies) {
  const results = await Promise.all(
    movies.map(async (movie) => {
      try {
        const details = await fetchMovieDetails(movie.imdbID);

        return {
          ...movie,
          ...details
        };
      } catch (error) {
        // Keep the search result even if its detail request fails.
        console.warn(`Could not enrich ${movie.Title}:`, error);

        return {
          ...movie,
          Genre: movie.Genre || "N/A",
          imdbRating: movie.imdbRating || "N/A",
          Plot: movie.Plot || "Details unavailable."
        };
      }
    })
  );

  return results;
}

// ------------------------------------------------------------
// Rendering
// ------------------------------------------------------------

function renderMovies(movies) {
  movieContainer.innerHTML = "";
  emptyState.classList.toggle("hidden", movies.length !== 0);

  if (movies.length === 0) {
    return;
  }

  const fragment = document.createDocumentFragment();

  movies.forEach((movie) => {
    fragment.appendChild(createMovieCard(movie));
  });

  movieContainer.appendChild(fragment);
}

function createMovieCard(movie) {
  const card = document.createElement("article");
  card.className = "movie-card";

  const isLiked = likedMovies.some(
    (liked) => liked.imdbID === movie.imdbID
  );

  const poster = getPoster(movie.Poster);

  card.innerHTML = `
    <div class="poster-wrap">
      <img
        src="${poster}"
        alt="${escapeHTML(movie.Title)} poster"
        loading="lazy"
        onerror="this.src='${getFallbackPoster()}'"
      />
      <span class="type-badge">${escapeHTML(
        (movie.Type || "movie").toUpperCase()
      )}</span>
    </div>

    <div class="card-body">
      <h3 class="movie-title" title="${escapeHTML(movie.Title)}">
        ${escapeHTML(movie.Title)}
      </h3>

      <div class="movie-meta">
        <span>${escapeHTML(movie.Year || "N/A")}</span>
        <span>•</span>
        <span class="rating">
          ★ ${escapeHTML(movie.imdbRating || "N/A")}
        </span>
      </div>

      <div class="card-actions">
        <button
          class="like-button ${isLiked ? "liked" : ""}"
          type="button"
          data-action="like"
        >
          ${isLiked ? "♥ Liked" : "♡ Like"}
        </button>

        <button
          class="details-button"
          type="button"
          data-action="details"
        >
          Details
        </button>
      </div>
    </div>
  `;

  card.querySelector('[data-action="like"]').addEventListener("click", () => {
    toggleLike(movie);
  });

  card.querySelector('[data-action="details"]').addEventListener("click", () => {
    openMovieDetails(movie);
  });

  return card;
}

// ------------------------------------------------------------
// Details modal
// ------------------------------------------------------------

async function openMovieDetails(movie) {
  movieModal.classList.remove("hidden");
  movieModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  modalBody.innerHTML = `
    <div class="modal-loading">
      Loading ${escapeHTML(movie.Title)}...
    </div>
  `;

  try {
    const details = await fetchMovieDetails(movie.imdbID);
    const fullMovie = { ...movie, ...details };

    modalBody.innerHTML = createModalContent(fullMovie);
    setupModalLikeButton(fullMovie);
  } catch (error) {
    console.error("Details error:", error);

    modalBody.innerHTML = `
      <div class="modal-loading">
        Could not load movie details.
      </div>
    `;
  }
}

function createModalContent(movie) {
  const genres = movie.Genre && movie.Genre !== "N/A"
    ? movie.Genre.split(",").map((genre) => `
        <span class="modal-tag">${escapeHTML(genre.trim())}</span>
      `).join("")
    : `<span class="modal-tag">Genre unavailable</span>`;

  const liked = likedMovies.some(
    (item) => item.imdbID === movie.imdbID
  );

  return `
    <div class="modal-layout">
      <img
        class="modal-poster"
        src="${getPoster(movie.Poster)}"
        alt="${escapeHTML(movie.Title)} poster"
        onerror="this.src='${getFallbackPoster()}'"
      />

      <div>
        <span class="modal-type">
          ${(movie.Type || "movie").toUpperCase()}
        </span>

        <h2 class="modal-title" id="modalTitle">
          ${escapeHTML(movie.Title)}
        </h2>

        <p class="modal-meta">
          ${escapeHTML(movie.Year || "N/A")}
          · ${escapeHTML(movie.Runtime || "Runtime N/A")}
          ·
          <span class="modal-rating">
            ★ ${escapeHTML(movie.imdbRating || "N/A")}
          </span>
        </p>

        <div class="modal-section">
          <h4>GENRES</h4>
          <div class="modal-tags">${genres}</div>
        </div>

        <div class="modal-section">
          <h4>PLOT</h4>
          <p>${escapeHTML(movie.Plot || "Plot unavailable.")}</p>
        </div>

        <div class="modal-section">
          <h4>DIRECTOR</h4>
          <p>${escapeHTML(movie.Director || "N/A")}</p>
        </div>

        <div class="modal-section">
          <h4>CAST</h4>
          <p>${escapeHTML(movie.Actors || "N/A")}</p>
        </div>

        <button
          class="modal-like ${liked ? "liked" : ""}"
          id="modalLikeButton"
          type="button"
        >
          ${liked ? "♥ Liked" : "♡ Add to Likes"}
        </button>
      </div>
    </div>
  `;
}

function setupModalLikeButton(movie) {
  const button = document.querySelector("#modalLikeButton");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    toggleLike(movie);
    setupModalLikeButton(movie);
  });
}

function closeMovieModal() {
  movieModal.classList.add("hidden");
  movieModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

// ------------------------------------------------------------
// Likes + localStorage
// ------------------------------------------------------------

function loadLikedMovies() {
  try {
    const saved = localStorage.getItem("moviematch-liked");

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLikedMovies() {
  localStorage.setItem(
    "moviematch-liked",
    JSON.stringify(likedMovies)
  );
}

function toggleLike(movie) {
  const existingIndex = likedMovies.findIndex(
    (liked) => liked.imdbID === movie.imdbID
  );

  if (existingIndex !== -1) {
    likedMovies.splice(existingIndex, 1);
  } else {
    likedMovies.push(movie);
  }

  saveLikedMovies();

  // If the user is currently looking at liked movies,
  // immediately refresh that list.
  if (activeFilter === "♥ Liked Movies") {
    applyActiveFilter();
    return;
  }

  // Refresh current cards so the button changes immediately.
  renderMovies(currentMovies);
}

// ------------------------------------------------------------
// Search events
// ------------------------------------------------------------

function setupSearch() {
  searchButton.addEventListener("click", () => {
    searchMoviesFromAPI(searchBar.value, 1);
  });

  searchBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchMoviesFromAPI(searchBar.value, 1);
    }
  });
}

// ------------------------------------------------------------
// Genre arrow scrolling
// ------------------------------------------------------------

function setupGenreScrolling() {
  leftArrow.addEventListener("click", () => {
    keywords.scrollBy({
      left: -320,
      behavior: "smooth"
    });
  });

  rightArrow.addEventListener("click", () => {
    keywords.scrollBy({
      left: 320,
      behavior: "smooth"
    });
  });
}

// ------------------------------------------------------------
// UI helpers
// ------------------------------------------------------------

function setLoading(isLoading) {
  loading.classList.toggle("hidden", !isLoading);

  if (isLoading) {
    movieContainer.classList.add("hidden");
    emptyState.classList.add("hidden");
  } else {
    movieContainer.classList.remove("hidden");
  }
}

function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.remove("hidden");

  if (isError) {
    statusBox.style.borderColor = "#55303a";
    statusBox.style.background = "#1c0e13";
    statusBox.style.color = "#ff8fa5";
  } else {
    statusBox.style.borderColor = "#553f19";
    statusBox.style.background = "#1d180d";
    statusBox.style.color = "#f4cc6a";
  }
}

function hideStatus() {
  statusBox.classList.add("hidden");
}

function updateResultsHeader(title, visibleCount, total = null) {
  resultsTitle.textContent = title;

  if (total !== null && total !== undefined) {
    resultsCount.textContent = `${visibleCount} shown · ${total} total`;
  } else {
    resultsCount.textContent =
      `${visibleCount} ${visibleCount === 1 ? "movie" : "movies"}`;
  }
}

function getPoster(poster) {
  if (poster && poster !== "N/A") {
    return poster;
  }

  return getFallbackPoster();
}

function getFallbackPoster() {
  // Inline SVG means there is no missing ./assets/no-poster.jpg request.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="400" height="600" fill="#181c23"/>
      <text x="200" y="285" text-anchor="middle" fill="#727987" font-family="Arial" font-size="24">
        NO POSTER
      </text>
      <text x="200" y="320" text-anchor="middle" fill="#555c68" font-family="Arial" font-size="14">
        MovieMatch
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function dedupeMovies(movies) {
  const seen = new Set();

  return movies.filter((movie) => {
    if (!movie.imdbID || seen.has(movie.imdbID)) {
      return false;
    }

    seen.add(movie.imdbID);
    return true;
  });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeTextForHeader(value) {
  return value.replaceAll('"', '\\"');
}

// ------------------------------------------------------------
// Modal events
// ------------------------------------------------------------

closeModal.addEventListener("click", closeMovieModal);
modalBackdrop.addEventListener("click", closeMovieModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !movieModal.classList.contains("hidden")) {
    closeMovieModal();
  }
});
