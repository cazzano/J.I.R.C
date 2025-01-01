import React, { useState, useEffect, useMemo, useCallback } from 'react';
import App from './App';
import { useBookActions } from './App_3.jsx';
import { 
  BookDetailModal, 
  PDFPreviewModal 
} from './App_4.jsx';

const API_BASE_URL = 'http://0.0.0.0:3000/api/v1';

const App2 = () => {
  // State Management
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  // Book Actions Hook
  const { 
    isPreviewOpen, 
    setIsPreviewOpen, 
    handleDownload, 
    previewData,
    setPreviewData,
    closePreview 
  } = useBookActions();

  // Fetch Books Effect
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

  // Enhanced Preview Handler
  const handlePreview = useCallback(async (selectedBook) => {
    try {
      // Fetch preview URL
      const previewResponse = await fetch(
        `${API_BASE_URL}/books/${selectedBook.id}/preview?page=0&scale=1.0`
      );

      // Check if response is ok
      if (!previewResponse.ok) {
        throw new Error('Failed to fetch preview');
      }

      // Convert response to blob
      const previewBlob = await previewResponse.blob();

      // Create object URL
      const previewUrl = URL.createObjectURL(previewBlob);

      // Update state with preview data
      setPreviewData({
        previewUrl: previewUrl,
        bookDetails: selectedBook
      });
      setSelectedBook(selectedBook);
      setIsPreviewOpen(true);

      // Fetch total page count
      const pageCountResponse = await fetch(
        `${API_BASE_URL}/books/${selectedBook.id}/page-count`
      );
      
      if (pageCountResponse.ok) {
        const pageCountData = await pageCountResponse.json();
        setTotalPages(pageCountData.total_pages);
      }

    } catch (error) {
      console.error('Preview error:', error);
      
      // More detailed error handling
      if (error.message === 'Failed to fetch preview') {
        alert('Unable to load preview. The file might be corrupted or unavailable.');
      } else {
        alert('An unexpected error occurred while loading the preview.');
      }
    }
  }, [setPreviewData, setSelectedBook, setIsPreviewOpen]);

  // Memoized Filtered Books
  const filteredBooks = useMemo(() => {
    if (!searchTerm) return books;
    return books.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [books, searchTerm]);

  // Modal Close Handler
  const handleCloseModal = () => {
    setSelectedBook(null);
    setIsPreviewOpen(false);
    // Revoke object URL to prevent memory leaks
    if (previewData?.previewUrl) {
      URL.revokeObjectURL(previewData.previewUrl);
    }
  };

  // Render Method
  return (
    <>
      {/* Main App Component */}
      <App 
        onBookSelect={setSelectedBook}
        onBookPreview={handlePreview}
        filteredBooks={filteredBooks}
        isLoading={isLoading}
        error={error}
        setSearchTerm={setSearchTerm}
      />
      
      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal 
          book={selectedBook} 
          isOpen={!!selectedBook} 
          onClose={handleCloseModal} 
          onDownload={() => handleDownload(selectedBook)} 
          onPreview={() => handlePreview(selectedBook)} 
        />
      )}

      {/* PDF Preview Modal */}
      <PDFPreviewModal 
        book={selectedBook} 
        isOpen={isPreviewOpen} 
        onClose={handleCloseModal} 
        previewData={previewData}
        totalPages={totalPages}
      />
    </>
  );
};

export default App2;
