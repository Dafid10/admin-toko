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
  // const session = getAdminSession();
  // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { 
      category: true,
      variants: true,
      wholesale: true
    },
    orderBy: { createdAt: "desc" },
  });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ products, categories });
}

export async function POST(req: NextRequest) {
  // const session = getAdminSession();
  // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Handle Bulk Upload
  if (body.isBulk && Array.isArray(body.products)) {
    try {
        const createdProducts = await Promise.all(
            body.products.map((p: any) => 
                prisma.product.create({
                    data: {
                        name: p.name,
                        slug: slugify(p.name),
                        sku: p.sku ? String(p.sku).trim() : null,
                        description: p.description || "",
                        price: Number(p.price),
                        stock: Number(p.stock),
                        imageUrl: p.imageUrl || null,
                        categoryId: p.categoryId,
                        media: p.media ? {
                            create: p.media.map((m: any, index: number) => ({
                                url: m.url,
                                type: m.type || "IMAGE",
                                order: index,
                            })),
                        } : undefined,
                    }
                })
            )
        );
        return NextResponse.json({ success: true, count: createdProducts.length });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Handle Single Upload
  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: slugify(body.name),
      sku: body.sku ? String(body.sku).trim() : null,
      description: body.description,
      price: Number(body.price),
      stock: Number(body.stock),
      weight: body.weight ? Number(body.weight) : null,
      length: body.length ? Number(body.length) : null,
      width: body.width ? Number(body.width) : null,
      height: body.height ? Number(body.height) : null,
      stockStatus: body.stockStatus || "READY",
      indentDays: body.indentDays ? Number(body.indentDays) : null,
      imageUrl: body.imageUrl || null,
      categoryId: body.categoryId,
      variants: body.variants ? {
        create: body.variants.map((v: any) => ({
          name: v.name,
          price: v.price ? Number(v.price) : null,
          stock: Number(v.stock) || 0,
          sku: v.sku || null,
        }))
      } : undefined,
      wholesale: body.wholesale ? {
        create: body.wholesale.map((w: any) => ({
          minQuantity: Number(w.minQuantity),
          price: Number(w.price),
        }))
      } : undefined,
      media: body.media ? {
        create: body.media.map((m: any, index: number) => ({
          url: m.url,
          type: m.type || "IMAGE",
          order: index,
        })),
      } : undefined,
    },
  });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest) {
  // const session = getAdminSession();
  // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...rest } = body;

  // Data to update
  const updateData: any = {
    ...(rest.name !== undefined ? { name: rest.name } : {}),
    ...(rest.sku !== undefined ? { sku: rest.sku ? String(rest.sku).trim() : null } : {}),
    ...(rest.description !== undefined ? { description: rest.description } : {}),
    ...(rest.price !== undefined ? { price: Number(rest.price) } : {}),
    ...(rest.stock !== undefined ? { stock: Number(rest.stock) } : {}),
    ...(rest.weight !== undefined ? { weight: rest.weight ? Number(rest.weight) : null } : {}),
    ...(rest.length !== undefined ? { length: rest.length ? Number(rest.length) : null } : {}),
    ...(rest.width !== undefined ? { width: rest.width ? Number(rest.width) : null } : {}),
    ...(rest.height !== undefined ? { height: rest.height ? Number(rest.height) : null } : {}),
    ...(rest.stockStatus !== undefined ? { stockStatus: rest.stockStatus } : {}),
    ...(rest.indentDays !== undefined ? { indentDays: rest.indentDays ? Number(rest.indentDays) : null } : {}),
    ...(rest.imageUrl !== undefined ? { imageUrl: rest.imageUrl } : {}),
    ...(rest.categoryId !== undefined ? { categoryId: rest.categoryId } : {}),
    ...(rest.isActive !== undefined ? { isActive: rest.isActive } : {}),
  };

  // Handle variants
  if (rest.variants !== undefined) {
    updateData.variants = {
      deleteMany: {},
      create: rest.variants.map((v: any) => ({
        name: v.name,
        price: v.price ? Number(v.price) : null,
        stock: Number(v.stock) || 0,
        sku: v.sku || null,
      }))
    };
  }

  // Handle wholesale
  if (rest.wholesale !== undefined) {
    updateData.wholesale = {
      deleteMany: {},
      create: rest.wholesale.map((w: any) => ({
        minQuantity: Number(w.minQuantity),
        price: Number(w.price),
      }))
    };
  }

  // Handle media updates by deleting existing and creating new (ordered)
  if (rest.media !== undefined) {
    updateData.media = {
      deleteMany: {},
      create: rest.media.map((m: any, index: number) => ({
        url: m.url,
        type: m.type || "IMAGE",
        order: index,
      })),
    };
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  // const session = getAdminSession();
  // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  // Nonaktifkan saja, jangan hapus permanen — supaya histori order lama tetap utuh
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
