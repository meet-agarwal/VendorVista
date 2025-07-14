import { createTemplateCard, initializeFilters } from './templateSelector.js';

const allTemplatesBtn = document.getElementById('allTemplatesBtn');
const savedTemplatesBtn = document.getElementById('savedTemplatesBtn');
const firstPageButton = document.getElementById('firstPage');
const productPageButton = document.getElementById('productPage');
const thankYouPageButton = document.getElementById('thankYouPage');
const gridContainer = document.getElementById('templateGrid');


export let pageData = {};
export let editedPage = {};
let descKeys = [];
export let links = {};
export let config = {
    mode: 'default',   // 'default' | 'edited'
    page: 'product',  // 'first' | 'product' | 'last'
    filter: {},
    links: links
};

window.addEventListener('DOMContentLoaded', async () => {


    const response = await fetch('/api/editor-config');
    const editorConfig = await response.json();

    // Set dynamic config values
    links = editorConfig.links;
    initializeFilters(editorConfig.filters, config);
    pageData = editorConfig.templates_default;
    editedPage = editorConfig.templates_edited;
    descKeys = editorConfig.descKeys;

    console.log(pageData);
    console.log(editedPage);




    const templateButtons = [allTemplatesBtn, savedTemplatesBtn];
    const pageButtons = [firstPageButton, productPageButton, thankYouPageButton];

    allTemplatesBtn.addEventListener('click', () => {
        config.mode = 'default';
        config.page = 'product';
        console.log(config);
        loadTemplates(pageData[config.page]);
        setActiveButton(templateButtons, allTemplatesBtn);
        setActiveButton(pageButtons, productPageButton);
        loadTemplates(pageData.product);
    });

    savedTemplatesBtn.addEventListener('click', () => {
        config.mode = 'edited';
        config.page = 'product';
        console.log(config);
        loadTemplates(editedPage[config.page]);
        setActiveButton(templateButtons, savedTemplatesBtn);
        setActiveButton(pageButtons, productPageButton);
        loadTemplates(editedPage.product);
    });

    firstPageButton.addEventListener('click', () => {
        config.page = 'first';
        if (config.mode == 'default' && config.page == 'first') {
            loadTemplates(pageData.first);
            console.log("pageData", pageData);
        } else if (config.mode == 'edited' && config.page == 'first') {
            loadTemplates(editedPage.first);
            console.log("editedPage", editedPage);
        }
        console.log(config);
        setActiveButton(pageButtons, firstPageButton);
    });

    productPageButton.addEventListener('click', () => {
        config.page = 'product';
        if (config.mode == 'default' && config.page == 'product') {
            loadTemplates(pageData.product);
        } else if (config.mode == 'edited' && config.page == 'product') {
            loadTemplates(editedPage.product);
        }
        console.log(config);
        setActiveButton(pageButtons, productPageButton);
    });

    thankYouPageButton.addEventListener('click', () => {
        config.page = 'last';
        if (config.mode == 'default' && config.page == 'last') {
            loadTemplates(pageData.last);
        } else if (config.mode == 'edited' && config.page == 'last') {
            loadTemplates(editedPage.last);
        }
        console.log(config);
        setActiveButton(pageButtons, thankYouPageButton);
    });

    // Helper to update active button style
    const setActiveButton = (buttonGroup, activeButton) => {
        buttonGroup.forEach(btn => {
            btn.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
            btn.classList.add('text-gray-600', 'hover:text-gray-900');
        });
        activeButton.classList.remove('text-gray-600', 'hover:text-gray-900');
        activeButton.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
    };

    loadTemplates(pageData[config.page]);
    setActiveButton(pageButtons, productPageButton);
    renderSelectedTemplatesCard();


});


export const loadTemplates = (templates) => {
    // Prevent crash if templates is undefined or not an array
    if (!Array.isArray(templates)) {
        console.warn('Invalid or missing template data:', templates);
        gridContainer.innerHTML = '<p class="text-center text-gray-500">No templates available.</p>';
        return;
    }

    gridContainer.innerHTML = '';

    // Apply filters if any
    if (Object.keys(config.filter).length > 0) {
        templates = templates.filter(template => {
            return Object.entries(config.filter).every(([key, value]) => {
                return String(template[key]) === String(value);
            });
        });
    }

    if (templates.length === 0) {
        gridContainer.innerHTML = '<p class="text-center text-gray-500">No templates match the selected filters.</p>';
        return;
    }

    templates.forEach(template => {
        const card = createTemplateCard(template, descKeys);
        gridContainer.appendChild(card);
    });
};

