// templateSelector.js

import { pageData , editedPage , loadTemplates , links, config } from './editorMain.js' ; 

export function createTemplateCard(template, descKeys) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const pageType = config.page;
  const mode = config.mode;

  const imgBase = links.images[mode][pageType];

  const metaItems = descKeys
  .filter(key => template[key] !== undefined && template[key] !== null && template[key] !== '')
  .map(key =>
    key === 'products'
      ? `<span>${template[key]} Products</span>`
      : `<span>${template[key]}</span>`
  )
  .join('');

  card.innerHTML = `
              <div class="product-card-img">
                <img src="${imgBase}/${template.image}" alt="${template.displayName}">
              </div>
              <div class="product-card-body">
                <div class="product-card-title">${template.name}</div>
                <div class="product-card-meta">${metaItems}</div>
                <div class="product-card-buttons">
                  <button class="preview-btn">Preview</button>
                  <button class="select-btn">Select</button>
                  <button class="edit-btn">Edit</button>
                </div>
    </div>
  `;

  // Button Event Bindings
  card.querySelector('.preview-btn')
    .addEventListener('click', () => previewTemplate(template.pdf, mode, pageType));

  card.querySelector('.select-btn')
    .addEventListener('click', () => selectTemplate(template));

  card.querySelector('.edit-btn')
    .addEventListener('click', () => EditTemplate(template.id));

  return card;
}


export function initializeFilters(filters) {
  const filtersContainer = document.getElementById('filters_section_tray');

  // Clear any existing content (optional)
  filtersContainer.innerHTML = '';

  // Create dropdowns for each filter category
  Object.entries(filters).forEach(([filterName, filterValues]) => {
    const select = document.createElement('select');
    select.className = 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    select.dataset.filterType = filterName;

    // Create "All" option
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = `All ${filterName.charAt(0).toUpperCase() + filterName.slice(1)}`;
    select.appendChild(allOption);

    // Create options for each filter value
    filterValues.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });

    filtersContainer.appendChild(select);
  });

  // Add event listeners to all dropdowns
  const dropdowns = filtersContainer.querySelectorAll('select');
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('change', () => {
      applyFilters( );
    });
  });
}

function applyFilters() {
  const gridContainer = document.querySelector('.product-grid');
  const dropdowns = document.querySelectorAll('#filters_section_tray select');
  const activeFilters = {};

  // Collect all active filters from dropdowns
  dropdowns.forEach(dropdown => {
    const filterType = dropdown.dataset.filterType;
    const selectedValue = dropdown.value;

    if (selectedValue) {
      activeFilters[filterType] = selectedValue;
    }
  });

  config.filter = activeFilters;
  console.log("Active Filters:", config.filter);

  // Get correct dataset based on mode
  let currentData = config.mode === 'edited'
    ? editedPage[config.page]
    : pageData[config.page];


  // Load filtered templates
  loadTemplates(currentData);
}
