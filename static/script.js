



// Function to generate a unique ID
function generateUniqueId(prefix) {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

// ScrollableFilter class for filters with many options
class ScrollableFilter {
    constructor(container, filterLabel, filterOptions, typediv , masterFilterDataDict) {
        this.masterFilterDataDict = masterFilterDataDict
        this.container = container;
        this.filterLabel = filterLabel;
        this.typediv = typediv
        this.filterOptions = filterOptions;
        this.createFilterBlock();
    }

    createFilterBlock() {
        const filterId = generateUniqueId('filter');
        
        // Create the filter block container
        const filterBlock = document.createElement('div');
        filterBlock.className = 'filter-block';
        
        // Create the filter label
        const labelElement = document.createElement('div');
        labelElement.className = 'filter-label';
        labelElement.textContent = this.filterLabel;
        labelElement.setAttribute('role', 'button');
        labelElement.setAttribute('tabindex', '0');
        labelElement.setAttribute('aria-expanded', 'true');
        labelElement.setAttribute('aria-controls', filterId);
        
        // Create the filter content container with scrollable class
        const contentElement = document.createElement('div');
        contentElement.id = filterId;
        contentElement.className = 'filter-content scrollable-content';
        
        if(this.typediv === "parentType"){
            // Create radio options for parent values
        this.filterOptions.forEach(option => {
            const radioId = generateUniqueId(`${this.filterLabel.toLowerCase().replace(/\s+/g, '-')}`);
            
            const optionElement = document.createElement('div');
            optionElement.className = 'filter-option';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = radioId;
            radio.name = this.filterLabel.toLowerCase().replace(/\s+/g, '-');
            radio.value = option.toLowerCase().replace(/\s+/g, '-');
            
            // Add event listener to show child filters when selected
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    renderChildFilters(option, this.masterFilterDataDict[option]);
                }
            });
            
            const optionLabel = document.createElement('label');
            optionLabel.setAttribute('for', radioId);
            optionLabel.textContent = option;
            
            optionElement.appendChild(radio);
            optionElement.appendChild(optionLabel);
            contentElement.appendChild(optionElement);
        });

        }else{
            // Create filter options
        this.filterOptions.forEach(option => {
            const checkboxId = generateUniqueId(`${this.filterLabel.toLowerCase().replace(/\s+/g, '-')}`);
            
            const optionElement = document.createElement('div');
            optionElement.className = 'filter-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.name = this.filterLabel.toLowerCase().replace(/\s+/g, '-');
            checkbox.value = option.toLowerCase().replace(/\s+/g, '-');
            
            const optionLabel = document.createElement('label');
            optionLabel.setAttribute('for', checkboxId);
            optionLabel.textContent = option;
            
            optionElement.appendChild(checkbox);
            optionElement.appendChild(optionLabel);
            contentElement.appendChild(optionElement);
        });
        }

        

        const counterElement = document.createElement('div');
        counterElement.className = 'filter-item-counter';
        counterElement.textContent = `${this.filterOptions.length} items`;
        
        filterBlock.appendChild(labelElement);
        filterBlock.appendChild(contentElement);
        filterBlock.appendChild(counterElement);
        this.container.appendChild(filterBlock);
    }
}

// // Function to create filter blocks from API data
// function renderFilter(masterFilterDataDict ,parentFiltervalues ) {
//     const filtersContainer = document.querySelector('.filters');
    
//     // Clear any existing filters
//     filtersContainer.innerHTML = '';
    
//     // Loop through each filter category in the API response
//     Object.entries(filterData).forEach(([filterLabel, filterOptions]) => {
//         // Use ScrollableFilter for categories with more than 10 options
//         if (filterOptions.length > 10) {
//             new ScrollableFilter(filtersContainer, filterLabel, filterOptions);
//         } else {
//             // Create a unique ID for this filter block
//             const filterId = generateUniqueId('filter');
            
//             // Create the filter block container
//             const filterBlock = document.createElement('div');
//             filterBlock.className = 'filter-block';
            
//             // Create the filter label
//             const labelElement = document.createElement('div');
//             labelElement.className = 'filter-label';
//             labelElement.textContent = filterLabel;
//             labelElement.setAttribute('role', 'button');
//             labelElement.setAttribute('tabindex', '0');
//             labelElement.setAttribute('aria-expanded', 'true');
//             labelElement.setAttribute('aria-controls', filterId);
            
//             // Create the filter content container
//             const contentElement = document.createElement('div');
//             contentElement.id = filterId;
//             contentElement.className = 'filter-content';
            
