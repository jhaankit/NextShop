import { NextRequest } from "next/server";
import { apiError, apiJson, requireApiSession } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

export function GET(request: NextRequest) {
  const session = requireApiSession(request);
  if (session instanceof Response) return session;
  return apiJson(mockRepository.notifications.list());
}

export async function PATCH(request: NextRequest) {
  const session = requireApiSession(request);
  if (session instanceof Response) return session;
  const body = (await request.json()) as { id?: string; all?: boolean };
  if (body.all) return apiJson(mockRepository.notifications.markAllRead());
  const notification = body.id ? mockRepository.notifications.markRead(body.id) : undefined;
  if (!notification) return apiError(404, "NOTIFICATION_NOT_FOUND", "Notification not found.");
  return apiJson(notification);
}
