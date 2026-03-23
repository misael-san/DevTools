document.addEventListener('DOMContentLoaded', () => {
    // Get references to the textareas
    const decodedTextArea = document.getElementById('decoded-text');
    const encodedTextArea = document.getElementById('encoded-text');

    // Flag to prevent infinite loops during programmatic updates
    let isInternallyUpdating = false;

    /**
     * Encodes a string of characters into HTML entities.
     * Encodes &, <, >, ", ' and characters with charCode > 127.
     * @param {string} str - The string to encode.
     * @returns {string} The HTML entity encoded string.
     */
    function encodeEntities(str) {
        if (typeof str !== 'string') return '';

        // Basic entities map
        const basicEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;' // HTML5 entity for single quote. Use '&#39;' for wider compatibility if needed.
        };

        let result = '';
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (basicEntities[char]) {
                result += basicEntities[char];
            } else if (char.charCodeAt(0) > 127) {
                // For non-ASCII characters, use hexadecimal numeric entities
                result += `&#x${char.charCodeAt(0).toString(16).toUpperCase()};`;
            } else {
                result += char; // Keep other ASCII characters as they are
            }
        }
        return result;
    }

    /**
     * Decodes a string of HTML entities back into characters.
     * Uses the browser's built-in HTML parsing capabilities.
     * @param {string} str - The HTML entity string to decode.
     * @returns {string} The decoded string.
     */
    function decodeEntities(str) {
        if (typeof str !== 'string') return '';

        // Create a temporary textarea element to leverage browser's HTML parsing
        const tempTextArea = document.createElement('textarea');
        tempTextArea.innerHTML = str;
        return tempTextArea.value;
    }

    // Event listener for the "Decoded Characters" textarea
    decodedTextArea.addEventListener('input', () => {
        // If the update is triggered by the other textarea, do nothing
        if (isInternallyUpdating) return;

        const decodedText = decodedTextArea.value;
        const encodedText = encodeEntities(decodedText);

        // Set flag to true before programmatically updating the other textarea
        isInternallyUpdating = true;
        encodedTextArea.value = encodedText;
        // Reset flag after update
        isInternallyUpdating = false;
    });

    // Event listener for the "HTML Entities" textarea
    encodedTextArea.addEventListener('input', () => {
        // If the update is triggered by the other textarea, do nothing
        if (isInternallyUpdating) return;

        const encodedText = encodedTextArea.value;
        const decodedText = decodeEntities(encodedText);

        // Set flag to true before programmatically updating the other textarea
        isInternallyUpdating = true;
        decodedTextArea.value = decodedText;
        // Reset flag after update
        isInternallyUpdating = false;
    });
});