window.previewTemplate = function (pdfFilename, mode, pageType) {
    const pdfUrl = `${links.pdf[mode][pageType]}/${pdfFilename}`;
    const popup = window.open(pdfUrl, '_blank', 'width=800,height=600');
    if (popup) popup.focus();
    else alert('Please allow popups to preview the brochure.');
};

window.selectTemplate = async function (template) {
    const page = config.page;
    const mode = config.mode;

    // Validate template object before sending
    if (!template || !template.html || !template.pdf || !template.image) {
        console.error("Invalid template object:", template);
        showAlert('error', 'Invalid template data', 'The template information is incomplete.');
        return;
    }

    const baseLinks = links.templates[mode][page];
    const pdfLink = links.pdf[mode][page];
    const imageLink = links.images[mode][page];

    const payload = {
        [page]: {
            template: template,
            links: {
                pdf: `${pdfLink}/${template.pdf}`,
                images: `${imageLink}/${template.image}`,
                html: `${baseLinks}/${template.html}`
            },
            mode: mode
        }
    };

    try {
        console.log("Sending template selection:", { page, mode, payload });

        const res = await fetch('/api/templates-selected', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Debug-Info': JSON.stringify({
                    client_time: new Date().toISOString(),
                    user_agent: navigator.userAgent
                })
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        console.log("Server response:", result);

        if (!res.ok) {
            // Handle server-side errors (4xx, 5xx)
            let errorMsg = result.message || 'Failed to select template';

            if (result.details?.errors?.length) {
                errorMsg += `\n• ${result.details.errors.map(e => e.error).join('\n• ')}`;
            }

            throw new Error(errorMsg);
        }

        // Validate successful response
        if (result.status !== 'success') {
            throw new Error(result.message || 'Unexpected response from server');
        }

        // Show appropriate success message
        if (result.details?.updated_pages?.includes(page)) {
            showAlert('success', 'Template Selected',
                `${template.displayName} was successfully selected for the ${page} page.`);
        }
        else if (result.details?.skipped_pages?.some(item => item.page === page)) {
            const skipReason = result.details.skipped_pages.find(item => item.page === page).reason;
            showAlert('info', 'Template Not Changed',
                `Template not updated for ${page} page: ${skipReason}`);
        }

        // Refresh the selected templates display
        renderSelectedTemplatesCard();

    } catch (err) {
        console.error("Template selection failed:", err);

        showAlert('error', 'Selection Failed',
            `Could not select template: ${err.message}\n\n` +
            `Template: ${template.name}\n` +
            `Page: ${page}\n` +
            `Mode: ${mode}`);
    }
};

const MAX_ALERTS = 8;
const container  = document.getElementById('alert-container');

function showAlert(type, title, message) {
  // 1) Create the alert element
  const alertBox = document.createElement('div');
  alertBox.className = `alert-box ${type}`;
  alertBox.innerHTML = `
    <strong>${title}</strong>
    <p>${message}</p>
  `;

  // 2) Prepend it (new alert at top)
  container.prepend(alertBox);

  // 3) Enforce max alerts
  while (container.children.length > MAX_ALERTS) {
    // Remove the oldest (bottom) alert immediately
    container.lastElementChild.remove();
  }

  // 4) Trigger slide‑in & push‑down
  //    On next frame, clear the initial transform/opacity
  requestAnimationFrame(() => {
    alertBox.style.opacity   = '1';
    alertBox.style.transform = 'translateX(0) translateY(0)';
    // Existing alerts will gain margin-top and animate down
  });

  // 5) Auto-remove after 5s with slide‑out & pull‑up
  setTimeout(() => {
    // Slide this one out to the right
    alertBox.style.opacity   = '0';
    alertBox.style.transform = 'translateX(100%) translateY(0)';

    // Once its own transition ends, remove it
    alertBox.addEventListener('transitionend', () => {
      alertBox.remove();
      // Remaining alerts will lose that first margin and animate up
    }, { once: true });
  }, 5000);
}

