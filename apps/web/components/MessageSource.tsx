import { MessageSource } from "@/types/next-auth-extensions";
import { ExternalLink } from "lucide-react";
import { useState , useRef , useEffect } from 'react';


const MessageSources = ({ sources }: { sources: MessageSource[] | undefined  }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const ref = useRef<HTMLDivElement | null>(null);
  
    if (!sources || sources.length === 0) return null
  
    const extractDomain = (url: string) => {
      try {
        const domain = new URL(url).hostname
        return domain
      } catch (error) {
        return url
      }
    }
  
    const getFaviconUrl = (url: string, title: string) => {
      try {
        if (
          title &&
          (title.includes(".com") || title.includes(".org") || title.includes(".net") || title.includes("."))
        ) {
          const domainMatch = title.match(/([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/)
          if (domainMatch && domainMatch[1]) {
            return `https://www.google.com/s2/favicons?domain=${domainMatch[1]}&sz=32`
          }
        }
  
        const domain = extractDomain(url)
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      } catch (error) {
        return null
      }
    }
  
    useEffect(() => {
      const handleClickOutside = (event : any) => {
        if(ref.current && !ref.current.contains(event.target)) setIsExpanded(false);
      }
  
      window.addEventListener('click' , handleClickOutside);
      return () => window.removeEventListener('click' , handleClickOutside);
    }, []);
  
    return (
      <div ref={ref} className={`w-full mt-2 mb-2 transition-all duration-400 ease-in-out`}>
        <div className="flex items-center justify-center gap-2 cursor-pointer w-fit" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="text-sm text-muted-foreground">Sources:</span>
  
          {/* Collapsed view - only show logos */}
          {!isExpanded && (
            <div className="flex -space-x-2 overflow-hidden" onClick={() => setIsExpanded(!isExpanded)}>
              {sources.slice(0, 4).map((source, index) => (
                <div
                  key={source.id}
                  className="w-5 h-5 rounded-full bg-transparent flex items-center justify-center"
                  style={{ zIndex: sources.length - index }}
                >
                  <img
                    src={getFaviconUrl(source.url , source.title) || "/placeholder.svg"}
                    alt={source.title || extractDomain(source.url)}
                    className="w-5 h-5 object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://www.google.com/s2/favicons?domain=default&sz=32"
                    }}
                  />
                </div>
              ))}
              {sources.length > 4 && (
                <div
                  className="w-6 h-6 rounded-full border border-border bg-sidebar-border flex items-center justify-center text-xs text-muted-foreground"
                  style={{ zIndex: 0 }}
                >
                  +{sources.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
  
        {isExpanded && (
          <div className="mt-2 flex flex-wrap gap-2 transition-all duration-200 ease-in-out">
            {sources.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sidebar-border hover:bg-sidebar-border/80 transition-colors"
              >
                <img
                  src={getFaviconUrl(source.url , source.title) || "/placeholder.svg"}
                  alt={source.title || extractDomain(source.url)}
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "https://www.google.com/s2/favicons?domain=default&sz=32"
                  }}
                />
                <span className="text-sm text-foreground truncate max-w-[150px]">
                  {source.title || extractDomain(source.url)}
                </span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </div>
    )
}


export default MessageSources;