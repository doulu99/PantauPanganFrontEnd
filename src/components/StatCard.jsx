import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : change < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <Minus className="w-4 h-4 text-gray-500 mr-1" />
              )}
              <span className={`text-sm ${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;