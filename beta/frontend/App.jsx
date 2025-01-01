import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, 
  faEye, 
  faComment, 
  faTimes,
  faBook,
  faSearch,
  faSpinner,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

// API Configuration
const API_BASE_URL = 'http://0.0.0.0:3000/api/v1';

// Utility Components
const SearchBar = React.memo(({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="flex items-center mb-6 space-x-2">
      <div className="join w-full">
        <input 
          type="text" 
          placeholder="Search books..." 
          className="input input-bordered join-item w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          className="btn btn-primary join-item"
          onClick={handleSearch}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
    </div>
  );
});

// Preview Modal Component
const PreviewModal = React.memo(({ book, isOpen, onClose }) => {
  const [previewInfo, setPreviewInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreviewInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/preview/books/${book.id}`);
        if (!response.ok) {
          throw new Error('Failed to load preview');
        }
        const data = await response.json();
        setPreviewInfo(data);
        setError(null);
      } catch (err) {
        setError('Failed to load preview. Please try again later.');
        console.error('Preview error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && book) {
      fetchPreviewInfo();
    }
  }, [isOpen, book]);

  if (!isOpen || !book) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Preview: {book.title}</h2>
          <button 
            onClick={onClose}
            className="btn btn-circle btn-outline"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <FontAwesomeIcon icon={faSpinner} spin className="text-3xl" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-12">{error}</div>
          ) : !previewInfo?.previewEnabled ? (
            <div className="text-center p-12">Preview not available for this book.</div>
          ) : (
            <div className="space-y-6">
              {/* Preview Image */}
              <div className="flex justify-center">
                <img
                  src={`${API_BASE_URL}/preview/books/${book.id}/pages/${currentPage}`}
                  alt={`Page ${currentPage}`}
                  className="max-h-[60vh] object-contain shadow-lg"
                />
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-center items-center gap-4">
                <button
                  className="btn btn-primary"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
                  Previous
                </button>
                <span className="text-lg">
                  Page {currentPage} of {previewInfo.totalPages}
                </span>
                <button
                  className="btn btn-primary"
                  disabled={currentPage >= previewInfo.totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                  <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Book Card Component
const BookCard = React.memo(({ book, onLearnMore }) => (
  <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
    <figure className="px-4 pt-4">
      <img 
        src={book.cover_image} 
        alt={book.title} 
        className="rounded-xl h-64 w-full object-cover"
        loading="lazy"
      />
    </figure>
    <div className="card-body items-center text-center">
      <h2 className="card-title">{book.title}</h2>
      <p className="text-sm text-gray-600">By {book.author}</p>
      <div className="badge badge-primary">{book.category}</div>
      <div className="card-actions justify-center mt-4">
        <button 
          className="btn btn-primary" 
          onClick={() => onLearnMore(book)}
        >
          <FontAwesomeIcon icon={faBook} className="mr-2" />
          Learn More
        </button>
      </div>
    </div>
  </div>
));

// Book Detail Modal
const BookDetailModal = React.memo(({ book, isOpen, onClose }) => {
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen || !book) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${book.id}/download`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download the book. Please try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{book.title}</h2>
          <button 
            onClick={onClose} 
            className="btn btn-circle btn-outline"
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
              className="w-full rounded-lg shadow-md"
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
                onClick={handleDownload}
                className="btn btn-primary"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Download
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPreview(true)}
              >
                <FontAwesomeIcon icon={faEye} className="mr-2" />
                Preview
              </button>
              <button className="btn btn-accent">
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
            {book.reviews.map(review => (
              <div key={review.id} className="mb-2">
                <p className="italic">"{review.text}"</p>
                <p className="text-sm text-gray-600">- {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          book={book}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
});

// Main App Component
const App = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/books`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        
        const data = await response.json();
        setBooks(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Unable to load books. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Memoized filtered books
  const filteredBooks = useMemo(() => {
    if (!searchTerm) return books;
    return books.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [books, searchTerm]);

  const handleLearnMore = useCallback((book) => {
    setSelectedBook(book);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedBook(null);
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="bg-primary text-primary-content p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Islamic Book Library</h1>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        <SearchBar onSearch={setSearchTerm} />

        {isLoading ? (
          <div className="flex justify-center items-center">
            <FontAwesomeIcon icon={faSpinner} spin className="text-3xl" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onLearnMore={handleLearnMore} />
            ))}
          </div>
        )}
      </main>

      {selectedBook && (
        <BookDetailModal 
          book={selectedBook} 
          isOpen={!!selectedBook} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default App;