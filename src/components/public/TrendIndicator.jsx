// ==========================================
// src/components/public/TrendIndicator.jsx
// ==========================================
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export const TrendIndicator = ({ trend, value, percentage }) => {
  if (trend === 'up') {
    return (
      <div className="flex items-center text-red-600">
        <ArrowUp className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">+{formatPrice(Math.abs(value))}</span>
        <span className="text-xs ml-1">(+{percentage?.toFixed(2)}%)</span>
      </div>
    );
  } else if (trend === 'down') {
    return (
      <div className="flex items-center text-green-600">
        <ArrowDown className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">-{formatPrice(Math.abs(value))}</span>
        <span className="text-xs ml-1">(-{Math.abs(percentage)?.toFixed(2)}%)</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-gray-600">
        <Minus className="w-4 h-4 mr-1" />
        <span className="text-sm">Stabil</span>
      </div>
    );
  }
};

export { CommodityCard, BPNCard, ComparisonCard };