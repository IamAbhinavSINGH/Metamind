"use client"

import { useEffect, useRef, useState, memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/providers/ThemeProvider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CodeBlock } from "./CodeBlock"

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Create a memoized version of the component to prevent unnecessary re-renders
const MemoizedMarkdown = memo(
  ({ content, components, className }: { content: string; components: any; className: string }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  ),
)

MemoizedMarkdown.displayName = "MemoizedMarkdown"

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  const [stableContent, setStableContent] = useState(content)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const visibilityRef = useRef(true)

  // Handle content updates with debouncing
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Only update content if the component is visible
    if (visibilityRef.current) {
      timeoutRef.current = setTimeout(() => {
        setStableContent(content)
      }, 10)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [content])

  useEffect(() => {
    const handleVisibilityChange = () => {
      visibilityRef.current = document.visibilityState === "visible"

      // If becoming visible and content has changed, update it
      if (visibilityRef.current && content !== stableContent) {
        setStableContent(content)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [content, stableContent])

  const markdownComponents = {
    h1: ({ node, ...props } : { node : any }) => (
      <h1
        className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 mt-8 text-primary"
        {...props}
      />
    ),
    h2: ({ node, ...props } : { node : any } ) => (
      <h2
        className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-4 mt-8 text-primary"
        {...props}
      />
    ),
    h3: ({ node, ...props } :  { node : any }) => (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4 mt-6 text-primary" {...props} />
    ),
    h4: ({ node, ...props } :  { node : any }) => (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4 mt-6" {...props} />
    ),
    h5: ({ node, ...props } :  { node : any }) => (
      <h5 className="scroll-m-20 text-lg font-semibold tracking-tight mb-4 mt-6" {...props} />
    ),
    h6: ({ node, ...props } :  { node : any }) => (
      <h6 className="scroll-m-20 text-base font-semibold tracking-tight mb-4 mt-6" {...props} />
    ),
    p: ({ node, ...props } :  { node : any }) => <p className="leading-7 [&:not(:first-child)]:mt-4 mb-4" {...props} />,
    a: ({ node, ...props } :  { node : any }) => (
      <a
        className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    ul: ({ node, ...props } :  { node : any }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />,
    ol: ({ node, ...props } :  { node : any }) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />,
    li: ({ node, ...props } :  { node : any }) => <li className="leading-7" {...props} />,
    blockquote: ({ node, ...props } :  { node : any }) => (
      <blockquote className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground" {...props} />
    ),
    hr: ({ node, ...props } :  { node : any }) => <hr className="my-6 border-border" {...props} />,
    img: ({ node, ...props } : React.ImgHTMLAttributes<HTMLImageElement> & { node: any }) => (
      <img
        className="rounded-md border border-border my-8 max-w-full h-auto shadow-md"
        loading="lazy"
        {...props}
        alt={props.alt || "Image"}
      />
    ),
    table: ({ node, ...props } :  { node : any }) => (
      <div className="my-6 w-full overflow-y-auto rounded-md border">
        <table className="w-full border-collapse text-sm" {...props} />
      </div>
    ),
    thead: ({ node, ...props } :  { node : any }) => <thead className="bg-muted/50" {...props} />,
    tbody: ({ node, ...props } :  { node : any }) => <tbody className="divide-y divide-border" {...props} />,
    tr: ({ node, ...props } :  { node : any }) => <tr className="m-0 p-0 even:bg-muted/20" {...props} />,
    th: ({ node, ...props } :  { node : any }) => (
      <th
        className="border-b border-border px-4 py-3 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right"
        {...props}
      />
    ),
    td: ({ node, ...props } : { node : any } ) => (
      <td
        className="border-b border-border px-4 py-3 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
        {...props}
      />
    ),
    pre: ({ node, children, ...props } : { node : any , children : any }) => <div className="not-prose bg-transparent p-0">{children}</div>,
   code: ({ node, className, children, ...props }: { node: any; className: string; children: any }) => {
      const match = /language-(\w+)/.exec(className || "")

      if (match) {
        const codeContent = String(children).replace(/\n$/, "")

        // Only render if we have content
        return codeContent ? (
          <CodeBlock
            code={codeContent}
            language={match[1]}
            theme={isDarkTheme ? "dark-plus" : "light-plus"}
            className=""
            showLineNumbers={true}
          />
        ) : (
          <div className="my-6 p-4 border border-border rounded-lg bg-muted text-center">Empty code block</div>
        )
      }

      return (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props}>
          {children}
        </code>
      )
    },
    details: ({ node, ...props } : { node : any , children : any } ) => (
      <Accordion type="single" collapsible className="my-6 border rounded-lg overflow-hidden">
        <AccordionItem value="details" className="border-0">
          {props.children}
        </AccordionItem>
      </Accordion>
    ),
    summary: ({ node, children, ...props } : { node: any; children: React.ReactNode } ) => (
      <AccordionTrigger className="text-base font-medium px-4">{children}</AccordionTrigger>
    ),
    div: ({ node, ...props }: { node: any; [key: string]: any }) => {
      // Check if parent is details and this is not a summary
      const isDetailsContent =
        (node as any)?.parent?.tagName === "details" &&
        node?.children?.every((child: { tagName: string }) =>
          typeof child === "object" && "tagName" in child ? child.tagName !== "summary" : true,
        )

      if (isDetailsContent) {
        return <AccordionContent className="px-4">{props.children}</AccordionContent>
      }

      return <div {...props} />
    },
    aside: ({ node, children, ...props }: { node: unknown; children: React.ReactNode; [key: string]: any }) => {
      return (
        <Alert className="my-6">
          <AlertDescription>{children}</AlertDescription>
        </Alert>
      )
    },
  }

  return (
    <div className={cn("markdown-renderer prose prose-stone dark:prose-invert max-w-none", className)}>
      <MemoizedMarkdown content={stableContent} components={markdownComponents} className="w-full max-w-full" />
    </div>
  )
}
