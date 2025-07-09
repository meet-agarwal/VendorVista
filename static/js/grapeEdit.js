import { initializeEditor } from './grapeEditorInit.js';

const params = new URLSearchParams(window.location.search);
const tpl = params.get('template');
const mode = params.get('mode');
const page = params.get('page');

const templateUrl = tpl || null;


// Initialize GrapesJS on #canvas
initializeEditor('gjs', templateUrl);


// 1. Somewhere in your UI: a “Save” button
const btn = document.getElementById('save_template');
btn.addEventListener('click', () => {
  // 2. Extract HTML & CSS
  const html = editor.getHtml();
  const css  = editor.getCss();

  // 3. POST to your server
  fetch('/api/templates/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      filename: 'myTemplate.html',   // you choose
      html, 
      css 
    })
  })
  .then(r => r.json())
  .then(res => alert('Saved to: ' + res.path))
  .catch(err => console.error(err));
});
