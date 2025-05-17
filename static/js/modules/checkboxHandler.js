// export function updateFilterUI(updatedOptions) {
//     Object.entries(updatedOptions).forEach(([filterName, values]) => {
//         const container = document.getElementById(`filter-${filterName}`);
//         if (!container) return;

//         container.innerHTML = ''; // Clear old checkboxes

//         values.forEach(value => {
//             const id = `${filterName}-${value.replace(/\s+/g, '-').toLowerCase()}`;
//             const label = document.createElement('label');
//             label.innerHTML = `
//                 <input type="checkbox" id="${id}" name="${filterName}" value="${value}">
//                 ${value}
//             `;
//             container.appendChild(label);
//         });
//     });
// }

export function updateFilterUI(updatedOptions , checkedFilters = {}) {
    Object.entries(updatedOptions).forEach(([filterName, values]) => {
        const normalizedKey = filterName.trim().toLowerCase();

        const filterGroups = document.querySelectorAll('.filter-content.scrollable-content');

        filterGroups.forEach(group => {
            const label = group.getAttribute('aria-labelledby')?.trim().toLowerCase();
            if (label === normalizedKey) {
                group.innerHTML = ''; // Clear current checkboxes

                values.forEach(value => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'filter-option';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = filterName;
                    checkbox.value = value;

                    // Check if this value is in checkedFilters for this group
                    const checkedValues = checkedFilters[filterName] || [];
                    if (checkedValues.includes(value)) {
                        checkbox.checked = true;
                    }

                    wrapper.appendChild(checkbox);
                    wrapper.append(` ${value}`); // Optional: add text label

                    group.appendChild(wrapper);
                });

                        // now refresh counters:
        document.querySelectorAll('.filter-block').forEach(block => {
            const numItems = block.querySelectorAll('.filter-content .filter-option').length;
            block.querySelector('.filter-item-counter')
                .textContent = `${numItems} items`;
        });
        }
            
        });
    });
}



export async function get_updated_filter_options(dataDict) {
    // This function fetches updated filter options based on the selected filters
    // It sends a POST request to the server with the selected filters and receives updated options in response
    try {
        const response = await fetch('/api/filters/updateFilters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataDict)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch updated filter options');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching updated filter options:', error);
        throw error;
    } 

  }
  