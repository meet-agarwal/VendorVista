let priceOptions = [];

export function get_updated_price_options(masterData){
    const    input  = masterData['Start Price'];
    
    const roundedUnique = Array.from(
    new Set(input.map(num => Math.round(num)))
    );

    priceOptions = roundedUnique.sort((a, b) => a - b);

      const filter = new PriceFilter(document.getElementById('filter-container'), priceOptions)
        .onChange(({min, max}) => {
          console.log('Selected range:', min, max);
          // TODO: apply filtering logic here
        });

    console.log(roundedUnique); 
}


class PriceFilter {
      constructor(containerEl, valueArray) {
        this.container = containerEl;
        this.slider = this.container.querySelector('#filter-slider-container');
        this.thumbMin = this.container.querySelector('#filter-slider-thumb-min');
        this.thumbMax = this.container.querySelector('#filter-slider-thumb-max');
        this.inputMin = this.container.querySelector('#filter-input-min');
        this.inputMax = this.container.querySelector('#filter-input-max');

        this.onChangeCallback = null;
        this.updatePriceArray(valueArray);
        this._addEventListeners();
      }

      updatePriceArray(newArray) {
        this.values = Array.from(new Set(newArray)).sort((a,b) => a-b);
        this.min = this.values[0];
        this.max = this.values[this.values.length - 1];
        this.currentMin = this.min;
        this.currentMax = this.max;

        // Set attributes & inputs
        this.slider.style.setProperty('--min', this.min);
        this.slider.style.setProperty('--max', this.max);
        this.setPositions();
        this.inputMin.min = this.min;
        this.inputMin.max = this.max;
        this.inputMax.min = this.min;
        this.inputMax.max = this.max;
        this.inputMin.value = this.currentMin;
        this.inputMax.value = this.currentMax;

        this._updateAria();
      }

      onChange(callback) {
        this.onChangeCallback = callback;
        return this;
      }

      setPositions() {
        this.slider.style.setProperty('--val-min', this.currentMin);
        this.slider.style.setProperty('--val-max', this.currentMax);
      }

      _updateAria() {
        [
          {el: this.thumbMin, val: this.currentMin},
          {el: this.thumbMax, val: this.currentMax}
        ].forEach(({el, val}) => {
          el.setAttribute('aria-valuemin', this.min);
          el.setAttribute('aria-valuemax', this.max);
          el.setAttribute('aria-valuenow', val);
        });
      }

      _addEventListeners() {
        // Drag logic
        [ {thumb: this.thumbMin, onMove: this._onThumbMinMove.bind(this)},
          {thumb: this.thumbMax, onMove: this._onThumbMaxMove.bind(this)}
        ].forEach(({thumb, onMove}) => {
          thumb.addEventListener('pointerdown', e => {
            e.preventDefault();
            this.container.classList.add('no-select');
            const handleMove = moveEvent => { onMove(moveEvent); };
            const handleUp = () => {
              document.removeEventListener('pointermove', handleMove);
              document.removeEventListener('pointerup', handleUp);
              this.container.classList.remove('no-select');
            };
            document.addEventListener('pointermove', handleMove);
            document.addEventListener('pointerup', handleUp);
          });
        });

        // Input logic
        this.inputMin.addEventListener('change', () => {
          let v = parseInt(this.inputMin.value, 10);
          if (isNaN(v)) v = this.min;
          this.currentMin = Math.min(Math.max(v, this.min), this.currentMax);
          this.inputMin.value = this.currentMin;
          this._sync();
        });
        this.inputMax.addEventListener('change', () => {
          let v = parseInt(this.inputMax.value, 10);
          if (isNaN(v)) v = this.max;
          this.currentMax = Math.max(Math.min(v, this.max), this.currentMin);
          this.inputMax.value = this.currentMax;
          this._sync();
        });
      }

      _onThumbMinMove(e) {
        const rect = this.slider.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        let value = Math.round(this.min + percent * (this.max - this.min));
        value = Math.min(Math.max(value, this.min), this.currentMax);
        this.currentMin = value;
        this.inputMin.value = value;
        this._sync();
      }
      _onThumbMaxMove(e) {
        const rect = this.slider.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        let value = Math.round(this.min + percent * (this.max - this.min));
        value = Math.max(Math.min(value, this.max), this.currentMin);
        this.currentMax = value;
        this.inputMax.value = value;
        this._sync();
      }

      _sync() {
        this.setPositions();
        this._updateAria();
        if (typeof this.onChangeCallback === 'function') {
          this.onChangeCallback({ min: this.currentMin, max: this.currentMax });
        }
      }
    }

   