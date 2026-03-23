<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['category_id', 'name', 'description', 'price', 'image_url', 'is_available'];

    public function getImageUrlAttribute(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        $normalizedPath = str_starts_with($value, '/') ? $value : '/' . $value;

        return url($normalizedPath);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
