export class SettingsManager {
  constructor(
    settingsBtnSelector,
    popupSelector,
    contentSelector,
    submitBtnSelector,
    apiEndpoint
  ) {
    this.settingsBtn = document.querySelector(settingsBtnSelector);
    this.popup = document.querySelector(popupSelector);
    this.contentArea = document.querySelector(contentSelector);
    this.submitBtn = document.querySelector(submitBtnSelector);
    this.apiEndpoint = apiEndpoint;
    this.selectedOptions = new Set();
    this.maxSelections = 5;
    this.selectedSection = document.getElementById('popup_special_region'); // Reference to our selected options section
    this.sortableInstance = null; // Reference to SortableJS instance

    this.initEventListeners();
  }

  async fetchOptions() {
    try {
      this.showLoadingState();
      const response = await fetch(this.apiEndpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const options = await response.json();

      if (!Array.isArray(options)) {
        throw new Error('Invalid options format: expected an array');
      }

      return options;
    } catch (error) {
      console.error('Failed to fetch options:', error);
      this.showErrorState();
      throw error;
    }
  }

  renderOptions(options, initial_selection) {
    this.clearContentArea();

    // Create the selected section
    this.createSelectedSection();

    // Efficiently set selectedOptions using label match
    if (Array.isArray(initial_selection) && initial_selection.length > 0) {
      const labelToIdMap = new Map(
        options.map(opt => [opt.label.trim().toLowerCase(), opt.id])
      );
      initial_selection.forEach(label => {
        const id = labelToIdMap.get(label.trim().toLowerCase());
        if (id) this.selectedOptions.add(id);
      });

    }

    if (!options || options.length === 0) {
      this.showEmptyState();
      return;
    }

    // Create a container for available options
    const availableOptionsContainer = document.createElement('div');
    availableOptionsContainer.className = 'available-options-container';
    this.contentArea.appendChild(availableOptionsContainer);

    // First render selected options in the selected section
    options.forEach(option => {
      if (this.selectedOptions.has(option.id)) {
        this.addOptionToSelectedSection(option);
      }
    });

    // Then render remaining options in the available section
    options.forEach(option => {
      if (!option.id || !option.label) {
        console.warn('Invalid option format skipped:', option);
        return;
      }

      if (!this.selectedOptions.has(option.id)) {
        this.createOptionElement(option, availableOptionsContainer);
      }
    });

    this.updateSelectionFeedback();
    this.initSortable();
  }

  createSelectedSection() {
    // Remove existing selected section if it exists
    if (this.selectedSection) {
      this.selectedSection.innerHTML = ''; // Clear existing content
    }
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'selected-options-container';
    optionsContainer.id = 'selected-options-container';
    this.selectedSection.appendChild(optionsContainer);
    // // Insert at the beginning of content area
    // this.contentArea.insertBefore(this.selectedSection, this.contentArea.firstChild);
  }

  addOptionToSelectedSection(option) {
    const selectedContainer = this.selectedSection.querySelector('.selected-options-container');
    this.createOptionElement(option, selectedContainer, true);
  }

  createOptionElement(option, container, isSelected = false) {
    // Wrapper for each option
    const optionContainer = document.createElement('div');
    optionContainer.className = 'option-container';
    optionContainer.dataset.id = option.id;
    if (isSelected) {
      optionContainer.classList.add('selected');
    }




    // Checkbox input
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `option-${option.id}`;
    checkbox.value = option.id;
    checkbox.dataset.label = option.label;
    checkbox.checked = isSelected;
    // Disable unchecked boxes once limit reached
    checkbox.disabled = !isSelected && this.selectedOptions.size >= this.maxSelections;
    checkbox.addEventListener('change', (e) => this.handleCheckboxChange(e, option));
    optionContainer.appendChild(checkbox);

    // Label for the checkbox
    const label = document.createElement('label');
    label.htmlFor = `option-${option.id}`;
    label.textContent = option.label;
    optionContainer.appendChild(label);

    // Finally, append to whatever container you passed in
    container.appendChild(optionContainer);
    if (isSelected) {
      const dragHandle = document.createElement('i');
      dragHandle.className = 'fas fa-grip-lines drag-handle';
      dragHandle.title = 'Drag to reorder';
      optionContainer.appendChild(dragHandle);
    }
  }


  initSortable() {
    const selectedContainer = this.selectedSection?.querySelector('.selected-options-container');
    if (!selectedContainer) return;

    // Destroy previous instance if it exists
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
    }

    this.sortableInstance = new Sortable(selectedContainer, {
      animation: 150,
      handle: '.option-container',  // only this little icon will grab
      onEnd: () => {
        // You can save the new order if needed
        console.log('Items reordered');
      }
    });
  }

