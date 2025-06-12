"use client"

import { useEffect, useState, useRef, memo } from "react"
import { Check, Copy, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { codeToHtml } from "shiki"
 const { getHighlighter } = await import("@/lib/shiki")

interface CodeBlockProps {
  code: string
  language?: string
  theme?: "light-plus" | "dark-plus"
  className?: string
  showLineNumbers?: boolean
  fileName?: string
}

// Use a simple pre-rendering approach for better performance
export const CodeBlock = memo(
  ({
    code,
    language = "plaintext",
    theme = "dark-plus",
    className,
    showLineNumbers = true,
    fileName,
  }: CodeBlockProps) => {
    const [copied, setCopied] = useState(false)
    const codeRef = useRef<HTMLPreElement>(null)
    const [isHighlighted, setIsHighlighted] = useState(false)
    const isDark = theme === "dark-plus"
    const [highlightError, setHighlightError] = useState(false)

    // Always show the raw code first, then try to highlight
    useEffect(() => {
      if (!codeRef.current) return

      // Always set the raw code first to ensure content is visible
      if (codeRef.current) {
        codeRef.current.textContent = code
      }

      // Then try to highlight it
      const highlightCode = async () => {
        if (!codeRef.current) {
          console.log("early returning , coderef.current & isHighlighted : " , codeRef.current , isHighlighted);
          return
        }

        try {
          // Import the highlighter
          const highlighter = await getHighlighter()

          // Load theme/language if needed
          await Promise.all([
            !highlighter.getLoadedThemes().includes(theme) && highlighter.loadTheme(theme),
            !highlighter.getLoadedLanguages().includes(language as any) && highlighter.loadLanguage(language as any),
          ])
          
          // const highlighted = highlighter.codeToHtml(code, {
          //   lang: language,
          //   theme: theme,
          // })

          const highlighted = await codeToHtml(code , { lang : language , theme });

          if (codeRef.current) {
            codeRef.current.innerHTML = highlighted
            setIsHighlighted(true)
          }
        } catch (error) {
          console.error("Error highlighting code:", error)
          setHighlightError(true)
          // Keep the raw code visible
        }
      }

      // // Use IntersectionObserver to only highlight when visible
      // const observer = new IntersectionObserver(
      //   (entries) => {
      //     if (entries[0]?.isIntersecting && !isHighlighted) {
      //       highlightCode()
      //     }
      //   },
      //   { threshold: 0.1 },
      // )

      // observer.observe(codeRef.current)
      // return () => observer.disconnect()

      highlightCode();
    }, [code, language, theme, isHighlighted])

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
          "relative rounded-lg my-4 overflow-hidden border border-border w-full max-w-full",
          isDark ? "bg-[#1E1E1E]" : "bg-[#FFFFFF]",
          className,
        )}
      >
        {/* Header with language and actions */}
        <div
          className={cn(
            "flex items-center justify-between px-4 py-2 text-sm border-b border-border",
            isDark ? "bg-sidebar-border/90 text-gray-100" : "bg-[#F3F3F3] text-gray-700",
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {fileName ? (
              <span className="font-medium truncate">{fileName}</span>
            ) : (
              <span className="font-medium">{getLanguageDisplayName(language)}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyToClipboard}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isDark ? "hover:bg-stone-700 text-gray-200" : "hover:bg-gray-200 text-gray-700",
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
                isDark ? "hover:bg-stone-700 text-gray-200" : "hover:bg-gray-200 text-gray-700",
              )}
              aria-label="Download code"
              title="Download code"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="relative overflow-auto scrollbar-thin max-w-full">
          <pre
            ref={codeRef}
            className={cn(
              "p-4 text-sm font-mono whitespace-pre overflow-x-auto",
              isDark ? "text-gray-300" : "text-gray-800",
              !isHighlighted && !highlightError && "animate-pulse",
            )}
          >
            {/* The code content will be set via useEffect */}
          </pre>
        </div>
      </div>
    )
  },
)

CodeBlock.displayName = "CodeBlock"

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
  }

  return extensionMap[language] || "txt"
}
