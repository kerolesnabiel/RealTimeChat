import { Check, CheckCheck } from "lucide-react";

import type { MessageDto } from "../../api/chatApi";
import { formatLocalTime } from "../../utils/dateUtils";

interface MessageBubbleProps {
  message: MessageDto;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const isDeleted = Boolean(message.deletedAt);

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isMine
              ? "rounded-br-md bg-linear-to-r from-cyan-500 to-blue-600 text-white"
              : "rounded-bl-md bg-white/6 text-slate-200"
          }`}
        >
          <p
            className={`whitespace-pre-wrap wrap-break-word text-sm leading-6 ${
              isDeleted ? "italic opacity-60" : ""
            }`}
          >
            {message.text}
          </p>
        </div>

        <div
          className={`mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-600 ${
            isMine ? "justify-end" : "justify-start"
          }`}
        >
          <span>{formatLocalTime(message.createdAt)}</span>

          {message.editedAt && !isDeleted && <span>(edited)</span>}

          {isMine && !isDeleted && renderStatus(message.status)}
        </div>
      </div>
    </div>
  );
}

function renderStatus(status: number | null) {
  if (status === null) {
    return null;
  }

  if (status === 0) {
    return <Check size={12} className="text-slate-500" />;
  }

  if (status === 1) {
    return <CheckCheck size={12} className="text-slate-400" />;
  }

  if (status === 2) {
    return <CheckCheck size={12} className="text-cyan-300" />;
  }

  return null;
}
