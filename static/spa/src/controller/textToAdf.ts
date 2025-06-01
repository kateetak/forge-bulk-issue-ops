
type Adf = {
  type: 'doc',
  version: 1,
  content: any[]
}

export const textToAdf = (text: string): Adf => {
  const content: any[] = [];
  const paragraphs = text.split('\n');
  for (const paragraph of paragraphs) {
    if (paragraph.trim()) {
      content.push({
        type: 'paragraph',
        content: [{
          type: 'text',
          text: paragraph
        }]
      });
    }
  }
  const adf: Adf = {
    type: "doc",
    version: 1,
    content: content
  }
  return adf;
}

export const adfToText = (adf: Adf): string => {
  let text = '';
  if (adf.content && adf.content.length > 0) {
    for (const block of adf.content) {
      if (block.type === 'paragraph') {
        const paragraphText = block.content.map((c: any) => c.text).join('');
        text += paragraphText + '\n';
      }
    }
  }
  // Remove the last newline character if it exists
  if (text.endsWith('\n')) {
    text = text.slice(0, -1);
  }
  return text;
}