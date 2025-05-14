// import { createHighlighter as createShikiHighlighter, type Highlighter } from 'shiki'

// let highlighterPromise: Promise<Highlighter> | null = null
// let highlighterInstance: Highlighter | null = null

// export async function getHighlighter() {
//   if (!highlighterPromise) {
//     highlighterPromise = createShikiHighlighter({
//       themes: ['dark-plus', 'light-plus'],
//       langs: [
//         'javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'json',
//         'python', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php',
//         'ruby', 'swift', 'kotlin', 'markdown', 'plaintext'
//       ],
//     }).then(instance => {
//       highlighterInstance = instance
//       return instance
//     })
//   }
//   return highlighterPromise
// }

// export function disposeHighlighter() {
//   if (highlighterInstance) {
//     highlighterInstance.dispose()
//     highlighterInstance = null
//     highlighterPromise = null
//   }
// }

import { getSingletonHighlighter as getShikiHighlighter } from "shiki"

let highlighterPromise: Promise<any> | null = null

export async function getHighlighter() {
  if (!highlighterPromise) {
    // Create a singleton promise to avoid multiple initializations
    highlighterPromise = getShikiHighlighter({
      themes: ["dark-plus", "light-plus"],
      langs: [
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "html",
        "css",
        "json",
        "markdown",
        "python",
        "java",
        "c",
        "cpp",
        "csharp",
        "go",
        "rust",
        "php",
        "ruby",
        "swift",
        "kotlin",
        "bash",
        "shell",
        "sql",
        "yaml",
        "plaintext",
      ],
    })
  }

  return highlighterPromise;
}