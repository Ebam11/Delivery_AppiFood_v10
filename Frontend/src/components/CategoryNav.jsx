// Archivo: src/components/CategoryNav.jsx | Comentario: logica principal del modulo.
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CategoryNav({ onCategoryChange }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const { t } = useTranslation();

  const categories = [
    { id: 'all',          icon: <i className="fas fa-utensils mr-1"></i>,       label: t('categoryNav.all', 'Todas') },
    { id: 'hamburguesas', icon: <i className="fas fa-hamburger mr-1"></i>,      label: t('categoryNav.burgers', 'Hamburguesas') },
    { id: 'pizza',        icon: <i className="fas fa-pizza-slice mr-1"></i>,    label: t('categoryNav.pizza', 'Pizzas') },
    { id: 'sushi',        icon: <i className="fas fa-fish mr-1"></i>,           label: t('categoryNav.sushi', 'Sushi') },
    { id: 'pollo',        icon: <i className="fas fa-drumstick-bite mr-1"></i>, label: t('categoryNav.chicken', 'Pollo') },
    { id: 'pastas',       icon: <i className="fas fa-wine-glass-alt mr-1"></i>, label: t('categoryNav.pasta', 'Pastas') },
    { id: 'saludable',    icon: <i className="fas fa-carrot mr-1"></i>,         label: t('categoryNav.healthy', 'Saludable') },
    { id: 'postres',      icon: <i className="fas fa-birthday-cake mr-1"></i>,  label: t('categoryNav.desserts', 'Postres') },
    { id: 'bebidas',      icon: <i className="fas fa-cocktail mr-1"></i>,       label: t('categoryNav.drinks', 'Bebidas') },
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
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>
    </nav>
  );
}