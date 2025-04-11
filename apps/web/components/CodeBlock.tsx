"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { getHighlighter, disposeHighlighter } from "@/lib/shiki"


interface CodeBlockProps {
  code: string
  language?: string
  theme?: "light-plus" | "dark-plus"
  className?: string
  showLineNumbers?: boolean
  fileName?: string
}


export const CodeBlock = ({
  code,
  language = "plaintext",
  theme = "dark-plus",
  className,
  showLineNumbers = true,
  fileName,
}: CodeBlockProps) => {
  const [html, setHtml] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Capture initial dimensions
  useEffect(() => {
    if (preRef.current) {
      const rect = preRef.current.getBoundingClientRect()
      setDimensions({
        width: rect.width,
        height: rect.height
      })
    }
  }, [])


  useEffect(() => {
    let isMounted = true
    const highlightCode = async () => {
      if (!isMounted) return
      try {
        const highlighter = await getHighlighter()

        // Load theme/language if needed
        await Promise.all([
          !highlighter.getLoadedThemes().includes(theme) && highlighter.loadTheme(theme),
          !highlighter.getLoadedLanguages().includes(language as any) && highlighter.loadLanguage(language as any)
        ])

        const highlighted = highlighter.codeToHtml(code, {
          lang: language,
          theme: theme,
          transformers: [
            {
              pre(node) {
                const classNameArray = Array.isArray(node.properties.className)
                  ? node.properties.className
                  : typeof node.properties.className === "string"
                    ? [node.properties.className]
                    : []
                node.properties.className = [...classNameArray, "code-block-pre overflow-auto"]
                return node
              },
              code(node) {
                const classNameArray = Array.isArray(node.properties.className)
                  ? node.properties.className
                  : node.properties.className
                    ? [node.properties.className]
                    : []
                const validClassNames = classNameArray.filter(
                  (cls) => typeof cls === "string" || typeof cls === "number",
                )
                node.properties.className = [...validClassNames, "code-block-code , overflow-auto"]
                return node
              },
              line(node) {
                const classNames = Array.isArray(node.properties.className)
                  ? node.properties.className.filter((cls) => typeof cls === "string" || typeof cls === "number")
                  : typeof node.properties.className === "string" || typeof node.properties.className === "number"
                    ? [node.properties.className]
                    : []
                node.properties.className = [...classNames, "code-line , overflow-auto"]
                return node
              },
            },
          ],
        })

        if (isMounted) {
          setHtml(highlighted)
        }
      } catch (error) {
        console.error("Error highlighting code:", error)
        if (isMounted) {
          setHtml(`<pre class="code-block-pre"><code class="code-block-code">${escapeHtml(code)}</code></pre>`)
        }
      }
    }

    highlightCode()

    return () => {
      isMounted = false
    }
  }, [code, language, theme])

   // Dispose highlighter on unmount
   useEffect(() => {
      return () => {
        disposeHighlighter()
      }
    }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName || `code.${getFileExtension(language)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border border-border my-4 group",
        theme === "dark-plus" ? "bg-[#1E1E1E]" : "bg-[#FFFFFF]",
        className,
      )}
    >
      {/* Header with language and actions */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 text-sm border-b border-border",
          theme === "dark-plus" ? "bg-[#252526] text-gray-300" : "bg-[#F3F3F3] text-gray-700",
        )}
      >
        <div className="flex items-center gap-2">
          {fileName ? (
            <span className="font-medium">{fileName}</span>
          ) : (
            <span className="font-medium">{getLanguageDisplayName(language)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              theme === "dark-plus" ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-700",
            )}
            aria-label="Copy code"
            title="Copy code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            onClick={downloadCode}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              theme === "dark-plus" ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-700",
            )}
            aria-label="Download code"
            title="Download code"
          >
            <Download size={16} />
          </button>
        </div>
      </div>


      <div className="relative px-6 py-4 overflow-auto scrollbar-thin">
        {/* Render plain text first */}
        {/* <pre 
          ref={preRef}
          className={cn(
            "absolute text-xs font-mono opacity-0 pointer-events-none",
            showLineNumbers && "line-numbers"
          )}
          style={{ 
            width: dimensions.width || 'auto',
            height: dimensions.height || 'auto'
          }}
        >
          {code}
        </pre> */}
        
        {/* Highlighted content */}
        {html && (
          <div
            className={cn(" text-xs font-mono", showLineNumbers && "line-numbers")}
            dangerouslySetInnerHTML={{ __html: html }}
            style={{
              minWidth: dimensions.width || 'auto',
              minHeight: dimensions.height || 'auto'
            }}
          />
        )}
      </div>
    </div>
  );
}

// Helper functions
function getLanguageDisplayName(language: string): string {
  const languageMap: Record<string, string> = {
    js: "JavaScript",
    ts: "TypeScript",
    jsx: "React JSX",
    tsx: "React TSX",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    md: "Markdown",
    python: "Python",
    py: "Python",
    java: "Java",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    ruby: "Ruby",
    swift: "Swift",
    kotlin: "Kotlin",
    plaintext: "Plain Text",
    // Add more languages as needed
  }

  return languageMap[language] || language.charAt(0).toUpperCase() + language.slice(1)
}

function getFileExtension(language: string): string {
  const extensionMap: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    jsx: "jsx",
    tsx: "tsx",
    html: "html",
    css: "css",
    json: "json",
    markdown: "md",
    python: "py",
    java: "java",
    c: "c",
    cpp: "cpp",
    csharp: "cs",
    go: "go",
    rust: "rs",
    php: "php",
    ruby: "rb",
    swift: "swift",
    kotlin: "kt",
    // Add more extensions as needed
  }

  return extensionMap[language] || "txt"
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
