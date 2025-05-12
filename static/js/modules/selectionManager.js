export class SelectionManager {
    constructor() {
        this.selectedProducts = new Map();  // No sessionStorage
    }

    toggleProductSelection(isChecked, productId, productData) {
        if (isChecked) {
            this.selectedProducts.set(productId, productData);
        } else {
            this.selectedProducts.delete(productId);
        }
    }

    getSelectedProducts() {
        return Object.fromEntries(this.selectedProducts);
    }

    clearSelections() {
        this.selectedProducts.clear();
    }

    isProductSelected(productId) {
        return this.selectedProducts.has(productId);
    }
}
