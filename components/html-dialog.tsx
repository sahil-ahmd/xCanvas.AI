"use client";

import { getHTMLWrapper } from "@/lib/frame-wrapper";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { CodeBlock, CodeBlockCopyButton } from "./ai-elements/code-block";

type HtmlDialogProps = {
  html?: string;
  title?: string;
  theme_style?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const HtmlDialog = ({
  open,
  title,
  theme_style,
  onOpenChange,
  html,
}: HtmlDialogProps) => {
  const fullHtml = getHTMLWrapper(html ?? "", title, theme_style);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-7xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title || "Untitled"}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-full overflow-y-auto">
          <div>
            <CodeBlock
              className="w-full h-auto"
              code={fullHtml}
              language="html"
              showLineNumbers
            >
              <CodeBlockCopyButton className="fixed top-16 right-12 z-50 bg-muted!" />
            </CodeBlock>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HtmlDialog;
