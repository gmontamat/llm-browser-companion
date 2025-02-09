"use strict";

console.log("content-script: LOAD");

function isNodeEditable(node) {
  // Traverse up the DOM tree to check if any ancestor is editable
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node;
      const contentEditable = element.getAttribute('contenteditable');

      if (element.isContentEditable || contentEditable === 'true') {
        return true;
      }

      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        return true;
      }
    }
    node = node.parentNode;
  }
  return false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.text) {
    // Retrieve the user-configured Azure AI API credentials
    chrome.storage.sync.get(['apiKey', 'resourceName', 'deploymentId', 'apiVersion', 'maxTokens', 'temperature'], (config) => {
      const apiKey = config.apiKey || '';
      const resourceName = config.resourceName || '';
      const deploymentId = config.deploymentId || '';
      const apiVersion = config.apiVersion || '2023-05-15';
      const maxTokens = config.maxTokens || 120;
      const temperature = config.temperature || 0.7;

      if (!apiKey || !resourceName || !deploymentId) {
        alert('LLM Browser Companion: missing required API settings.');
        return;
      }

      // Construct the full API endpoint URL
      const apiUrl = `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`;

      // Call the Azure AI API with the highlighted text
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `${request.textPrompt}\n\n${request.text}\n\n` }
          ],
          max_tokens: maxTokens,
          temperature: temperature
        })
      })
      .then(response => response.json())
      .then(data => {
        const responseText = data.choices[0].message.content;

        const selection = window.getSelection();
        let isEditable = false;
        // Check if there's a selection
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const commonAncestorContainer = range.commonAncestorContainer;
            // Check if the selected text is within an editable element
            isEditable = isNodeEditable(commonAncestorContainer);
        }

        if (isEditable) {
          // Replace the selected text with the response
          range.deleteContents();
          range.insertNode(document.createTextNode(responseText));
        } else {
          // TODO: fix cross-origin error
          alert(responseText)
          // Open a new window with the response if not editable
          //const responseWindow = window.open("", "_blank", "width=600,height=400");
          //responseWindow.document.write("<pre>" + responseText + "</pre>");
          //responseWindow.document.title = "LLM Browser Companion";
        }
      })
      .catch(error => console.error('Error:', error));
    });
  }
});
