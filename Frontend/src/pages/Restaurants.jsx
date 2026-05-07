// Archivo: src/pages/Restaurants.jsx | Comentario: logica principal del modulo.
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { useFavoritesStore } from "../store/favoritesStore";
import { fetchJson } from "../api/fetchJson";
import FoodCategoryCarousel from "../components/FoodCategoryCarousel";
import Footer from "../components/Footer";
import { MOCK_RESTAURANTS } from "../data/mockRestaurants";
import { isRestaurantOpenNow } from "../components/ScheduleDisplay";

const DEFAULT_LOCATION = {
  lat: 2.4448,
  lng: -76.6147,
  label: "Popayán, Cauca",
};

const DEFAULT_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900";

const DEFAULT_FOOD_TYPES = [
  "Comida Casera",
  "Sopas y Caldos",
  "Antojitos Payaneses",
  "Empanadas y Fritos",
  "Tamales",
  "Hamburguesas",
  "Pizza",
  "Japonesa",
  "Italiana",
  "Mexicana",
  "Saludable",
  "Panadería y Postres",
  "Bebidas Tradicionales",
];

const normalizeCategory = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const parseStoredLocation = (storedAddress) => {
  const value = String(storedAddress || "").trim();

  try {
    const storedCoords = JSON.parse(
      localStorage.getItem("selected_delivery_coords") || "null",
    );
    if (
      storedCoords &&
      Number.isFinite(Number(storedCoords.lat)) &&
      Number.isFinite(Number(storedCoords.lng))
    ) {
      return {
        lat: Number(storedCoords.lat),
        lng: Number(storedCoords.lng),
        label: storedCoords.label || value || DEFAULT_LOCATION.label,
      };
    }
  } catch (error) {
    // Ignore malformed coordinate cache and fall through to the text-based fallback.
  }

  const match = value.match(/ubicaci[oó]n actual \(([-\d.]+),\s*([-\d.]+)\)/i);

  if (match) {
    return {
      lat: Number(match[1]),
      lng: Number(match[2]),
      label: value,
    };
  }

  return DEFAULT_LOCATION;
};

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (from, to) => {
  const fromLat = Number(from?.lat);
  const fromLng = Number(from?.lng);
  const toLat = Number(to?.lat);
  const toLng = Number(to?.lng);

  if ([fromLat, fromLng, toLat, toLng].some((value) => Number.isNaN(value))) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadiusKm = 6371;
  const latDelta = toRadians(toLat - fromLat);
  const lngDelta = toRadians(toLng - fromLng);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(lngDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getRestaurantCategories = (restaurant) => {
  const values = [];
  const candidates = [
    restaurant?.category,
    restaurant?.category_name,
    restaurant?.foodType,
    restaurant?.food_type,
    restaurant?.type,
  ];

  candidates.forEach((candidate) => {
    if (typeof candidate === "string" && candidate.trim()) {
      values.push(candidate);
    }
  });

  if (Array.isArray(restaurant?.categories)) {
    restaurant.categories.forEach((category) => {
      if (typeof category === "string" && category.trim()) {
        values.push(category);
      }
      if (
        category &&
        typeof category === "object" &&
        typeof category.name === "string"
      ) {
        values.push(category.name);
      }
    });
  }

  return values;
};

const normalizeRestaurant = (restaurant) => {
  const categories = Array.isArray(restaurant?.categories)
    ? restaurant.categories
    : [];

  const categoryNames = categories
    .map((category) =>
      typeof category === "string" ? category : category?.name,
    )
    .filter(Boolean);

  const sched = restaurant?.schedule || restaurant?.schedules || [];
  const hasSchedule = Array.isArray(sched) && sched.length > 0;
  const backendOpenFlag = (() => {
    if (typeof restaurant?.isOpen === "boolean") return restaurant.isOpen;
    if (restaurant?.isOpen === 1) return true;
    if (restaurant?.isOpen === 0) return false;
    if (typeof restaurant?.is_open === "boolean") return restaurant.is_open;
    if (restaurant?.is_open === 1) return true;
    if (restaurant?.is_open === 0) return false;
    return undefined;
  })();

  const isOpen =
    backendOpenFlag ??
    (hasSchedule
      ? isRestaurantOpenNow(sched)
      : restaurant?.is_active !== false);

  return {
    ...restaurant,
    image:
      restaurant?.banner ||
      restaurant?.logo ||
      restaurant?.image ||
      DEFAULT_RESTAURANT_IMAGE,
    rating: Number(restaurant?.average_rating ?? restaurant?.rating ?? 0),
    delivery: Number(restaurant?.delivery_cost ?? restaurant?.delivery ?? 0),
    lat: Number(restaurant?.lat ?? restaurant?.latitude ?? NaN),
    lng: Number(restaurant?.lng ?? restaurant?.longitude ?? NaN),
    time: restaurant?.delivery_time_min
      ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max ?? restaurant.delivery_time_min + 10} min`
      : restaurant?.time || "20-30 min",
    isOpen,
    categories: categories.length > 0 ? categories : categoryNames,
    isNew: restaurant?.created_at
      ? new Date() - new Date(restaurant.created_at) < 2 * 24 * 60 * 60 * 1000
      : restaurant?.is_new || false,
  };
};

const sortRestaurants = (list = []) => {
  return [...list].sort((a, b) => {
    const openA = Boolean(a?.isOpen);
    const openB = Boolean(b?.isOpen);

    if (openA !== openB) {
      return Number(openB) - Number(openA);
    }

    return Number(b?.rating || 0) - Number(a?.rating || 0);
  });
};

const handleRestaurantImageError = (event) => {
  if (!event?.currentTarget) return;

  if (event.currentTarget.dataset.fallbackApplied === "true") {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = "true";
  event.currentTarget.src = DEFAULT_RESTAURANT_IMAGE;
};

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const { favorites, fetchFavorites, isFavorite, toggleFavorite } =
    useFavoritesStore();
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const trackRef = useRef(null);

  const handleFavoriteToggle = async (restaurantId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    await toggleFavorite(restaurantId, token);
  };

  useEffect(() => {
    let active = true;

    const loadRestaurants = async () => {
      try {
        const data = await fetchJson("/restaurants?paginate=false");
        const restaurantsArray = Array.isArray(data)
          ? data
          : data.data || data.restaurants || [];

        const normalized = restaurantsArray.map(normalizeRestaurant);
        if (active) {
          const source =
            normalized.length > 0
              ? normalized
              : MOCK_RESTAURANTS.map(normalizeRestaurant);
          setRestaurants(sortRestaurants(source));
          setError(null);
        }
      } catch (err) {
        console.error("Error cargando restaurantes:", err);
        if (active) {
          setRestaurants(
            sortRestaurants(MOCK_RESTAURANTS.map(normalizeRestaurant)),
          );
          setError(null);
        }
      }
    };

    loadRestaurants();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextQuery = params.get("q") || "";
    setSearchQuery(nextQuery);
  }, [location.search]);

  useEffect(() => {
    const syncLocation = () => {
      const storedAddress =
        localStorage.getItem("selected_delivery_address") || "";
      setUserLocation(parseStoredLocation(storedAddress));
    };

    syncLocation();
    window.addEventListener("delivery-address-updated", syncLocation);
    window.addEventListener("storage", syncLocation);

    return () => {
      window.removeEventListener("delivery-address-updated", syncLocation);
      window.removeEventListener("storage", syncLocation);
    };
  }, []);

  useEffect(() => {
    if (token) {
      fetchFavorites(token);
    }
  }, [token, fetchFavorites]);

  const hasPromo = (restaurant) => Number(restaurant.delivery || 0) <= 4000;
  const hasHighRating = (restaurant) => Number(restaurant.rating || 0) >= 4.7;
  const isFavoriteRestaurant = (restaurant) =>
    favorites.includes(restaurant.id);
  const getCategoryBadges = (restaurant) =>
    getRestaurantCategories(restaurant).slice(0, 3);

  const availableFoodTypes = useMemo(() => {
    const categorySet = new Set();
    restaurants.forEach((restaurant) => {
      getRestaurantCategories(restaurant).forEach((category) =>
        categorySet.add(category),
      );
    });
    const ordered = DEFAULT_FOOD_TYPES.filter((category) =>
      categorySet.has(category),
    );
    return ordered.length > 0 ? ordered : DEFAULT_FOOD_TYPES;
  }, [restaurants]);

  const isInSelectedCategory = (restaurant) => {
    if (!selectedCategory) return true;
    const selected = normalizeCategory(selectedCategory);
    return getRestaurantCategories(restaurant).some(
      (category) => normalizeCategory(category) === selected,
    );
  };

  const filteredRestaurants = restaurants.filter((r) => {
    if (filter === "promo" && !hasPromo(r)) return false;
    if (filter === "rating" && !hasHighRating(r)) return false;
    if (filter === "favorites" && !isFavoriteRestaurant(r)) return false;
    if (!isInSelectedCategory(r)) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const haystack = [
        r.name,
        r.description,
        r.category,
        r.category_name,
        r.foodType,
        r.food_type,
        ...(Array.isArray(r.categories)
          ? r.categories.flatMap((category) => {
              if (typeof category === "string") return [category];
              if (category && typeof category === "object")
                return [category.name, category.slug];
              return [];
            })
          : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    }
    return true;
  });

  const nearbyRestaurants = useMemo(
    () =>
      [...restaurants]
        .map((restaurant) => ({
          ...restaurant,
          distanceKm: getDistanceKm(userLocation, restaurant),
        }))
        .filter((restaurant) => Number.isFinite(restaurant.distanceKm))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 8),
    [restaurants, userLocation],
  );

  const openCount = restaurants.filter((r) => r.isOpen).length;
  const closedCount = restaurants.filter((r) => !r.isOpen).length;

  const slide = (dir) => {
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll(".restaurant-card-item");
    if (!cards.length) return;
    const vis = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 4;
    const max = Math.max(0, cards.length - vis);
    const next = Math.max(0, Math.min(carouselIndex + dir, max));
    setCarouselIndex(next);
    trackRef.current.style.transform = `translateX(-${next * (cards[0].offsetWidth + 24)}px)`;
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory((previous) =>
      previous === category ? null : category,
    );
  };

  const handleClearFilters = () => {
    setFilter("all");
    setSelectedCategory(null);
    setSearchQuery("");
    navigate("/restaurants", { replace: true });
  };

  const hasActiveFilters =
    filter !== "all" ||
    Boolean(selectedCategory) ||
    Boolean(searchQuery.trim());

  return (
    <div className="page-restaurants min-h-screen bg-white">
      {/* ═══════════ SECCIÓN: Filtros y Categorías ═══════════ */}
      <section className="py-4 md:py-6">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {t("restaurants.title")}
            </h1>
            <p className="text-sm text-gray-500">{t("restaurants.subtitle")}</p>
          </div>

          {restaurants.length > 0 && !searchQuery.trim() && (
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 max-w-2xl">
              <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-[#FF4B3E] leading-none">
                  {restaurants.length}
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {t("restaurants.count")}
                </p>
              </div>
              <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-green-600 leading-none">
                  {openCount}
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {t("restaurants.open")}
                </p>
              </div>
              <div className="text-center p-3 md:p-4 bg-gray-100 rounded-lg">
                <p className="text-2xl md:text-3xl font-bold text-gray-600 leading-none">
                  {closedCount}
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {t("restaurants.closed")}
                </p>
              </div>
            </div>
          )}

          {/* Filtros principales */}
          <div className="mb-4 flex gap-2 overflow-x-auto flex-nowrap pb-2">
            <button onClick={() => setFilter("all")}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition ${filter === "all" ? "bg-[#FF4B3E] text-white" : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FF4B3E]"}`}>
              {t('restaurants.filter_all') || "Todos"}
            </button>
            <button onClick={() => setFilter("promo")}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${filter === "promo" ? "bg-[#FFB84D] text-white" : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FFB84D]"}`}>
              🎁 {t('restaurants.filter_promo') || "Promo"}
            </button>
            <button onClick={() => setFilter("rating")}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${filter === "rating" ? "bg-[#4ECDC4] text-white" : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#4ECDC4]"}`}>
              ⭐ {t('restaurants.filter_rating') || "Calificación alta"}
            </button>
            <button onClick={() => setFilter("favorites")}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold transition flex items-center gap-2 ${filter === "favorites" ? "bg-[#FD79A8] text-white" : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FD79A8]"}`}>
              ❤️ {t('restaurants.filter_favorites') || "Favoritos"}
            </button>
            {hasActiveFilters && (
              <button type="button" onClick={handleClearFilters}
                className="flex-shrink-0 px-4 py-2 rounded-full font-bold transition flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-200 hover:border-[#FF4B3E]">
                <i className="fas fa-trash" />
              </button>
            )}
          </div>

          <div className="mb-3">
            <FoodCategoryCarousel
              categories={availableFoodTypes}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          </div>

          {error && <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">{error}</p>}
        </div>
      </section>

      {/* SI HAY BÚSQUEDA O CATEGORÍA, SOLO MOSTRAR RESULTADOS */}
      {(searchQuery.trim() || selectedCategory) ? (
        <section className="py-6 md:py-8">
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {searchQuery.trim() ? `${t('restaurants.results_for') || "Resultados para"} "${searchQuery}"` : selectedCategory}
              </h2>
              <p className="text-gray-500 mt-1">{filteredRestaurants.length} {t('restaurants.restaurants_found') || "restaurantes encontrados"}</p>
            </div>

            {filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} isFavorite={isFavorite(restaurant.id)} onToggleFavorite={() => handleFavoriteToggle(restaurant.id)} t={t} navigate={navigate} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{t("restaurants.no_results")}</h3>
                <p className="text-gray-600">{t("restaurants.no_results_hint")}</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* SECCIONES NORMALES CUANDO NO HAY BÚSQUEDA */}
          {/* Favoritos / Carrusel */}
          <section className="py-4 md:py-6 bg-gray-50">
            <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t("restaurants.favorites")}</h2>
                <div className="flex gap-2">
                   <button onClick={() => slide(-1)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white transition shadow-sm"><i className="fas fa-chevron-left text-gray-400" /></button>
                   <button onClick={() => slide(1)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white transition shadow-sm"><i className="fas fa-chevron-right text-gray-400" /></button>
                </div>
              </div>
              <div className="overflow-hidden">
                <div ref={trackRef} className="flex gap-4 transition-transform duration-500 ease-out">
                  {restaurants.slice(0, 10).map(r => (
                    <div key={r.id} className="restaurant-card-item flex-shrink-0 w-64">
                       <RestaurantCard restaurant={r} isFavorite={isFavorite(r.id)} onToggleFavorite={() => handleFavoriteToggle(r.id)} t={t} navigate={navigate} compact />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Todos los Restaurantes */}
          <section className="py-8 md:py-12">
            <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">{t("restaurants.explore")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} isFavorite={isFavorite(restaurant.id)} onToggleFavorite={() => handleFavoriteToggle(restaurant.id)} t={t} navigate={navigate} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer restaurants={restaurants} />
    </div>
  );
}

// Subcomponente para evitar repetición
function RestaurantCard({ restaurant, isFavorite, onToggleFavorite, t, navigate, compact = false }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
      onClick={() => navigate(`/restaurants/${restaurant.id}`, { state: { restaurant } })}>
      <div className={`relative ${compact ? 'h-40' : 'h-48'} overflow-hidden bg-gray-100`}>
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {restaurant.isOpen ? (
            <span className="px-3 py-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-xl shadow-lg uppercase tracking-wider">{t('restaurants.badge_open') || "ABIERTO"}</span>
          ) : (
            <span className="px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm text-white text-xs font-bold rounded-xl shadow-lg uppercase tracking-wider">{t('restaurants.badge_closed') || "CERRADO"}</span>
          )}
          {restaurant.isNew && <span className="px-3 py-1.5 bg-brand/90 backdrop-blur-sm text-white text-xs font-black rounded-xl shadow-lg uppercase tracking-wider">{t('restaurants.badge_new') || "NUEVO"}</span>}
        </div>
        <div className="absolute top-4 right-4 z-10">
          <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-glass transition-all hover:scale-110 ${isFavorite ? "text-brand" : "text-gray-400 hover:text-brand"}`}>
            <i className={`fas fa-heart text-lg ${isFavorite ? "text-brand" : ""}`} />
          </button>
        </div>
        {!restaurant.isOpen && <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-none transition-all duration-300 group-hover:bg-black/20" />}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-xl text-gray-900 mb-1 truncate font-outfit">{restaurant.name}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{restaurant.description}</p>
        <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-gray-50">
           <div className="flex items-center gap-3">
             <span className="flex items-center gap-1.5 font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg"><i className="fas fa-star text-yellow-400" /> {restaurant.rating}</span>
             <span className="text-gray-500 flex items-center gap-1.5"><i className="far fa-clock text-gray-400" /> {restaurant.time}</span>
           </div>
           <span className="font-bold bg-brand-light text-brand px-3 py-1 rounded-lg flex items-center gap-1"><i className="fas fa-motorcycle text-xs" /> ${restaurant.delivery.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
