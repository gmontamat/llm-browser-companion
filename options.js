"use strict";

console.log("options-script: LOAD");

// Render menu items
function renderMenuItems() {
  chrome.storage.sync.get('menuItems', (data) => {
    const menuList = document.getElementById('menuList');
    menuList.innerHTML = '';
    if (data.menuItems) {
      data.menuItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.title} - ${item.text}`;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => {
          data.menuItems.splice(index, 1);
          chrome.storage.sync.set({ 'menuItems': data.menuItems }, renderMenuItems);
        };
        li.appendChild(removeButton);
        menuList.appendChild(li);
      });
    }
  });
}

// Add a new menu item
document.getElementById('add').addEventListener('click', () => {
  const title = document.getElementById('title').value;
  const text = document.getElementById('text').value;
  if (title && text) {
    chrome.storage.sync.get('menuItems', (data) => {
      const newMenuItems = data.menuItems || [];
      const newId = `menuItem_${new Date().getTime()}`;
      newMenuItems.push({ id: newId, title, text });
      chrome.storage.sync.set({ 'menuItems': newMenuItems }, () => {
        renderMenuItems();
        document.getElementById('title').value = '';
        document.getElementById('text').value = '';
      });
    });
  }
});

// Save API configuration
document.getElementById('saveApiConfig').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value;
  const resourceName = document.getElementById('resourceName').value;
  const deploymentId = document.getElementById('deploymentId').value;
  const apiVersion = document.getElementById('apiVersion').value;
  const maxTokens = parseInt(document.getElementById('maxTokens').value);
  const temperature = parseInt(document.getElementById('temperature').value);
  chrome.storage.sync.set({ apiKey, resourceName, deploymentId, apiVersion, maxTokens, temperature }, () => {
    alert('API configuration saved.');
  });
});

// Load API configuration on page load
document.addEventListener('DOMContentLoaded', () => {
  renderMenuItems();
  chrome.storage.sync.get(['apiKey', 'resourceName', 'deploymentId', 'apiVersion', 'maxTokens', 'temperature'], (config) => {
    document.getElementById('apiKey').value = config.apiKey || '';
    document.getElementById('resourceName').value = config.resourceName || '';
    document.getElementById('deploymentId').value = config.deploymentId || '';
    document.getElementById('apiVersion').value = config.apiVersion || '2023-05-15';
    document.getElementById('maxTokens').value = config.maxTokens || 120;
    document.getElementById('temperature').value = config.temperature || 0.7;
  });
});
