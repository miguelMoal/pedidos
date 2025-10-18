import image_e4e0c17164a66349674cb9789c4d5acd7e753e51 from 'figma:asset/e4e0c17164a66349674cb9789c4d5acd7e753e51.png';
import image_7ffdb8492baa21690fa344bd55f65ec9e82f6c23 from 'figma:asset/7ffdb8492baa21690fa344bd55f65ec9e82f6c23.png';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function AppHeader() {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-3 flex justify-center m-[0px]">
        <div className="flex items-center">
          <ImageWithFallback
            src={image_e4e0c17164a66349674cb9789c4d5acd7e753e51}
            alt="Logo"
            className="h-16 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}