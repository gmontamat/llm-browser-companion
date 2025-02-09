# LLM Browser Companion

When writing an email or a PR review, I follow these steps: I write it in my own words, then copy and paste it into the
LLM platform of choice with a prompt like "spell-check, fix grammar, and simplify this text to make it more readable".
After that, I copy the edited result back to the original input box. Sometimes, I want to summarize long articles to get
the main points instead of reading through them, and I repeat the same copy-and-paste steps. This Firefox extension
simplifies my process by directly calling the LLM provider with customizable prompts.

Additionally, this happens to be an experiment to check if LLMs can help me write code in a language and framework I am
not familiar with. It seems that coding a browser extension in JavaScript comes with many restrictions. For instance,
injecting this extension into an Outlook tab to modify an email or edit a Reddit comment is not simple. Unfortunately,
the LLM wasn't very helpful in resolving these and other issues that arose during debugging.

The extension logo was created by DALL-E.

# How to Test this Extension in Firefox

1. Clone this repository.
2. Open Firefox.
3. Navigate to [about:debugging](about:debugging) in the address bar.
4. Click on "This Firefox" in the sidebar.
5. Click "Load Temporary Add-on".
6. Select the manifest.json file from the cloned repository.
