"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/providers/ThemeProvider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CodeBlock } from "./CodeBlock"
import { useEffect, useState } from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  // Add this near the top of the component, after the theme check
  const [contentLoaded, setContentLoaded] = useState(false)

  // Add this useEffect to handle content loading
  useEffect(() => {
    setContentLoaded(false)
    // Small delay to ensure state updates properly
    const timer = setTimeout(() => setContentLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [content])

  return (
    <div className={cn("markdown-renderer", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl mb-4 mt-6" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-4 mt-6"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4 mt-6" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4 mt-6" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="scroll-m-20 text-lg font-semibold tracking-tight mb-4 mt-6" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="scroll-m-20 text-base font-semibold tracking-tight mb-4 mt-6" {...props} />
          ),
          p: ({ node, ...props }) => <p className="leading-7 mb-4 font-light" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2 font-light" {...props} />,
          ol: ({ node, ...props }) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 font-light" {...props} />,
          li: ({ node, ...props }) => <li {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="mt-6 border-l-2 border-primary pl-6 italic font-light" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-4 border-border" {...props} />,
          img: ({ node, ...props }) => (
            <img
              className="rounded-md border border-border my-6 max-w-full h-auto"
              {...props}
              alt={props.alt || "Image"}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="my-6 w-full overflow-y-auto">
              <table className="w-full border-collapse border border-border font-light" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-muted/50" {...props} />,
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => <tr className="border-b border-border m-0 p-0 even:bg-muted/20" {...props} />,
          th: ({ node, ...props }) => (
            <th
              className="border border-border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
              {...props}
            />
          ),
          pre: ({ node, children, ...props }) => <div className="bg-transparent p-0">{children}</div>,

          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "")

            return match ? (
              <CodeBlock
                code={String(children).replace(/\n$/, "")}
                language={match[1]}
                theme={theme === "dark" ? "dark-plus" : "light-plus"}
                className="my-4"
                showLineNumbers={true}
              />
            ) : (
              <code className="bg-muted rounded-sm px-1.5 py-0.5 text-sm font-mono" {...props}>
                {children}
              </code>
            )
          },

          // Custom components for special markdown blocks
          details: ({ node, ...props }) => (
            <Accordion type="single" collapsible className="my-4">
              <AccordionItem value="details">{props.children}</AccordionItem>
            </Accordion>
          ),

          summary: ({ node, ...props }) => (
            <AccordionTrigger className="text-base font-medium">{props.children}</AccordionTrigger>
          ),

          // Map the content inside details (but not summary) to AccordionContent
          div: ({ node, ...props }) => {
            // Check if parent is details and this is not a summary
            const isDetailsContent =
              (node as any)?.parent?.tagName === "details" &&
              node?.children?.every((child) =>
                typeof child === "object" && "tagName" in child ? child.tagName !== "summary" : true,
              )

            if (isDetailsContent) {
              return <AccordionContent>{props.children}</AccordionContent>
            }

            return <div {...props} />
          },

          // Special handling for callouts/alerts
          aside: ({ node, children, ...props }) => {
            return (
              <Alert className="my-4">
                <AlertDescription>{children}</AlertDescription>
              </Alert>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

