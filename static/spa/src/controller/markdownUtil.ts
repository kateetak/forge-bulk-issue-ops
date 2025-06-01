const { Remarkable } = require('remarkable');
const { linkify } = require('remarkable/linkify');

// https://github.com/jamiemcg/Remarkable?tab=readme-ov-file
// https://github.com/jonschlinkert/remarkable?tab=readme-ov-file

const md = new Remarkable({
  html:         true,        // Enable HTML tags in source
  xhtmlOut:     true,        // Use '/' to close single tags (<br />)
  breaks:       true,        // Convert '\n' in paragraphs into <br>
  langPrefix:   'language-',  // CSS language prefix for fenced blocks

  // Enable some language-neutral replacement + quotes beautification
  typographer:  false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed
  highlight: function (/*str, lang*/) { return ''; }
})
.use(linkify);


class MarkdownUtil {
  
  markdownToHtml = (markdown: string): string => {
    return md.render(markdown);
  }
  
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new MarkdownUtil();
