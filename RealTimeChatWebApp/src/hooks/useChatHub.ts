import { useEffect, useRef } from "react";

import {
  onMessageDeleted,
  onMessageDelivered,
  onMessageEdited,
  onMessageReceived,
  onMessagesDelivered,
  onMessagesRead,
  startChatHub,
  type SignalRMessageDeleted,
  type SignalRMessageDelivered,
  type SignalRMessageReceived,
  type SignalRMessagesDelivered,
  type SignalRMessagesRead,
} from "../signalr/chatHub";

interface UseChatHubOptions {
  onMessageReceived?: (message: SignalRMessageReceived) => void;
  onMessageEdited?: (message: SignalRMessageReceived) => void;
  onMessageDeleted?: (message: SignalRMessageDeleted) => void;
  onMessageDelivered?: (message: SignalRMessageDelivered) => void;
  onMessagesDelivered?: (payload: SignalRMessagesDelivered) => void;
  onMessagesRead?: (payload: SignalRMessagesRead) => void;
}

export function useChatHub({
  onMessageReceived: messageReceivedHandler,
  onMessageEdited: messageEditedHandler,
  onMessageDeleted: messageDeletedHandler,
  onMessageDelivered: messageDeliveredHandler,
  onMessagesDelivered: messagesDeliveredHandler,
  onMessagesRead: messagesReadHandler,
}: UseChatHubOptions = {}) {
  const handlersRef = useRef({
    messageReceivedHandler,
    messageEditedHandler,
    messageDeletedHandler,
    messageDeliveredHandler,
    messagesDeliveredHandler,
    messagesReadHandler,
  });

  // Keep callbacks current without recreating SignalR subscriptions.
  useEffect(() => {
    handlersRef.current = {
      messageReceivedHandler,
      messageEditedHandler,
      messageDeletedHandler,
      messageDeliveredHandler,
      messagesDeliveredHandler,
      messagesReadHandler,
    };
  });

  useEffect(() => {
    let mounted = true;

    const handleMessageReceived = (message: SignalRMessageReceived) => {
      handlersRef.current.messageReceivedHandler?.(message);
    };

    const handleMessageEdited = (message: SignalRMessageReceived) => {
      handlersRef.current.messageEditedHandler?.(message);
    };

    const handleMessageDeleted = (message: SignalRMessageDeleted) => {
      handlersRef.current.messageDeletedHandler?.(message);
    };

    const handleMessageDelivered = (message: SignalRMessageDelivered) => {
      handlersRef.current.messageDeliveredHandler?.(message);
    };

    const handleMessagesDelivered = (payload: SignalRMessagesDelivered) => {
      handlersRef.current.messagesDeliveredHandler?.(payload);
    };

    const handleMessagesRead = (payload: SignalRMessagesRead) => {
      handlersRef.current.messagesReadHandler?.(payload);
    };

    const connect = async () => {
      try {
        await startChatHub();

        // Component may have unmounted while SignalR was connecting.
        if (!mounted) {
          return;
        }

        const cleanupFunctions = [
          onMessageReceived(handleMessageReceived),
          onMessageEdited(handleMessageEdited),
          onMessageDeleted(handleMessageDeleted),
          onMessageDelivered(handleMessageDelivered),
          onMessagesDelivered(handleMessagesDelivered),
          onMessagesRead(handleMessagesRead),
        ];

        return () => {
          cleanupFunctions.forEach((remove) => remove());
        };
      } catch (error) {
        if (mounted) {
          console.error("ChatHub initialization failed.", error);
        }
      }
    };

    let cleanup: (() => void) | undefined;

    void connect().then((remove) => {
      if (!mounted) {
        remove?.();
        return;
      }

      cleanup = remove;
    });

    return () => {
      mounted = false;

      // Only remove this component's event handlers.
      // Do NOT stop the global SignalR connection here.
      cleanup?.();
    };
  }, []);
}
