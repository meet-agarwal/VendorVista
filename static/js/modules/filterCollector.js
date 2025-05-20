export function collectSelectedFilters() {
    // ... logic to get selected parent + child filters

    let selectedFilters = {
        // price: {
        //     min: document.getElementById('filter-input-min').value || '0',
        //     max: document.getElementById('filter-input-max').value || '3000+'
        // },
        parent: {},
        child: {}
    };

    // Get selected parent filter (radio button)
    const parentFilter = document.querySelector('.filter-block input[type="radio"]:checked');
    if (parentFilter) {
        selectedFilters.parent = {
            name: parentFilter.name,
            value: parentFilter.value
        };
    }

    // Get all selected child filters (checkboxes)
    document.querySelectorAll('.child-filter input[type="checkbox"]:checked').forEach(checkbox => {
        const filterName = checkbox.name;
        if (!selectedFilters.child[filterName]) {
            selectedFilters.child[filterName] = [];
        }
        selectedFilters.child[filterName].push(checkbox.value);
    });

    return selectedFilters;
}

