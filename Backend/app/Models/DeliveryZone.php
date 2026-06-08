<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\Cacheable;

/**
 * Modelo DeliveryZone
 *
 * Representa una zona de entrega de un restaurante
 * Define las áreas geográficas donde un restaurante puede entregar
 */
class DeliveryZone extends Model
{
    use HasFactory, Cacheable;

    protected $cachePrefix = 'delivery_zones';
    protected $cacheTime = 1440;

    protected $fillable = [
        'restaurant_id',
        'name',
        'latitude',
        'longitude',
        'radius_km',
        'delivery_cost',
        'delivery_time_min',
        'coordinates',
        'is_active',
        'description',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'radius_km' => 'float',
        'delivery_cost' => 'decimal:2',
        'delivery_time_min' => 'integer',
        'coordinates' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Relación: Una zona de entrega pertenece a un restaurante
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * Scope: Obtener solo zonas activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Calcula la distancia entre dos puntos (Fórmula de Haversine)
     *
     * @param float $lat1 Latitud del punto 1
     * @param float $lon1 Longitud del punto 1
     * @param float $lat2 Latitud del punto 2
     * @param float $lon2 Longitud del punto 2
     * @return float Distancia en kilómetros
     */
    public static function haversineDistance(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $earthRadius = 6371; // Radio de la Tierra en km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * asin(sqrt($a));
        $distance = $earthRadius * $c;

        return round($distance, 2);
    }

    /**
     * Verifica si una dirección está dentro de esta zona de entrega
     *
     * @param float $latitude Latitud de la dirección
     * @param float $longitude Longitud de la dirección
     * @return bool True si la dirección está en la zona
     */
    public function containsLocation(float $latitude, float $longitude): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // Si usa coordinates (formato antiguo)
        if ($this->coordinates) {
            return $this->checkCoordinatesFormat($latitude, $longitude);
        }

        // Si usa latitude/longitude
        if (!$this->latitude || !$this->longitude || !$this->radius_km) {
            return false;
        }

        $distance = self::haversineDistance(
            $this->latitude,
            $this->longitude,
            $latitude,
            $longitude
        );

        return $distance <= $this->radius_km;
    }

    /**
     * Verifica si la ubicación está en el formato de coordenadas antiguo
     */
    private function checkCoordinatesFormat(float $latitude, float $longitude): bool
    {
        // Esta es una compatibilidad con el formato anterior
        // Aquí va la lógica si se usa 'coordinates' en lugar de lat/lng
        return false;
    }

    /**
     * Obtiene el costo de entrega para una ubicación
     *
     * @param float $latitude Latitud de la dirección
     * @param float $longitude Longitud de la dirección
     * @return float|null Costo de entrega, o null si no está en zona
     */
    public function getDeliveryCost(float $latitude, float $longitude): ?float
    {
        if ($this->containsLocation($latitude, $longitude)) {
            return (float) $this->delivery_cost;
        }

        return null;
    }

    /**
     * Obtiene el tiempo estimado de entrega
     *
     * @return int Minutos estimados
     */
    public function getEstimatedTime(): int
    {
        return $this->delivery_time_min ?? 30;
    }
}
