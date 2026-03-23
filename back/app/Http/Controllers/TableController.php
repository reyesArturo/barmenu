<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TableController extends Controller
{
    public function index()
    {
        return Table::orderBy('id')->get();
    }

    public function generate(Request $request)
    {
        $data = $request->validate([
            'count' => 'required|integer|min:1|max:200',
        ]);

        $count = (int) $data['count'];
        $maxMesaNumber = Table::query()
            ->where('number', 'like', 'Mesa %')
            ->pluck('number')
            ->map(function (string $number): int {
                if (preg_match('/^Mesa\s+(\d+)$/i', trim($number), $matches)) {
                    return (int) $matches[1];
                }

                return 0;
            })
            ->max();

        $nextNumber = ((int) $maxMesaNumber) + 1;
        $created = [];

        for ($i = 0; $i < $count; $i++) {
            $created[] = Table::create([
                'number' => 'Mesa ' . ($nextNumber + $i),
                'qr_token' => Str::uuid()->toString(),
            ]);
        }

        return response()->json([
            'message' => 'Mesas creadas correctamente',
            'created' => $created,
        ], 201);
    }

    public function reset(Request $request)
    {
        $data = $request->validate([
            'count' => 'nullable|integer|min:1|max:200',
        ]);

        $count = (int) ($data['count'] ?? 1);

        DB::transaction(function () use ($count): void {
            Table::query()->delete();

            for ($i = 1; $i <= $count; $i++) {
                Table::create([
                    'number' => 'Mesa ' . $i,
                    'qr_token' => Str::uuid()->toString(),
                ]);
            }
        });

        return response()->json([
            'message' => 'Mesas reiniciadas correctamente',
        ]);
    }
}
