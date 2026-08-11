"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  text: string;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function CopyButton({
  text,
  label = "Copy",
  disabled = false,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!failed) return;
    const timer = window.setTimeout(() => setFailed(false), 2500);
    return () => window.clearTimeout(timer);
  }, [failed]);

  async function handleCopy() {
    if (!text || disabled) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFailed(false);
    } catch {
      setCopied(false);
      setFailed(true);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !text}
        onClick={handleCopy}
        className={className}
      >
        {copied ? <Check /> : failed ? <AlertCircle /> : <Copy />}
        {copied ? "Copied" : failed ? "Copy failed" : label}
      </Button>
      {failed ? (
        <span className="text-xs text-destructive" role="alert">
          Clipboard blocked — select and copy manually.
        </span>
      ) : null}
    </div>
  );
}
