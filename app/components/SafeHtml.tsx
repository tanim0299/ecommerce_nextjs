import React from 'react';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

const allowedTags = new Set([
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'strike',
  'mark', 'small', 'sub', 'sup', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'a', 'img'
]);

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  // 1. Remove comments
  let clean = html.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Strip dangerous tags and their content
  clean = clean.replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|svg|math|applet|meta|link)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  clean = clean.replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|svg|math|applet|meta|link)\b[^>]*\/?\s*>/gi, '');

  // 3. Remove inline event handlers (onclick, onload, onerror, etc.)
  clean = clean.replace(/\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 4. Clean tags: allow only allowedTags, preserve safe attributes
  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/gi, (match, tagName, rawAttrs) => {
    const tag = tagName.toLowerCase();
    if (!allowedTags.has(tag)) {
      return '';
    }

    const isClosing = match.startsWith('</');
    if (isClosing) {
      return `</${tag}>`;
    }

    // Filter safe attributes for opening tags
    const safeAttrs: string[] = [];
    const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

      // Block javascript:, vbscript: schemes
      if ((attrName === 'href' || attrName === 'src') && /^(javascript|vbscript):/i.test(attrValue.trim())) {
        continue;
      }

      if (['class', 'style', 'title', 'alt', 'width', 'height', 'colspan', 'rowspan', 'align'].includes(attrName)) {
        safeAttrs.push(`${attrName}="${attrValue.replace(/"/g, '&quot;')}"`);
      } else if (attrName === 'href' && tag === 'a') {
        safeAttrs.push(`href="${attrValue.replace(/"/g, '&quot;')}"`);
        safeAttrs.push('target="_blank"');
        safeAttrs.push('rel="noopener noreferrer"');
      } else if (attrName === 'src' && tag === 'img') {
        safeAttrs.push(`src="${attrValue.replace(/"/g, '&quot;')}"`);
        safeAttrs.push('loading="lazy"');
      }
    }

    const attrStr = safeAttrs.length > 0 ? ' ' + safeAttrs.join(' ') : '';
    if (tag === 'br' || tag === 'hr' || tag === 'img') {
      return `<${tag}${attrStr} />`;
    }

    return `<${tag}${attrStr}>`;
  });

  return clean;
};

export default function SafeHtml({ html, className }: SafeHtmlProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}