import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const expeditions = await (prisma as any).shippingExpedition.findMany({
    orderBy: { createdAt: 'asc' }
  });
  return NextResponse.json(expeditions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const expedition = await (prisma as any).shippingExpedition.create({
    data: {
      name: body.name,
      isActive: body.isActive ?? true,
      type: body.type || 'AUTOMATIC'
    }
  });
  return NextResponse.json(expedition);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const expedition = await (prisma as any).shippingExpedition.update({
    where: { id },
    data
  });
  return NextResponse.json(expedition);
}
