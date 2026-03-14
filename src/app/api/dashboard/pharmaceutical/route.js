import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import Medicine from '@/models/Medicine';
import User from '@/models/User';

export async function GET() {
  try {
    const decoded = await getUserFromRequest();
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'PHARMACEUTICAL') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const now = new Date();

    const [allMedicines, totalStock, lowStockMeds, expiredMeds] = await Promise.all([
      Medicine.find().lean(),
      Medicine.aggregate([{ $group: { _id: null, total: { $sum: '$stock' } } }]),
      Medicine.find({ $expr: { $lt: ['$stock', '$lowStockThreshold'] } }).sort({ stock: 1 }).limit(10).lean(),
      Medicine.find({ expiryDate: { $lt: now } }).sort({ expiryDate: 1 }).limit(10).lean(),
    ]);

    // Category distribution for donut chart
    const categoryMap = {};
    allMedicines.forEach(m => {
      categoryMap[m.category] = (categoryMap[m.category] || 0) + m.stock;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Stock levels by category for bar chart
    const stockData = Object.entries(categoryMap).map(([name, stock]) => ({ name, stock }));

    const lowStockItems = lowStockMeds.map(m => ({
      _id: m._id,
      name: m.name,
      category: m.category,
      stock: m.stock,
      threshold: m.lowStockThreshold,
    }));

    const user = await User.findById(decoded.id).lean();

    return NextResponse.json({
      stats: {
        totalStock: totalStock[0]?.total || 0,
        lowStockCount: lowStockMeds.length,
        expiredCount: expiredMeds.length,
        pendingOrders: 0,
      },
      lowStockItems,
      expiredMeds: expiredMeds.map(m => ({
        _id: m._id,
        name: m.name,
        category: m.category,
        expiryDate: new Date(m.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        stock: m.stock,
      })),
      stockData,
      categoryData,
      pharmaName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Pharma',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
