import { generateUniqueId } from './idUtils.js';
import { renderChildFilters } from './renderFilter.js';

export class ScrollableFilter {
  constructor(container, filterLabel, filterOptions, typediv, masterFilterDataDict) {
    this.masterFilterDataDict = masterFilterDataDict;
    this.container = container;
    this.filterLabel = filterLabel;
    this.typediv = typediv;
    this.filterOptions = filterOptions;
    this.createFilterBlock();
  }

  createFilterBlock() {
    // ... original logic for building the block

    
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
         contentElement.setAttribute('aria-labelledby', this.filterLabel );
        contentElement.setAttribute('role', 'group');
        
        if(this.typediv === "parentType"){
        // Create radio options for parent values

        // // Sort options alphabetically
        // this.filterOptions.sort((a, b) => a.localeCompare(b));

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
            // Sort options alphabetically
        this.filterOptions.sort((a, b) => String(a).localeCompare(String(b)));


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
