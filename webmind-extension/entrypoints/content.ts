/**
 * Content script for WebMind highlighting.
 * Injected into web pages to handle text selection and highlighting.
 */

import { createHighlight } from '../utils/highlight-utils';
import { normalizeUrl } from '../utils/dom-utils';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'HIGHLIGHT_SELECTION') {
        highlightSelectedText(message.text);
        sendResponse({ success: true });
      }
    });
  },
});

function highlightSelectedText(selectedText: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const text = range.toString();

  if (!text.trim()) return;

  // Create highlight marker
  const span = document.createElement('span');
  span.style.backgroundColor = 'rgba(254, 240, 138, 0.4)';
  span.style.borderRadius = '2px';
  span.style.padding = '1px 0';
  span.className = 'webmind-highlight';

  try {
    range.surroundContents(span);
  } catch {
    const extracted = range.extractContents();
    span.appendChild(extracted);
    range.insertNode(span);
  }

  // Build highlight data
  const highlight = createHighlight({
    url: normalizeUrl(window.location.href),
    title: document.title,
    text: text.trim(),
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    xpath: getXPath(span),
    color: 'yellow',
  });

  // Save to storage via background script
  chrome.runtime.sendMessage({
    type: 'SAVE_HIGHLIGHT',
    highlight,
  });

  selection.removeAllRanges();
}

function getXPath(element: Element): string {
  if (element === document.documentElement) return '/html';
  if (element === document.body) return '/html/body';

  const parent = element.parentElement;
  if (!parent) return '';

  const siblings = Array.from(parent.children).filter((el) => el.tagName === element.tagName);
  const index = siblings.indexOf(element) + 1;
  const tag = element.tagName.toLowerCase();

  return `${getXPath(parent)}/${tag}[${index}]`;
}
