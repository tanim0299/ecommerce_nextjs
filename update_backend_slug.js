const fs = require('fs');
const path = require('path');

const khataBase = path.resolve('..', 'khata_erp');

// 1. Update ProductSettingsApiController.php
const ctrlPath = path.join(khataBase, 'app', 'Http', 'Controllers', 'Api', 'ProductSettingsApiController.php');
let ctrl = fs.readFileSync(ctrlPath, 'utf8');
ctrl = ctrl.replace('public function productDetail(int $id): JsonResponse', 'public function productDetail(string $id): JsonResponse');
fs.writeFileSync(ctrlPath, ctrl, 'utf8');
console.log('Updated ProductSettingsApiController.php');

// 2. Update ProductSettingsApiService.php
const svcPath = path.join(khataBase, 'app', 'Services', 'ProductSettingsApiService.php');
let svc = fs.readFileSync(svcPath, 'utf8');

const oldMethodRegex = /public function productDetail\(int \$productId\): array[\s\S]*?public function productReviews/m;

const newMethodCode = `public function productDetail(string $identifier): array
    {
        $query = Product::query()
            ->where('is_active', true)
            ->with([
                'item:id,name,sl',
                'category:id,name,sl,banner',
                'subCategory:id,name,sl',
                'brand:id,name,logo',
                'unit:id,name',
                'warranty:id,duration,period_type',
                'images' => fn ($q) => $q->orderBy('sl_no'),
                'variants' => fn ($q) => $q->where('is_active', true)->ordered(),
                'variants.attributeValues' => fn ($q) => $q->with('attribute:id,name'),
            ]);

        if (is_numeric($identifier)) {
            $product = $query->find((int) $identifier);
        } else {
            $decoded = trim(urldecode($identifier));
            $slugName = str_replace('-', ' ', $decoded);

            $product = (clone $query)->where(function ($q) use ($decoded, $slugName) {
                $q->where('name', $decoded)
                    ->orWhere('name', $slugName)
                    ->orWhereRaw("LOWER(name) = ?", [strtolower($decoded)])
                    ->orWhereRaw("LOWER(name) = ?", [strtolower($slugName)])
                    ->orWhereRaw("LOWER(REPLACE(name, ' ', '-')) = ?", [strtolower($decoded)])
                    ->orWhereRaw("LOWER(REPLACE(name, ' ', '')) = ?", [strtolower(str_replace(['-', ' '], '', $decoded))])
                    ->orWhere('sku', $decoded);
            })->first();
        }

        if (! $product) {
            return $this->error('Product not found.', 404);
        }

        return $this->success($this->transformProduct($product), 'Product loaded successfully.');
    }

    public function productReviews`;

svc = svc.replace(oldMethodRegex, newMethodCode);

// Also in transformProduct, add slug to product, item, category, subCategory
if (!svc.includes("'slug' => \\Illuminate\\Support\\Str::slug($product->name)")) {
    svc = svc.replace(
        "'name' => $product->name,",
        `'name' => $product->name,
            'slug' => \\Illuminate\\Support\\Str::slug($product->name),`
    );

    svc = svc.replace(
        "'name' => $product->category->name,",
        `'name' => $product->category->name,
                'slug' => \\Illuminate\\Support\\Str::slug($product->category->name),`
    );

    svc = svc.replace(
        "'name' => $product->subCategory->name,",
        `'name' => $product->subCategory->name,
                'slug' => \\Illuminate\\Support\\Str::slug($product->subCategory->name),`
    );

    svc = svc.replace(
        "'name' => $product->item->name,",
        `'name' => $product->item->name,
                'slug' => \\Illuminate\\Support\\Str::slug($product->item->name),`
    );
}

fs.writeFileSync(svcPath, svc, 'utf8');
console.log('Updated ProductSettingsApiService.php');