// window.renderSelectedTemplatesCard = async function () {
//     const container = document.getElementById('selected_products');
//     container.innerHTML = ''; // clear existing
//
//     try {
//         console.log("Fetching selected templates...");
//         const res = await fetch('/api/templates-selected');
//
//         if (!res.ok) {
//             const errorData = await res.json().catch(() => ({}));
//             throw new Error(
//                 `Server error: ${res.status} ${res.statusText}\n` +
//                 `Details: ${errorData.message || 'No details provided'}\n` +
//                 `Debug: ${JSON.stringify(errorData.debug_info || {}, null, 2)}`
//             );
//         }
//
//         const data = await res.json();
//         console.log("API Response:", data);
//
//         // Validate response structure
//         if (data.status !== 'success' || !data.templates_selected) {
//             throw new Error(
//                 `Invalid API response structure\n` +
//                 `Expected 'status: success' and 'templates_selected' field\n` +
//                 `Received: ${JSON.stringify(data, null, 2)}`
//             );
//         }
//
//         console.log(`Found ${Object.keys(data.templates_selected).length} selected templates`);
//
//         if (Object.keys(data.templates_selected).length === 0) {
//             container.innerHTML = `
//                 <div class="empty-state">
//                     <p class="text-gray-500">No templates selected yet</p>
//                     <p class="text-sm text-gray-400">
//                         Select templates from the gallery above to get started
//                     </p>
//                 </div>
//             `;
//             return;
//         }
//
//         // Process each template
//         Object.entries(data.templates_selected).forEach(([page, entry]) => {
//             const template = entry.template;
//             const links = entry.links;
//             const mode_ = entry.mode;
//             const page_ = page;
//
//             if (!template || Object.keys(template).length === 0) {
//                 console.warn(`Empty template found for page: ${page}`);
//                 return;
//             }
//
//             if (!links || !links.images || !links.pdf || !links.html) {
//                 console.warn(`Incomplete links for page: ${page}`, links);
//                 return;
//             }
//
//             try {
//                 const card = createSelectedCard(template, links, mode_, page_);
//                 container.appendChild(card);
//             } catch (cardError) {
//                 console.error(`Failed to create card for ${page}:`, cardError);
//                 container.appendChild(createErrorCard(page, cardError));
//             }
//         });
//
//     } catch (err) {
//         console.error("Error loading selected templates:", err);
//
//         container.innerHTML = `
//             <div class="error-state bg-red-50 p-4 rounded-lg">
//                 <h3 class="text-red-600 font-medium">Error loading templates</h3>
//                 <p class="text-red-500 text-sm">${err.message.split('\n')[0]}</p>
//                 <details class="text-xs text-gray-500 mt-2">
//                     <summary>Technical details</summary>
//                     <pre class="bg-gray-100 p-2 mt-1 rounded">${err.message}</pre>
//                 </details>
//                 <button onclick="window.renderSelectedTemplatesCard()"
//                     class="mt-2 text-sm text-blue-600 hover:text-blue-800">
//                     Try again
//                 </button>
//             </div>
//         `;
//     }
// };


