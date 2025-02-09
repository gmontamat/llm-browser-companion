"use strict";

console.log("background-script: LOAD");

// Default menu items
const defaultMenuItems = [
  {
    id: "defaultReWrite",
    title: "Re-write",
    text: "Re-write this text spell-checking it, fixing grammar, and simplifying it to make it more readable:"
  },
  {
    id: "defaultSummarize",
    title: "Summarize",
    text: "Summarize this text in a few bullet points, highlighting the main ideas and intention of the author:"
  }
];

// Initialize default menu items on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('menuItems', (data) => {
    if (!data || !data.menuItems || data.menuItems.length === 0) {
      chrome.storage.sync.set({ 'menuItems': defaultMenuItems }, updateContextMenus);
    } else {
      updateContextMenus();
    }
  });
});

// Load menu items from storage and create context menus
function updateContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.storage.sync.get('menuItems', (data) => {
      if (data.menuItems) {
        data.menuItems.forEach(item => {
          chrome.contextMenus.create({
            id: item.id,
            title: item.title,
            contexts: ["selection"]
          });
        });
      }
    });
  });
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.storage.sync.get('menuItems', (data) => {
    const selectedItem = data.menuItems.find(item => item.id === info.menuItemId);
    if (selectedItem) {
      chrome.tabs.sendMessage(tab.id, { text: info.selectionText, textPrompt: selectedItem.text });
    }
  });
});
