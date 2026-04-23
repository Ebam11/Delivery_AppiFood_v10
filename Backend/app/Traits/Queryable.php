<?php

namespace App\Traits;

/**
 * Trait Queryable
 *
 * Proporciona scopes reutilizables para filtrado, búsqueda, ordenamiento
 * y paginación de modelos. Evita duplicación de código.
 *
 * Uso: use Queryable;
 *
 * Scopes disponibles:
 * - included() → carga relaciones dinámicamente
 * - filter() → filtra por parámetros
 * - sort() → ordena dinámicamente
 * - getOrPaginate() → obtiene o pagina resultados
 *
 * Personalización en cada modelo:
 * - $allowedIncludes = []
 * - $allowedFilters = []
 * - $allowedSorts = []
 * - $filterMapping = [] (mapeo de alias de filtros)
 *
 * @example
 * User::included()->filter()->sort()->getOrPaginate();
 */
trait Queryable
{
    /**
     * Relaciones permitidas para eager loading
     */
    protected array $allowedIncludes = [];

    /**
     * Campos permitidos para filtrar
     */
    protected array $allowedFilters = [];

    /**
     * Campos permitidos para ordenar
     */
    protected array $allowedSorts = [];

    /**
     * Mapeo de filtros (alias → columna BD)
     * Ej: ['created_by' => 'user_id']
     */
    protected array $filterMapping = [];

    /**
     * Cargar relaciones dinámicamente desde query param 'include'
     *
     * Uso: Model::included()->get()
     * Query: ?include=users,posts
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeIncluded($query)
    {
        if (!request()->has('include')) {
            return $query;
        }

        $includes = array_filter(
            array_map('trim', explode(',', request()->input('include')))
        );

        $includes = array_intersect($includes, $this->allowedIncludes);

        return $query->with($includes);
    }

    /**
     * Filtrar modelos dinámicamente desde query params
     *
     * Uso: Model::filter()->get()
     * Query: ?name=John&status=active
     *
     * Soporta operadores:
     * - ?email=user@example.com (igualdad)
     * - ?age>18 (mayor que)
     * - ?age<65 (menor que)
     * - ?created_at>=2024-01-01 (mayor o igual)
     * - ?created_at<=2024-12-31 (menor o igual)
     * - ?name~John (LIKE búsqueda)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFilter($query)
    {
        if (!request()->has('filter') && count(request()->query()) === 0) {
            return $query;
        }

        // Si viene en array 'filter', usarlo; si no, usar todos los query params
        $filters = request()->input('filter', request()->query());

        foreach ($filters as $key => $value) {
            if (empty($value) || in_array($key, ['page', 'per_page', 'sort', 'include'])) {
                continue;
            }

            // Mapear alias de filtro si existe
            $column = $this->filterMapping[$key] ?? $key;

            // Saltar si no está en allowedFilters
            if ($this->allowedFilters && !in_array($key, $this->allowedFilters)) {
                continue;
            }

            // Detectar operadores especiales
            if (preg_match('/^(.+?)(>|<|>=|<=|~)(.+)$/', $value, $matches)) {
                $field = $column;
                $operator = $matches[2];
                $val = $matches[3];

                if ($operator === '~') {
                    $query->where($field, 'LIKE', "%{$val}%");
                } else {
                    $query->where($field, $operator, $val);
                }
            } else {
                // Búsqueda exacta
                $query->where($column, $value);
            }
        }

        return $query;
    }

    /**
     * Ordenar modelos dinámicamente desde query param 'sort'
     *
     * Uso: Model::sort()->get()
     * Query: ?sort=name,-created_at
     *
     * - Prefijo '-' para orden descendente
     * - Sin prefijo para orden ascendente
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSort($query)
    {
        if (!request()->has('sort')) {
            return $query;
        }

        $sorts = array_filter(
            array_map('trim', explode(',', request()->input('sort')))
        );

        foreach ($sorts as $sort) {
            $direction = 'asc';
            $column = $sort;

            if (str_starts_with($sort, '-')) {
                $direction = 'desc';
                $column = substr($sort, 1);
            }

            // Validar que el campo esté permitido
            if ($this->allowedSorts && !in_array($column, $this->allowedSorts)) {
                continue;
            }

            $query->orderBy($column, $direction);
        }

        return $query;
    }

    /**
     * Obtener resultados o paginarlos dinámicamente
     *
     * Uso: Model::getOrPaginate()
     * Query: ?paginate=true&per_page=20
     *
     * Si no viene 'paginate=true', retorna todos los resultados
     * Si viene 'paginate=true', pagina según 'per_page' (default: 15)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public function scopeGetOrPaginate($query)
    {
        $paginate = request()->boolean('paginate', true);
        $perPage = request()->integer('per_page', 15);

        // Limitar per_page máximo a 100 para evitar queries pesadas
        $perPage = min($perPage, 100);

        if ($paginate) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Combinación común: included() + filter() + sort() + getOrPaginate()
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return mixed
     */
    public function scopeQueryable($query)
    {
        return $query
            ->included()
            ->filter()
            ->sort()
            ->getOrPaginate();
    }
}
