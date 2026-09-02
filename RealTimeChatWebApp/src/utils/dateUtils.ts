export function parseUtcDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const normalizedValue = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
    ? value
    : `${value}Z`;

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatLocalTime(value: string | null | undefined): string {
  const date = parseUtcDate(value);

  if (!date) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatLocalDate(value: string | null | undefined): string {
  const date = parseUtcDate(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatChatTime(value: string | null | undefined): string {
  const date = parseUtcDate(value);

  if (!date) {
    return "";
  }

  const now = new Date();

  const isToday = date.toLocaleDateString() === now.toLocaleDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}
