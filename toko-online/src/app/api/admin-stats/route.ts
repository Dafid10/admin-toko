import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { subDays, isToday, isThisWeek } from "date-fns";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    // Ambil semua order dalam 30 hari terakhir
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { items: { include: { product: true } } }
    });

    // Kalkulasi Statistik
    let totalToday = 0;
    let totalWeek = 0;
    let totalMonth = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    orders.forEach(o => {
      if (isToday(o.createdAt)) totalToday += o.totalAmount;
      if (isThisWeek(o.createdAt)) totalWeek += o.totalAmount;
    });

    // Kalkulasi Barang Terlaris (Top Selling)
    const productSales: any = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const name = item.product.name;
        productSales[name] = (productSales[name] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => (b.qty as number) - (a.qty as number))
      .slice(0, 5);

    return NextResponse.json({ totalToday, totalWeek, totalMonth, topProducts, orders });
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}