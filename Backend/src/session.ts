import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "./auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  return { session, response: null };
}

export function sessionUserId(session: { user: { id: string } }) {
  const userId = Number(session.user.id);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}