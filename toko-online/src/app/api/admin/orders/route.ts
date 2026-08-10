import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  // if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(orders);
}

export async function PATCH(req: NextRequest) {
  // if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, status, trackingNumber, expeditionName } = await req.json();
  const allowed = ["DIPROSES", "DIKIRIM", "SELESAI", "DIBATALKAN"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const order = await prisma.order.update({ 
    where: { id: orderId }, 
    data: { 
      status,
      trackingNumber,
      expeditionName
    } 
  });
  return NextResponse.json(order);
}
