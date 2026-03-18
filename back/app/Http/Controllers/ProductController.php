<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with('category')->get();
    }

    public function menu()
    {
        return Category::with(['products' => function($q) {
            $q->where('is_available', true);
        }])->where('is_active', true)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'is_available' => 'boolean',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_url'] = $this->storeImageAndGetUrl($request);
        }

        return Product::create($validated);
    }

    public function show(Product $product)
    {
        return $product->load('category');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric',
            'is_available' => 'sometimes|boolean',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $this->deleteLocalImageFromStorage($product->image_url);
            $validated['image_url'] = $this->storeImageAndGetUrl($request);
        }

        $product->update($validated);
        return $product;
    }

    public function destroy(Product $product)
    {
        $this->deleteLocalImageFromStorage($product->image_url);
        $product->delete();
        return response()->noContent();
    }

    private function storeImageAndGetUrl(Request $request): string
    {
        $path = $request->file('image')->store('products', 'public');
        return '/storage/' . $path;
    }

    private function deleteLocalImageFromStorage(?string $imageUrl): void
    {
        $path = $this->extractStoragePath($imageUrl);

        if (!$path) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function extractStoragePath(?string $imageUrl): ?string
    {
        if (!$imageUrl) {
            return null;
        }

        $path = parse_url($imageUrl, PHP_URL_PATH) ?: $imageUrl;
        $marker = '/storage/';
        $position = strpos($path, $marker);

        if ($position === false) {
            return null;
        }

        return ltrim(substr($path, $position + strlen($marker)), '/');
    }
}
