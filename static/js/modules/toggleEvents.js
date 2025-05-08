export function addToggleEventListeners() {
    // ... logic to handle expand/collapse toggle

    // First remove all existing listeners
    document.querySelectorAll('.filter-label[data-has-listener]').forEach(label => {
    label.replaceWith(label.cloneNode(true));
    });

    document.querySelectorAll('.filter-label').forEach(label => {
        label.setAttribute('data-has-listener', 'true');
        
        const handler = function() {
            const contentId = this.getAttribute('aria-controls');
            const content = contentId ? document.getElementById(contentId) : null;
            
            if (content) {
                const wasExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !wasExpanded);
                this.classList.toggle('collapsed');
                content.classList.toggle('hidden');
            }
        };
        
        label.addEventListener('click', handler);
        label.addEventListener('keydown', function(e) {
            if (['Enter', ' '].includes(e.key)) {
                e.preventDefault();
                handler.call(this);
            }
        });
    });
  }
  