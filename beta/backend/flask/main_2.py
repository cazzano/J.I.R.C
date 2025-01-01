# main_2.py
import os
import logging
import traceback
import sqlite3
from typing import List, Optional

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='app_logs/database_errors.log',
    filemode='a'
)
logger = logging.getLogger(__name__)

# Console handler for immediate visibility
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

class Book:
    def __init__(self, row):
        self.id = row['id']
        self.title = row['title']
        self.author = row['author']
        self.category = row['category']
        self.description = row['description']
        self.cover_image = row['cover_image']
        self.publication_year = row['publication_year']
        self.isbn = row['isbn']
        self.pdf_path = row['pdf_path']
        self.reviews = []

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'category': self.category,
            'description': self.description,
            'cover_image': self.cover_image,
            'publication_year': self.publication_year,
            'isbn': self.isbn,
            'reviews': [review.to_dict() for review in self.reviews]
        }

class Review:
    def __init__(self, row):
        self.id = row['id']
        self.book_id = row['book_id']
        self.text = row['text']
        self.author = row['author']

    def to_dict(self):
        return {
            'id': self.id,
            'book_id': self.book_id,
            'text': self.text,
            'author': self.author
        }

class DatabaseManager:
    @staticmethod
    def get_db_connection():
        try:
            conn = sqlite3.connect('books.db')
            conn.row_factory = sqlite3.Row
            logger.debug("Database connection established")
            return conn
        except sqlite3.Error as e:
            logger.error(f"Database connection error: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    @staticmethod
    def init_db():
        try:
            logger.info("Initializing database")
            conn = DatabaseManager.get_db_connection()
            cursor = conn.cursor()
            
            # Create Books Table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                cover_image TEXT,
                publication_year INTEGER,
                isbn TEXT,
                pdf_path TEXT
            )''')

            # Create Reviews Table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER,
                text TEXT NOT NULL,
                author TEXT NOT NULL,
                FOREIGN KEY(book_id) REFERENCES books(id)
            )''')
            
            conn.commit()
            conn.close()
            logger.info("Database initialization complete")
        except Exception as e:
            logger.error(f"Database initialization error: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    @staticmethod
    def insert_sample_data():
        try:
            logger.info("Inserting sample data")
            conn = DatabaseManager.get_db_connection()
            cursor = conn.cursor()

            # Check if books exist
            cursor.execute("SELECT COUNT(*) FROM books")
            if cursor.fetchone()[0] > 0:
                logger.info("Sample data already exists")
                conn.close()
                return

            # Sample books with varied details
            books_data = [
                {
                    'title': 'The Sealed Nectar',
                    'author': 'Safiur Rahman Mubarakpuri',
                    'category': 'Biography',
                    'description': 'Comprehensive biography of Prophet Muhammad (peace be upon him)',
                    'cover_image': 'https://example.com/sealed-nectar.jpg',
                    'publication_year': 1979,
                    'isbn': '978-9960-899-55-8',
                    'pdf_path': './pdfs/sealed-nectar.pdf'
                },
                {
                    'title': 'Clean Code',
                    'author': 'Robert C. Martin',
                    'category': 'Programming',
                    'description': 'A handbook of agile software craftsmanship',
                    'cover_image': 'https://example.com/clean-code.jpg',
                    'publication_year': 2008,
                    'isbn': '978-0132350884',
                    'pdf_path': './pdfs/clean-code.pdf'
                }
            ]

            for book in books_data:
                cursor.execute('''
                INSERT INTO books (
                    title, author, category, description, cover_image, 
                    publication_year, isbn, pdf_path
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', tuple(book.values()))
                
                book_id = cursor.lastrowid

                # Insert sample reviews
                cursor.execute('''
                INSERT INTO reviews (book_id, text, author) 
                VALUES (?, ?, ?)
                ''', (book_id, f'Great book about {book["title"]}', 'Anonymous'))

            conn.commit()
            conn.close()
            logger.info("Sample data insertion complete")
        except Exception as e:
            logger.error(f"Sample data insertion error: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    @staticmethod
    def get_book_reviews(book_id: int) -> List[Review]:
        try:
            logger.info(f"Retrieving reviews for book {book_id}")
            conn = DatabaseManager.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM reviews WHERE book_id = ?", (book_id,))
            reviews = [Review(row) for row in cursor.fetchall()]
            
            conn.close()
            logger.info(f"Retrieved {len(reviews)} reviews for book {book_id}")
            return reviews
        except Exception as e:
            logger.error(f"Error retrieving reviews for book {book_id}: {str(e)}")
            logger.error(traceback.format_exc())
            return []

    @staticmethod
    def get_all_books() -> List[Book]:
        try:
            logger.info("Retrieving all books")
            conn = DatabaseManager.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM books")
            books = [Book(row) for row in cursor.fetchall()]
            
            for book in books:
                book.reviews = DatabaseManager.get_book_reviews(book.id)
            
            conn.close()
            logger.info(f"Retrieved {len(books)} books")
            return books
        except Exception as e:
            logger.error(f"Error retrieving all books: {str(e)}")
            logger.error(traceback.format_exc())
            return []

    @staticmethod
    def get_book_by_id(book_id: int) -> Optional[Book]:
        try:
            logger.info(f"Attempting to retrieve book with ID: {book_id}")
            conn = DatabaseManager.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
            result = cursor.fetchone()
            
            if not result:
                logger.warning(f"No book found with ID: {book_id}")
                return None
            
            book = Book(result)
            book.reviews = DatabaseManager.get_book_reviews(book.id)
            logger.info(f"Book retrieved: {book.title} (ID: {book.id})")
            return book
        except Exception as e:
            logger.error(f"Error retrieving book by ID {book_id}: {str(e)}")
            logger.error(traceback.format_exc())
            return None

    @staticmethod
    def delete_book(book_id: int) -> bool:
        try:
            logger.info(f"Attempting to delete book with ID: {book_id}")
            conn = DatabaseManager.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM books WHERE id = ?", (book_id,))
            conn.commit()
            conn.close()
            logger.info(f"Book with ID {book_id} deleted successfully")
            return True
        except Exception as e:
            logger.error(f"Error deleting book with ID {book_id}: {str(e)}")
            logger.error(traceback.format_exc())
            return False

    @staticmethod
    def update_book(book_id: int, updated_data: dict) -> bool:
        try:
            logger.info(f"Attempting to update book with ID: {book_id}")
            conn = DatabaseManager.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
            UPDATE books SET title = ?, author = ?, category = ?, 
            description = ?, cover_image = ?, publication_year = ?, 
            isbn = ?, pdf_path = ? WHERE id = ?
            ''', (*updated_data.values(), book_id))
            
            conn.commit()
            conn.close()
            logger.info(f"Book with ID {book_id} updated successfully")
            return True
        except Exception as e:
            logger.error(f"Error updating book with ID {book_id}: {str(e)}")
            logger.error(traceback.format_exc())
            return False