window.renderSelectedTemplatesCard = async function () {
    const container = document.getElementById('selected_products');
    container.innerHTML = ''; // clear existing

    try {
        console.log("Fetching selected templates...");
        const res = await fetch('/api/templates-selected');

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(
                `Server error: ${res.status} ${res.statusText}\n` +
                `Details: ${errorData.message || 'No details provided'}\n` +
                `Debug: ${JSON.stringify(errorData.debug_info || {}, null, 2)}`
            );
        }

        const data = await res.json();
        console.log("API Response:", data);

        // Validate response structure
        if (data.status !== 'success' || !data.templates_selected) {
            throw new Error(
                `Invalid API response structure\n` +
                `Expected 'status: success' and 'templates_selected' field\n` +
                `Received: ${JSON.stringify(data, null, 2)}`
            );
        }

        const templates = data.templates_selected;
        console.log(`Found ${Object.keys(templates).length} selected templates`);

        if (Object.keys(templates).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p class="text-gray-500">No templates selected yet</p>
                    <p class="text-sm text-gray-400">
                        Select templates from the gallery above to get started
                    </p>
                </div>
            `;
            return;
        }

        // Define desired rendering order
        const renderOrder = ['first', 'product', 'last'];

        renderOrder.forEach(page => {
            const entry = templates[page];
            if (!entry) {
                console.warn(`No entry for page: ${page}`);
                return;
            }

            const { template, links, mode: mode_, /* page key already in "page" */ } = entry;
            const page_ = page;

            if (!template || Object.keys(template).length === 0) {
                console.warn(`Empty template found for page: ${page}`);
                return;
            }

            if (!links || !links.images || !links.pdf || !links.html) {
                console.warn(`Incomplete links for page: ${page}`, links);
                return;
            }

            try {
                const card = createSelectedCard(template, links, mode_, page_);
                container.appendChild(card);
            } catch (cardError) {
                console.error(`Failed to create card for ${page}:`, cardError);
                container.appendChild(createErrorCard(page, cardError));
            }
        });

    } catch (err) {
        console.error("Error loading selected templates:", err);

        container.innerHTML = `
            <div class="error-state bg-red-50 p-4 rounded-lg">
                <h3 class="text-red-600 font-medium">Error loading templates</h3>
                <p class="text-red-500 text-sm">${err.message.split('\n')[0]}</p>
                <details class="text-xs text-gray-500 mt-2">
                    <summary>Technical details</summary>
                    <pre class="bg-gray-100 p-2 mt-1 rounded">${err.message}</pre>
                </details>
                <button onclick="window.renderSelectedTemplatesCard()" 
                    class="mt-2 text-sm text-blue-600 hover:text-blue-800">
                    Try again
                </button>
            </div>
        `;
    }
};

function createErrorCard(page, error) {
    const card = document.createElement('div');
    card.className = 'error-card bg-yellow-50 p-3 rounded border border-yellow-200';
    card.innerHTML = `
        <div class="text-yellow-700">
            <p class="font-medium">Error displaying template for ${page}</p>
            <p class="text-sm">${error.message.split('\n')[0]}</p>
        </div>
    `;
    return card;
}

function createSelectedCard(template, links, mode, page) {
    // Create card
    const card = document.createElement('div');
    card.className = 'product-card';

    let placeHoldername ;

    if(page == "first"){
        placeHoldername = "First Page";
    }else if (page == "last"){
        placeHoldername = "Last Page";
    }else{
        placeHoldername = "Product Page";
    }

 const metaItems = descKeys
  .filter(key => template[key] !== undefined && template[key] !== null && template[key] !== '')
  .map(key =>
    key === 'products'
      ? `<span>${template[key]} Products</span>`
      : `<span>${template[key]}</span>`
  )
  .join('');
    card.innerHTML = `
                <div class="product-card-img">
                <img src="${links.images}" alt="${template.displayName}">
                </div>
                <div class="product-card-body">
                <div class="product-card-page">[${placeHoldername}]</div>
                <div class="product-card-title">${template.displayName}</div>
                <div class="product-card-meta">${metaItems}</div>
                <div class="product-card-buttons">
                    <button class="preview-btn">Preview</button>
                    <button class="select-btn">Remove</button>
                    <button class="edit-btn">Edit</button>
                </div>
                </div>
            `;

    // Button Event Bindings
    card.querySelector('.preview-btn')
        .addEventListener('click', () => previewTemplate(template.pdf, mode, page));

    card.querySelector('.select-btn')
        .addEventListener('click', () => removeSelectedTemplateCard(page, template, mode, links));

    card.querySelector('.edit-btn')
        .addEventListener('click', () => EditTemplate(template.id));

    return card;

}

window.removeSelectedTemplateCard = async function (pageKey, template, mode, links) {
    try {
        const res = await fetch(`/api/templates-selected/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page: pageKey,
                template: template,
                links: links,
                mode: mode
            })
        });

        const result = await res.json();
        console.log("delete_selected, Backend response:", result);

        if (res.ok && result.success) {
            showAlert(
                'success',
                'Template Removed',
                result.message || `${template.displayName} was successfully removed from ${pageKey} page.`
            );
        } else {
            let errorDetails = '';
            if (result.details) {
                errorDetails = `\n\nDetails: ${JSON.stringify(result.details, null, 2)}`;
            }

            showAlert(
                'error',
                'Removal Failed',
                (result.error || "Failed to remove template.") + errorDetails
            );
        }

        renderSelectedTemplatesCard(); // Refresh UI

    } catch (err) {
        console.error("Network/JS error in removeSelectedTemplateCard:", err);
        showAlert(
            'error',
            'Removal Error',
            `Error while removing selected template:\n${err.message}\n\n` +
            `Template: ${template.name}\n` +
            `Page: ${pageKey}`
        );
    }
};

window.EditTemplate = function (templateID) {

    // Sending the TemplateID to the Editor , Where the grapeEditor will call route to the backend to get the
    // link , template metadata and the mode & page
    window.location.href = `/grapeEdit?templateID=${encodeURIComponent(templateID)}`;
};
