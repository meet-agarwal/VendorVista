



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
    const filtersContainer = document.querySelector('.filters');
    if (!filtersContainer) return;

    // Remove any existing child filters
    document.querySelectorAll('.child-filter').forEach(el => el.remove());
    
    // Render each child filter category
    Object.entries(childFilters).forEach(([childLabel, childOptions]) => {
        const childFilterId = generateUniqueId('child-filter');
        
        // Create child filter block
        const childFilterBlock = document.createElement('div');
        childFilterBlock.className = 'filter-block child-filter';
        
        // Create child filter label
        const childLabelElement = document.createElement('div');
        childLabelElement.className = 'filter-label';
        childLabelElement.textContent = childLabel;
        childLabelElement.setAttribute('role', 'button');
        childLabelElement.setAttribute('tabindex', '0');
        childLabelElement.setAttribute('aria-expanded', 'true');
        childLabelElement.setAttribute('aria-controls', childFilterId);
        
        // Create child filter content with scrollable class (always scrollable)
        const childContentElement = document.createElement('div');
        childContentElement.id = childFilterId;
        childContentElement.className = 'filter-content scrollable-content';
        
        // Create checkbox options
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
        
        // Add item counter (always shown)
        const counterElement = document.createElement('div');
        counterElement.className = 'filter-item-counter';
        counterElement.textContent = `${childOptions.length} items`;
        
        childFilterBlock.appendChild(childLabelElement);
        childFilterBlock.appendChild(childContentElement);
        childFilterBlock.appendChild(counterElement);
        filtersContainer.appendChild(childFilterBlock);
    });

    // Add toggle event listeners
    setTimeout(() => addToggleEventListeners(), 10);
}

    // Function to add toggle event listeners to filter labels
    function addToggleEventListeners() {
        // First remove all existing listeners
        document.querySelectorAll('.filter-label[data-has-listener]').forEach(label => {
            label.replaceWith(label.cloneNode(true));
        });
    
        document.querySelectorAll('.filter-label').forEach(label => {
            label.setAttribute('data-has-listener', 'true');
            
            const handler = function() {
                const contentId = this.getAttribute('aria-controls');
                const content = contentId ? document.getElementById(contentId) : null;
                
                if (content) {
                    const wasExpanded = this.getAttribute('aria-expanded') === 'true';
                    this.setAttribute('aria-expanded', !wasExpanded);
                    this.classList.toggle('collapsed');
                    content.classList.toggle('hidden');
                }
            };
            
            label.addEventListener('click', handler);
            label.addEventListener('keydown', function(e) {
                if (['Enter', ' '].includes(e.key)) {
                    e.preventDefault();
                    handler.call(this);
                }
            });
        });
    }

    // Function to collect all selected filters
function collectSelectedFilters() {
    const selectedFilters = {
        // price: {
        //     min: minPriceToggle.dataset.value || '0',
        //     max: maxPriceToggle.dataset.value || '3000+'
        // },
        parent: {},
        child: {}
    };

    // Get selected parent filter (radio button)
    const parentFilter = document.querySelector('.filter-block input[type="radio"]:checked');
    if (parentFilter) {
        selectedFilters.parent = {
            name: parentFilter.name,
            value: parentFilter.value
        };
    }

    // Get all selected child filters (checkboxes)
    document.querySelectorAll('.child-filter input[type="checkbox"]:checked').forEach(checkbox => {
        const filterName = checkbox.name;
        if (!selectedFilters.child[filterName]) {
            selectedFilters.child[filterName] = [];
        }
        selectedFilters.child[filterName].push(checkbox.value);
    });

    return selectedFilters;
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


    // COLLECT THE FILTER CHECKED OPTIONS 

    // Add event listener for Apply Filters button
    document.getElementById('apply_filters_button')?.addEventListener('click', async function() {
        const selectedFilters = collectSelectedFilters();
        console.log('Selected Filters:', selectedFilters);

        const productsData = getProductsData(selectedFilters) ; 
        console.log("Products to Display", productsData)  ;
        
        // Here you would typically send this data to your backend
        // or use it to filter products on the frontend
        // For example:
        // filterProducts(selectedFilters);
    });


});

async function getProductsData(file) {
    try {
        const selectedFilters = file ; 

        const response = await fetch('/api/getProducts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedFilters) 
        });

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong!");
        }
        const data = await response.json(); // Convert response to JSON        

        return data ;

    } catch (error) {
        console.error('Error in getting Products Detials:', error);
        throw error
    }
  }