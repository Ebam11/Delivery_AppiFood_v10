// Menús completos y coherentes por restaurante
export const RESTAURANT_MENUS = {
  1: { // Burgers & Co
    name: 'Burgers & Co',
    products: [
      // Entradas
      { id: 101, name: 'Alitas BBQ', category: 'entradas', price: 18000, image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd94b73?w=400' },
      { id: 102, name: 'Papas Crujientes', category: 'entradas', price: 12000, image: 'https://images.unsplash.com/photo-1585080876546-fa35db86d1f9?w=400' },
      { id: 103, name: 'Tabla de Quesos', category: 'entradas', price: 22000, image: 'https://images.unsplash.com/photo-1589985643469-ddf0e08897e8?w=400' },
      // Platos principales
      { id: 104, name: 'Burger Clásica', category: 'burger', price: 28000, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
      { id: 105, name: 'Doble Carne Especial', category: 'burger', price: 35000, image: 'https://images.unsplash.com/photo-1550547990-a82b1d179cc6?w=400' },
      { id: 106, name: 'Burger Vegetariana', category: 'burger', price: 24000, image: 'https://images.unsplash.com/photo-1585238341710-4913b3f3602d?w=400' },
      // Bebidas
      { id: 107, name: 'Refresco Grande', category: 'bebidas', price: 6000, image: 'https://images.unsplash.com/photo-1554866585-e1b9ca5f2d5b?w=400' },
      { id: 108, name: 'Cerveza Artesanal', category: 'bebidas', price: 12000, image: 'https://images.unsplash.com/photo-1608270861620-7c80ca7d8bca?w=400' },
      { id: 109, name: 'Combo Burger + Papas + Bebida', category: 'combos', price: 38000, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    ]
  },
  2: { // Pizzería La Nonna
    name: 'Pizzería La Nonna',
    products: [
      // Entradas
      { id: 201, name: 'Tabla Italiana', category: 'entradas', price: 25000, image: 'https://images.unsplash.com/photo-1589985643469-ddf0e08897e8?w=400' },
      { id: 202, name: 'Camarones al Ajillo', category: 'entradas', price: 20000, image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd94b73?w=400' },
      { id: 203, name: 'Sopa de Tomate', category: 'entradas', price: 14000, image: 'https://images.unsplash.com/photo-1547592166-7ef50153ec9d?w=400' },
      // Platos principales
      { id: 204, name: 'Pizza Margherita', category: 'pizza', price: 32000, image: 'https://images.unsplash.com/photo-1604874891752-8e81e58dd086?w=400' },
      { id: 205, name: 'Pizza Carnívora', category: 'pizza', price: 38000, image: 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=400' },
      { id: 206, name: 'Pizza Vegetariana', category: 'pizza', price: 30000, image: 'https://images.unsplash.com/photo-1511689915989-48d1c67b591d?w=400' },
      // Bebidas
      { id: 207, name: 'Vino Tinto 750ml', category: 'bebidas', price: 35000, image: 'https://images.unsplash.com/photo-1608270861620-7c80ca7d8bca?w=400' },
      { id: 208, name: 'Agua con Gas', category: 'bebidas', price: 5000, image: 'https://images.unsplash.com/photo-1554866585-e1b9ca5f2d5b?w=400' },
      { id: 209, name: 'Combo Familiar Pizza + Bebida', category: 'combos', price: 52000, image: 'https://images.unsplash.com/photo-1604874891752-8e81e58dd086?w=400' },
    ]
  },
  3: { // Sushi Paradise
    name: 'Sushi Paradise',
    products: [
      // Entradas
      { id: 301, name: 'Tabla de Entrada', category: 'entradas', price: 28000, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
      { id: 302, name: 'Gyoza de Camarón', category: 'entradas', price: 16000, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a104?w=400' },
      { id: 303, name: 'Edamame Salteado', category: 'entradas', price: 10000, image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd94b73?w=400' },
      // Platos principales
      { id: 304, name: 'Sushi Mix 8pz', category: 'sushi', price: 35000, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
      { id: 305, name: 'Sashimi Premium', category: 'sushi', price: 42000, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
      { id: 306, name: 'Rollos Variados', category: 'sushi', price: 38000, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
      // Bebidas
      { id: 307, name: 'Té Verde', category: 'bebidas', price: 8000, image: 'https://images.unsplash.com/photo-1597318972826-82214dbf4d37?w=400' },
      { id: 308, name: 'Sake Caliente', category: 'bebidas', price: 18000, image: 'https://images.unsplash.com/photo-1608270861620-7c80ca7d8bca?w=400' },
      { id: 309, name: 'Combo Sushi Mix + Bebida', category: 'combos', price: 52000, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
    ]
  },
  4: { // Taquería El Sabor
    name: 'Taquería El Sabor',
    products: [
      // Entradas
      { id: 401, name: 'Nachos con Queso', category: 'entradas', price: 14000, image: 'https://images.unsplash.com/photo-1585080876546-fa35db86d1f9?w=400' },
      { id: 402, name: 'Guacamole Fresco', category: 'entradas', price: 12000, image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd94b73?w=400' },
      { id: 403, name: 'Elotes a la Parrilla', category: 'entradas', price: 10000, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400' },
      // Platos principales
      { id: 404, name: 'Tacos al Pastor x3', category: 'tacos', price: 18000, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400' },
      { id: 405, name: 'Tacos Carnitas x3', category: 'tacos', price: 20000, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400' },
      { id: 406, name: 'Tacos Veganos x3', category: 'tacos', price: 16000, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400' },
      // Bebidas
      { id: 407, name: 'Horchata Natural', category: 'bebidas', price: 8000, image: 'https://images.unsplash.com/photo-1554866585-e1b9ca5f2d5b?w=400' },
      { id: 408, name: 'Cerveza Corona', category: 'bebidas', price: 10000, image: 'https://images.unsplash.com/photo-1608270861620-7c80ca7d8bca?w=400' },
    ]
  },
  5: { // Wok Express
    name: 'Wok Express',
    products: [
      // Entradas
      { id: 501, name: 'Spring Rolls x6', category: 'entradas', price: 12000, image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd94b73?w=400' },
      { id: 502, name: 'Tabla China', category: 'entradas', price: 24000, image: 'https://images.unsplash.com/photo-1589985643469-ddf0e08897e8?w=400' },
      { id: 503, name: 'Sopa Agria Picante', category: 'entradas', price: 14000, image: 'https://images.unsplash.com/photo-1547592166-7ef50153ec9d?w=400' },
      // Platos principales
      { id: 504, name: 'Arroz con Pollo', category: 'asian', price: 26000, image: 'https://images.unsplash.com/photo-1609617529014-97deb8aab433?w=400' },
      { id: 505, name: 'Tallarín Saltado', category: 'asian', price: 28000, image: 'https://images.unsplash.com/photo-1609617529014-97deb8aab433?w=400' },
      { id: 506, name: 'Wok de Mariscos', category: 'asian', price: 35000, image: 'https://images.unsplash.com/photo-1609617529014-97deb8aab433?w=400' },
      // Bebidas
      { id: 507, name: 'Té de Jazmín', category: 'bebidas', price: 6000, image: 'https://images.unsplash.com/photo-1597318972826-82214dbf4d37?w=400' },
      { id: 508, name: 'Agua de Jamaica', category: 'bebidas', price: 5000, image: 'https://images.unsplash.com/photo-1554866585-e1b9ca5f2d5b?w=400' },
    ]
  },
  6: { // Dulces Tentaciones
    name: 'Dulces Tentaciones',
    products: [
      // Entradas
      { id: 601, name: 'Tabla de Frutas', category: 'entradas', price: 16000, image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd94b73?w=400' },
      { id: 602, name: 'Frutos Secos Mix', category: 'entradas', price: 14000, image: 'https://images.unsplash.com/photo-1585075482f73a9e42f0827e85f7ce5e8e1e5d07?w=400' },
      // Postres
      { id: 603, name: 'Torta Chocolate', category: 'postres', price: 22000, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
      { id: 604, name: 'Cheesecake', category: 'postres', price: 20000, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
      { id: 605, name: 'Tiramisú', category: 'postres', price: 19000, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
      { id: 606, name: 'Macarons Variados', category: 'postres', price: 18000, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
      // Bebidas
      { id: 607, name: 'Café Espresso', category: 'bebidas', price: 7000, image: 'https://images.unsplash.com/photo-1597318972826-82214dbf4d37?w=400' },
      { id: 608, name: 'Capuchino Premium', category: 'bebidas', price: 10000, image: 'https://images.unsplash.com/photo-1597318972826-82214dbf4d37?w=400' },
      // Combos
      { id: 609, name: 'Combo Postre + Café', category: 'combos', price: 18000, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
    ]
  },
  7: { // Verde Orgánico
    name: 'Verde Orgánico',
    products: [
      // Entradas
      { id: 701, name: 'Tabla Vegana', category: 'entradas', price: 18000, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
      { id: 702, name: 'Humus Casero', category: 'entradas', price: 12000, image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd94b73?w=400' },
      // Platos principales
      { id: 703, name: 'Buddha Bowl Premium', category: 'vegan', price: 28000, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
      { id: 704, name: 'Pasta Vegana', category: 'vegan', price: 24000, image: 'https://images.unsplash.com/photo-1621996346565-431f63602f41?w=400' },
      { id: 705, name: 'Hamburguesa Vegana', category: 'vegan', price: 22000, image: 'https://images.unsplash.com/photo-1585238341710-4913b3f3602d?w=400' },
      // Bebidas
      { id: 706, name: 'Batido Verde', category: 'bebidas', price: 10000, image: 'https://images.unsplash.com/photo-1538328432458-c67dafdf234d?w=400' },
      { id: 707, name: 'Jugo Detox', category: 'bebidas', price: 12000, image: 'https://images.unsplash.com/photo-1553530666-ba2a8e36cd12?w=400' },
    ]
  },
  8: { // Mar & Pescado
    name: 'Mar & Pescado',
    products: [
      // Entradas
      { id: 801, name: 'Tabla de Mariscos', category: 'entradas', price: 35000, image: 'https://images.unsplash.com/photo-1580822261290-991b38693d1b?w=400' },
      { id: 802, name: 'Ceviche Fresco', category: 'entradas', price: 28000, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400' },
      // Platos principales
      { id: 803, name: 'Paella de Mariscos', category: 'seafood', price: 45000, image: 'https://images.unsplash.com/photo-1606787620891-759c1dc73183?w=400' },
      { id: 804, name: 'Camarones al Ajillo', category: 'seafood', price: 38000, image: 'https://images.unsplash.com/photo-1580822261290-991b38693d1b?w=400' },
      { id: 805, name: 'Filete de Pescado', category: 'seafood', price: 42000, image: 'https://images.unsplash.com/photo-1606787620891-759c1dc73183?w=400' },
      // Bebidas
      { id: 806, name: 'Vino Blanco Premium', category: 'bebidas', price: 40000, image: 'https://images.unsplash.com/photo-1608270861620-7c80ca7d8bca?w=400' },
      { id: 807, name: 'Agua Mineral', category: 'bebidas', price: 5000, image: 'https://images.unsplash.com/photo-1554866585-e1b9ca5f2d5b?w=400' },
    ]
  },
  9: { // Pollo Dorado
    name: 'Pollo Dorado',
    products: [
      // Entradas
      { id: 901, name: 'Alitas BBQ', category: 'entradas', price: 16000, image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd94b73?w=400' },
      { id: 902, name: 'Tabla Variada', category: 'entradas', price: 22000, image: 'https://images.unsplash.com/photo-1589985643469-ddf0e08897e8?w=400' },
      // Platos principales
      { id: 903, name: 'Pollo a Brasa Entero', category: 'chicken', price: 45000, image: 'https://images.unsplash.com/photo-1618164436241-92473d360d3d?w=400' },
      { id: 904, name: 'Pollo a Brasa Medio', category: 'chicken', price: 32000, image: 'https://images.unsplash.com/photo-1618164436241-92473d360d3d?w=400' },
      { id: 905, name: 'Pechuga Grillada', category: 'chicken', price: 28000, image: 'https://images.unsplash.com/photo-1618164436241-92473d360d3d?w=400' },
      // Bebidas
      { id: 906, name: 'Gaseosa 2L', category: 'bebidas', price: 12000, image: 'https://images.unsplash.com/photo-1554866585-e1b9ca5f2d5b?w=400' },
      { id: 907, name: 'Cerveza Fría', category: 'bebidas', price: 11000, image: 'https://images.unsplash.com/photo-1608270861620-7c80ca7d8bca?w=400' },
    ]
  },
  10: { // Café La Esquina
    name: 'Café La Esquina',
    products: [
      // Entradas
      { id: 1001, name: 'Pan Tostado', category: 'entradas', price: 6000, image: 'https://images.unsplash.com/photo-1585080876546-fa35db86d1f9?w=400' },
      { id: 1002, name: 'Croissant Mantequilla', category: 'entradas', price: 8000, image: 'https://images.unsplash.com/photo-1585080876546-fa35db86d1f9?w=400' },
      // Platos principales
      { id: 1003, name: 'Desayuno Completo', category: 'coffee', price: 24000, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400' },
      { id: 1004, name: 'Omelette Premium', category: 'coffee', price: 20000, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400' },
      // Bebidas
      { id: 1005, name: 'Café Americano', category: 'bebidas', price: 6000, image: 'https://images.unsplash.com/photo-1597318972826-82214dbf4d37?w=400' },
      { id: 1006, name: 'Cappuccino', category: 'bebidas', price: 8000, image: 'https://images.unsplash.com/photo-1597318972826-82214dbf4d37?w=400' },
      { id: 1007, name: 'Latte Caramel', category: 'bebidas', price: 9000, image: 'https://images.unsplash.com/photo-1597318972826-82214dbf4d37?w=400' },
      { id: 1008, name: 'Batido Fresa', category: 'bebidas', price: 10000, image: 'https://images.unsplash.com/photo-1538328432458-c67dafdf234d?w=400' },
    ]
  },
}
