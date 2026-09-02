import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MessageInputProps {
  disabled?: boolean;
  isSending?: boolean;
  onSend: (text: string) => Promise<void>;
}

export default function MessageInput({
  disabled = false,
  isSending = false,
  onSend,
}: MessageInputProps) {
  const [text, setText] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = async () => {
    const value = text.trim();

    if (!value || isSending || disabled) {
      return;
    }

    await onSend(value);

    setText("");

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="border-t border-white/10 bg-slate-950/50 p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          rows={1}
          placeholder={
            disabled ? "Select a conversation..." : "Type a message..."
          }
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
        />

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={disabled || isSending || !text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Send size={17} />
          )}
        </button>
      </div>

      <p className="mx-auto mt-2 max-w-4xl text-[10px] text-slate-700">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}
