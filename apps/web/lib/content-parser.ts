export interface MarkdownBlock {
  key: string;
  type: 'markdown' | 'code';
  content: string;
  language?: string;
  isComplete: boolean;
}

/**
 * Parses a markdown string into an array of markdown and code blocks.
 * @param markdown The raw markdown string.
 * @returns An array of MarkdownBlock objects.
 */
export function parseMarkdownIntoBlocks(markdown: string): MarkdownBlock[] {
  // This regex splits the content by fenced code blocks.
  // It captures the language, the content, and the closing backticks.
  // The 's' flag allows '.' to match newlines.
  const blockSplitRegex = /(```(\w*)\n([\s\S]*?)\n```)/g;

  const blocks: MarkdownBlock[] = [];
  let lastIndex = 0;
  let match;

  // Find all completed code blocks
  while ((match = blockSplitRegex.exec(markdown)) !== null) {
    // 1. Add the markdown content found before this code block
    if (match.index > lastIndex) {
      const markdownContent = markdown.substring(lastIndex, match.index);
      blocks.push({
        key: `md-${lastIndex}`,
        type: 'markdown',
        content: markdownContent,
        isComplete: true,
      });
    }

    // 2. Add the complete code block
    const language = match[2] || 'plaintext';
    const codeContent = match[3];
    blocks.push({
      key: `code-${match.index}`,
      type: 'code',
      content: codeContent || '',
      language: language,
      isComplete: true,
    });

    lastIndex = match.index + match[0].length;
  }

  // 3. Handle any remaining content, which could be markdown or an incomplete code block
  if (lastIndex < markdown.length) {
    const remainingContent = markdown.substring(lastIndex);
    const incompleteCodeMatch = remainingContent.match(/^```(\w*)\n?([\s\S]*)$/);

    if (incompleteCodeMatch) {
      // It's an incomplete code block
      const language = incompleteCodeMatch[1] || 'plaintext';
      const codeContent = incompleteCodeMatch[2];
      blocks.push({
        key: `code-${lastIndex}`,
        type: 'code',
        content: codeContent || '',
        language: language,
        isComplete: false,
      });
    } else {
      // It's trailing markdown text
      blocks.push({
        key: `md-${lastIndex}`,
        type: 'markdown',
        content: remainingContent,
        isComplete: false,
      });
    }
  }

  return blocks;
}