document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('json-input');
    const outputArea = document.getElementById('json-output');
    const toggleBtn = document.getElementById('toggle-tree');
    
    let isExpanded = true;

    // Helper function to prevent HTML injection (XSS) and display tags as plain text
    function escapeHTML(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g, match => {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            };
            return escapeMap[match];
        });
    }

    toggleBtn.addEventListener('click', () => {
        const detailsElements = outputArea.querySelectorAll('details');
        isExpanded = !isExpanded;
        
        detailsElements.forEach(detail => {
            detail.open = isExpanded;
        });

        toggleBtn.textContent = isExpanded ? 'Collapse All' : 'Expand All';
    });

    inputArea.addEventListener('input', () => {
        const rawText = inputArea.value.trim();
        
        if (!rawText) {
            outputArea.innerHTML = '<span class="placeholder-msg">Waiting for valid JSON...</span>';
            toggleBtn.disabled = true;
            return;
        }

        try {
            const parsedJSON = JSON.parse(rawText);
            outputArea.innerHTML = ''; 
            outputArea.appendChild(buildTree(parsedJSON));
            
            toggleBtn.disabled = false;
            isExpanded = true;
            toggleBtn.textContent = 'Collapse All';
            
        } catch (error) {
            outputArea.innerHTML = `<span class="error-msg">Invalid JSON: ${error.message}</span>`;
            toggleBtn.disabled = true;
        }
    });

    function buildTree(data, key = null, isLast = true) {
        const wrapper = document.createElement('div');
        
        // Escape the key if it exists to prevent HTML injection in object keys
        const safeKey = key !== null ? escapeHTML(String(key)) : null;
        const keyHtml = safeKey !== null ? `<span class="json-key">"${safeKey}"</span>: ` : '';

        if (data === null) {
            wrapper.innerHTML = `${keyHtml}<span class="json-null">null</span>${isLast ? '' : ','}`;
            return wrapper;
        }

        if (typeof data !== 'object') {
            const valClass = `json-${typeof data}`;
            // Escape the string value so HTML tags show as text
            const valStr = typeof data === 'string' ? `"${escapeHTML(data)}"` : data;
            wrapper.innerHTML = `${keyHtml}<span class="${valClass}">${valStr}</span>${isLast ? '' : ','}`;
            return wrapper;
        }

        const isArray = Array.isArray(data);
        const openBracket = isArray ? '[' : '{';
        const closeBracket = isArray ? ']' : '}';
        const entries = isArray ? data : Object.entries(data);
        const length = entries.length;

        if (length === 0) {
            wrapper.innerHTML = `${keyHtml}${openBracket}${closeBracket}${isLast ? '' : ','}`;
            return wrapper;
        }

        const details = document.createElement('details');
        details.open = true;
        
        const summary = document.createElement('summary');
        summary.innerHTML = `${keyHtml}${openBracket}`;
        details.appendChild(summary);

        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'json-children';

        if (isArray) {
            entries.forEach((item, index) => {
                childrenContainer.appendChild(buildTree(item, null, index === length - 1));
            });
        } else {
            entries.forEach(([k, v], index) => {
                childrenContainer.appendChild(buildTree(v, k, index === length - 1));
            });
        }

        details.appendChild(childrenContainer);

        const closeNode = document.createElement('div');
        closeNode.innerHTML = `${closeBracket}${isLast ? '' : ','}`;
        details.appendChild(closeNode);

        wrapper.appendChild(details);
        return wrapper;
    }
});