// Wait for the entire HTML document to be fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const htmlInput = document.getElementById('html-input');
    const outputFrame = document.getElementById('output-frame');
    const resizer = document.getElementById('resizer');
    const inputPane = document.getElementById('input-pane');
    const outputPane = document.getElementById('output-pane');
    const outputWidthDisplay = document.getElementById('output-width');
    const outputHeightDisplay = document.getElementById('output-height');

    // --- Core Functions ---

    /**
     * Renders the HTML code from the input textarea into the output iframe.
     * Also updates the displayed viewport dimensions of the iframe.
     */
    function renderHTML() {
        const code = htmlInput.value;
        outputFrame.srcdoc = code;
        updateViewportInfo();
    }

    /**
     * Updates the displayed width and height of the output iframe.
     * Uses requestAnimationFrame for potentially smoother updates.
     */
    function updateViewportInfo() {
        requestAnimationFrame(() => {
            if (outputFrame.contentWindow) {
                outputWidthDisplay.textContent = outputFrame.clientWidth;
                outputHeightDisplay.textContent = outputFrame.clientHeight;
            }
        });
    }

    // --- Event Listeners ---
    htmlInput.addEventListener('input', renderHTML);
    renderHTML(); // Initial render

    // --- Resizer Logic ---
    let isResizing = false; // Flag to track if the user is currently dragging the resizer
    // Store the pointerId for capturing and releasing
    let currentPointerId = null;


    // Use 'pointerdown' instead of 'mousedown' for better cross-device compatibility
    // and to enable pointer capture.
    resizer.addEventListener('pointerdown', (e) => {
        // Prevent default browser actions like text selection or image dragging,
        // which can interfere with our custom drag behavior.
        e.preventDefault();

        isResizing = true; // Set the resizing flag
        currentPointerId = e.pointerId; // Store the ID of the pointer (e.g., mouse, touch)

        // Capture the pointer. This makes the 'resizer' element the target
        // for all subsequent pointer events (pointermove, pointerup, pointercancel)
        // until the pointer is released. This is crucial for preventing the
        // "stuck" behavior when the mouse moves over iframes or outside the window.
        resizer.setPointerCapture(e.pointerId);

        // Attach pointermove and pointerup listeners directly to the resizer.
        // Since the pointer is captured, these events will fire on the resizer
        // regardless of where the pointer actually is on the screen.
        resizer.addEventListener('pointermove', handlePointerMove);
        resizer.addEventListener('pointerup', stopResize);
        resizer.addEventListener('pointercancel', stopResize); // Handle cases like system interruptions

        // Temporarily change body styles to improve resizing experience
        document.body.style.userSelect = 'none'; // Disable text selection globally
        document.body.style.cursor = 'col-resize'; // Change cursor for the whole body
    });

    /**
     * Handles the pointermove event when resizing.
     * Calculates and applies the new widths for the input and output panes.
     * @param {PointerEvent} e - The pointer event object.
     */
    function handlePointerMove(e) {
        // Only proceed if resizing is active and the event's pointerId matches the captured one.
        // This is an extra check, though setPointerCapture usually handles exclusivity.
        if (!isResizing || e.pointerId !== currentPointerId) return;

        const containerOffsetLeft = inputPane.parentElement.offsetLeft;
        let newLeftWidth = e.clientX - containerOffsetLeft;

        const totalWidth = inputPane.parentElement.offsetWidth;
        const resizerWidth = resizer.offsetWidth;
        const minPaneWidth = 50; // px

        // Constrain newLeftWidth to respect minimum pane widths
        if (newLeftWidth < minPaneWidth) {
            newLeftWidth = minPaneWidth;
        }
        if (totalWidth - newLeftWidth - resizerWidth < minPaneWidth) {
            newLeftWidth = totalWidth - minPaneWidth - resizerWidth;
        }

        const newRightWidth = totalWidth - newLeftWidth - resizerWidth;

        inputPane.style.flexBasis = `${newLeftWidth}px`;
        outputPane.style.flexBasis = `${newRightWidth}px`;

        updateViewportInfo(); // Update dimensions display
    }

    /**
     * Handles the pointerup or pointercancel event to stop the resizing process.
     * Cleans up event listeners, releases pointer capture, and resets body styles.
     * @param {PointerEvent} e - The pointer event object.
     */
    function stopResize(e) {
        // Only proceed if resizing is active and the event's pointerId matches.
        if (!isResizing || (currentPointerId !== null && e.pointerId !== currentPointerId)) return;

        isResizing = false; // Reset the resizing flag

        // Release the pointer capture. This is essential to allow normal event
        // handling for other elements once dragging is complete.
        if (currentPointerId !== null) {
            try {
                resizer.releasePointerCapture(currentPointerId);
            } catch (error) {
                // Capture might have already been lost (e.g. element removed, devtools interaction)
                // console.warn("Failed to release pointer capture:", error);
            }
            currentPointerId = null; // Clear stored pointer ID
        }


        // Remove the event listeners from the resizer.
        resizer.removeEventListener('pointermove', handlePointerMove);
        resizer.removeEventListener('pointerup', stopResize);
        resizer.removeEventListener('pointercancel', stopResize);

        // Reset body styles to their defaults
        document.body.style.userSelect = ''; // Re-enable text selection
        document.body.style.cursor = '';   // Reset the cursor
    }

    // --- ResizeObserver for Output Pane ---
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === outputPane) {
                updateViewportInfo();
            }
        }
    });
    resizeObserver.observe(outputPane);

    // Initial viewport info update
    setTimeout(updateViewportInfo, 100); // Small delay for initial layout stability
});