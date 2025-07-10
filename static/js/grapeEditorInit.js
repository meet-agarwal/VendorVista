// // editorInit.js
//
// export let editor ;
//
// /**
//  * Initializes the GrapesJS editor and loads template if given
//  * @param {string} mountId - HTML element ID to mount GrapesJS editor
//  * @param {string|null} templatePath - Optional HTML template path to load
//  */
// export function initializeEditor(mountId = 'gjs', templatePath = null) {
//     editor = grapesjs.init({
//     container: `#${mountId}`,
//     fromElement: false,
//     height: '100%',
//     width: 'auto',
//     storageManager: false,
//     plugins: [],
//     pluginsOpts: {},
//     components: '',
//     style: '',
//     deviceManager: {
//       // only one device, Desktop
//         dragMode: 'none',
//       devices: [
//         {
//           name: 'Desktop',
//           width: '',      // full width
//           widthMedia: ''  // no media query wrapper
//         }
//       ]
//     }
//   });
//
//   editor.StyleManager.removeSector('general');
//   editor.StyleManager.removeSector('extra');
//   editor.StyleManager.removeSector('flex');
//
//   //  // Method 1: Disable dragging after editor initialization
//   // editor.on('load', () => {
//   //   // Disable drag and drop functionality
//   //   editor.Canvas.getCanvasView().droppable = false;
//   //
//   //   // Or disable specific drag operations
//   //   const canvas = editor.Canvas.getCanvasView();
//   //   canvas.sorter && canvas.sorter.disable();
//   // });
//
//   // Method 2: Listen for component events and restrict movement
//   editor.on('component:add', (component) => {
//     // Make components non-draggable
//     component.set('draggable', false);
//     component.set('droppable', false);
//
//
//   });
//
//
//
//
//   if (templatePath) {
//     fetch(templatePath)
//       .then(res => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`);
//         }
//         return res.text();
//       })
//       .then(html => {
//         editor.setComponents(html);
//         console.log('Template loaded into GrapesJS');
//       })
//       .catch(err => {
//         console.error('Error loading template:', err);
//         alert('Could not load template: ' + err.message);
//       });
//   }
//
//   return editor;
// }
// editorInit.js

export let editor;

/**
 * Initializes the GrapesJS editor and loads template if given
 * @param {string} mountId - HTML element ID to mount GrapesJS editor
 * @param {string|null} templatePath - Optional HTML template path to load
 */
export function initializeEditor(mountId = 'gjs', templatePath = null) {
  editor = grapesjs.init({
    container: `#${mountId}`,
    fromElement: false,
    height: '100%',
    width: 'auto',
    storageManager: false,
    plugins: [],
    pluginsOpts: {},
    components: '',
    style: '',
    blockManager: {
      appendTo: '#blocks', // Panel for draggable elements
    },
    deviceManager: {
      dragMode: 'none',
      devices: [
        {
          name: 'Desktop',
          width: '',
          widthMedia: ''
        }
      ]
    }
  });

  // Remove unused style sectors
  editor.StyleManager.removeSector('general');
  editor.StyleManager.removeSector('extra');
  editor.StyleManager.removeSector('flex');

  // Restrict drag/drop on template-loaded components, but allow for blocks
  editor.on('component:add', (component) => {
    if (!component.get('copyable')) {
      component.set('draggable', false);
      component.set('droppable', false);
    }
  });

  // Add blocks: Text and Image
  const blockManager = editor.BlockManager;

  blockManager.add('text', {
    label: 'Text',
    category: 'Basic',
    content: {
      type: 'text',
      content: 'Insert your text here',
      style: { padding: '10px' },
      copyable: true // Mark user-inserted block
    }
  });

  blockManager.add('image', {
    label: 'Image',
    category: 'Basic',
    content: {
      type: 'image',
      activeOnRender: 1,
      copyable: true
    }
  });

  // Load external template if provided
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
