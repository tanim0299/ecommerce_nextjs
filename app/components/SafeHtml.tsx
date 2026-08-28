interface SafeHtmlProps {
  html: string;
  className?: string;
}

const allowedTags = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'ul', 'ol', 'li', 'blockquote',
  'h2', 'h3', 'h4', 'h5', 'h6', 'span',
]);

const sanitizeHtml = (html: string) => html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
  .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|svg|math)\b[^>]*\/?\s*>/gi, '')
  .replace(/<\/([a-z][\w-]*)\s*>/gi, (tag, tagName: string) => {
    const normalizedTag = tagName.toLocaleLowerCase();
    return allowedTags.has(normalizedTag) ? `</${normalizedTag}>` : '';
  })
  .replace(/<([a-z][\w-]*)(?:\s[^>]*)?\/?\s*>/gi, (tag, tagName: string) => {
    const normalizedTag = tagName.toLocaleLowerCase();
    if (!allowedTags.has(normalizedTag)) return '';
    return normalizedTag === 'br' ? '<br>' : `<${normalizedTag}>`;
  });

export default function SafeHtml({ html, className }: SafeHtmlProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
