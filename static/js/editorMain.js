// const filters = {
//     "products": [2, 3, 4, 6, 9, 12, 16, 20],
//     "theme": ["Modern", "Minimal", "Professional", "Classic"]
// };
// const templatesDataProduct =
//     [
//         {
//             "name": "4_2rows_2cols.html",
//             "displayName": "Elegant Brochure",
//             "image": "4_2rows_2cols.png",
//             "pdf": "4_2rows_2cols.pdf",
//             "products": 4,
//             "theme": "Modern",
//             "grid": "2rows_2cols"
//         },
//         {
//             "name": "6_3rows_2cols.html",
//             "displayName": "Minimalist Style",
//             "image": "6_3rows_2cols.png",
//             "pdf": "6_3rows_2cols.pdf",
//             "products": 6,
//             "theme": "Minimal",
//             "grid": "3rows_2cols"
//         },
//         {
//             "name": "9_3rows_3cols.html",
//             "displayName": "Professional Layout",
//             "image": "9_3rows_3cols.png",
//             "pdf": "9_3rows_3cols.pdf",
//             "products": 9,
//             "theme": "Professional",
//             "grid": "3rows_3cols"
//         },
//         {
//             "name": "12_4rows_3cols.html",
//             "displayName": "Modern Grid",
//             "image": "12_4rows_3cols.png",
//             "pdf": "12_4rows_3cols.pdf",
//             "products": 12,
//             "theme": "Modern",
//             "grid": "4rows_3cols"
//         },
//         {
//             "name": "16_4rows_4cols.html",
//             "displayName": "Simple & Clean",
//             "image": "16_4rows_4cols.png",
//             "pdf": "16_4rows_4cols.pdf",
//             "products": 16,
//             "theme": "Minimal",
//             "grid": "4rows_4cols"
//         },
//         {
//             "name": "2_2rows_1cols_sameSide.html",
//             "displayName": "Same Side products",
//             "image": "2_2rows_1cols_SameSide.png",
//             "pdf": "2_2rows_1cols_sameSide.pdf",
//             "products": 2,
//             "theme": "Minimal",
//             "grid": "2rows_1cols"
//         },
//         {
//             "name": "2_2rows_1cols_zigZag.html",
//             "displayName": "Zig Zag products",
//             "image": "2_2rows_1cols_ZigZag.png",
//             "pdf": "2_2rows_1cols_zigZag.pdf",
//             "products": 2,
//             "theme": "Minimal",
//             "grid": "2rows_1cols"
//         },
//         {
//             "name": "3_3rows_1cols_zigZag.html",
//             "displayName": "Zig Zag products",
//             "image": "3_3rows_1cols_zigZag.png",
//             "pdf": "3_3rows_1cols_zigZag.pdf",
//             "products": 3,
//             "theme": "Minimal",
//             "grid": "3rows_1cols"
//         },
//         {
//             "name": "3_3rows_1cols_sameSide.html",
//             "displayName": "Same Side products",
//             "image": "3_3rows_1cols_sameSide.png",
//             "pdf": "3_3rows_1cols_sameSide.pdf",
//             "products": 3,
//             "theme": "Minimal",
//             "grid": "3rows_1cols"
//         },
//         {
//             "name": "20_5rows_4cols.html",
//             "displayName": "Product Gallery",
//             "image": "20_5rows_4cols.png",
//             "pdf": "20_5rows_4cols.pdf",
//             "products": 20,
//             "theme": "Minimal",
//             "grid": "5rows_4cols"
//         }
//     ];
// const templatesDataFirstPage = [
//     {
//         "name": "4_2rows_2cols.html",
//         "displayName": "Elegant Brochure",
//         "image": "4_2rows_2cols.png",
//         "pdf": "4_2rows_2cols.pdf",
//         "products": 4,
//         "theme": "Modern",
//         "grid": "2rows_2cols"
//     },
//     {
//         "name": "6_3rows_2cols.html",
//         "displayName": "Minimalist Style",
//         "image": "6_3rows_2cols.png",
//         "pdf": "6_3rows_2cols.pdf",
//         "products": 6,
//         "theme": "Minimal",
//         "grid": "3rows_2cols"
//     },
//     {
//         "name": "9_3rows_3cols.html",
//         "displayName": "Professional Layout",
//         "image": "9_3rows_3cols.png",
//         "pdf": "9_3rows_3cols.pdf",
//         "products": 9,
//         "theme": "Professional",
//         "grid": "3rows_3cols"
//     },
//     {
//         "name": "12_4rows_3cols.html",
//         "displayName": "Modern Grid",
//         "image": "12_4rows_3cols.png",
//         "pdf": "12_4rows_3cols.pdf",
//         "products": 12,
//         "theme": "Modern",
//         "grid": "4rows_3cols"
//     },
//     {
//         "name": "16_4rows_4cols.html",
//         "displayName": "Simple & Clean",
//         "image": "16_4rows_4cols.png",
//         "pdf": "16_4rows_4cols.pdf",
//         "products": 16,
//         "theme": "Minimal",
//         "grid": "4rows_4cols"
//     },
//     {
//         "name": "2_2rows_1cols_sameSide.html",
//         "displayName": "Same Side products",
//         "image": "2_2rows_1cols_SameSide.png",
//         "pdf": "2_2rows_1cols_sameSide.pdf",
//         "products": 2,
//         "theme": "Minimal",
//         "grid": "2rows_1cols"
//     },
//     {
//         "name": "2_2rows_1cols_zigZag.html",
//         "displayName": "Zig Zag products",
//         "image": "2_2rows_1cols_ZigZag.png",
//         "pdf": "2_2rows_1cols_zigZag.pdf",
//         "products": 2,
//         "theme": "Minimal",
//         "grid": "2rows_1cols"
//     },
//     {
//         "name": "3_3rows_1cols_zigZag.html",
//         "displayName": "Zig Zag products",
//         "image": "3_3rows_1cols_zigZag.png",
//         "pdf": "3_3rows_1cols_zigZag.pdf",
//         "products": 3,
//         "theme": "Minimal",
//         "grid": "3rows_1cols"
//     },
//     {
//         "name": "3_3rows_1cols_sameSide.html",
//         "displayName": "Same Side products",
//         "image": "3_3rows_1cols_sameSide.png",
//         "pdf": "3_3rows_1cols_sameSide.pdf",
//         "products": 3,
//         "theme": "Minimal",
//         "grid": "3rows_1cols"
//     },
//     {
//         "name": "20_5rows_4cols.html",
//         "displayName": "Product Gallery",
//         "image": "20_5rows_4cols.png",
//         "pdf": "20_5rows_4cols.pdf",
//         "products": 20,
//         "theme": "Minimal",
//         "grid": "5rows_4cols"
//     }
// ];
// const templatesDataLastPage = [
//     {
//         "name": "4_2rows_2cols.html",
//         "displayName": "Elegant Brochure",
//         "image": "4_2rows_2cols.png",
//         "pdf": "4_2rows_2cols.pdf",
//         "products": 4,
//         "theme": "Modern",
//         "grid": "2rows_2cols"
//     },
//     {
//         "name": "6_3rows_2cols.html",
//         "displayName": "Minimalist Style",
//         "image": "6_3rows_2cols.png",
//         "pdf": "6_3rows_2cols.pdf",
//         "products": 6,
//         "theme": "Minimal",
//         "grid": "3rows_2cols"
//     },
//     {
//         "name": "9_3rows_3cols.html",
//         "displayName": "Professional Layout",
//         "image": "9_3rows_3cols.png",
//         "pdf": "9_3rows_3cols.pdf",
//         "products": 9,
//         "theme": "Professional",
//         "grid": "3rows_3cols"
//     },
//     {
//         "name": "12_4rows_3cols.html",
//         "displayName": "Modern Grid",
//         "image": "12_4rows_3cols.png",
//         "pdf": "12_4rows_3cols.pdf",
//         "products": 12,
//         "theme": "Modern",
//         "grid": "4rows_3cols"
//     },
//     {
//         "name": "16_4rows_4cols.html",
//         "displayName": "Simple & Clean",
//         "image": "16_4rows_4cols.png",
//         "pdf": "16_4rows_4cols.pdf",
//         "products": 16,
//         "theme": "Minimal",
//         "grid": "4rows_4cols"
//     },
//     {
//         "name": "2_2rows_1cols_sameSide.html",
//         "displayName": "Same Side products",
//         "image": "2_2rows_1cols_SameSide.png",
//         "pdf": "2_2rows_1cols_sameSide.pdf",
//         "products": 2,
//         "theme": "Minimal",
//         "grid": "2rows_1cols"
//     },
//     {
//         "name": "2_2rows_1cols_zigZag.html",
//         "displayName": "Zig Zag products",
//         "image": "2_2rows_1cols_ZigZag.png",
//         "pdf": "2_2rows_1cols_zigZag.pdf",
//         "products": 2,
//         "theme": "Minimal",
//         "grid": "2rows_1cols"
//     },
//     {
//         "name": "3_3rows_1cols_zigZag.html",
//         "displayName": "Zig Zag products",
//         "image": "3_3rows_1cols_zigZag.png",
//         "pdf": "3_3rows_1cols_zigZag.pdf",
//         "products": 3,
//         "theme": "Minimal",
//         "grid": "3rows_1cols"
//     },
//     {
//         "name": "3_3rows_1cols_sameSide.html",
//         "displayName": "Same Side products",
//         "image": "3_3rows_1cols_sameSide.png",
//         "pdf": "3_3rows_1cols_sameSide.pdf",
//         "products": 3,
//         "theme": "Minimal",
//         "grid": "3rows_1cols"
//     },
//     {
//         "name": "20_5rows_4cols.html",
//         "displayName": "Product Gallery",
//         "image": "20_5rows_4cols.png",
//         "pdf": "20_5rows_4cols.pdf",
//         "products": 20,
//         "theme": "Minimal",
//         "grid": "5rows_4cols"
//     }
// ];
// export const links = {
//     "images": {
//         "default": {
//             "first": "/static/assets/images/Default_Templates/First_page",
//             "product": "/static/assets/images/Default_Templates/Product_page",
//             "last": "/static/assets/images/Default_Templates/Last_page"
//         },
//         "edited": {
//             "first": "/static/assets/images/Edited_Templates/First_page",
//             "product": "/static/assets/images/Edited_Templates/Product_page",
//             "last": "/static/assets/images/Edited_Templates/Last_page"
//         }
//     },
//     "pdf": {
//         "default": {
//             "first": "/static/assets/templatesPDF/Default_Templates/First_page",
//             "product": "/static/assets/templatesPDF/Default_Templates/Product_page",
//             "last": "/static/assets/templatesPDF/Default_Templates/Last_page"
//         },
//         "edited": {
//             "first": "/static/assets/templatesPDF/Edited_Templates/First_page",
//             "product": "/static/assets/templatesPDF/Edited_Templates/Product_page",
//             "last": "/static/assets/templatesPDF/Edited_Templates/Last_page"
//         }
//     },
//     "templates": {
//         "default": {
//             "first": "/static/assets/templates/Default_Templates/First_page",
//             "product": "/static/assets/templates/Default_Templates/Product_page",
//             "last": "/static/assets/templates/Default_Templates/Last_page"
//         },
//         "edited": {
//             "first": "/static/assets/templates/Edited_Templates/First_page",
//             "product": "/static/assets/templates/Edited_Templates/Product_page",
//             "last": "/static/assets/templates/Edited_Templates/Last_page"
//         }
//     }
// }

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
// export const loadTemplates = (templates) => {
//     gridContainer.innerHTML = '';

