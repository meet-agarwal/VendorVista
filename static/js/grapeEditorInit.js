// editorInit.js

/**
 * Initializes the GrapesJS editor and loads template if given
 * @param {string} mountId - HTML element ID to mount GrapesJS editor
 * @param {string|null} templatePath - Optional HTML template path to load
 */
export function initializeEditor(mountId = 'gjs', templatePath = null) {
  const editor = grapesjs.init({
    container: `#${mountId}`,
    fromElement: false,
    height: '100%',
    width: 'auto',
    storageManager: false,
    plugins: [],
    pluginsOpts: {},
    components: '',
    style: '',
    deviceManager: {
      // only one device, Desktop
      devices: [
        {
          name: 'Desktop',
          width: '',      // full width
          widthMedia: ''  // no media query wrapper
        }
      ]
    }
  });

  editor.StyleManager.removeSector('general');
  editor.StyleManager.removeSector('extra');
  editor.StyleManager.removeSector('flex');




  if (templatePath) {
    fetch(templatePath)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then(html => {
        editor.setComponents(html);
        console.log('Template loaded into GrapesJS');
      })
      .catch(err => {
        console.error('Error loading template:', err);
        alert('Could not load template: ' + err.message);
      });
  }

  return editor;
}
