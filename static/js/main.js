import { renderFilter } from './modules/renderFilter.js';
import { collectSelectedFilters } from './modules/filterCollector.js';
import { setupPriceFilter } from './modules/priceFilter.js';
import { getProductsData } from './modules/api.js';
import {CardGenerator} from './modules/cardGeneratorClass.js'

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

    // 1. Define which keys you want to display in each card
  const keysToShow = ['Adjustable', 'Design', 'Gemstone', 'Metal'];

  // 2. Initialize the CardGenerator with your keys and container ID
  const cardGenerator = new CardGenerator(keysToShow, 'cards-container');
  // 4. Create and insert the cards
  cardGenerator.createCards(productsData, handleCheckboxChange);

  // Later, if you need to update the keys to display:
  // cardGenerator.setKeysToDisplay(['name', 'email', 'phone']);
  // cardGenerator.createCards(masterDict); // Recreate cards with new keys
  });

  

  // 3. Define your master dictionary (example data)  
  const masterDict = {
    'card1': {
      imageUrl: 'path/to/image1.jpg',
      name: 'John Doe',
      age: 32,
      email: 'john@example.com',
      department: 'Engineering',
      salary: 85000, // This won't be shown as not in keysToShow
      hireDate: '2020-01-15'
    },
    'card2': {
      imageUrl: 'path/to/image2.jpg',
      name: 'Jane Smith',
      age: 28,
      email: 'jane@example.com',
      department: 'Marketing',
      phone: '555-1234' // This won't be shown
    }
    // Add more cards as needed
  };

  // Optional: Define checkbox callback function
  function handleCheckboxChange(isChecked, cardId, cardData) {
    console.log(`Card ${cardId} ${isChecked ? 'selected' : 'deselected'}`, cardData);
  }

  
});
