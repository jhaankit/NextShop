import { redirect } from "next/navigation";
import { getCurrentSession } from "@/services/auth/server";

export default async function HomePage() {
  const session = await getCurrentSession();
  redirect(session ? "/dashboard" : "/login");
}
