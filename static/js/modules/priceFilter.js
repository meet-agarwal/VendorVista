const priceOptions = [
    0, 100, 200, 300, 400, 500,
    750, 1000, 1500, 2000, 2500, 3000
];

export function setupPriceFilter() {
    // Setup price slider, dropdowns, and interaction logic


    // Price-filter functionality 

    const priceRangeSlider = document.getElementById('price-range');
    const minPriceToggle = document.getElementById('min-price-toggle');
    const maxPriceToggle = document.getElementById('max-price-toggle');
    const minPriceMenu = document.getElementById('min-price-menu');
    const maxPriceMenu = document.getElementById('max-price-menu');
    // const applyBtn = document.getElementById('apply-price');

    

    // Initialize dropdowns
    createDropdownOptions(minPriceMenu);
    createDropdownOptions(maxPriceMenu, true);

    // Toggle dropdown menus
    [minPriceToggle, maxPriceToggle].forEach(toggle => {
        toggle.addEventListener('click', function () {
            const menu = this.nextElementSibling;
            document.querySelectorAll('.price-dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.remove('show');
            });
            menu.classList.toggle('show');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.price-dropdown')) {
            document.querySelectorAll('.price-dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    setupDropdownSelection(minPriceToggle, minPriceMenu);
    setupDropdownSelection(maxPriceToggle, maxPriceMenu);

    // Update dropdowns from slider
    priceRangeSlider.addEventListener('input', function () {
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
}

// Create dropdown options
function createDropdownOptions(menu, isMaxMenu = false ) {
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
    menu.addEventListener('click', function (e) {
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