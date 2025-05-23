export class SelectionManager {
    constructor() {
        this.selectedProducts = new Map();  // No sessionStorage
    }

    toggleProductSelection(isChecked, productId, productData) {
        if (isChecked) {
            this.selectedProducts.set(productId, productData);
            console.log(`Product selected: ${productId}`, productData); 
            console.log(`Selected products:`, this.selectedProducts);
            
            
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

    getSelectedProductData() {
        return Array.from(this.selectedProducts.values());
    }

}
