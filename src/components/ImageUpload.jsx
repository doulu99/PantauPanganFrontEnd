// components/ImageUpload.jsx - Image Upload Component for Market Prices
import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  maxSizePerImage = 5, // MB
  disabled = false,
  className = ""
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState(images);
  const [errors, setErrors] = useState([]);
  const [showPreview, setShowPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFiles = (fileList) => {
    const files = Array.from(fileList);
    const newErrors = [];
    const validFiles = [];
    const newPreviews = [...previews];

    // Check if adding these files would exceed the limit
    if (previews.length + files.length > maxImages) {
      newErrors.push(`Maximum ${maxImages} images allowed. You can add ${maxImages - previews.length} more.`);
      setErrors(newErrors);
      return;
    }

    files.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        newErrors.push(`File "${file.name}" is not an image.`);
        return;
      }

      // Validate file size
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > maxSizePerImage) {
        newErrors.push(`File "${file.name}" is too large. Maximum ${maxSizePerImage}MB allowed.`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = {
          id: Date.now() + index,
          file: file,
          url: e.target.result,
          name: file.name,
          size: file.size,
          type: 'new'
        };
        
        newPreviews.push(preview);
        setPreviews([...newPreviews]);
        
        // Update parent component
        const allFiles = newPreviews
          .filter(p => p.type === 'new')
          .map(p => p.file);
        onImagesChange(allFiles);
      };
      reader.readAsDataURL(file);
      validFiles.push(file);
    });

    setErrors(newErrors);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Remove image
  const removeImage = (id) => {
    const newPreviews = previews.filter(preview => preview.id !== id);
    setPreviews(newPreviews);
    
    // Update parent component
    const allFiles = newPreviews
      .filter(p => p.type === 'new')
      .map(p => p.file);
    onImagesChange(allFiles);
  };

  // Open file dialog
  const openFileDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Camera className="w-12 h-12 text-gray-400" />
          <div className="text-lg font-medium text-gray-900">
            {dragActive ? 'Drop images here' : 'Upload Images'}
          </div>
          <div className="text-sm text-gray-500">
            Drag and drop images here, or click to select files
          </div>
          <div className="text-xs text-gray-400">
            Maximum {maxImages} images, {maxSizePerImage}MB each. Supports: JPG, PNG, GIF, WebP
          </div>
        </div>

        {/* Upload Count */}
        {previews.length > 0 && (
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {previews.length} / {maxImages}
          </div>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Selected Images ({previews.length})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {previews.map((preview) => (
              <div key={preview.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreview(preview);
                      }}
                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(preview.id);
                      }}
                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                      disabled={disabled}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Image info */}
                <div className="mt-1 text-xs text-gray-500 truncate">
                  {preview.name}
                </div>
                <div className="text-xs text-gray-400">
                  {formatFileSize(preview.size)}
                </div>

                {/* Main image indicator */}
                {preview.id === previews[0]?.id && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs font-medium">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {showPreview.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(showPreview.size)}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <img
                  src={showPreview.url}
                  alt={showPreview.name}
                  className="max-w-full max-h-96 mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;