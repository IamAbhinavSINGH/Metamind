"use client"

import { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/providers/ThemeProvider"
import { CodeBlock } from "./CodeBlock"
import { parseMarkdownIntoBlocks } from "@/lib/content-parser"

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Memoized component for rendering STABLE markdown blocks.
// It will only re-render if its specific `content` prop changes.
const MemoizedMarkdownBlock = memo(
  ({ content, components }: { content: string; components: any }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  ),
)
MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

const MemoizedCodeBlock = memo(CodeBlock)
MemoizedCodeBlock.displayName = "MemoizedCodeBlock"

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  const markdownComponents = {
    h1: ({ node, ...props }: { node: any }) => (
      <h1 className="mt-6 mb-4 font-semibold text-4xl pb-3 border-b border-gray-200" {...props} />
    ),
    h2: ({ node, ...props }: { node: any }) => (
      <h2 className="mt-6 mb-4 font-semibold text-3xl pb-3 border-b border-gray-200" {...props} />
    ),
    h3: ({ node, ...props } : { node : any }) => (
      <h3 className="mt-6 mb-4 font-semibold text-2xl" {...props} />
    ),
    h4: ({ node, ...props } : { node : any }) => (
        <h4 className="mt-6 mb-4 font-semibold text-xl" {...props} />
    ),
    h5: ({ node, ...props } : { node : any }) => (
        <h5 className="mt-6 mb-4 font-semibold text-lg" {...props} />
    ),
    h6: ({ node, ...props } : { node : any }) => (
      <h6 className="mt-6 mb-4 font-semibold text-base text-gray-500" {...props} />
    ),
    p: ({ node, ...props } : { node : any }) => (
      <p className="mb-4 leading-relaxed" {...props} />
    ),
    a: ({ node, ...props } : { node : any }) => (
      <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    blockquote: ({ node, ...props } : { node : any }) => (
      <blockquote className="my-4 pl-4 text-gray-500 border-l-4 border-gray-200" {...props} />
    ),
    hr: ({ node, ...props } : { node : any }) => (
      <hr className="my-6 h-1 bg-gray-200 border-0" {...props} />
    ),
    img: ({ node, ...props } : React.ImgHTMLAttributes<HTMLImageElement> & { node: any }) => (
      <img className="max-w-full my-4 bg-white" loading="lazy" {...props} alt={props.alt || "Image"} />
    ),
    ul: ({ node, ...props }: { node: any }) => (
        <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...props} />
    ),
    ol: ({ node, ...props }: { node: any }) => (
        <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...props} />
    ),
    li: ({ node, ...props }: { node: any }) => <li {...props} />,
    table: ({ node, ...props } : { node : any }) => (
      <div className="my-4 w-full overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200" {...props} />
      </div>
    ),
    thead: ({ node, ...props } : { node : any }) => <thead {...props} />,
    tbody: ({ node, ...props } : { node : any }) => <tbody {...props} />,
    tr: ({ node, ...props } : { node : any }) => (
      <tr className="bg-white border-t border-gray-200 even:bg-gray-50" {...props} />
    ),
    th: ({ node, ...props } : { node : any }) => (
      <th className="px-5 py-3 font-semibold text-left border border-gray-200" {...props} />
    ),
    td: ({ node, ...props } : { node : any } ) => (
      <td className="px-5 py-3 text-left border border-gray-200" {...props} />
    ),
    pre: ({ children }: { children: any }) => <div className="not-prose bg-transparent p-0">{children}</div>,
    code: ({ node, className, children, ...props }: { node: any; className?: string; children: any }) => {
      const match = /language-(\w+)/.exec(className || "");
      if (match) {
        // This case is now less likely to be hit for large blocks, but we keep it as a fallback.
        return <CodeBlock code={String(children).replace(/\n$/, "")} language={match[1]} theme={isDarkTheme ? "dark-plus" : "light-plus"} />;
      }
      return <code className="relative rounded bg-sidebar-border/80 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props}>{children}</code>;
    },
   details: ({ node, ...props } : { node : any , children : any } ) => (
      <details className="block my-4" {...props} />
    ),
    summary: ({ node, children, ...props } : { node: any; children: React.ReactNode } ) => (
      <summary className="cursor-pointer list-item" {...props}>{children}</summary>
    ),
    div: ({ node, ...props }: { node: any; [key: string]: any }) => {
      const isDetailsContent = (node as any)?.parent?.tagName === "details" && node?.children?.every((child: { tagName: string }) =>
        typeof child === "object" && "tagName" in child ? child.tagName !== "summary" : true )

      if (isDetailsContent) {
        return <div {...props}>{props.children}</div>
      }

      return <div {...props} />
    },
    aside: ({ node, children, ...props }: { node: unknown; children: React.ReactNode; [key: string]: any }) => {
      return (
        <aside className="my-6 p-4 border-l-4 border-gray-200" {...props}>
            {children}
        </aside>
      )
    }
  };

  const blocks = parseMarkdownIntoBlocks(content)

  return (
    <div className={cn("markdown-renderer prose prose-stone dark:prose-invert max-w-none", className)}>
      {blocks.map(block => {
        if (block.type === 'code') {
          return (
            <MemoizedCodeBlock
              key={block.key}
              code={block.content}
              language={block.language}
              theme={isDarkTheme ? "dark-plus" : "light-plus"}
              showLineNumbers={true}
            />
          )
        }
        
        return (
          <MemoizedMarkdownBlock
            key={block.key}
            content={block.content}
            components={markdownComponents}
          />
        )
      })}
    </div>
  )
}