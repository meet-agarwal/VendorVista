/**
 * CardGenerator - A class to create styled cards with images and data tables
 */

/**
 * CardGenerator - A class to create styled cards with images and data tables
 */
export class CardGenerator {
    constructor(keysToDisplay, containerId) {
        this.keysToDisplay = keysToDisplay;
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with ID '${containerId}' not found`);
        }

        // Pagination state
        this.cardsPerPage = 30;
        this.currentPage = 1;
        this.masterData = {};
        this.checkboxCallback = null;
    }

    setKeysToDisplay(newKeys) {
        this.keysToDisplay = newKeys;
    }

    createCards(masterDict, checkboxCallback = null) {
        this.masterData = masterDict;
        this.checkboxCallback = checkboxCallback;
        this.currentPage = 1;
        this._renderCurrentPage();
    }

    // PRIVATE METHODS

    _renderCurrentPage() {
        this.container.innerHTML = '';

        const entries = Object.entries(this.masterData);
        const totalPages = Math.ceil(entries.length / this.cardsPerPage);

        // If no data, show message
        if (entries.length === 0) {
            this.container.textContent = 'No products to display';
            return;
        }

        const startIdx = (this.currentPage - 1) * this.cardsPerPage;
        const endIdx = startIdx + this.cardsPerPage;
        const pageEntries = entries.slice(startIdx, endIdx);

        for (const [cardId, cardData] of pageEntries) {
            const card = this._createCardElement( cardData, this.checkboxCallback);
            this.container.appendChild(card);
        }

        // only render pagination if there are multiple pages
        if (totalPages > 1) {
            this._renderPaginationControls(totalPages);
        }
    }

    _renderPaginationControls(totalPages) {

       


        const paginationWrapper = document.querySelector('.pagination_control_div');
        if (!paginationWrapper) return;
    
        paginationWrapper.innerHTML = ''; // Clear previous pagination controls
    
        const pagination = document.createElement('div');
        pagination.className = 'pagination-controls';
    
        const createPageButton = (text, page, disabled = false) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.disabled = disabled;
        
            if (!disabled && page !== this.currentPage) {
                btn.onclick = () => {
                    this.currentPage = page;
                    this._renderCurrentPage();
        
                    // Scroll to top of product grid or page
                    const grid = document.getElementById('cards-container');
                    if (grid) {
                        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                };
            } else if (page === this.currentPage) {
                btn.classList.add('active');
            }
            return btn;
        };
        
        // Prev button
        pagination.appendChild(createPageButton('Prev', this.currentPage - 1, this.currentPage === 1));
    
        const visiblePages = this._getVisiblePages(totalPages);
    
        visiblePages.forEach(p => {
            pagination.appendChild(createPageButton(p, p, p === this.currentPage));
        });
    
        // Next button
        pagination.appendChild(createPageButton('Next', this.currentPage + 1, this.currentPage === totalPages));
    
        // Page X of Y info
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages.toLocaleString()}`;
        pageInfo.style.marginLeft = '12px';
        pageInfo.style.fontWeight = '500';
        pageInfo.style.color = '#555';
        pagination.appendChild(pageInfo);
    
        paginationWrapper.appendChild(pagination);
    }
    
    // _getVisiblePages(totalPages) {
    //     const pages = [];
    //     const maxVisible = 10;
    //     let startPage, endPage;
    
    //     if (totalPages <= maxVisible) {
    //         startPage = 1;
    //         endPage = totalPages;
    //     } else {
    //         if (this.currentPage <= 5) {
    //             startPage = 1;
    //             endPage = 10;
    //         } else if (this.currentPage + 4 >= totalPages) {
    //             startPage = totalPages - 9;
    //             endPage = totalPages;
    //         } else {
    //             startPage = this.currentPage - 4;
    //             endPage = this.currentPage + 5;
    //         }
    //     }
    
    //     for (let i = startPage; i <= endPage; i++) {
    //         pages.push(i);
    //     }
    
    //     return pages;
    // }

    _getVisiblePages(totalPages) {
    const pages = [];
    const maxVisible = 10;
    
    // If total pages is less than or equal to maxVisible, show all pages
    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }
    
    // Calculate start and end pages for the visible range
    let startPage, endPage;
    
    // Current page is in the first 5 pages
    if (this.currentPage <= 5) {
        startPage = 1;
        endPage = maxVisible;
    } 
    // Current page is in the last 5 pages
    else if (this.currentPage >= totalPages - 4) {
        startPage = totalPages - maxVisible + 1;
        endPage = totalPages;
    } 
    // Current page is somewhere in the middle
    else {
        startPage = this.currentPage - Math.floor(maxVisible / 2);
        endPage = this.currentPage + Math.floor(maxVisible / 2) - 1;
    }
    
    // Ensure we don't go below page 1
    startPage = Math.max(startPage, 1);
    // Ensure we don't go beyond total pages
    endPage = Math.min(endPage, totalPages);
    
