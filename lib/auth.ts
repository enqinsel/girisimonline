import type { User } from "@supabase/supabase-js";
import {
  getSupabaseAnonClient,
  getSupabaseUserClient,
} from "@/lib/supabase/clients";

export function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return header.slice("bearer ".length).trim();
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(email.toLowerCase());
}

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const token = getBearerToken(request);
  if (!token) return null;

  const supabase = getSupabaseAnonClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;

  return data.user;
}

export function getAuthenticatedDataClient(request: Request) {
  const token = getBearerToken(request);
  return token ? getSupabaseUserClient(token) : null;
}

export async function requireAdmin(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}
