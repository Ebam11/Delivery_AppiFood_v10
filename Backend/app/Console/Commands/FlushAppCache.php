<?php

namespace App\Console\Commands;

use App\Services\Cache\RepositoryCacheService;
use App\Models\Restaurant;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class FlushAppCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:flush-app {--model= : Flush cache for specific model}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Flush application cache for queries and repositories';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $model = $this->option('model');

        if ($model) {
            $this->flushModelCache($model);
        } else {
            $this->flushAllCache();
        }

        return Command::SUCCESS;
    }

    /**
     * Flush cache para modelo específico
     */
    private function flushModelCache(string $model): void
    {
        match ($model) {
            'restaurants' => Restaurant::flushCache(),
            'products' => Product::flushCache(),
            'categories' => Category::flushCache(),
            default => $this->error("Model {$model} not found"),
        };

        $this->info("Cache flushed for model: {$model}");
    }

    /**
     * Flush todo el caché
     */
    private function flushAllCache(): void
    {
        // Flush repository cache
        RepositoryCacheService::flushAll();

        // Flush model cache
        Restaurant::flushCache();
        Product::flushCache();
        Category::flushCache();

        // Flush all cache
        Cache::flush();

        $this->info('✅ All application cache flushed successfully');
        $this->line('
Flushed:
  - Restaurant cache
  - Product cache
  - Category cache
  - Repository cache
  - All other cache
        ');
    }
}
