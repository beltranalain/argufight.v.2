"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

interface StatementEditorProps {
  onSubmit: (content: string) => Promise<void>;
  maxLength?: number;
  disabled?: boolean;
  placeholder?: string;
  round: number;
  allowCopyPaste?: boolean;
}

export function StatementEditor({
  onSubmit,
  maxLength = 5000,
  disabled = false,
  placeholder = "Write your argument...",
  round,
  allowCopyPaste = true,
}: StatementEditorProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (content.trim().length < 10) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!allowCopyPaste) {
      e.preventDefault();
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > maxLength;
  const isTooShort = charCount > 0 && charCount < 10;

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Round {round} Argument</h4>
        {!allowCopyPaste && (
          <span className="text-xs text-neon-orange">Copy/paste disabled</span>
        )}
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        disabled={disabled || isSubmitting}
        rows={8}
        className="min-h-[160px] resize-y"
        maxLength={maxLength + 100}
      />

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs ${
              isOverLimit
                ? "text-destructive"
                : charCount > maxLength * 0.9
                  ? "text-neon-orange"
                  : "text-muted-foreground"
            }`}
          >
            {charCount}/{maxLength}
          </span>
          {isTooShort && (
            <span className="text-xs text-neon-orange">
              Min 10 characters
            </span>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={disabled || isSubmitting || isOverLimit || charCount < 10}
          className="bg-electric-blue text-black hover:bg-electric-blue/90"
          size="sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-3 w-3" />
              Submit Argument
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
