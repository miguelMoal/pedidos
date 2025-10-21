import { Button } from './ui/button';

type OrderSummaryFooterProps = {
  subtotal: number;
  shippingCost: number;
  total: number;
  ctaText: string;
  onCta: () => void;
  secondaryCtaText?: string;
  onSecondaryCta?: () => void;
  microcopy?: string;
  orderId?: number;
};

export default function OrderSummaryFooter({
  subtotal,
  shippingCost,
  total,
  ctaText,
  onCta,
  secondaryCtaText,
  onSecondaryCta,
  microcopy,
  orderId
}: OrderSummaryFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Summary */}
        <div className="space-y-2 mb-4">
          {orderId && (
            <div className="flex justify-between text-gray-600">
              <span>ID de orden</span>
              <span className="font-mono text-sm">#{orderId}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Envío</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          <div className="h-px bg-gray-200 my-2" />
          <div className="flex justify-between text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Microcopy */}
        {microcopy && (
          <p className="text-sm text-gray-500 mb-4">{microcopy}</p>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={onCta}
            className="w-full bg-[#046741] hover:bg-[#035530] text-white h-12 rounded-xl"
          >
            {ctaText}
          </Button>
          {secondaryCtaText && onSecondaryCta && (
            <Button
              onClick={onSecondaryCta}
              variant="outline"
              className="w-full h-12 rounded-xl"
            >
              {secondaryCtaText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}