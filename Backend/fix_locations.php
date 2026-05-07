<?php
use App\Models\Restaurant;

$restaurants = Restaurant::whereNull('lat')->orWhere('lat', 0)->get();
foreach ($restaurants as $restaurant) {
    $restaurant->lat = 2.4350 + (mt_rand() / mt_getrandmax()) * 0.0200;
    $restaurant->lng = -76.6250 + (mt_rand() / mt_getrandmax()) * 0.0200;
    $restaurant->save();
}
echo "Updated " . $restaurants->count() . " restaurants.\n";
