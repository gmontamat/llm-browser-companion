"use strict";

console.log("content-script: LOAD");

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
        const text = selection.toString();
        if (!text.trim()) {
          // Copy to clipboard if not able to edit content
          navigator.clipboard.writeText(responseText).then(() => {
            alert("Replaced text copied to clipboard!");
          });
        }
        else if (document.activeElement.isContentEditable) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(responseText));
        }
        else {
          // Content is not editable
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
