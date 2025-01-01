import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faArrowRight, 
  faExpand, 
  faCompress, 
  faDownload, 
  faTimes 
} from '@fortawesome/free-solid-svg-icons';

const PDFViewer = ({ 
  previewData, 
  onClose, 
  onDownload 
}) => {
  // State Management
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Preview Image
  const fetchPreviewImage = useCallback(async (page = 1, scaleValue = scale) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${previewData.previewUrl}?page=${page - 1}&scale=${scaleValue}`
      );

      if (!response.ok) {
        throw new Error('Failed to load preview');
      }

      // Update state
      setCurrentPage(page);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [previewData]);

  // Page Navigation
  const handlePageChange = useCallback((direction) => {
    const newPage = currentPage + direction;
    if (newPage > 0 && (!totalPages || newPage <= totalPages)) {
      fetchPreviewImage(newPage);
    }
  }, [currentPage, totalPages, fetchPreviewImage]);

  // Scale Toggle
  const toggleScale = useCallback(() => {
    const newScale = scale === 1.0 ? 1.5 : 1.0;
    setScale(newScale);
    fetchPreviewImage(currentPage, newScale);
  }, [scale, currentPage, fetchPreviewImage]);

  // Initial Load
  useEffect(() => {
    fetchPreviewImage();
  }, [fetchPreviewImage]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePageChange(-1);
          break;
        case 'ArrowRight':
          handlePageChange(1);
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePageChange, onClose]);

  // Render
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex flex-col 
      items-center justify-center p-4 overflow-hidden"
    >
      {/* Modal Header */}
      <div className="absolute top-4 right-4 z-60 flex space-x-4">
        <button 
          onClick={() => onDownload(previewData.bookDetails)}
          className="btn btn-ghost text-white hover:bg-white/20"
          title="Download PDF"
        >
          <FontAwesomeIcon icon={faDownload} className="text-xl" />
        </button>
        <button 
          onClick={onClose} 
          className="btn btn-ghost text-white hover:bg-white/20"
          title="Close Preview"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
      </div>

      {/* Preview Content */}
      <div className="relative w-full max-w-4xl max-h-[80vh]">
        {/* Loading and Error States */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="loading loading-spinner text-white"></span>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => fetchPreviewImage()} 
              className="btn btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Preview Image */}
        {!isLoading && !error && (
          <img 
            src={`${previewData.previewUrl}?page=${currentPage - 1}&scale=${scale}`}
            alt={`PDF Preview - Page ${currentPage}`}
            className="w-full h-full object-contain rounded-lg shadow-2xl"
            style={{ maxHeight: '80vh' }}
          />
        )}
      </div>

      {/* Navigation Controls */}
      <div 
        className="mt-4 bg-white/20 rounded-full 
        flex items-center justify-center space-x-4 p-2"
      >
        {/* Previous Page */}
        <button 
          onClick={() => handlePageChange(-1)}
          disabled={currentPage <= 1}
          className="btn btn-circle btn-ghost disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        {/* Page Indicator */}
        <span className="text-white">
          Page {currentPage} {totalPages && `of ${totalPages}`}
        </span>

        {/* Next Page */}
        <button 
          onClick={() => handlePageChange(1)}
          disabled={totalPages && currentPage >= totalPages}
          className="btn btn-circle btn-ghost disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>

        {/* Zoom Toggle */}
        <button 
          onClick={toggleScale}
          className="btn btn-circle btn-ghost"
        >
          <FontAwesomeIcon 
            icon={scale === 1.0 ? faExpand : faCompress} 
          />
        </button>
      </div>
    </div>
  );
};

export default React.memo(PDFViewer);
