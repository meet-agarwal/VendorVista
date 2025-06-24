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

  renderOptions(options, inital_selection) {
    this.clearContentArea();

    /// Efficiently set selectedOptions using label match
    if (Array.isArray(inital_selection) && inital_selection.length > 0) {
      const labelToIdMap = new Map(options.map(opt => [opt.label, opt.id]));
      inital_selection.forEach(label => {
        const id = labelToIdMap.get(label);
        if (id) this.selectedOptions.add(id);
      });
    }

    if (!options || options.length === 0) {
      this.showEmptyState();
      return;
    }

    options.forEach(option => {
      if (!option.id || !option.label) {
        console.warn('Invalid option format skipped:', option);
        return;
      }

      const optionContainer = document.createElement('div');
      optionContainer.className = 'option-container';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `option-${option.id}`;
      checkbox.value = option.id;
      checkbox.dataset.label = option.label;
      checkbox.checked = this.selectedOptions.has(option.id);
      checkbox.disabled = !this.selectedOptions.has(option.id) &&
        this.selectedOptions.size >= this.maxSelections;

      checkbox.addEventListener('change', (e) => this.handleCheckboxChange(e));

      const label = document.createElement('label');
      label.htmlFor = `option-${option.id}`;
      label.textContent = option.label;
      label.class = 'label'

      optionContainer.appendChild(checkbox);
      optionContainer.appendChild(label);
      this.contentArea.appendChild(optionContainer);
    });

    this.updateSelectionFeedback();
  }

  handleCheckboxChange(event) {
    const checkbox = event.target;
    const optionId = checkbox.value;

    if (checkbox.checked) {
      if (this.selectedOptions.size < this.maxSelections) {
        this.selectedOptions.add(optionId);
      } else {
        checkbox.checked = false;
        this.showLimitFeedback();
      }
    } else {
      this.selectedOptions.delete(optionId);
    }

    // Update disabled state of all checkboxes
    this.updateCheckboxesState();
    this.updateSelectionFeedback();
  }

  handleSubmit() {
    const selectedIds = Array.from(this.selectedOptions);
    this.closePopup();
    return selectedIds;
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