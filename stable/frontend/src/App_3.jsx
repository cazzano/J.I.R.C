import { useState, useCallback, useMemo } from 'react';

const API_BASE_URL = 'http://0.0.0.0:3000/api/v1';

export const useBookActions = () => {
  // State Management
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState(null);

  // Download Handler
  const handleDownload = useCallback(async (book) => {
    try {
      setIsDownloading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/books/${book.id}/download`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${book.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsDownloading(false);
    } catch (err) {
      console.error('Download error:', err);
      setError('Download failed. Please try again.');
      setIsDownloading(false);
    }
  }, []);

  // Preview Handler
  const handlePreview = useCallback(async (book) => {
    try {
      setIsPreviewLoading(true);
      setError(null);
      setCurrentPage(0);
      setScale(1.0);

      // Fetch preview
      const previewResponse = await fetch(
        `${API_BASE_URL}/books/${book.id}/preview?page=0&scale=1.0`
      );

      if (!previewResponse.ok) {
        throw new Error('Failed to fetch preview');
      }

      const previewBlob = await previewResponse.blob();
      const previewUrl = URL.createObjectURL(previewBlob);

      // Fetch page count
      const pageCountResponse = await fetch(
        `${API_BASE_URL}/books/${book.id}/page-count`
      );

      const pageCountData = await pageCountResponse.json();

      setPreviewData({
        previewUrl,
        bookDetails: book
      });
      setTotalPages(pageCountData.total_pages);
      setIsPreviewOpen(true);
      setIsPreviewLoading(false);

    } catch (err) {
      console.error('Preview error:', err);
      setError('Preview failed. Please try again.');
      setIsPreviewLoading(false);
    }
  }, []);

  // Page Navigation Handler
  const handlePageChange = useCallback(async (direction) => {
    try {
      if (!previewData) return;

      const newPage = currentPage + direction;
      
      if (newPage < 0 || (totalPages > 0 && newPage >= totalPages)) {
        return;
      }

      setIsPreviewLoading(true);
      setCurrentPage(newPage);

      const previewResponse = await fetch(
        `${API_BASE_URL}/books/${previewData.bookDetails.id}/preview?page=${newPage}&scale=${scale}`
      );

      if (!previewResponse.ok) {
        throw new Error('Failed to fetch page preview');
      }

      const previewBlob = await previewResponse.blob();
      const previewUrl = URL.createObjectURL(previewBlob);

      setPreviewData(prev => ({
        ...prev,
        previewUrl
      }));
      setIsPreviewLoading(false);

    } catch (err) {
      console.error('Page change error:', err);
      setError('Failed to change page. Please try again.');
      setIsPreviewLoading(false);
    }
  }, [previewData, currentPage, totalPages, scale]);

  // Scale Toggle Handler
  const handleScaleChange = useCallback(async () => {
    try {
      if (!previewData) return;

      const newScale = scale === 1.0 ? 1.5 : 1.0;
      setScale(newScale);
      setIsPreviewLoading(true);

      const previewResponse = await fetch(
        `${API_BASE_URL}/books/${previewData.bookDetails.id}/preview?page=${currentPage}&scale=${newScale}`
      );

      if (!previewResponse.ok) {
        throw new Error('Failed to fetch scaled preview');
      }

      const previewBlob = await previewResponse.blob();
      const previewUrl = URL.createObjectURL(previewBlob);

      setPreviewData(prev => ({
        ...prev,
        previewUrl
      }));
      setIsPreviewLoading(false);

    } catch (err) {
      console.error('Scale change error:', err);
      setError('Failed to change scale. Please try again.');
      setIsPreviewLoading(false);
    }
  }, [previewData, currentPage, scale]);

  // Close Preview Handler
  const closePreview = useCallback(() => {
    if (previewData) {
      URL.revokeObjectURL(previewData.previewUrl);
    }
    setIsPreviewOpen(false);
    setPreviewData(null);
    setCurrentPage(0);
    setScale(1.0);
    setError(null);
  }, [previewData]);

  // Book Search Hook
  const useBookSearch = (books, searchTerm) => {
    return useMemo(() => {
      if (!searchTerm) return books;
      
      const lowercasedTerm = searchTerm.toLowerCase();
      
      return books.filter(book => 
        book.title.toLowerCase().includes(lowercasedTerm) ||
        book.author.toLowerCase().includes(lowercasedTerm) ||
        book.category.toLowerCase().includes(lowercasedTerm)
      );
    }, [books, searchTerm]);
  };

  // Error Handler
  const useErrorHandler = () => {
    const clearError = () => setError(null);
    return { error, setError, clearError };
  };

  return {
    // State
    isPreviewOpen,
    setIsPreviewOpen,
    previewData,
    setPreviewData,
    currentPage,
    totalPages,
    scale,
    isDownloading,
    isPreviewLoading,
    error,

    // Methods
    handleDownload,
    handlePreview,
    handlePageChange,
    handleScaleChange,
    closePreview,
    useBookSearch,
    useErrorHandler
  };
};
