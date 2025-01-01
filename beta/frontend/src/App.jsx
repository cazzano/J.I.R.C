import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faSpinner,
  faBook
} from '@fortawesome/free-solid-svg-icons';

// Utility Components
const SearchBar = React.memo(({ onSearch }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

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
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
      <h2 className="card-title line-clamp-2">{book.title}</h2>
      <p className="text-sm text-gray-600 line-clamp-1">By {book.author}</p>
      <div className="badge badge-primary">{book.category}</div>
      <div className="card-actions justify-center mt-4">
        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => onLearnMore(book)}
        >
          <FontAwesomeIcon icon={faBook} className="mr-2" />
          Learn More
        </button>
      </div>
    </div>
  </div>
));

const App = ({ onBookSelect, filteredBooks, isLoading, error, setSearchTerm }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Book Library</h1>
      <SearchBar onSearch={setSearchTerm} />
      {isLoading ? (
        <div className="flex justify-center items-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map(book => (
            <BookCard 
              key={book.id} 
              book={book} 
              onLearnMore={onBookSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
