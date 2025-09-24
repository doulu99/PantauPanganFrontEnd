// ==========================================
// src/components/public/BPNCard.jsx
// ==========================================
import { TrendIndicator } from './TrendIndicator';

const BPNCard = ({ item }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group">
      <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 transform">
        <div className="flex items-center mb-4">
          {!imageError && (item.image_url || item.background) ? (
            <img 
              src={item.image_url || item.background} 
              alt={item.name}
              className="w-16 h-16 rounded-xl mr-4 object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
            <p className="text-sm text-gray-500">Per {item.unit || item.satuan || 'kg'}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Harga Hari Ini:</span>
            <span className="text-2xl font-bold text-orange-600">
              {formatPrice(item.today || item.price || 0)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Perubahan:</span>
            <TrendIndicator 
              trend={item.gap_change || (item.gap > 0 ? 'up' : item.gap < 0 ? 'down' : 'stable')} 
              value={item.gap || 0} 
              percentage={item.gap_percentage || 0}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tanggal Update:</span>
            <span className="text-sm text-gray-700">
              {item.yesterday_date ? new Date(item.yesterday_date).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};