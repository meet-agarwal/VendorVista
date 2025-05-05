

// Function to generate a unique ID
function generateUniqueId(prefix) {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

// Function to create filter blocks from API data
function createFilterBlocks(filterData) {
    const filtersContainer = document.querySelector('.filters');
    
    // Clear any existing filters
    filtersContainer.innerHTML = '';
    
    // Loop through each filter category in the API response
    Object.entries(filterData).forEach(([filterLabel, filterOptions]) => {
        // Create a unique ID for this filter block
        const filterId = generateUniqueId('filter');
        
        // Create the filter block container
        const filterBlock = document.createElement('div');
        filterBlock.className = 'filter-block';
        
        // Create the filter label
        const labelElement = document.createElement('div');
        labelElement.className = 'filter-label';
        labelElement.textContent = filterLabel;
        labelElement.setAttribute('role', 'button');
        labelElement.setAttribute('tabindex', '0');
        labelElement.setAttribute('aria-expanded', 'true');
        labelElement.setAttribute('aria-controls', filterId);
        
        // Create the filter content container
        const contentElement = document.createElement('div');
        contentElement.id = filterId;
        contentElement.className = 'filter-content';
        
        // Create filter options
        filterOptions.forEach(option => {
            // Create a unique ID for this checkbox
            const checkboxId = generateUniqueId(`${filterLabel.toLowerCase().replace(/\s+/g, '-')}`);
            
            // Create the filter option container
            const optionElement = document.createElement('div');
            optionElement.className = 'filter-option';
            
            // Create the checkbox input
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.name = filterLabel.toLowerCase().replace(/\s+/g, '-');
            checkbox.value = option.toLowerCase().replace(/\s+/g, '-');
            
            // Create the label for the checkbox
            const optionLabel = document.createElement('label');
            optionLabel.setAttribute('for', checkboxId);
            optionLabel.textContent = option;
            
            // Append checkbox and label to the option element
            optionElement.appendChild(checkbox);
            optionElement.appendChild(optionLabel);
            
            // Append the option to the content container
            contentElement.appendChild(optionElement);
        });
        
        // Append label and content to the filter block
        filterBlock.appendChild(labelElement);
        filterBlock.appendChild(contentElement);
        
        // Append the filter block to the filters container
        filtersContainer.appendChild(filterBlock);
    });
    
    // Add event listeners to the newly created filter labels
    addToggleEventListeners();
}

// Function to add toggle event listeners to filter labels
function addToggleEventListeners() {
    const filterLabels = document.querySelectorAll('.filter-label');
    
    filterLabels.forEach(label => {
        // Add click event listener
        label.addEventListener('click', function() {
            // Toggle the collapsed class on the label
            this.classList.toggle('collapsed');
            
            // Get the content element using aria-controls
            const contentId = this.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            
            // Toggle the hidden class on the content
            content.classList.toggle('hidden');
            
            // Update ARIA attributes for accessibility
            const isExpanded = !content.classList.contains('hidden');
            this.setAttribute('aria-expanded', isExpanded);
        });
        
        // Add keyboard support for accessibility
        label.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', function() {

  
    fetch('/api/filters')
        .then(response => response.json())
        .then(data => {
            createFilterBlocks(data);
        })
        .catch(error => {
            console.error('Error fetching filter data:', error);
        });

        const priceRangeSlider = document.getElementById('price-range');
        const minPriceToggle = document.getElementById('min-price-toggle');
        const maxPriceToggle = document.getElementById('max-price-toggle');
        const minPriceMenu = document.getElementById('min-price-menu');
        const maxPriceMenu = document.getElementById('max-price-menu');
        const applyBtn = document.getElementById('apply-price');
        
        // Price options for dropdowns
        const priceOptions = [
            0, 100, 200, 300, 400, 500, 
            750, 1000, 1500, 2000, 2500, 3000
        ];
        
        // Create dropdown options
        function createDropdownOptions(menu, isMaxMenu = false) {
            menu.innerHTML = '';
            
            // Add "Any" option for max menu
            if (isMaxMenu) {
                const anyItem = document.createElement('div');
                anyItem.className = 'price-dropdown-item';
                anyItem.textContent = 'Any';
                anyItem.dataset.value = '';
                menu.appendChild(anyItem);
            }
            
            priceOptions.forEach(price => {
                const item = document.createElement('div');
                item.className = 'price-dropdown-item';
                item.textContent = `₹${price}`;
                item.dataset.value = price;
                menu.appendChild(item);
            });
            
            // Add "3000+" option for max menu
            if (isMaxMenu) {
                const plusItem = document.createElement('div');
                plusItem.className = 'price-dropdown-item';
                plusItem.textContent = '₹3000+';
                plusItem.dataset.value = '3000+';
                menu.appendChild(plusItem);
            }
        }
        
        // Initialize dropdowns
        createDropdownOptions(minPriceMenu);
        createDropdownOptions(maxPriceMenu, true);
        
        // Toggle dropdown menus
        [minPriceToggle, maxPriceToggle].forEach(toggle => {
            toggle.addEventListener('click', function() {
                const menu = this.nextElementSibling;
                document.querySelectorAll('.price-dropdown-menu').forEach(m => {
                    if (m !== menu) m.classList.remove('show');
                });
                menu.classList.toggle('show');
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.price-dropdown')) {
                document.querySelectorAll('.price-dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
        
        // Handle dropdown item selection
        function setupDropdownSelection(toggle, menu) {
            menu.addEventListener('click', function(e) {
                if (e.target.classList.contains('price-dropdown-item')) {
                    const value = e.target.dataset.value;
                    const displayText = value === '' ? (toggle === minPriceToggle ? 'Min' : 'Max') : 
                                        value === '3000+' ? '₹3000+' : `₹${value}`;
                    
                    toggle.textContent = displayText;
                    toggle.dataset.value = value;
                    this.classList.remove('show');
                    
                    // Update slider when dropdown changes
                    updateSliderFromDropdowns();
                }
            });
        }
        
        setupDropdownSelection(minPriceToggle, minPriceMenu);
        setupDropdownSelection(maxPriceToggle, maxPriceMenu);
        
        // Update dropdowns from slider
        priceRangeSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            minPriceToggle.textContent = `₹${value}`;
            minPriceToggle.dataset.value = value;
            
            // Auto-set max price to next higher option
            const nextOption = priceOptions.find(opt => opt > value) || 3000;
            maxPriceToggle.textContent = `₹${nextOption}`;
            maxPriceToggle.dataset.value = nextOption;
        });
        
        // Update slider from dropdowns
        function updateSliderFromDropdowns() {
            const minValue = minPriceToggle.dataset.value ? 
                             (minPriceToggle.dataset.value === '3000+' ? 3000 : 
                              parseInt(minPriceToggle.dataset.value)) : 0;
            priceRangeSlider.value = minValue;
        }
        
        // Handle apply button click
        applyBtn.addEventListener('click', function() {
            const minPrice = minPriceToggle.dataset.value ? 
                            (minPriceToggle.dataset.value === '3000+' ? 3000 : 
                             parseInt(minPriceToggle.dataset.value)) : 0;
            
            const maxPrice = maxPriceToggle.dataset.value ? 
                            (maxPriceToggle.dataset.value === '3000+' ? null : 
                             parseInt(maxPriceToggle.dataset.value)) : null;
            
            // Validate inputs
            if (maxPrice !== null && minPrice > maxPrice) {
                alert('Minimum price cannot be greater than maximum price');
                return;
            }
            
            console.log(`Applying price filter: ₹${minPrice} to ${maxPrice ? '₹' + maxPrice : 'Any'}`);
            
            // In a real application, you would:
            // 1. Store these values in your state management
            // 2. Filter your product list
            // 3. Update the UI to show filtered products
        });
    
}); 












  

