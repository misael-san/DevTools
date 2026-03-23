// Updates line numbers dynamically
function updateLineNumbers() {
  const textarea = document.getElementById('jsonInput');
  const lineNumbers = document.getElementById('lineNumbers');
  const lines = textarea.value.split('\n').length || 1; // Ensures at least 1 line
  lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

// Validates JSON using jsonlint, after attempting to prettify
function validateJson() {
  const textarea = document.getElementById('jsonInput');
  const errorOutput = document.getElementById('errorOutput');
  let input = textarea.value;

  // Clear previous results
  errorOutput.innerHTML = '';

  if (!input.trim()) {
    errorOutput.textContent = 'Please enter JSON to validate.';
    errorOutput.style.color = '#d32f2f';
    return;
  }

  // First, attempt to prettify the JSON regardless of validity
  try {
    const parsed = JSON.parse(input); // Parse to prettify
    input = JSON.stringify(parsed, null, 2); // Prettify
    textarea.value = input; // Update textarea with prettified JSON
    updateLineNumbers();
  } catch (error) {
    // If parsing fails, still proceed to validation with original input
    textarea.value = input; // Keep original input if it can't be parsed
    updateLineNumbers();
  }

  // Now validate the JSON using jsonlint
  try {
    jsonlint.parse(input); // Use jsonlint for validation
    errorOutput.textContent = 'Valid JSON';
    errorOutput.style.color = '#4CAF50';
  } catch (error) {
    errorOutput.textContent = `Error: ${error.message}`;
    errorOutput.style.color = '#d32f2f';

    // Try to identify the error line
    const lines = input.split('\n');
    let errorLine = 1;
    let errorColumn = 1;

    // Extract line number and position from jsonlint error message
    const lineMatch = error.message.match(/line (\d+)/i);
    const positionMatch = error.message.match(/position (\d+)/i);
    if (lineMatch) {
      errorLine = parseInt(lineMatch[1]);
    }
    if (positionMatch) {
      const position = parseInt(positionMatch[1]);
      let currentPos = 0;
      for (let i = 0; i < lines.length; i++) {
        if (i + 1 < errorLine) {
          currentPos += lines[i].length + 1; // +1 for newline
        } else {
          errorColumn = position - currentPos + 1;
          break;
        }
      }
    }

    // Highlight the error line
    if (lines[errorLine - 1]) {
      errorOutput.innerHTML += `
        <div class="error-line">
          Line ${errorLine}, Column ${errorColumn}: ${lines[errorLine - 1].replace(/</g, '<').replace(/>/g, '>')}
        </div>`;
    }
  }
}

// Toggles between compressing and prettifying JSON
function toggleFormat() {
  const textarea = document.getElementById('jsonInput');
  const formatButton = document.getElementById('formatButton');
  const errorOutput = document.getElementById('errorOutput');
  const input = textarea.value;

  // Clear previous results
  errorOutput.innerHTML = '';

  if (!input.trim()) {
    errorOutput.textContent = 'Please enter JSON to format.';
    errorOutput.style.color = '#d32f2f';
    return;
  }

  try {
    const parsed = JSON.parse(input); // Use JSON.parse for formatting
    const currentMode = formatButton.getAttribute('data-mode');

    if (currentMode === 'prettify') {
      // Prettify: Format with indentation
      textarea.value = JSON.stringify(parsed, null, 2);
      formatButton.textContent = 'Compress';
      formatButton.setAttribute('data-mode', 'compress');
      errorOutput.textContent = 'JSON Prettified';
    } else {
      // Compress: Minify to a single line
      textarea.value = JSON.stringify(parsed);
      formatButton.textContent = 'Prettify';
      formatButton.setAttribute('data-mode', 'prettify');
      errorOutput.textContent = 'JSON Compressed';
    }
    updateLineNumbers();
    errorOutput.style.color = '#4CAF50';
  } catch (error) {
    errorOutput.textContent = `Error: ${error.message}`;
    errorOutput.style.color = '#d32f2f';

    // Try to identify the error line
    const lines = input.split('\n');
    let errorLine = 1;
    let errorColumn = 1;

    // Extract line number and position from error message
    const lineMatch = error.message.match(/position (\d+)/i);
    if (lineMatch) {
      const position = parseInt(lineMatch[1]);
      let currentPos = 0;
      for (let i = 0; i < lines.length; i++) {
        currentPos += lines[i].length + 1; // +1 for newline
        if (currentPos > position) {
          errorLine = i + 1;
          errorColumn = position - (currentPos - lines[i].length - 1);
          break;
        }
      }
    }

    // Highlight the error line
    if (lines[errorLine - 1]) {
      errorOutput.innerHTML += `
        <div class="error-line">
          Line ${errorLine}, Column ${errorColumn}: ${lines[errorLine - 1].replace(/</g, '<').replace(/>/g, '>')}
        </div>`;
    }
  }
}

// Copies the input to clipboard
function copyResult() {
  const textarea = document.getElementById('jsonInput');
  const errorOutput = document.getElementById('errorOutput');
  const text = textarea.value;

  // Clear previous results
  errorOutput.innerHTML = '';

  if (text.trim()) {
    navigator.clipboard.writeText(text).then(() => {
      errorOutput.textContent = 'JSON copied to clipboard!';
      errorOutput.style.color = '#4CAF50';
    }).catch(err => {
      console.error('Failed to copy: ', err);
      errorOutput.textContent = 'Failed to copy JSON.';
      errorOutput.style.color = '#d32f2f';
    });
  } else {
    errorOutput.textContent = 'No JSON to copy.';
    errorOutput.style.color = '#d32f2f';
  }
}

// Clears the form
function clearInput() {
  const textarea = document.getElementById('jsonInput');
  const errorOutput = document.getElementById('errorOutput');
  const formatButton = document.getElementById('formatButton');

  textarea.value = '';
  errorOutput.textContent = '';
  formatButton.textContent = 'Prettify';
  formatButton.setAttribute('data-mode', 'prettify');
  updateLineNumbers();
}

// Initializes line numbers and adds event listeners
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('jsonInput');
  const lineNumbers = document.getElementById('lineNumbers');

  // Initial line numbers
  updateLineNumbers();

  // Update line numbers on input
  textarea.addEventListener('input', updateLineNumbers);

  // Synchronize scrolling
  textarea.addEventListener('scroll', () => {
    lineNumbers.scrollTop = textarea.scrollTop;
  });
});