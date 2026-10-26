import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireSpace() {
  const user = await requireUser();
  if (!user.space) redirect("/onboarding");
  return user;
}
