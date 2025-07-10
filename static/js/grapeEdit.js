import { initializeEditor , editor} from './grapeEditorInit.js';

let temp_page = "" ;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const tplId = params.get('templateID');

    if (!tplId) {
        console.error('No templateID found in URL.');
        return;
    }

   try {
    const response = await fetch('/api/getGrapeEditortemplateData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateID: tplId }),
    });

    const result = await response.json();

    if (!response.ok || result.status !== 'success') {
        const msg = result.message || 'Unknown error occurred while fetching template data.';
        alert(` Error: ${msg}`);
        console.error('Server Error:', result);
        return;
    }

    // Extract the template HTML URL and metadata
    const templateUrl = result.html_link;
    const templateMeta = result.template_meta;
    const mode = result.mode;
    temp_page  = result.page;


    console.log(' Template Loaded:', templateMeta.displayName || templateMeta.name);
    // Optionally: Show user message
    // showAlert('success', 'Template Loaded', `Loaded "${templateMeta.displayName}"`);

    // Initialize GrapesJS with fetched HTML
    initializeEditor('gjs', templateUrl);

} catch (error) {
    alert(' Network Error: Unable to fetch template from server.');
    console.error('Fetch error:', error);
}

const btnPopup = document.getElementById('template_editor_btn');
btnPopup.addEventListener('click', () => {
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'filenameModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';

    modal.innerHTML = `
          <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300">
            <h2 class="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Save Template As
            </h2>
            <p class="text-sm text-gray-500 mb-4">Choose a meaningful name for your saved template file.</p>
          
            <input id="filenameInput" type="text"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                   placeholder="e.g. modern_brochure" />
          
            <div class="flex justify-end gap-3 mt-5">
              <button id="cancelBtn"
                      class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition">
                Cancel
              </button>
              <button id="saveTheTemplateToMemory"
                      class="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">
                Save
              </button>
            </div>
          </div>
    `;
    document.body.appendChild(modal);

    // Now the modal is in the DOM, so bind event listeners
    document.getElementById('cancelBtn').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('saveTheTemplateToMemory').addEventListener('click', async () => {
        const filename = document.getElementById('filenameInput').value.trim();
        if (!filename) {
            alert('Please enter a file name.');
            return;
        }

        modal.remove();

        const html = editor.getHtml();
        const css = editor.getCss();

        try {
            const response = await fetch('/api/Edited_templates/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: filename + '.html',
                    html: html,
                    css: css,
                    page : temp_page,
                    previousTempID: tplId,
                })
            });

            const result = await response.json();
            if (response.ok) {
                alert('Saved to: ' + result.path);
            } else {
                alert('Save failed: ' + (result.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Network error while saving.');
        }
    });
});


});




