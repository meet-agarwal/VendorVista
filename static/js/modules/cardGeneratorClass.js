/**
 * CardGenerator - A class to create styled cards with images and data tables
 */
// export class CardGenerator {
//     /**
//      * Constructor - Initializes the CardGenerator with keys to display
//      * @param {Array} keysToDisplay - Array of keys that should be shown in the card table
//      * @param {string} containerId - ID of the HTML element where cards will be inserted
//      */
//     constructor(keysToDisplay, containerId) {
//       // Store the keys that should be displayed in each card
//       this.keysToDisplay = keysToDisplay;

//       // Store the container element where cards will be added
//       this.container = document.getElementById(containerId);

//       // Throw error if container not found
//       if (!this.container) {
//         throw new Error(`Container element with ID '${containerId}' not found`);
//       }
//     }

//     /**
//      * Updates the list of keys to be displayed in cards
//      * @param {Array} newKeys - New array of keys to display
//      */
//     setKeysToDisplay(newKeys) {
//       this.keysToDisplay = newKeys;
//     }

//     /**
//      * Creates and inserts cards based on the master dictionary
//      * @param {Object} masterDict - Dictionary where each key-value pair represents a card
//      * @param {Function} checkboxCallback - Optional callback for checkbox events
//      */
//     createCards(masterDict, checkboxCallback = null) {
//       // Clear existing cards in the container
//       this.container.innerHTML = '';

//       // Loop through each item in the master dictionary
//       for (const [cardId, cardData] of Object.entries(masterDict)) {
//         // Create card element
//         const card = this._createCardElement(cardId, cardData, checkboxCallback);

//         // Add card to container
//         this.container.appendChild(card);
//         console.log('card created', cardId)
//       }
//     }

//     // PRIVATE METHODS (internal use only)

//     /**
//      * Creates a single card element
//      * @private
//      * @param {string} cardId - Unique identifier for the card
//      * @param {Object} cardData - Data object containing card information
//      * @param {Function} checkboxCallback - Callback for checkbox events
//      * @returns {HTMLElement} The created card element
//      */
//     _createCardElement(cardId, cardData, checkboxCallback) {
//       // Create main card container
//       const card = document.createElement('div');
//       card.className = 'card';
//       card.dataset.cardId = cardId;

//       // Create image section (top half of card)
//       const imageSection = this._createImageSection(cardId, cardData, checkboxCallback);
//       card.appendChild(imageSection);

//       // Create table section (bottom half of card)
//       const tableSection = this._createTableSection(cardData);
//       card.appendChild(tableSection);

//       return card;
//     }

//     /**
//      * Creates the image section with checkbox
//      * @private
//      * @param {string} cardId - Unique identifier for the card
//      * @param {Object} cardData - Data object containing card information
//      * @param {Function} checkboxCallback - Callback for checkbox events
//      * @returns {HTMLElement} The created image section
//      */
//     _createImageSection(cardId, cardData, checkboxCallback) {
//       const imageSection = document.createElement('div');
//       imageSection.className = 'card-image-section';

//       // Create and add image if available
//       if (cardData.imageUrl) {
//         const img = document.createElement('img');
//         img.src = cardData.imageUrl;
//         img.alt = cardData.title || 'Card Image';
//         imageSection.appendChild(img);
//       } else {
//         // Placeholder if no image
//         imageSection.style.backgroundColor = '#f0f0f0';
//         imageSection.style.minHeight = '150px';
//         imageSection.textContent = 'No Image Available';
//       }

//       // Create and add checkbox
//       const checkboxContainer = document.createElement('div');
//       checkboxContainer.className = 'card-checkbox-container';

//       const checkbox = document.createElement('input');
//       checkbox.type = 'checkbox';
//       checkbox.id = `card-checkbox-${cardId}`;
//       checkbox.className = 'card-checkbox';

//       // Add callback if provided
//       if (checkboxCallback) {
//         checkbox.addEventListener('change', (e) => {
//           checkboxCallback(e.target.checked, cardId, cardData);
//         });
//       }

