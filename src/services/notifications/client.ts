import { apiFetch } from "@/services/http";
import type { NotificationItem } from "@/types/domain";

export const notificationsService = {
  getNotifications: () => apiFetch<NotificationItem[]>("/api/notifications"),
  markRead: (id: string) => apiFetch<NotificationItem>("/api/notifications", { method: "PATCH", body: JSON.stringify({ id }) }),
  markAllRead: () => apiFetch<NotificationItem[]>("/api/notifications", { method: "PATCH", body: JSON.stringify({ all: true }) })
};
