import { renderFilter } from './modules/renderFilter.js';
import { collectSelectedFilters } from './modules/filterCollector.js';
import { setupPriceFilter } from './modules/priceFilter.js';
import { getProductsData } from './modules/api.js';
import { showProducts , selectionManager } from './modules/cardGeneratorClass.js'
import { SettingsManager } from './modules/settingManager.js';
// Importing necessary modules

// declaring global variables 
window.selectionManager = selectionManager;


document.addEventListener('DOMContentLoaded', () => {

  let dataPro = []
  let settingKeys = ['Adjustable', 'Design', 'Gemstone', 'Metal']

  window.settingKeys = ['Adjustable', 'Design', 'Gemstone', 'Metal']

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
      
      settingKeys = formattedKeys;
      window.settingKeys = formattedKeys;

     const selectedTab = document.getElementById('SelectedProductsNavFront') ;
     const alltab = document.getElementById('AllProductsNavFront') ;

      if (selectedTab.checked) {
        const selectedData = selectionManager.getSelectedProducts();
        showProducts(selectedData, formattedKeys); // Show selected products
      }else if (alltab.checked) {
        showProducts(dataPro, formattedKeys); // Show all products
      }

   
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

    showProducts(productsData , settingKeys); // card generator call function 
  });

  document.getElementById("SelectedProductsNavFront")?.addEventListener("change", () => {
    const selectedData = selectionManager.getSelectedProducts();
    if (Object.keys(selectedData).length === 0) {
        document.getElementById('cards-container').textContent = 'No products selected';
        document.querySelector('.pagination_control_div').innerHTML = '';
    } else {
        showProducts(selectedData, settingKeys);
    }
});

  document.getElementById("AllProductsNavFront")?.addEventListener("change", () => {
      showProducts(dataPro , settingKeys);  // Shows all products again
  });

});