//     // Apply filters if any
//     if (Object.keys(config.filter).length > 0) {
//         templates = templates.filter(template => {
//             return Object.entries(config.filter).every(([key, value]) => {
//                 // Convert to string for safe comparison
//                 return String(template[key]) === String(value);
//             });
//         });
//     }

//     templates.forEach(template => {
//         const card = createTemplateCard(template, descKeys);
//         gridContainer.appendChild(card);
//     });
// };



// Handle preview and select globally

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

    const baseLinks = links.templates[mode][page];
    const pdfLink = links.pdf[mode][page];
    const imageLink = links.images[mode][page];

    const payload = {
        [page]: {
            template: template,
            links: {
                pdf: `${pdfLink}/${template.pdf}`,
                images: `${imageLink}/${template.image}`,
                html: `${baseLinks}/${template.name}`
            },
            mode : mode
        }
    };

    try {
        const res = await fetch('/api/templates-selected', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (result = "Selected Succesfully") {
            alert("Template selected successfully");
        } else if( result = "Already Selected fot the page") {
            alert("Already Selected fot the page");
        }
    } catch (err) {
        console.error("Failed to update selected template:", err);
        alert("Failed to update selected template");
    }


    renderSelectedTemplatesCard() ; 
};


window.EditTemplate = function (htmlFileName) {
    let mode_con = config.mode;        // 'default' or 'edited'
    let page_con = config.page;        // 'first', 'product', or 'last'

    let link_con = links.templates[mode_con][page_con];

    // Construct full template path
    let finalLINK = `${link_con}/${htmlFileName}`;

    window.location.href = `/grapeEdit?template=${encodeURIComponent(finalLINK)}&mode=${mode_con}&page=${page_con}`;
};


