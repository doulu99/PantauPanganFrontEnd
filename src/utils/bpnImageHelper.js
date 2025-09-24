// src/utils/bpnImageHelper.js - NEW FILE
const config = {
  API_URL: import.meta.env.VITE_API_URL || (
    import.meta.env.MODE === 'development' 
      ? "http://localhost:5000/api" 
      : "/api"
  )
};

/**
 * Helper untuk handle BPN images dengan proxy
 */
export const useBpnImage = () => {
  
  // Extract filename dari URL BPN
  const extractFilename = (bpnUrl) => {
    if (!bpnUrl) return null;
    
    const matches = bpnUrl.match(/\/komoditas-ikon\/(.+\.(png|jpg|jpeg|webp))$/i);
    return matches ? matches[1] : null;
  };

  // Convert BPN URL ke proxy URL
  const getBpnImageUrl = (bpnUrl) => {
    if (!bpnUrl) return null;
    
    // Jika bukan URL BPN, return as-is
    if (!bpnUrl.includes('panelharga.badanpangan.go.id')) {
      return bpnUrl;
    }
    
    const filename = extractFilename(bpnUrl);
    if (!filename) return null;
    
    // Return proxy URL
    return `${config.API_URL}/images/bpn-image/${filename}`;
  };

  // Test apakah image bisa diload
  const testBpnImage = async (bpnUrl) => {
    const proxyUrl = getBpnImageUrl(bpnUrl);
    if (!proxyUrl) return false;
    
    try {
      const response = await fetch(proxyUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('BPN image test failed:', error);
      return false;
    }
  };

  return {
    getBpnImageUrl,
    extractFilename,
    testBpnImage
  };
};

/**
 * Component SafeImage yang sudah terintegrasi dengan BPN proxy
 */
import React, { useState } from 'react';
import { Package, RefreshCw } from 'lucide-react';

export const BpnImage = ({ 
  src, 
  alt = '', 
  className = '',
  fallback = null,
  showRetry = true,
  ...props 
}) => {
  const [imageState, setImageState] = useState({
    loaded: false,
    error: false,
    retrying: false
  });
  
  const { getBpnImageUrl } = useBpnImage();
  
  // Get proxy URL untuk BPN images
  const imageUrl = getBpnImageUrl(src);
  
  const handleLoad = () => {
    setImageState({ loaded: true, error: false, retrying: false });
  };

  const handleError = (e) => {
    console.error('BPN Image load error:', {
      original_src: src,
      proxy_src: imageUrl,
      alt
    });
    
    setImageState(prev => ({ ...prev, error: true, retrying: false }));
  };

  const retryLoad = () => {
    setImageState({ loaded: false, error: false, retrying: true });
    // Force reload dengan timestamp
    const img = document.createElement('img');
    img.src = `${imageUrl}?_retry=${Date.now()}`;
  };

  // Fallback jika tidak ada URL atau error
  if (!imageUrl || (imageState.error && !showRetry)) {
    return fallback || (
      <div className={`flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 ${className}`}>
        <Package className="h-6 w-6 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading state */}
      {(!imageState.loaded || imageState.retrying) && (
        <div className={`absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center ${className}`}>
          {imageState.retrying ? (
            <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Package className="h-4 w-4 text-gray-400" />
          )}
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={imageState.retrying ? `${imageUrl}?_retry=${Date.now()}` : imageUrl}
        alt={alt}
        className={`${className} ${!imageState.loaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {/* Error retry button */}
      {imageState.error && showRetry && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <button
            onClick={retryLoad}
            className="bg-white text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Test utilities untuk debug BPN images
 */
export const debugBpnImages = {
  // Test semua gambar dari data BPN
  testAllImages: async (bpnData) => {
    const { testBpnImage } = useBpnImage();
    const results = [];
    
    for (const item of bpnData) {
      if (item.background) {
        const canLoad = await testBpnImage(item.background);
        results.push({
          id: item.id,
          name: item.name,
          original_url: item.background,
          can_load: canLoad
        });
      }
    }
    
    console.table(results);
    return results;
  },

  // Test specific image
  testSingleImage: async (bpnUrl) => {
    const { getBpnImageUrl, testBpnImage } = useBpnImage();
    const proxyUrl = getBpnImageUrl(bpnUrl);
    const canLoad = await testBpnImage(bpnUrl);
    
    const result = {
      original_url: bpnUrl,
      proxy_url: proxyUrl,
      can_load: canLoad
    };
    
    console.log('BPN Image Test Result:', result);
    return result;
  }
};

export default { useBpnImage, BpnImage, debugBpnImages };