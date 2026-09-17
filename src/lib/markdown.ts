import { SITE_URL } from '@/seo/site';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(raw: string): string {
  let s = escapeHtml(raw);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g, (_m, text: string, url: string) => {
    const external = /^https?:\/\//.test(url) && !url.startsWith(SITE_URL);
    return `<a href="${url}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
  });
  return s;
}

/**
 * Small, safe markdown renderer for blog posts. Supports ## / ### headings,
 * paragraphs, bold, italics, links, bullet and numbered lists, and quotes.
 * All text is HTML-escaped first, so authors cannot inject markup.
 */
export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.type}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.type}>`);
    list = null;
  };

  for (const line of lines) {
    const t = line.trim();
    let m: RegExpMatchArray | null;
    if (!t) {
      flushPara();
      flushList();
    } else if ((m = t.match(/^(#{2,3})\s+(.*)$/))) {
      flushPara();
      flushList();
      const level = m[1].length;
      out.push(`<h${level}>${inline(m[2])}</h${level}>`);
    } else if ((m = t.match(/^[-*]\s+(.*)$/))) {
      flushPara();
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; }
      list.items.push(m[1]);
    } else if ((m = t.match(/^\d+\.\s+(.*)$/))) {
      flushPara();
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; }
      list.items.push(m[1]);
    } else if ((m = t.match(/^>\s?(.*)$/))) {
      flushPara();
      flushList();
      out.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else {
      flushList();
      para.push(t);
    }
  }
  flushPara();
  flushList();
  return out.join('\n');
}

export function plainText(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