window.renderSelectedTemplatesCard = async function () {
    const container = document.getElementById('selected_products');
    container.innerHTML = ''; // clear existing

    try {
        const res = await fetch('/api/templates-selected');
        const data = await res.json();

        console.log("data fetched", data);

        if (!data || !data.templates_selected || Object.keys(data.templates_selected).length === 0) {
            container.innerHTML = '<p class="text-gray-500">No selected templates yet.</p>';
            return;
        }

        Object.entries(data.templates_selected).forEach(([page, entry]) => {
            const template = entry.template;
            const links = entry.links;
            const mode_ = entry.mode;
            const page_ = page

            if (template && Object.keys(template).length > 0) {
                const card = createSelectedCard(template, links , mode_ , page_);
                container.appendChild(card);
            }
        });

    } catch (err) {
        console.error("Error loading selected templates:", err);
        container.innerHTML = '<p class="text-red-500">Failed to load selected templates.</p>';
    }
};

function createSelectedCard ( template , links , mode, page){
    // Create card
        const card = document.createElement('div');
        card.className = 'product-card';

          const metaItems = descKeys.map(key =>
                key === 'products'
                ? `<span>${template[key]} Products</span>`
                : `<span>${template[key]}</span>`
            ).join('');

            card.innerHTML = `
                <div class="product-card-img">
                <img src="${links.images}" alt="${template.displayName}">
                </div>
                <div class="product-card-body">
                <div class="product-card-title">${template.displayName} - {${page}}</div>
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
                .addEventListener('click', () => removeSelectedTemplateCard (page, template , mode , links  ));

            card.querySelector('.edit-btn')
                .addEventListener('click', () => EditTemplate(template.name));

        return card ;
        
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
            alert(result.message || "Template removed successfully.");
        } else {
            const errorMsg = result.error || "Failed to remove template.";
            alert("error:" + errorMsg);

            if (result.details) {
                console.warn("delete_selected, Debug Details:", result.details);
            }
        }

        renderSelectedTemplatesCard(); // Refresh UI

    } catch (err) {
        console.error("Network/JS error in removeSelectedTemplateCard:", err);
        alert("Error while removing selected template.");
    }
};



