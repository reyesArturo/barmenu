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
        return Order::with('items.product')->findOrFail($id);
    }

    public function kitchenOrders()
    {
        return Order::with(['table', 'items.product'])
            ->whereIn('status', ['pending', 'preparing'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function cashierOrders()
    {
        return Order::with(['table', 'items.product'])
            ->whereIn('status', ['served', 'pending', 'preparing'])
            ->orderBy('created_at', 'asc')
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

    public function metrics()
    {
        $today = Carbon::today();
        
        $salesToday = Order::whereDate('created_at', $today)
            ->where('status', 'paid')
            ->sum('total_amount');

        $averageTicket = Order::whereDate('created_at', $today)
            ->where('status', 'paid')
            ->avg('total_amount');

        $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->whereHas('order', function($q) use ($today) {
                $q->whereDate('created_at', $today);
            })
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->with('product')
            ->get();

        return response()->json([
            'sales_today' => $salesToday,
            'average_ticket' => (float) $averageTicket,
            'top_products' => $topProducts
        ]);
    }
}
