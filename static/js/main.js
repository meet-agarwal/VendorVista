import { renderFilter } from './modules/renderFilter.js';
import { collectSelectedFilters } from './modules/filterCollector.js';
import { setupPriceFilter } from './modules/priceFilter.js';
import { getProductsData } from './modules/api.js';

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/filters')
    .then(res => res.json())
    .then(([masterFilterDataDict, parentFiltervalues]) => {
      renderFilter(masterFilterDataDict, parentFiltervalues);
    })
    .catch(err => console.error('Error fetching filter data:', err));

    setupPriceFilter();

  document.getElementById('apply_filters_button')?.addEventListener('click', async () => {
    const selectedFilters = collectSelectedFilters();
    console.log('Selected Filters:', selectedFilters);

    const productsData = await getProductsData(selectedFilters);
    console.log('Products to Display', productsData);
  });
});
