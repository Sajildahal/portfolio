import { NextResponse } from "next/server";
import {
  INITIAL_ADMIN_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DATA_PROVIDERS,
} from "@/lib/admin/adminStore";
import { DEFAULT_FEE_SCHEDULE } from "@/lib/financial/nepseFeeEngine";

export async function GET() {
  return NextResponse.json({
    users: INITIAL_ADMIN_USERS,
    dataProviders: INITIAL_DATA_PROVIDERS,
    auditLogs: INITIAL_AUDIT_LOGS,
    feeSchedule: DEFAULT_FEE_SCHEDULE,
    systemMetrics: {
      serverUptime: "99.98%",
      activeSessions: 342,
      databaseLatency: "2.4ms",
      cacheHitRatio: "94.8%",
      aiInferenceAvgMs: 145,
    },
  });
}
