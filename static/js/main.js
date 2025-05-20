import { renderFilter } from './modules/renderFilter.js';
import { collectSelectedFilters } from './modules/filterCollector.js';
import { setupPriceFilter } from './modules/priceFilter.js';
import { getProductsData } from './modules/api.js';
import { showProducts, selectionManager } from './modules/cardGeneratorClass.js'
import { SettingsManager } from './modules/settingManager.js';
import { get_updated_filter_options, updateFilterUI } from './modules/checkboxHandler.js';
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

    const selectedTab = document.getElementById('SelectedProductsNavFront');
    const alltab = document.getElementById('AllProductsNavFront');

    if (selectedTab.checked) {
      const selectedData = selectionManager.getSelectedProducts();
      showProducts(selectedData, formattedKeys); // Show selected products
    } else if (alltab.checked) {
      showProducts(dataPro, formattedKeys); // Show all products
    }


  });

  fetch('/api/filters')
    .then(res => res.json())
    .then(([masterFilterDataDict, parentFiltervalues]) => {

      renderFilter(masterFilterDataDict, parentFiltervalues);

      console.log('Master Filter Data:', masterFilterDataDict);
      console.log('Parent Filter Values:', parentFiltervalues);


      if (Array.isArray(masterFilterDataDict) && masterFilterDataDict.length > 0) {
        const keys = Object.keys(masterFilterDataDict[0]);

      } else {
        console.warn('masterFilterDataDict is empty or invalid:', masterFilterDataDict);
      }

    })
    .catch(err => console.error('Error fetching filter data:', err));

  // setupPriceFilter();

  document.getElementById('apply_filters_button')?.addEventListener('click', async () => {
    const selectedFilters = collectSelectedFilters();
    console.log('Selected Filters:', selectedFilters);

    const productsData = await getProductsData(selectedFilters);
    console.log('Products to Display', productsData);

    let min = document.getElementById('filter-input-min').value;
    let max = document.getElementById('filter-input-max').value;

    const filtered = productsData.filter(item =>
      item["Start Price"] >= min &&
      item["Start Price"] <= max
    );

    console.log('Filtered Products - Price Filter:', filtered);

    // dataPro = productsData;
    dataPro = filtered;

    showProducts(filtered, settingKeys); // card generator call function 
  });


   // Reference to the dropdown element
    const dropdownElement = document.getElementById('sortDropdown');
    const placeholderOption = dropdownElement.options[0];

     // Sorting function: takes list and order ('highToLow' or 'lowToHigh')
    function sortItemsByStartPrice(list, order) {
      return list.slice().sort((a, b) => {
        const priceA = a['Start Price'];
        const priceB = b['Start Price'];
        return order === 'highToLow' ? priceB - priceA : priceA - priceB;
      });
    }

    dropdownElement.addEventListener('change', function(event) {
      const selectedIndex = event.target.selectedIndex;
      const selectedOption = event.target.options[selectedIndex];
      const selectedValue = selectedOption.value;
      const selectedText = selectedOption.text;

      // Update placeholder text
      placeholderOption.text = `Sort By: ${selectedText}`;

      // Reset selection back to placeholder
      dropdownElement.selectedIndex = 0;

      // Call your sorting function here based on selectedValue
      console.log('Sorting order chosen:', selectedValue);
      // e.g., sortItems(selectedValue);

     let sampledata = dataPro;
      // Perform sorting
      const sortedList = sortItemsByStartPrice(sampledata, selectedValue);
      console.log('Sorted List of Products :', sortedList);
      showProducts(sortedList, settingKeys); // card generator call function

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
    showProducts(dataPro, settingKeys);  // Shows all products again
  });

  // Event delegation for checkboxes
  document.addEventListener('click', async function (event) {
    const checkbox = event.target;

    // Only proceed if it's a checkbox inside .filter-option
    if (checkbox.type === 'checkbox' && checkbox.closest('.filter-option')) {
      const groupName = checkbox.name.trim(); // Trim to avoid name="gemstone " issues

      // Find the closest .filter-content container
      const filterContent = checkbox.closest('.filter-content');

      if (!filterContent) return;

      // Now only find checkboxes with the same name inside the same filter-content group
      // const groupCheckboxes = filterContent.querySelectorAll(
      //   `input[type="checkbox"][name="${groupName}"]`
      // );

      // const checkedValues = Array.from(groupCheckboxes)
      //   .filter(cb => cb.checked)
      //   .map(cb => cb.value);

      // const result = {};
      // result[groupName] = checkedValues;

      // Define all group names exactly as they appear in the name attributes
      const allGroups = [
        "gemstone",
        "ring-size",
        "ring size",
        "stone-creation",
        "main-stone-color",
        "main stone color",
        "main-stone-shape",
        "main stone shape",
        "style",
        "closure",
        "design",
        "stone creation",
        "start price"
      ];

      const result = {};

      // Loop over all groups and collect checked values
      allGroups.forEach(groupName => {
        const groupCheckboxes = document.querySelectorAll(
          `input[type="checkbox"][name="${groupName}"]`
        );

        const checkedValues = Array.from(groupCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);

        result[groupName] = checkedValues;
      });


      // Find the div with the specific radio group (aria-labelledby="Product", role="group")
      const productRadioContainer = document.querySelector('[aria-labelledby="Product"][role="group"]');
      if (productRadioContainer) {
        const selectedRadio = productRadioContainer.querySelector('input[type="radio"]:checked');
        if (selectedRadio) {
          const radioGroupName = selectedRadio.name.trim();
          const radioValue = selectedRadio.value;
          result[radioGroupName] = [radioValue]; // wrap value in array for consistency
        }
      }

      // Clean the result object before sending
      const cleanedResult = {};
      for (const [key, value] of Object.entries(result)) {
        if (Array.isArray(value) && value.length > 0) {
          cleanedResult[key] = value;
        }
      }

      console.log('Sending to backend:', cleanedResult);

      const dataDict = await get_updated_filter_options(cleanedResult);

      console.log('Updated Filter Options:', dataDict);

      updateFilterUI(dataDict, cleanedResult);
      // Update the UI with the new filter options  

    }
  });



});

