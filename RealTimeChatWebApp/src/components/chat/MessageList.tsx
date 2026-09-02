import { ArrowDown, Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { MessageDto } from "../../api/chatApi";
import MessageBubble from "./MessageBubble";
import { formatLocalDate } from "../../utils/dateUtils";

interface MessageListProps {
  messages: MessageDto[];

  currentUserId: string;

  firstUnreadMessageId: string | null;

  isLoading: boolean;
  isLoadingBefore: boolean;
  isLoadingAfter: boolean;

  hasMoreBefore: boolean;
  hasMoreAfter: boolean;

  scrollToBottomSignal?: number;

  onLoadBefore: () => Promise<void>;
  onLoadAfter: () => Promise<void>;
}

const SCROLL_THRESHOLD = 80;

export default function MessageList({
  messages,
  currentUserId,
  firstUnreadMessageId,
  isLoading,
  isLoadingBefore,
  isLoadingAfter,
  hasMoreBefore,
  hasMoreAfter,
  scrollToBottomSignal,
  onLoadBefore,
  onLoadAfter,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const previousScrollHeightRef = useRef(0);
  const previousScrollToBottomSignal = useRef(0);

  const shouldRestoreScrollRef = useRef(false);

  const hasInitialScrollRef = useRef(false);

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (
      !scrollToBottomSignal ||
      scrollToBottomSignal === previousScrollToBottomSignal.current
    ) {
      return;
    }

    previousScrollToBottomSignal.current = scrollToBottomSignal;

    const container = containerRef.current;

    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [scrollToBottomSignal]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      const isNearTop = scrollTop <= SCROLL_THRESHOLD;

      const isNearBottom =
        scrollHeight - scrollTop - clientHeight <= SCROLL_THRESHOLD;

      if (isNearTop && hasMoreBefore && !isLoadingBefore) {
        previousScrollHeightRef.current = scrollHeight;

        shouldRestoreScrollRef.current = true;

        void onLoadBefore();
      }

      if (isNearBottom && hasMoreAfter && !isLoadingAfter) {
        void onLoadAfter();
      }

      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [
    hasMoreBefore,
    hasMoreAfter,
    isLoadingBefore,
    isLoadingAfter,
    onLoadBefore,
    onLoadAfter,
  ]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container || !shouldRestoreScrollRef.current) {
      return;
    }

    const previousHeight = previousScrollHeightRef.current;

    const newHeight = container.scrollHeight;

    container.scrollTop += newHeight - previousHeight;

    shouldRestoreScrollRef.current = false;
  }, [messages]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (
      !container ||
      hasInitialScrollRef.current ||
      isLoading ||
      messages.length === 0
    ) {
      return;
    }

    hasInitialScrollRef.current = true;

    requestAnimationFrame(() => {
      const unreadElement = firstUnreadMessageId
        ? container.querySelector(`[data-message-id="${firstUnreadMessageId}"]`)
        : null;

      if (unreadElement instanceof HTMLElement) {
        unreadElement.scrollIntoView({
          block: "start",
          behavior: "auto",
        });

        container.scrollTop -= 16;
      } else {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, [isLoading, messages.length, firstUnreadMessageId]);

  useEffect(() => {
    if (messages.length === 0) {
      hasInitialScrollRef.current = false;
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-400">No messages yet</p>

          <p className="mt-1 text-xs text-slate-600">
            Start the conversation below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto px-4 py-6 sm:px-6"
      >
        <div className="mx-auto max-w-4xl">
          {/* Older loading indicator */}
          {isLoadingBefore && (
            <div className="flex justify-center pb-4">
              <Loader2 size={17} className="animate-spin text-slate-600" />
            </div>
          )}

          {/* No more older messages */}
          {!hasMoreBefore && (
            <p className="pb-5 text-center text-[10px] text-slate-700">
              Beginning of conversation
            </p>
          )}

          <div className="space-y-3">
            {messages.map((message, index) => {
              const currentDate = formatLocalDate(message.createdAt);

              const previousDate =
                index > 0
                  ? formatLocalDate(messages[index - 1].createdAt)
                  : null;

              const showDate = currentDate !== previousDate;

              const isFirstUnread = message.id === firstUnreadMessageId;

              return (
                <div key={message.id} data-message-id={message.id}>
                  {showDate && (
                    <div className="my-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/5" />

                      <span className="text-[10px] font-medium text-slate-600">
                        {currentDate}
                      </span>

                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                  )}

                  {isFirstUnread && (
                    <div className="my-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-cyan-400/20" />

                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                        First unread
                      </span>

                      <div className="h-px flex-1 bg-cyan-400/20" />
                    </div>
                  )}

                  <MessageBubble
                    message={message}
                    isMine={message.senderId === currentUserId}
                  />
                </div>
              );
            })}
          </div>

          {/* Newer loading indicator */}
          {isLoadingAfter && (
            <div className="flex justify-center py-4">
              <Loader2 size={17} className="animate-spin text-slate-600" />
            </div>
          )}

          {!hasMoreAfter && <div className="h-4" />}
        </div>
      </div>

      {/* Scroll-to-latest button */}
      {showScrollButton && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-800/95 text-slate-300 shadow-xl backdrop-blur-xl transition hover:bg-slate-700 hover:text-white"
          aria-label="Scroll to latest messages"
        >
          <ArrowDown size={17} />
        </button>
      )}
    </div>
  );
}
