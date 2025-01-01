import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, 
  faEye, 
  faComment, 
  faTimes,
  faArrowLeft,
  faArrowRight,
  faExpand,
  faCompress
} from '@fortawesome/free-solid-svg-icons';

export const BookDetailModal = React.memo(({ 
  book, 
  isOpen, 
  onClose, 
  onDownload, 
  onPreview 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{book.title}</h2>
          <button 
            onClick={onClose} 
            className="btn btn-circle btn-ghost"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="grid md:grid-cols-3 gap-6 p-6">
          {/* Book Cover */}
          <div className="md:col-span-1">
            <img 
              src={book.cover_image} 
              alt={book.title} 
              className="w-full rounded-lg shadow-md object-cover"
            />
          </div>

          {/* Book Details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="badge badge-primary mr-2">{book.category}</span>
              <span className="text-gray-600">By {book.author}</span>
            </div>

            <p className="text-gray-700">{book.description}</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onDownload}
                className="btn btn-primary"
                aria-label="Download Book"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Download
              </button>
              <button 
                onClick={onPreview}
                className="btn btn-secondary"
                aria-label="Preview Book"
              >
                <FontAwesomeIcon icon={faEye} className="mr-2" />
                Preview
              </button>
              <button 
                className="btn btn-accent"
                aria-label="View Comments"
              >
                <FontAwesomeIcon icon={faComment} className="mr-2" />
                Comments
              </button>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="p-6 border-t grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Publication Details</h3>
            <p>Year: {book.publication_year}</p>
            <p>ISBN: {book.isbn}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Reviews</h3>
            {book.reviews && book.reviews.length > 0 ? (
              book.reviews.map(review => (
                <div key={review.id} className="mb-2">
                  <p className="italic">"{review.text}"</p>
                  <p className="text-sm text-gray-600">- {review.author}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export const PDFPreviewModal = React.memo(({ 
  book, 
  isOpen, 
  onClose, 
  previewData,
  totalPages = 0,
  onPageChange,
  currentPage = 0,
  onScaleChange,
  scale = 1.0
}) => {
  if (!isOpen || !previewData) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 overflow-hidden">
      {/* Modal Header */}
      <div className="absolute top-4 right-4 z-60 flex space-x-4">
        <button 
          onClick={onClose} 
          className="btn btn-ghost text-white hover:bg-white/20"
          aria-label="Close Preview"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
      </div>

      {/* Preview Content */}
      <div className="relative w-full max-w-4xl max-h-[80vh]">
        {previewData && previewData.previewUrl ? (
          <div className="flex flex-col items-center">
            <img 
              src={previewData.previewUrl} 
              alt="PDF Preview" 
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Page Navigation and Info */}
            <div className="mt-4 bg-white/20 rounded-full flex items-center justify-center space-x-4 p-2">
              {/* Previous Page */}
              <button 
                onClick={() => onPageChange(-1)}
                disabled={currentPage <= 0}
                className="btn btn-circle btn-ghost disabled:opacity-50"
                aria-label="Previous Page"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>

              {/* Page Indicator */}
              <span className="text-white">
                Page {currentPage + 1} {totalPages > 0 && `of ${totalPages}`}
              </span>

              {/* Next Page */}
              <button 
                onClick={() => onPageChange(1)}
                disabled={totalPages > 0 && currentPage >= totalPages - 1}
                className="btn btn-circle btn-ghost disabled:opacity-50"
                aria-label="Next Page"
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>

              {/* Zoom Toggle */}
              <button 
                onClick={onScaleChange}
                className="btn btn-circle btn-ghost"
                aria-label="Toggle Zoom"
              >
                <FontAwesomeIcon 
                  icon={scale === 1.0 ? faExpand : faCompress} 
                />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-white text-xl">
              Preview not available. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
