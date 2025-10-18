import { Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  quantity?: number;
  onAdd: () => void;
};

export default function ProductCard({
  name,
  price,
  image,
  category,
  quantity = 0,
  onAdd
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        {quantity > 0 && (
          <div className="absolute top-2 right-2 bg-[#046741] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
            {quantity}
          </div>
        )}
      </div>
      <div className="p-3">
        {category && (
          <p className="text-xs text-gray-500 mb-1">{category}</p>
        )}
        <h3 className="text-sm text-gray-900 mb-1 line-clamp-2">{name}</h3>
        <p className="text-gray-900 mb-3">${price.toFixed(2)}</p>
        <button
          onClick={onAdd}
          className="w-full bg-[#046741] hover:bg-[#035530] text-white py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Agregar</span>
        </button>
      </div>
    </div>
  );
}