//       checkboxContainer.appendChild(checkbox);
//       imageSection.appendChild(checkboxContainer);

//       return imageSection;
//     }

//     /**
//      * Creates the table section with card details
//      * @private
//      * @param {Object} cardData - Data object containing card information
//      * @returns {HTMLElement} The created table section
//      */
//     _createTableSection(cardData) {
//       const tableSection = document.createElement('div');
//       tableSection.className = 'card-table-section';

//       // Create table element
//       const table = document.createElement('table');

//       // Add rows for each key we want to display
//       this.keysToDisplay.forEach(key => {
//         if (cardData.hasOwnProperty(key)) {
//           const row = table.insertRow();

//           // Add key cell
//           const keyCell = row.insertCell(0);
//           keyCell.textContent = `${key}:`;
//           keyCell.className = 'key-cell';

//           // Add value cell
//           const valueCell = row.insertCell(1);
//           valueCell.textContent = cardData[key];
//           valueCell.className = 'value-cell';
//         }
//       });

//       tableSection.appendChild(table);
//       return tableSection;
//     }
//   }

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
        const startIdx = (this.currentPage - 1) * this.cardsPerPage;
        const endIdx = startIdx + this.cardsPerPage;
        const pageEntries = entries.slice(startIdx, endIdx);

        for (const [cardId, cardData] of pageEntries) {
            const card = this._createCardElement(cardId, cardData, this.checkboxCallback);
            this.container.appendChild(card);
        }

        if (entries.length > this.cardsPerPage) {
            this._renderPaginationControls(totalPages);
        }
    }

    _renderPaginationControls(totalPages) {
        const pagination = document.createElement('div');
        pagination.className = 'pagination-controls';

        // Prev
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Prev';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = () => {
            this.currentPage--;
            this._renderCurrentPage();
        };
        pagination.appendChild(prevBtn);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            if (i === this.currentPage) pageBtn.disabled = true;
            pageBtn.onclick = () => {
                this.currentPage = i;
                this._renderCurrentPage();
            };
            pagination.appendChild(pageBtn);
        }

        // Next
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.onclick = () => {
            this.currentPage++;
            this._renderCurrentPage();
        };
        pagination.appendChild(nextBtn);

        this.container.appendChild(pagination);
    }

    // /**
    //  * Creates a single card element
    //  * @private
    //  * @param {string} cardId - Unique identifier for the card
    //  * @param {Object} cardData - Data object containing card information
    //  * @param {Function} checkboxCallback - Callback for checkbox events
    //  * @returns {HTMLElement} The created card element
    //  **/
    _createCardElement(cardId, cardData, checkboxCallback) {
        // Create main card container
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.cardId = cardId;

        // Create image section (top half of card)
        const imageSection = this._createImageSection(cardId, cardData, checkboxCallback);
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
    _createImageSection(cardId, cardData, checkboxCallback) {
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

        // Create and add checkbox
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'card-checkbox-container';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `card-checkbox-${cardId}`;
        checkbox.className = 'card-checkbox';

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


export function showProducts(productsData) {
    // 1. Define which keys you want to display in each card
    const keysToShow = ['Adjustable', 'Design', 'Gemstone', 'Metal'];

    // 2. Initialize the CardGenerator with your keys and container ID
    const cardGenerator = new CardGenerator(keysToShow, 'cards-container');
    // 4. Create and insert the cards
    cardGenerator.createCards(productsData, handleCheckboxChange);

    // Later, if you need to update the keys to display:
    // cardGenerator.setKeysToDisplay(['name', 'email', 'phone']);
    // cardGenerator.createCards(masterDict); // Recreate cards with new keys
}


// Optional: Define checkbox callback function
function handleCheckboxChange(isChecked, cardId, cardData) {
    console.log(`Card ${cardId} ${isChecked ? 'selected' : 'deselected'}`, cardData);
}