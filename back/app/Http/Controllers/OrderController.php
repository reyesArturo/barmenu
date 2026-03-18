<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Table;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function validateTable($qr_token)
    {
        $table = Table::where('qr_token', $qr_token)->firstOrFail();
        return response()->json($table);
    }

    public function store(Request $request)
    {
        $request->validate([
            'table_id' => 'required|exists:tables,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric',
        ]);

        DB::beginTransaction();

        try {
            $total = 0;
            foreach($request->items as $item) {
                $total += ($item['quantity'] * $item['unit_price']);
            }

            $order = Order::create([
                'table_id' => $request->table_id,
                'status' => 'pending',
                'total_amount' => $total
            ]);

            foreach($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                    'notes' => $item['notes'] ?? null
                ]);
            }

            DB::commit();

            return response()->json($order->load('items'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear pedido', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return Order::with(['items.product', 'table'])->findOrFail($id);
    }

    public function kitchenOrders()
    {
        return Order::with(['table', 'items.product'])
            ->whereIn('status', ['pending', 'preparing'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function kitchenHistory()
    {
        return Order::with(['table', 'items.product'])
            ->whereIn('status', ['served', 'paid'])
            ->orderByDesc('updated_at')
            ->limit(20)
            ->get();
    }

    public function cashierOrders()
    {
        return Order::with(['table', 'items.product'])
            ->whereIn('status', ['served', 'pending', 'preparing'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function cashierHistory()
    {
        return Order::with(['table', 'items.product'])
            ->where('status', 'paid')
            ->orderByDesc('updated_at')
            ->limit(20)
            ->get();
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:pending,preparing,served,paid'
        ]);

        $order->status = $request->status;
        $order->save();
        
        return response()->json($order);
    }

    public function markAsPaid($id)
    {
        $order = Order::findOrFail($id);

        if ($order->status !== 'served') {
            return response()->json([
                'message' => 'Solo se pueden cobrar órdenes marcadas como servidas.',
            ], 422);
        }

        $order->status = 'paid';
        $order->save();

        return response()->json($order);
    }

    public function metrics()
    {
        $today = Carbon::today();
        $currentYear = Carbon::now()->year;
        $monthLabels = collect(range(1, 12))
            ->map(function (int $month) use ($currentYear) {
                $label = Carbon::createFromDate($currentYear, $month, 1)
                    ->locale('es')
                    ->isoFormat('MMM');

                return ucfirst($label);
            })
            ->values();

        $ordersToday = Order::query()
            ->whereDate('created_at', $today);

        $totalOrders = (clone $ordersToday)->count();

        $salesToday = (clone $ordersToday)
            ->where('status', 'paid')
            ->sum('total_amount');

        $averageTicket = (clone $ordersToday)
            ->where('status', 'paid')
            ->avg('total_amount');

        $statusCounts = (clone $ordersToday)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->whereHas('order', function($q) use ($today) {
                $q->whereDate('created_at', $today)
                    ->where('status', 'paid');
            })
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->with('product')
            ->get()
            ->map(function (OrderItem $item) {
                return [
                    'product_id' => $item->product_id,
                    'name' => $item->product?->name ?? 'Producto sin nombre',
                    'total_sold' => (int) $item->total_quantity,
                ];
            })
            ->values();

        $monthlyProductSalesRows = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('orders.status', 'paid')
            ->whereYear('orders.created_at', $currentYear)
            ->select(
                'order_items.product_id',
                'products.name',
                DB::raw('MONTH(orders.created_at) as month_number'),
                DB::raw('SUM(order_items.quantity) as total_quantity')
            )
            ->groupBy('order_items.product_id', 'products.name', DB::raw('MONTH(orders.created_at)'))
            ->get();

        $topMonthlyProducts = $monthlyProductSalesRows
            ->groupBy('product_id')
            ->map(function ($rows) {
                return [
                    'product_id' => $rows->first()->product_id,
                    'name' => $rows->first()->name,
                    'total_quantity' => (int) $rows->sum('total_quantity'),
                ];
            })
            ->sortByDesc('total_quantity')
            ->take(5)
            ->values();

        $monthlyProductSeries = $topMonthlyProducts
            ->map(function (array $product) use ($monthlyProductSalesRows) {
                $rowsByMonth = $monthlyProductSalesRows
                    ->where('product_id', $product['product_id'])
                    ->keyBy('month_number');

                return [
                    'product_id' => $product['product_id'],
                    'name' => $product['name'],
                    'data' => collect(range(1, 12))
                        ->map(fn (int $month) => (int) optional($rowsByMonth->get($month))->total_quantity)
                        ->values(),
                ];
            })
            ->values();

        return response()->json([
            'total_sales' => (float) $salesToday,
            'total_orders' => $totalOrders,
            'sales_today' => $salesToday,
            'average_ticket' => (float) ($averageTicket ?? 0),
            'top_products' => $topProducts,
            'monthly_labels' => $monthLabels,
            'monthly_product_sales' => $monthlyProductSeries,
            'status_counts' => [
                'pending' => (int) ($statusCounts['pending'] ?? 0),
                'preparing' => (int) ($statusCounts['preparing'] ?? 0),
                'served' => (int) ($statusCounts['served'] ?? 0),
                'paid' => (int) ($statusCounts['paid'] ?? 0),
            ],
        ]);
    }
}