    // Generate the page numbers
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    
    return pages;
}

    // /**
    //  * Creates a single card element
    //  * @private
    //  * @param {string} cardId - Unique identifier for the card
    //  * @param {Object} cardData - Data object containing card information
    //  * @param {Function} checkboxCallback - Callback for checkbox events
    //  * @returns {HTMLElement} The created card element
    //  **/
    _createCardElement( cardData, checkboxCallback) {
        // Create main card container
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.cardId = cardData._id;
        
        // Create image section (top half of card)
        const imageSection = this._createImageSection(cardData, checkboxCallback);
        card.appendChild(imageSection);

        // Create table section (bottom half of card)
        const tableSection = this._createTableSection(cardData);
        card.appendChild(tableSection);

        return card;
    }


    //     /**
    //      * Creates the image section with checkbox
    //      * @private
    //      * @param {string} cardId - Unique identifier for the card
    //      * @param {Object} cardData - Data object containing card information
    //      * @param {Function} checkboxCallback - Callback for checkbox events
    //      * @returns {HTMLElement} The created image section
    //      */  
    _createImageSection( cardData, checkboxCallback) {
        const imageSection = document.createElement('div');
        imageSection.className = 'card-image-section';

        // Create and add image if available
        if (cardData.imageUrl) {
            const img = document.createElement('img');
            img.src = cardData.imageUrl;
            img.alt = cardData.title || 'Card Image';
            imageSection.appendChild(img);
        } else {
            // Placeholder if no image
            imageSection.style.backgroundColor = '#f0f0f0';
            imageSection.style.minHeight = '150px';
            imageSection.textContent = 'No Image Available';
        }
        
        // fetch the cardId from the cardData 
        const cardId = cardData._id;

        // Create and add checkbox
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'card-checkbox-container';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `card-checkbox-${cardId}`;
        checkbox.className = 'card-checkbox';

        // Check if this product is already selected
        if (window.selectionManager && window.selectionManager.isProductSelected(cardId)) {
            checkbox.checked = true;
        }


        // Add callback if provided
        if (checkboxCallback) {
            checkbox.addEventListener('change', (e) => {
                checkboxCallback(e.target.checked, cardId, cardData);
            });
        }

        checkboxContainer.appendChild(checkbox);
        imageSection.appendChild(checkboxContainer);

        return imageSection;
    }

    //     /**
    //      * Creates the table section with card details
    //      * @private
    //      * @param {Object} cardData - Data object containing card information
    //      * @returns {HTMLElement} The created table section
    //      */
    _createTableSection(cardData) {
        const tableSection = document.createElement('div');
        tableSection.className = 'card-table-section';

        // Create table element
        const table = document.createElement('table');

        // Add rows for each key we want to display
        this.keysToDisplay.forEach(key => {
            if (cardData.hasOwnProperty(key)) {
                const row = table.insertRow();

                // Add key cell
                const keyCell = row.insertCell(0);
                keyCell.textContent = `${key}:`;
                keyCell.className = 'key-cell';

                // Add value cell
                const valueCell = row.insertCell(1);
                valueCell.textContent = cardData[key];
                valueCell.className = 'value-cell';
            }
        });

        tableSection.appendChild(table);
        return tableSection;
    }
}

// export  function showProducts(productsData ,keysList) {
//     // 1. Define which keys you want to display in each card
//     const keys = ['Adjustable', 'Design', 'Gemstone', 'Metal'];

//     let keysToShow ;
//     if (!keysList) keysToShow = keys 
//     else keysToShow = keysList

//     // 2. Initialize the CardGenerator with your keys and container ID
//     const cardGenerator = new CardGenerator(keysToShow, 'cards-container');
//     // 4. Create and insert the cards
//     cardGenerator.createCards(productsData, handleCheckboxChange);

//     // Later, if you need to update the keys to display:
//     // cardGenerator.setKeysToDisplay(['name', 'email', 'phone']);
//     // cardGenerator.createCards(masterDict); // Recreate cards with new keys
// }

export function showProducts(productsData, keysList = null) {
    // Use default keys if none provided
    const defaultKeys = ['Adjustable', 'Design', 'Gemstone', 'Metal'];
    const keysToShow = keysList || defaultKeys;
    
    // Initialize or reuse existing CardGenerator
    let cardGenerator = window.cardGenerator; // Store in global scope
    if (!cardGenerator) {
        cardGenerator = new CardGenerator(keysToShow, 'cards-container');
        window.cardGenerator = cardGenerator; // Cache for reuse
    } else {
        cardGenerator.setKeysToDisplay(keysToShow); // Update keys
    }

     // Reset to first page and clear any existing pagination
    cardGenerator.currentPage = 1;
    const paginationWrapper = document.querySelector('.pagination_control_div');
    if (paginationWrapper) paginationWrapper.innerHTML = '';
    
    
    // Create/update cards
    cardGenerator.createCards(productsData, handleCheckboxChange);
}


import { SelectionManager } from './selectionManager.js';
export const selectionManager = new SelectionManager();


// Optional: Define checkbox callback function
function handleCheckboxChange(isChecked, cardId, cardData) {
    console.log(`Card ${cardId} ${isChecked ? 'selected' : 'deselected'}`, cardData);
    // Use selectionManager to manage selections
    selectionManager.toggleProductSelection(isChecked, cardId, cardData);
    console.log("Selected:", selectionManager.getSelectedProducts());

    // Check if the Selected Products tab is currently active
    const selectedTab = document.getElementById('SelectedProductsNavFront');
    if (selectedTab && selectedTab.checked) {
        const selectedData = selectionManager.getSelectedProducts();
        const keysToShow = window.settingKeys || ['Adjustable', 'Design', 'Gemstone', 'Metal'];
        
        // Immediately update the view with remaining selected products
        showProducts(selectedData, keysToShow);
    }
}