//             // Create filter options
//             filterOptions.forEach(option => {
//                 const checkboxId = generateUniqueId(`${filterLabel.toLowerCase().replace(/\s+/g, '-')}`);
                
//                 const optionElement = document.createElement('div');
//                 optionElement.className = 'filter-option';
                
//                 const checkbox = document.createElement('input');
//                 checkbox.type = 'checkbox';
//                 checkbox.id = checkboxId;
//                 checkbox.name = filterLabel.toLowerCase().replace(/\s+/g, '-');
//                 checkbox.value = option.toLowerCase().replace(/\s+/g, '-');
                
//                 const optionLabel = document.createElement('label');
//                 optionLabel.setAttribute('for', checkboxId);
//                 optionLabel.textContent = option;
                
//                 optionElement.appendChild(checkbox);
//                 optionElement.appendChild(optionLabel);
//                 contentElement.appendChild(optionElement);
//             });
            
//             filterBlock.appendChild(labelElement);
//             filterBlock.appendChild(contentElement);
//             filtersContainer.appendChild(filterBlock);
//         }
//     });
    
//     // Add event listeners to the newly created filter labels
//     addToggleEventListeners();
// }

function renderFilter(masterFilterDataDict, parentFiltervalues) {
    const filtersContainer = document.querySelector('.filters');
    
    // Clear any existing filters
    filtersContainer.innerHTML = '';
    
    // First, render parent filters as radio buttons
    Object.entries(parentFiltervalues).forEach(([parentLabel, parentOptions]) => {
    if (parentOptions.length > 6) {
        new ScrollableFilter(filtersContainer, parentLabel, parentOptions, "parentType" , masterFilterDataDict);
    } else {
        const parentFilterId = generateUniqueId('parent-filter');
        
        // Create parent filter block
        const parentFilterBlock = document.createElement('div');
        parentFilterBlock.className = 'filter-block parent-filter';
        
        // Create parent filter label
        const parentLabelElement = document.createElement('div');
        parentLabelElement.className = 'filter-label';
        parentLabelElement.textContent = parentLabel;
        
        // Create parent filter content
        const parentContentElement = document.createElement('div');
        parentContentElement.className = 'filter-content';
        
        // Create radio options for parent values
        parentOptions.forEach(option => {
            const radioId = generateUniqueId(`${parentLabel.toLowerCase().replace(/\s+/g, '-')}`);
            
            const optionElement = document.createElement('div');
            optionElement.className = 'filter-option';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = radioId;
            radio.name = parentLabel.toLowerCase().replace(/\s+/g, '-');
            radio.value = option;
            
            // Add event listener to show child filters when selected
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    renderChildFilters(option, masterFilterDataDict[option]);
                }
            });
            
            const optionLabel = document.createElement('label');
            optionLabel.setAttribute('for', radioId);
            optionLabel.textContent = option;
            
            optionElement.appendChild(radio);
            optionElement.appendChild(optionLabel);
            parentContentElement.appendChild(optionElement);
        });
        
        parentFilterBlock.appendChild(parentLabelElement);
        parentFilterBlock.appendChild(parentContentElement);
        filtersContainer.appendChild(parentFilterBlock);
    }
    });
    

        // Add toggle event listeners to the parent filters
        addToggleEventListeners();
}

// Function to render child filters when a parent is selected
function renderChildFilters(parentValue, childFilters) {

    // Get the filters container (must be available in the DOM)
    const filtersContainer = document.querySelector('.filters');
    
    if (!filtersContainer) {
        console.error('Filters container not found!');
        return;
    }


    // Remove any existing child filters
    document.querySelectorAll('.child-filter').forEach(el => el.remove());
    
    // Render each child filter category
    Object.entries(childFilters).forEach(([childLabel, childOptions]) => {
    if (childOptions.length > 6) {
        new ScrollableFilter(filtersContainer, childLabel, childOptions, "childType" , childFilters);
    } else {
        const childFilterId = generateUniqueId('child-filter');
        
        // Create child filter block
        const childFilterBlock = document.createElement('div');
        childFilterBlock.className = 'filter-block child-filter';
        
        // Create child filter label
        const childLabelElement = document.createElement('div');
        childLabelElement.className = 'filter-label';
        childLabelElement.textContent = childLabel;
        
        // Create child filter content
        const childContentElement = document.createElement('div');
        childContentElement.className = 'filter-content';
        
        // Create checkbox options for child values
        childOptions.forEach(option => {
            const checkboxId = generateUniqueId(`${childLabel.toLowerCase().replace(/\s+/g, '-')}`);
            
            const optionElement = document.createElement('div');
            optionElement.className = 'filter-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.name = childLabel.toLowerCase().replace(/\s+/g, '-');
            checkbox.value = option;
            
            const optionLabel = document.createElement('label');
            optionLabel.setAttribute('for', checkboxId);
            optionLabel.textContent = option;
            
            optionElement.appendChild(checkbox);
            optionElement.appendChild(optionLabel);
            childContentElement.appendChild(optionElement);
        });
        
        childFilterBlock.appendChild(childLabelElement);
        childFilterBlock.appendChild(childContentElement);
        filtersContainer.appendChild(childFilterBlock);
    }
    });

    
    // Add toggle event listeners to the new child filters
    addToggleEventListeners();
}


