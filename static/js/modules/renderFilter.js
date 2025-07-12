import { generateUniqueId } from './idUtils.js';
import { ScrollableFilter } from './ScrollableFilter.js';
import { addToggleEventListeners } from './toggleEvents.js';
import { get_updated_price_options } from './PriceFilterSlider.js'

export function renderFilter(masterFilterDataDict, parentFiltervalues) {
    // ... logic to render parent filter

    const filtersContainer = document.querySelector('.filters');

    // Clear any existing filters
    filtersContainer.innerHTML = '';

    // First, render parent filters as radio buttons
    Object.entries(parentFiltervalues).forEach(([parentLabel, parentOptions]) => {
        if (parentOptions.length > 6) {
            new ScrollableFilter(filtersContainer, parentLabel, parentOptions, "parentType", masterFilterDataDict);
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
            parentContentElement.setAttribute('aria-labelledby', parentLabel);
            parentContentElement.setAttribute('role', 'group');


            // Create radio options for parent values
            parentOptions.forEach(option => {
                const radioId = generateUniqueId(`${parentLabel.toLowerCase().replace(/\s+/g, '-')}`);

                const optionElement = document.createElement('div');
                optionElement.className = 'filter-option';

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.id = radioId;
                radio.name = parentLabel.toLowerCase().replace(/\s+/g, ' ');
                radio.value = option;

                // Add event listener to show child filters when selected
                radio.addEventListener('change', () => {
                    if (radio.checked) {
                        renderChildFilters(option, masterFilterDataDict[option]);
                        // Hide other child filters
                        get_updated_price_options(masterFilterDataDict[option]);

                        const PriceFilterDiv = document.querySelector('.price-filter');
                        PriceFilterDiv.style = "display: block";

                        const SubmitButton = document.getElementById('apply_filters_button');
                        SubmitButton.style = "display: block";

                        const checkNavTab = document.getElementById('SelectedProductsNavFront');
                        checkNavTab.disabled = false;
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

export let childFilterGroupList = [] ;

export function renderChildFilters(parentValue, childFilters) {
    // ... logic to render children

    const childFiltergroup = Object.keys(childFilters).map(key => key.toLowerCase());
    console.log('hello, childFilters are:', childFiltergroup);
    childFilterGroupList = childFiltergroup ; 



    const filtersContainer = document.querySelector('.filters');
    if (!filtersContainer) return;

    // Remove any existing child filters
    document.querySelectorAll('.child-filter').forEach(el => el.remove());

    // Render each child filter category
    Object.entries(childFilters).forEach(([childLabel, childOptions]) => {
        if (childLabel === 'Start Price') return; // Skip if child label is 'startPrice'

        // Sort child options alphabetically
        childOptions.sort((a, b) => String(a).localeCompare(String(b)));

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
        childContentElement.setAttribute('aria-labelledby', childLabel);
        childContentElement.setAttribute('role', 'group');

        // Create checkbox options
        childOptions.forEach(option => {
            const checkboxId = generateUniqueId(`${childLabel.toLowerCase().replace(/\s+/g, '-')}`);

            const optionElement = document.createElement('div');
            optionElement.className = 'filter-option';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.name = childLabel.toLowerCase().replace(/\s+/g, ' ');
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
