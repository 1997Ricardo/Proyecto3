import './style.css'

// main.js

const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const gallery = document.getElementById('gallery');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageIndicator = document.getElementById('pageIndicator');

// REFERENCIA AL TOGGLE DE TEMA
const themeToggleCheckbox = document.getElementById('themeToggle');

// VARIABLES DE ESTADO PARA BÚSQUEDA/PAGINACIÓN
let currentQuery = '';
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

/**
 * Crea una tarjeta de foto (<a><img/></a>) usando los datos de Unsplash
 */
function createPhotoCard(photo) {
  const link = document.createElement('a');
  link.href = photo.links.html;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'photo-card';

  const img = document.createElement('img');
  img.src = photo.urls.small;
  img.alt = photo.alt_description || 'Foto sin descripción';
  img.loading = 'lazy';

  link.appendChild(img);
  return link;
}

/**
 * Muestra un mensaje de error y deshabilita los controles de paginación
 */
function showError(message) {
  gallery.innerHTML = '';
  const errorEl = document.createElement('p');
  errorEl.className = 'error-message';
  errorEl.textContent = `¡Ups! ${message}`;
  gallery.appendChild(errorEl);

  prevBtn.disabled = true;
  nextBtn.disabled = true;
  pageIndicator.textContent = '';
}

/**
 * Actualiza el estado (habilitado/deshabilitado) de los botones
 * de paginación y el texto del indicador de página.
 */
function updatePaginationControls() {
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
}

/**
 * Función principal para hacer fetch a Unsplash.
 * @param {string} query — Término a buscar.
 * @param {number} page — Página a solicitar.
 * @param {boolean} forceReset — Si true, limpiamos la galería antes de pintar.
 */
async function fetchPhotos(query, page = 1, forceReset = false) {
  if (isLoading) return;
  isLoading = true;

  if (page === 1 || forceReset) {
    gallery.innerHTML = '';
  }

  const loadingEl = document.createElement('p');
  loadingEl.textContent = 'Cargando imágenes…';
  loadingEl.className = 'loading-message';
  gallery.appendChild(loadingEl);

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?page=${page}&per_page=20&query=${encodeURIComponent(query)}&client_id=${accessKey}`
    );
    if (!response.ok) {
      throw new Error(`Código ${response.status}`);
    }
    const data = await response.json();

    totalPages = data.total_pages;

    if (data.results.length === 0 && page === 1) {
      showError('No se encontraron imágenes para esa búsqueda.');
      return;
    }

    if (page > totalPages) {
      return;
    }

    const loadingNode = document.querySelector('.loading-message');
    if (loadingNode) loadingNode.remove();

    data.results.forEach(photo => {
      const card = createPhotoCard(photo);
      gallery.appendChild(card);
    });

    currentPage = page;
    updatePaginationControls();
  } catch (err) {
    showError(`Error en la petición: ${err.message}`);
  } finally {
    isLoading = false;
  }
}

/**
 * Listener para el formulario de búsqueda:
 * reinicia todo (página 1) y hace fetch de la nueva query.
 */
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const keyword = searchInput.value.trim();
  if (!keyword) return;

  currentQuery = keyword;
  currentPage = 1;
  totalPages = 1;
  fetchPhotos(currentQuery, 1, true);
});

/**
 * Listeners de los botones de paginación:
 */
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    fetchPhotos(currentQuery, currentPage - 1, true);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages) {
    fetchPhotos(currentQuery, currentPage + 1, true);
  }
});

/**
  TOGGLE DE TEMA 
 */

function applyTheme(isOscuro) {
  if (isOscuro) {
    document.body.classList.add('Oscuro');
    localStorage.setItem('theme', 'Oscuro');
  } else {
    document.body.classList.remove('Oscuro');
    localStorage.setItem('theme', 'Claro');
  }
}


window.addEventListener('DOMContentLoaded', () => {
  // 1. GESTIÓN DE TEMA
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'Oscuro') {
    themeToggleCheckbox.checked = true;
    applyTheme(true);
  } else {
    themeToggleCheckbox.checked = false;
    applyTheme(false);
  }

  // 2. BÚSQUEDA INICIAL
  const defaultKeyword = searchInput.value.trim() || 'leones';
  currentQuery = defaultKeyword;
  fetchPhotos(currentQuery, 1, true);
});


themeToggleCheckbox.addEventListener('change', (e) => {
  applyTheme(e.target.checked);
});