// Function to add toggle event listeners to filter labels
function addToggleEventListeners() {
    const filterLabels = document.querySelectorAll('.filter-label');
    
    filterLabels.forEach(label => {
        // Add click event listener
        label.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            const contentId = this.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            content.classList.toggle('hidden');
            this.setAttribute('aria-expanded', !content.classList.contains('hidden'));
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
    // Fetch filter data from API
    fetch('/api/filters')
        .then(response => response.json())
        .then(data => {

            const masterFilterDataDict = data[0]; // conatains nested dict parent_values as keys and value as (child_keys and their values)
            const parentFiltervalues = data[1];   // contains the data for the parent_values 


            // createFilterBlocks will first populate the parentFiltervalues as single seection radio and when 
            // - the selection is done based on selection value the corrosponding filters will be populated 
            renderFilter(masterFilterDataDict , parentFiltervalues );
            
        })
        .catch(error => {
            console.error('Error fetching filter data:', error);
        });



    // Price-filter functionality 

    const priceRangeSlider = document.getElementById('price-range');
    const minPriceToggle = document.getElementById('min-price-toggle');
    const maxPriceToggle = document.getElementById('max-price-toggle');
    const minPriceMenu = document.getElementById('min-price-menu');
    const maxPriceMenu = document.getElementById('max-price-menu');
    // const applyBtn = document.getElementById('apply-price');
    
    const priceOptions = [
        0, 100, 200, 300, 400, 500, 
        750, 1000, 1500, 2000, 2500, 3000
    ];
    
    // Create dropdown options
function createDropdownOptions(menu, isMaxMenu = false) {
    menu.innerHTML = '';
    
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
    
    if (isMaxMenu) {
        const plusItem = document.createElement('div');
        plusItem.className = 'price-dropdown-item';
        plusItem.textContent = '₹3000+';
        plusItem.dataset.value = '3000+';
        menu.appendChild(plusItem);
    }
}


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
            updateSliderFromDropdowns();
        }
    });
}

// Update slider from dropdowns
    function updateSliderFromDropdowns() {
        const minValue = minPriceToggle.dataset.value ? 
                         (minPriceToggle.dataset.value === '3000+' ? 3000 : 
                          parseInt(minPriceToggle.dataset.value)) : 0;
        priceRangeSlider.value = minValue;
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

    setupDropdownSelection(minPriceToggle, minPriceMenu);
    setupDropdownSelection(maxPriceToggle, maxPriceMenu);
    
    // Update dropdowns from slider
    priceRangeSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        minPriceToggle.textContent = `₹${value}`;
        minPriceToggle.dataset.value = value;
        
        const nextOption = priceOptions.find(opt => opt > value) || 3000;
        maxPriceToggle.textContent = `₹${nextOption}`;
        maxPriceToggle.dataset.value = nextOption;
    });

    // Handle apply button click
    // applyBtn.addEventListener('click', function() {
    //     const minPrice = minPriceToggle.dataset.value ? 
    //                     (minPriceToggle.dataset.value === '3000+' ? 3000 : 
    //                      parseInt(minPriceToggle.dataset.value)) : 0;
        
    //     const maxPrice = maxPriceToggle.dataset.value ? 
    //                     (maxPriceToggle.dataset.value === '3000+' ? null : 
    //                      parseInt(maxPriceToggle.dataset.value)) : null;
        
    //     if (maxPrice !== null && minPrice > maxPrice) {
    //         alert('Minimum price cannot be greater than maximum price');
    //         return;
    //     }
        
    //     console.log(`Applying price filter: ₹${minPrice} to ${maxPrice ? '₹' + maxPrice : 'Any'}`);
    //     // Here you would typically filter your product list
    // });

    // price functionality ends 


});