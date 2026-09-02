import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

import { useAuthStore } from "../store/authStore";

export interface SignalRMessageReceived {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

export interface SignalRMessageDeleted {
  id: string;
  deletedAt: string;
}

export interface SignalRMessageDelivered {
  id: string;
  chatId: string;
  deliveredAt: string;
}

export interface SignalRMessagesDelivered {
  chats: {
    chatId: string;
    messageIds: string[];
  }[];
  deliveredAt: string;
}

export interface SignalRMessagesRead {
  chatId: string;
  messageIds: string[];
  readAt: string;
}

const chatHubUrl = import.meta.env.VITE_SIGNALR_CHAT_HUB_URL;

let connection: HubConnection | null = null;

// Important: all callers share the same start operation.
let startPromise: Promise<void> | null = null;

export function getChatHubConnection(): HubConnection {
  if (connection) {
    return connection;
  }

  connection = new HubConnectionBuilder()
    .withUrl(chatHubUrl, {
      accessTokenFactory: () => {
        return useAuthStore.getState().token ?? "";
      },
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  return connection;
}

export async function startChatHub(): Promise<HubConnection> {
  const hub = getChatHubConnection();

  if (hub.state === HubConnectionState.Connected) {
    return hub;
  }

  // Already reconnecting.
  if (hub.state === HubConnectionState.Reconnecting) {
    return hub;
  }

  // Another caller is already starting the connection.
  if (startPromise) {
    await startPromise;
    return hub;
  }

  // Only start from Disconnected.
  if (hub.state !== HubConnectionState.Disconnected) {
    return hub;
  }

  startPromise = hub.start();

  try {
    await startPromise;

    console.log("ChatHub connected.");

    return hub;
  } catch (error) {
    console.error("Failed to connect to ChatHub.", error);

    throw error;
  } finally {
    startPromise = null;
  }
}

export async function stopChatHub() {
  const hub = connection;

  if (!hub) {
    return;
  }

  // Don't stop while another start is in progress.
  if (startPromise) {
    try {
      await startPromise;
    } catch {
      // Connection failed to start, nothing to stop.
    }
  }

  if (hub.state !== HubConnectionState.Disconnected) {
    await hub.stop();
  }
}

export function onMessageReceived(
  handler: (message: SignalRMessageReceived) => void,
) {
  const hub = getChatHubConnection();

  hub.on("MessageReceived", handler);

  return () => {
    hub.off("MessageReceived", handler);
  };
}

export function onMessageEdited(
  handler: (message: SignalRMessageReceived) => void,
) {
  const hub = getChatHubConnection();

  hub.on("MessageEdited", handler);

  return () => {
    hub.off("MessageEdited", handler);
  };
}

export function onMessageDeleted(
  handler: (message: SignalRMessageDeleted) => void,
) {
  const hub = getChatHubConnection();

  hub.on("MessageDeleted", handler);

  return () => {
    hub.off("MessageDeleted", handler);
  };
}

export function onMessageDelivered(
  handler: (message: SignalRMessageDelivered) => void,
) {
  const hub = getChatHubConnection();

  hub.on("MessageDelivered", handler);

  return () => {
    hub.off("MessageDelivered", handler);
  };
}

export function onMessagesDelivered(
  handler: (payload: SignalRMessagesDelivered) => void,
) {
  const hub = getChatHubConnection();

  hub.on("MessagesDelivered", handler);

  return () => {
    hub.off("MessagesDelivered", handler);
  };
}

export function onMessagesRead(
  handler: (payload: SignalRMessagesRead) => void,
) {
  const hub = getChatHubConnection();

  hub.on("MessagesRead", handler);

  return () => {
    hub.off("MessagesRead", handler);
  };
}

export async function markMessagesAsDelivered(): Promise<void> {
  const hub = await startChatHub();
  await hub.invoke("MarkMessagesAsDelivered");
}

export async function markMessageAsDelivered(messageId: string): Promise<void> {
  const hub = await startChatHub();
  await hub.invoke("MarkMessageAsDelivered", messageId);
}

export async function markMessagesAsReadUpTo(messageId: string): Promise<void> {
  const hub = await startChatHub();
  await hub.invoke("MarkMessagesAsReadUpTo", messageId);
}
