// Archivo: src/components/CategoryNav.jsx | Comentario: logica principal del modulo.
import React, { useState } from 'react';

export default function CategoryNav({ onCategoryChange }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'hamburguesas', label: 'Hamburguesas' },
    { id: 'pizza', label: 'Pizza' },
    { id: 'sushi', label: 'Sushi' },
    { id: 'pollo', label: 'Pollo' },
    { id: 'pastas', label: 'Pastas' },
    { id: 'saludable', label: 'Saludable' },
    { id: 'postres', label: 'Postres' },
    { id: 'bebidas', label: 'Bebidas' },
  ];

  const handleClick = (categoryId) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <nav className="sticky top-[60px] z-10 bg-white border-b border-gray-200 overflow-x-auto -webkit-overflow-scrolling-touch scrollbar-hide" aria-label="Filtrar por categoría">
      <div className="flex gap-3 overflow-x-auto px-5 py-3 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all flex-shrink-0 ${
              activeCategory === cat.id 
                ? 'bg-[#FF4B3E] text-white border-[#FF4B3E]' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF4B3E] hover:text-[#FF4B3E]'
            }`}
            onClick={() => handleClick(cat.id)}
            data-cat={cat.id}
            type="button"
          >
            {cat.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
