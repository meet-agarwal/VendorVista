import { renderFilter, childFilterGroupList } from './modules/renderFilter.js';
import { collectSelectedFilters } from './modules/filterCollector.js';
import { setupPriceFilter } from './modules/priceFilter.js';
import { getProductsData } from './modules/api.js';
import { showProducts, selectionManager } from './modules/cardGeneratorClass.js'
import { SettingsManager } from './modules/settingManager.js';
import { get_updated_filter_options, updateFilterUI } from './modules/checkboxHandler.js';
import { imageGetter } from './modules/ImageGetter.js';
import { loadTableOptions, updateTableOptions } from './modules/tableOptions.js';
// Importing necessary modules

// declaring global variables 
window.selectionManager = selectionManager;
let pdfBlobUrl = null;



document.addEventListener('DOMContentLoaded', () => {

  let dataPro = []
  let settingKeys = [];
  (async () => {
    settingKeys = await loadTableOptions();
    window.settingKeys = settingKeys;
  })();
  let imageDict = {}
  // settingKeys = [
  //   "Adjustable",
  //   "Design",
  //   "Gemstone",
  //   "Metal"
  // ]
  //   window.settingKeys = settingKeys;


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
      settingsManager.renderOptions(formattedOptions, settingKeys);
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
    (async () => {
      updateTableOptions(formattedKeys);
      console.log('Updated setting keys in front-end:', formattedKeys);
    })();
    window.settingKeys = formattedKeys;

    const selectedTab = document.getElementById('SelectedProductsNavFront');
    const alltab = document.getElementById('AllProductsNavFront');

    if (selectedTab.checked) {
      const selectedData = selectionManager.getSelectedProducts();
      showProducts(selectedData, formattedKeys, imageDict); // Show selected products
    } else if (alltab.checked) {
      showProducts(dataPro, formattedKeys, imageDict); // Show all products
    }


  });

const filtersLoaderOverlay = document.getElementById('filters-fullscreen-loader');
filtersLoaderOverlay.style.display = 'flex'; // Show the loader
  // Fetch filter data from the API
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

     filtersLoaderOverlay.style.display = 'none'; // Hide after filters render
  })
  .catch(err => {
    console.error('Error fetching filter data:', err);
    filtersLoaderOverlay.innerHTML = "<p>Failed to load filters. Please refresh.</p>";
  });
  // setupPriceFilter();

  document.getElementById('apply_filters_button')?.addEventListener('click', async () => {
    const selectedFilters = collectSelectedFilters();
    console.log('Selected Filters:', selectedFilters);

    const productsData = await getProductsData(selectedFilters);
    console.log('Products to Display', productsData);

    // let min = document.getElementById('filter-input-min').value;
    // let max = document.getElementById('filter-input-max').value;

    // const filtered = productsData.filter(item =>
    //   item["Start Price"] >= min &&
    //   item["Start Price"] <= max

    // );


    // console.log('Filtered Products - Price Filter:', filtered);

    // // dataPro = productsData;
    // dataPro = filtered;

    let ImageGetterDict = await imageGetter();
    console.log('ImageGetterDict:', ImageGetterDict);
    imageDict = ImageGetterDict;

    showProducts(productsData, settingKeys, ImageGetterDict); // to be removed later
    // showProducts(filtered, settingKeys, ImageGetterDict); // card generator call function

    const sorter = document.getElementById('sortDropdownContainer');
    sorter.style.display = 'flex'; // Show the sorting dropdown

    const printButton = document.getElementById('printButton');

    printButton.style.display = 'block';
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

  dropdownElement.addEventListener('change', function (event) {
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
    showProducts(sortedList, settingKeys, imageDict); // card generator call function

  });

  document.getElementById("SelectedProductsNavFront")?.addEventListener("change", () => {
    const selectedData = selectionManager.getSelectedProducts();
    if (Object.keys(selectedData).length === 0) {
      document.getElementById('cards-container').textContent = 'No products selected';
      document.querySelector('.pagination_control_div').innerHTML = '';
    } else {
      showProducts(selectedData, settingKeys, imageDict);
    }


  });

  document.getElementById("AllProductsNavFront")?.addEventListener("change", () => {
    showProducts(dataPro, settingKeys, imageDict);  // Shows all products again



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

      // Define all group names exactly as they appear in the name attributes
      const allGroups = childFilterGroupList;

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

  // assume all cards are rendered inside #cards-container
  const cardsContainer = document.getElementById('cards-container');

  cardsContainer.addEventListener('click', e => {
    // find the closest .card ancestor of whatever was clicked
    const card = e.target.closest('.card');
    if (!card) return;               // click was outside any card
    if (e.target.matches('input[type="checkbox"]')) return;  // let real checkbox clicks go through

    // find the checkbox inside this card, and toggle it
    const cb = card.querySelector('input[type="checkbox"]');
    if (cb) {
      cb.click();  // this toggles checked-state and fires existing handlers
    }
  });


  // inside printButton event listener
  printButton.addEventListener('click', async () => {
    const selectedData = selectionManager.getSelectedProducts();
    if (Object.keys(selectedData).length === 0) {
      alert('No product selected');
      return;
    }

    printButton.disabled = true;
    printButton.innerText = 'Wait...';

    try {
      // Generate default filename
      const now = new Date();
      const options = { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
      const readableTimestamp = now.toLocaleString('en-US', options)
        .replace(/[, ]/g, '_')     // replace commas and spaces with underscores
        .replace(/:/g, '-')        // replace colon with dash
        .replace(/__/g, '_');      // fix any double underscores

      const defaultFileName = `brochure_${readableTimestamp}.pdf`;

      // Fetch the generated PDF blob from the backend
      const response = await fetch('/save-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedData, imageDict })
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const pdfBlob = await response.blob();
      pdfBlobUrl = URL.createObjectURL(pdfBlob);

      // Create and auto-click a download link
      const a = document.createElement('a');
      a.href = pdfBlobUrl;
      a.download = defaultFileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);


      // Show confirmation dialog
      const overlay = document.getElementById('print_dailog_overlay');
      const dailogbox = document.getElementById('print_dailog');
      overlay.style.display = 'block';
      dailogbox.style.display = 'block';
      printButton.style.display = 'none';

    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save PDF');
    } finally {
      // Reset button state even if something failed
      printButton.disabled = false;
      printButton.innerText = 'Print';
    }
  });

  document.getElementById('openPdfBtn').addEventListener('click', () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank');
    }

    // Hide the dialog after opening
    document.getElementById('print_dailog_overlay').style.display = 'none';
    document.getElementById('print_dailog').style.display = 'none';
    const printButton = document.getElementById('printButton');
    printButton.disabled = false;
    printButton.innerText = 'Print';
    printButton.style.display = 'block';
  });

  document.getElementById('closeDialogBtn').addEventListener('click', () => {
    document.getElementById('print_dailog_overlay').style.display = 'none';
    document.getElementById('print_dailog').style.display = 'none';
    const printButton = document.getElementById('printButton');
    printButton.style.display = 'block';
    printButton.disabled = false;
    printButton.innerText = 'Print';

  });



  document.getElementById('clearAllButton').addEventListener('click', () => {
    selectionManager.clearSelections();
    document.getElementById('selectedCount').textContent = '0'; // Reset the counter
    console.log('All selections cleared');
    showProducts(dataPro, settingKeys, imageDict);
  });

});

