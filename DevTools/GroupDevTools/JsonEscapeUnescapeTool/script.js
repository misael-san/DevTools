// --- DOM ELEMENT SELECTION ---
// Get references to the HTML elements we will interact with.
// It's a good practice to do this at the beginning of the script to have them readily available.
const jsonInput = document.getElementById('json-input');
const jsonOutput = document.getElementById('json-output');
const escapeBtn = document.getElementById('escape-btn');
const unescapeBtn = document.getElementById('unescape-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn'); // New clear button

// --- FUNCTION DEFINITIONS ---

/**
 * Custom function to escape a string according to strict JSON rules, matching the reference tool.
 * This iterates through each character in the input string and replaces special characters
 * with their escaped equivalents. It also escapes forward slashes (/) and non-ASCII characters
 * to Unicode escapes (\uXXXX) for compatibility and safety, which JSON.stringify does not do by default.
 * The output is the escaped content without outer quotes, to match the reference.
 * @param {string} inputString - The raw string to escape.
 * @returns {string} - The escaped string.
 */
function escapeJsonString(inputString) {
    let escapedResult = '';
    for (let index = 0; index < inputString.length; index++) {
        let currentChar = inputString[index];
        switch (currentChar) {
            case '"':
                escapedResult += '\\"';
                break;
            case '\\':
                escapedResult += '\\\\';
                break;
            case '/':
                escapedResult += '\\/';
                break;
            case '\b':
                escapedResult += '\\b';
                break;
            case '\f':
                escapedResult += '\\f';
                break;
            case '\n':
                escapedResult += '\\n';
                break;
            case '\r':
                escapedResult += '\\r';
                break;
            case '\t':
                escapedResult += '\\t';
                break;
            default:
                let charCode = currentChar.charCodeAt(0);
                if (charCode < 32 || charCode > 126) {
                    // Convert non-ASCII or control characters to \uXXXX format
                    let hexCode = charCode.toString(16).toUpperCase();
                    escapedResult += '\\u' + '0000'.substring(hexCode.length) + hexCode;
                } else {
                    escapedResult += currentChar;
                }
                break;
        }
    }
    return escapedResult;
}

/**
 * Function to "escape" a string.
 * It takes the text from the input area, treats it as a single string,
 * and applies the custom escapeJsonString function. This escapes internal characters like quotes, newlines, etc.,
 * including extra escapes for / and non-ASCII to match the reference tool.
 * The result is a string that can be safely embedded as a value in another JSON, without outer quotes.
 */
function handleEscape() {
    const rawString = jsonInput.value;
    if (!rawString) {
        jsonOutput.value = '';
        return;
    }
    try {
        const escapedString = escapeJsonString(rawString);
        jsonOutput.value = escapedString;
    } catch (error) {
        jsonOutput.value = `Error during escape: ${error.message}`;
    }
}

/**
 * Function to "unescape" a string.
 * It takes a string that has been previously escaped (a JSON string literal without outer quotes)
 * and uses JSON.parse() after wrapping it in quotes to return it to its original form.
 */
function handleUnescape() {
    const escapedString = jsonInput.value;
    if (!escapedString) {
        jsonOutput.value = '';
        return;
    }
    try {
        // Wrap the escaped content in quotes to make it a valid JSON string for parsing
        const unescapedString = JSON.parse(`"${escapedString}"`);
        jsonOutput.value = unescapedString;
    } catch (error) {
        jsonOutput.value = `ERROR: Invalid string to unescape. Please check the format.\n\nDetails: ${error.message}`;
    }
}

/**
 * Function to copy the content of the output area to the clipboard.
 * It uses the modern and secure `navigator.clipboard` API.
 */
function handleCopy() {
    const resultText = jsonOutput.value;
    if (!resultText) {
        return;
    }
    navigator.clipboard.writeText(resultText).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

/**
 * Function to clear the content of both the input and output textareas.
 */
function handleClear() {
    jsonInput.value = '';
    jsonOutput.value = '';
}


// --- EVENT LISTENER ASSIGNMENTS ---
// Assign the corresponding functions to the 'click' event of each button.
// This connects the JavaScript logic with user actions on the page.
escapeBtn.addEventListener('click', handleEscape);
unescapeBtn.addEventListener('click', handleUnescape);
copyBtn.addEventListener('click', handleCopy);
clearBtn.addEventListener('click', handleClear); // Event listener for the new clear button