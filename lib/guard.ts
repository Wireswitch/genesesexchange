import { auth } from "@/auth";

export async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || !["ADMIN", "ANALYST", "COMPLIANCE"].includes(role!)) return null;
  return session.user;
}
