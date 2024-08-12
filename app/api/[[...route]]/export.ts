// app/api/[[...route]]/export.ts

import { db } from "@/db/drizzle";
import { transactions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));

  const csv = [
    "Date,Amount,Category,Payee,Notes",
    ...userTransactions.map(
      (t) =>
        `${t.date},${t.amount},${t.category},${t.payee},${t.notes}`
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString()}.csv"`,
    },
  });
}