  handleCheckboxChange(event, option) {
    const checkbox = event.target;
    const optionId = checkbox.value;
    const optionContainer = checkbox.closest('.option-container');

    if (checkbox.checked) {
      if (this.selectedOptions.size < this.maxSelections) {
        this.selectedOptions.add(optionId);

        // Move to selected section
        optionContainer.remove();
        this.addOptionToSelectedSection({
          id: optionId,
          label: checkbox.dataset.label
        });
      } else {
        checkbox.checked = false;
        this.showLimitFeedback();
      }
    } else {
      this.selectedOptions.delete(optionId);

      // Move back to available section
      optionContainer.remove();
      const availableContainer = this.contentArea.querySelector('.available-options-container');
      this.createOptionElement({
        id: optionId,
        label: checkbox.dataset.label
      }, availableContainer);
    }

    this.updateCheckboxesState();
    this.updateSelectionFeedback();
  }


  handleSubmit() {
    const orderedSelectedIds = Array.from(
      this.selectedSection.querySelectorAll('.option-container.selected input[type="checkbox"]')
    ).map(cb => cb.value);

    this.closePopup();
    return orderedSelectedIds; // return ordered list
  }

  initEventListeners() {
    // Open popup when settings button is clicked
    this.settingsBtn?.addEventListener('click', () => this.openPopup());

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
      if (this.popup?.contains(e.target) ||
        this.settingsBtn?.contains(e.target)) {
        return;
      }
      this.closePopup();
    });

    // Handle submit button click
    this.submitBtn?.addEventListener('click', () => this.handleSubmit());
  }

  updateCheckboxesState() {
    const checkboxes = this.contentArea.querySelectorAll('input[type="checkbox"]');
    const atLimit = this.selectedOptions.size >= this.maxSelections;

    checkboxes.forEach(checkbox => {
      checkbox.disabled = !this.selectedOptions.has(checkbox.value) && atLimit;
    });
  }

  updateSelectionFeedback() {
    const counter = document.createElement('div');
    counter.className = 'selection-counter';
    counter.textContent = `${this.selectedOptions.size}/${this.maxSelections} selected`;

    const existingCounter = this.contentArea.querySelector('.selection-counter');
    if (existingCounter) {
      existingCounter.replaceWith(counter);
    } else {
      this.contentArea.appendChild(counter);
    }

    if (this.selectedOptions.size >= this.maxSelections) {
      this.contentArea.classList.add('limit-reached');
    } else {
      this.contentArea.classList.remove('limit-reached');
    }
  }

  showLimitFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'limit-feedback';
    feedback.textContent = `Maximum ${this.maxSelections} options allowed`;

    this.contentArea.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }

  showLoadingState() {
    this.clearContentArea();
    const loader = document.createElement('div');
    loader.className = 'loading-state';
    loader.textContent = 'Loading options...';
    this.contentArea.appendChild(loader);
  }

  showErrorState() {
    this.clearContentArea();
    const error = document.createElement('div');
    error.className = 'error-state';
    error.textContent = 'Failed to load options. Please try again.';
    this.contentArea.appendChild(error);
  }

  showEmptyState() {
    this.clearContentArea();
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No options available.';
    this.contentArea.appendChild(empty);
  }

  clearContentArea() {
    // Preserve elements with class 'preserve'
    const preserveElements = Array.from(this.contentArea.querySelectorAll('.preserve'));
    this.contentArea.innerHTML = '';
    preserveElements.forEach(el => this.contentArea.appendChild(el));
  }

  openPopup() {
    this.popup.style.display = 'block';
  }

  closePopup() {
    this.popup.style.display = 'none';
  }
}