const CJK_REGEX = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g;

const DEFAULT_CHARS_PER_MINUTE = 300;

export function stripMarkdown(input) {
  if (typeof input !== "string") return "";

  let s = input;

  // 1. Fenced code blocks
  s = s.replace(/```[\s\S]*?```/g, "");

  // 2. Inline code
  s = s.replace(/`[^`\n]*`/g, "");

  // 3. Images: ![alt](url) -> alt
  s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");

  // 4. Links: [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // 5. Reference-style links / images
  s = s.replace(/!?\[([^\]]+)\]\[[^\]]*\]/g, "$1");

  // 6. Heading prefixes
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");

  // 7. Emphasis markers (process longer markers first)
  s = s.replace(/(\*\*|__)(.+?)\1/g, "$2");
  s = s.replace(/(\*|_)(.+?)\1/g, "$2");
  s = s.replace(/~~(.+?)~~/g, "$1");

  // 8. List markers at line start
  s = s.replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, "");

  // 9. Blockquote markers
  s = s.replace(/^\s{0,3}>\s?/gm, "");

  // 10. Horizontal rules
  s = s.replace(/^\s{0,3}(?:[-*_]\s*){3,}$/gm, "");

  // 11. HTML tags
  s = s.replace(/<[^>]+>/g, "");

  // 12. Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

export function countWords(markdown) {
  const text = stripMarkdown(markdown);
  if (!text) return 0;

  const cjkCount = (text.match(CJK_REGEX) || []).length;
  const nonCjk = text.replace(CJK_REGEX, " ");
  const tokens = nonCjk.split(/\s+/).filter(Boolean);

  return cjkCount + tokens.length;
}

export function readingMinutes(markdown, cpm = DEFAULT_CHARS_PER_MINUTE) {
  const count = countWords(markdown);
  if (count === 0) return 0;
  if (count < cpm) return 1;
  return Math.ceil(count / cpm);
}
