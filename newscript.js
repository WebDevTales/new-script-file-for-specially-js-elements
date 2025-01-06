
    document.addEventListener("DOMContentLoaded", function () {
    const widgetContainers = document.querySelectorAll('.code-container');

    widgetContainers.forEach(container => {
        const editCodeButton = container.querySelector(".editCodeButton");
        const popupOverlay = container.querySelector(".popupOverlay");
        const closePopupButton = container.querySelector(".closePopupButton");
        const tabs = container.querySelectorAll(".tab-btn");
        const tabContents = container.querySelectorAll(".tab-content");
        const iframe = container.querySelector(".livePreviewIframe");

        // Code Elements
        const htmlCode = container.querySelector(".htmlCode");
        const cssCode = container.querySelector(".cssCode");
        const jsCode = container.querySelector(".jsCode");

        const htmlHighlight = container.querySelector(".htmlHighlight");
        const cssHighlight = container.querySelector(".cssHighlight");
        const jsHighlight = container.querySelector(".jsHighlight");



        // Attach Beautify Events
container.querySelectorAll(".beautify-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const codeType = btn.dataset.code; // Get the code type (htmlCode, cssCode, jsCode)
    const codeElement = container.querySelector(`.${codeType}`);
    const highlightElement = container.querySelector(`.${codeType.replace('Code', 'Highlight')}`);

    if (codeElement && highlightElement) {
      try {
        if (codeType === "htmlCode") {
          codeElement.value = html_beautify(codeElement.value);
        } else if (codeType === "cssCode") {
          codeElement.value = css_beautify(codeElement.value);
        } else if (codeType === "jsCode") {
          codeElement.value = js_beautify(codeElement.value);
        }
        highlightElement.textContent = codeElement.value; // Update the contenteditable element
        Prism.highlightElement(highlightElement); // Apply syntax highlighting
        console.log(`${codeType} beautified successfully.`);
      } catch (error) {
        console.error(`Error beautifying ${codeType}:`, error);
      }
    }
  });
});


        // Function to beautify and highlight code
        function beautifyAndHighlightCode() {
            try {
                if (htmlCode && htmlHighlight) {
                    preserveCursorPosition(htmlHighlight, () => {
                        htmlCode.value = html_beautify(htmlCode.value);  // Beautify code
                        htmlHighlight.textContent = htmlCode.value;  // Update contenteditable
                        Prism.highlightElement(htmlHighlight);  // Apply syntax highlighting
                    });
                }

                if (cssCode && cssHighlight) {
                    preserveCursorPosition(cssHighlight, () => {
                        cssCode.value = css_beautify(cssCode.value);  // Beautify code
                        cssHighlight.textContent = cssCode.value;  // Update contenteditable
                        Prism.highlightElement(cssHighlight);  // Apply syntax highlighting
                    });
                }

                if (jsCode && jsHighlight) {
                    preserveCursorPosition(jsHighlight, () => {
                        jsCode.value = js_beautify(jsCode.value);  // Beautify code
                        jsHighlight.textContent = jsCode.value;  // Update contenteditable
                        Prism.highlightElement(jsHighlight);  // Apply syntax highlighting
                    });
                }
            } catch (error) {
                console.error("Error during beautification or highlighting:", error);
            }
        }

        function updatePreview() {
    try {
        const mainIframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const popupIframe = container.querySelector(".popupLivePreview .livePreviewIframe");
        const popupIframeDoc = popupIframe ? (popupIframe.contentDocument || popupIframe.contentWindow.document) : null;

        // Write HTML and CSS to the iframe
        const content = `
            ${htmlCode ? htmlCode.value : ""}
            <style>${cssCode ? cssCode.value : ""}</style>
        `;

        // Update main iframe with beautified content
        mainIframeDoc.open();
        mainIframeDoc.write(content);
        mainIframeDoc.close();

        // Update popup iframe (if exists)
        if (popupIframeDoc) {
            popupIframeDoc.open();
            popupIframeDoc.write(content);
            popupIframeDoc.close();
        }

        // Execute JavaScript code in the iframe's context
        const jsContent = jsCode ? jsCode.value : "";
        if (jsContent) {
            const iframeWindow = iframe.contentWindow;
            const popupIframeWindow = popupIframe ? popupIframe.contentWindow : null;

            // Wait for the iframe to load before executing JS
            iframe.onload = () => {
                iframeWindow.eval(jsContent);
                console.log("JS executed in main iframe!");
            };

            if (popupIframe) {
                popupIframe.onload = () => {
                    popupIframeWindow.eval(jsContent);
                    console.log("JS executed in popup iframe!");
                };
            }
        }
    } catch (error) {
        console.error("Error during preview update:", error);
    }
}

        // Open Popup
        if (editCodeButton) {
            editCodeButton.addEventListener("click", () => {
                popupOverlay.style.display = "flex";
                beautifyAndHighlightCode(); // Beautify and highlight code when popup opens
                updatePreview(); // Set initial content in the popup
            });
        }

        // Close Popup
        if (closePopupButton) {
            closePopupButton.addEventListener("click", () => {
                popupOverlay.style.display = "none";
            });
        }

        // Tab Switching Logic
        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                tabs.forEach((btn) => btn.classList.remove("active"));
                tabContents.forEach((content) => content.classList.remove("active"));
                tab.classList.add("active");
                const activeTabContent = container.querySelector(`.${tab.dataset.tab}`);
                if (activeTabContent) {
                    activeTabContent.classList.add("active");
                }
            });
        });

        // Synchronize contenteditable with live updates
        if (htmlHighlight) {
            htmlHighlight.addEventListener("input", () => {
                preserveCursorPosition(htmlHighlight, () => {
                    htmlCode.value = htmlHighlight.textContent;
                    updatePreview(); // Live preview update
                });
            });
        }

        if (cssHighlight) {
            cssHighlight.addEventListener("input", () => {
                preserveCursorPosition(cssHighlight, () => {
                    cssCode.value = cssHighlight.textContent;
                    updatePreview(); // Live preview update
                });
            });
        }

        if (jsHighlight) {
            jsHighlight.addEventListener("input", () => {
                preserveCursorPosition(jsHighlight, () => {
                    jsCode.value = jsHighlight.textContent;
                    updatePreview(); // Live preview update
                });
            });
        }

        // Preserve cursor position during live synchronization
        function preserveCursorPosition(element, callback) {
            const selection = window.getSelection();
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

            const preCaretRange = range?.cloneRange();
            if (preCaretRange) {
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
            }
            const caretOffset = preCaretRange?.toString().length || 0;

            // Perform the update or callback
            callback();

            if (range && caretOffset > 0) {
                const newRange = document.createRange();
                const textNode = element.firstChild;
                newRange.setStart(textNode, caretOffset);
                newRange.setEnd(textNode, caretOffset);

                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }

       // Function to copy code to clipboard
function copyCode(codeElement, notificationElement) {
    try {
        const code = codeElement.value;
        navigator.clipboard.writeText(code).then(() => {
            console.log("Code copied to clipboard:", code);
            notificationElement.classList.add("show");
            setTimeout(() => {
                notificationElement.classList.remove("show");
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy code:", err);
        });
    } catch (error) {
        console.error("Error during copy operation:", error);
    }
}

// Attach Copy Events
container.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const codeType = btn.dataset.code; // Get the code type (htmlCode, cssCode, jsCode)
        const codeElement = container.querySelector(`.${codeType}`); // Find the corresponding textarea
        const notification = btn.nextElementSibling;
        copyCode(codeElement, notification);
    });
});






        beautifyAndHighlightCode();
        updatePreview();
    });
});

