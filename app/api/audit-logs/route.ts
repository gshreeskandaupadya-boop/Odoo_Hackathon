import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";

export async function GET() {
  try {
    const auditLogs = await db.orm.public.AuditLog
      .orderBy((log) => log.createdAt.desc())
      .all();

    const auditLogsWithActors = await Promise.all(
      auditLogs.map(async (log) => {
        if (!log.actorId) {
          return {
            ...log,
            actor: null,
          };
        }

        const users = await db.orm.public.User
          .where({ id: log.actorId })
          .all();

        return {
          ...log,
          actor: users[0] ?? null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      auditLogs: auditLogsWithActors,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);

    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}