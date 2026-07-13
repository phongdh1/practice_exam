import Markdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { cn } from "../lib/utils";

const markdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "a", "strong", "em", "p", "br", "ul", "ol", "li"],
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title", "target", "rel"],
  },
};

export interface SafeMarkdownProps {
  markdown: string;
  className?: string;
}

export function SafeMarkdown({ markdown, className }: SafeMarkdownProps) {
  return (
    <div className={cn("prose prose-invert max-w-none text-inherit [&_a]:underline", className)}>
      <Markdown
        rehypePlugins={[[rehypeSanitize, markdownSchema]]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
