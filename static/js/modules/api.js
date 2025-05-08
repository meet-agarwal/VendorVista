export async function getProductsData(file) {
    // ... API call to get products based on filters

    try {
        const selectedFilters = file ; 

        const response = await fetch('/api/getProducts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedFilters) 
        });

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong!");
        }
        const data = await response.json(); // Convert response to JSON        

        return data ;

    } catch (error) {
        console.error('Error in getting Products Detials:', error);
        throw error
    }
  }
  