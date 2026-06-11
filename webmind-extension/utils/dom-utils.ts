/**
 * DOM utility functions for WebMind content script.
 */

export function getXPathForNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentNode;
    if (!parent) return '';
    const siblings = Array.from(parent.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE);
    const index = siblings.indexOf(node as ChildNode) + 1;
    return `${getXPathForNode(parent)}/text()[${index}]`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const element = node as Element;
  if (element === document.documentElement) return '/html';
  if (element === document.body) return '/html/body';

  const parent = element.parentNode;
  if (!parent) return '';

  const siblings = Array.from(parent.children).filter((el) => el.tagName === element.tagName);
  const index = siblings.indexOf(element) + 1;
  const tag = element.tagName.toLowerCase();

  return `${getXPathForNode(parent)}/${tag}[${index}]`;
}

export function getElementByXPath(xpath: string): Node | null {
  try {
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
  } catch {
    return null;
  }
}

export function getTextOffsetInParent(textNode: Node): number {
  const parent = textNode.parentNode;
  if (!parent) return 0;

  let offset = 0;
  for (const child of Array.from(parent.childNodes)) {
    if (child === textNode) break;
    if (child.nodeType === Node.TEXT_NODE) {
      offset += (child.textContent || '').length;
    }
  }
  return offset;
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return url.replace(/\/$/, '').split('#')[0].split('?')[0];
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
