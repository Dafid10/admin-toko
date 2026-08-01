import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .concat("-", Math.random().toString(36).slice(2, 6));
}

export async function GET() {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ products, categories });
}

export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: slugify(body.name),
      sku: body.sku ? String(body.sku).trim() : null,
      description: body.description,
      price: Number(body.price),
      stock: Number(body.stock),
      imageUrl: body.imageUrl || null,
      categoryId: body.categoryId,
    },
  });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...rest } = body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(rest.name !== undefined ? { name: rest.name } : {}),
      ...(rest.sku !== undefined ? { sku: rest.sku ? String(rest.sku).trim() : null } : {}),
      ...(rest.description !== undefined ? { description: rest.description } : {}),
      ...(rest.price !== undefined ? { price: Number(rest.price) } : {}),
      ...(rest.stock !== undefined ? { stock: Number(rest.stock) } : {}),
      ...(rest.imageUrl !== undefined ? { imageUrl: rest.imageUrl } : {}),
      ...(rest.categoryId !== undefined ? { categoryId: rest.categoryId } : {}),
      ...(rest.isActive !== undefined ? { isActive: rest.isActive } : {}),
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  // Nonaktifkan saja, jangan hapus permanen — supaya histori order lama tetap utuh
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
