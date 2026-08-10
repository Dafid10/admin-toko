import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { 
      category: true,
      variants: true,
      wholesale: true,
      media: {
        orderBy: { order: "asc" }
      }
    },
  });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json(product);
}
