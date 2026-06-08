// Archivo: src/components/CategoryNav.jsx | Comentario: logica principal del modulo.
import React, { useState } from 'react';
import { useTranslate as useTranslation } from '../hooks/useTranslate';

export default function CategoryNav({ onCategoryChange }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const { t } = useTranslation();

  const categories = [
    { id: 'all',          label: `🍽️ ${t('categoryNav.all')}` },
    { id: 'hamburguesas', label: `🍔 ${t('categoryNav.burgers')}` },
    { id: 'pizza',        label: `🍕 ${t('categoryNav.pizza')}` },
    { id: 'sushi',        label: `🍣 ${t('categoryNav.sushi')}` },
    { id: 'pollo',        label: `🍗 ${t('categoryNav.chicken')}` },
    { id: 'pastas',       label: `🍝 ${t('categoryNav.pasta')}` },
    { id: 'saludable',    label: `🥗 ${t('categoryNav.healthy')}` },
    { id: 'postres',      label: `🍰 ${t('categoryNav.desserts')}` },
    { id: 'bebidas',      label: `🧃 ${t('categoryNav.drinks')}` },
  ];

  const handleClick = (categoryId) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <nav
      className="component-category-nav sticky top-[60px] z-10 bg-white border-b border-gray-200 overflow-x-auto -webkit-overflow-scrolling-touch scrollbar-hide"
      aria-label={t('categoryNav.ariaLabel')}
    >
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