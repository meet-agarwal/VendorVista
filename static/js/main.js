import { renderFilter } from './modules/renderFilter.js';
import { collectSelectedFilters } from './modules/filterCollector.js';
import { setupPriceFilter } from './modules/priceFilter.js';
import { getProductsData } from './modules/api.js';
import { showProducts } from './modules/cardGeneratorClass.js'
import { SettingsManager } from './modules/settingManager.js';

document.addEventListener('DOMContentLoaded', () => {

  let dataPro = []

  const settingsManager = new SettingsManager(
    '.settings-btn',        // Button to open popup
    '.settings-popup',      // Popup container
    '.popup-content',       // Content area for checkboxes
    '#setting_submit',      // Submit button (adjust selector if needed)
    '/api/settings/options' // API endpoint for options
  );

  settingsManager.fetchOptions()
    .then(options => {
      // Transform string array into {id, label} objects
      const formattedOptions = options.map(option => ({
        id: option.toLowerCase().replace(/\s+/g, '_'),
        label: option
      }));
      settingsManager.renderOptions(formattedOptions);
    })
    .catch(error => console.error('Settings error:', error));

    document.getElementById('setting_submit')?.addEventListener('click', () => {
      const selectedOptions = settingsManager.handleSubmit();
      console.log('Selected settings:', selectedOptions);
      
      // Transform keys to match your data structure (capitalize first letter)
      const formattedKeys = selectedOptions.map(key => 
          key.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
      );
      
      showProducts(dataPro, formattedKeys);
  });

  fetch('/api/filters')
    .then(res => res.json())
    .then(([masterFilterDataDict, parentFiltervalues]) => {

      renderFilter(masterFilterDataDict, parentFiltervalues);

      if (Array.isArray(masterFilterDataDict) && masterFilterDataDict.length > 0) {
        const keys = Object.keys(masterFilterDataDict[0]);

      } else {
        console.warn('masterFilterDataDict is empty or invalid:', masterFilterDataDict);
      }

    })
    .catch(err => console.error('Error fetching filter data:', err));

  setupPriceFilter();

  document.getElementById('apply_filters_button')?.addEventListener('click', async () => {
    const selectedFilters = collectSelectedFilters();
    console.log('Selected Filters:', selectedFilters);

    const productsData = await getProductsData(selectedFilters);
    console.log('Products to Display', productsData);

    dataPro = productsData ;

    showProducts(productsData);
  });


  // const settingsBtn = document.querySelector('.settings-btn');
  // const settingsPopup = document.querySelector('.settings-popup');

  // settingsBtn.addEventListener('click', function(e) {
  //   e.stopPropagation();
  //   settingsPopup.classList.toggle('show');
  // });

  // document.addEventListener('click', function() {
  //   settingsPopup.classList.remove('show');
  // });

  // settingsPopup.addEventListener('click', function(e) {
  //   e.stopPropagation();
  // });






});