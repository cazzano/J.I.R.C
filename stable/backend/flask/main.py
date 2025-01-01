# main.py
import logging
import traceback
from flask import Flask, jsonify, send_file, abort, request
from flask_cors import CORS
import os
from preview import PDFPreview
from main_2 import DatabaseManager, Book

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='app_logs/app_errors.log',
    filemode='a'
)
logger = logging.getLogger(__name__)

# Console handler for immediate visibility
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

app = Flask(__name__)
CORS(app, resources={r"/api/v1/*": {"origins": "http://localhost:5173"}})

# Routes
@app.route('/api/v1/books/', methods=['GET'])
def get_books():
    try:
        logger.info("Fetching all books")
        books = DatabaseManager.get_all_books()
        return jsonify([book.to_dict() for book in books])
    except Exception as e:
        logger.error(f"Error fetching books: {str(e)}")
        logger.error(traceback.format_exc())
        abort(500, description="Internal server error while fetching books")

@app.route('/api/v1/books/<int:book_id>/download', methods=['GET'])
def download_pdf(book_id):
    try:
        logger.info(f"Attempting to download PDF for book {book_id}")
        book = DatabaseManager.get_book_by_id(book_id)
        
        if not book:
            logger.warning(f"Book not found for download: {book_id}")
            abort(404, description="Book not found")
        
        pdf_path = book.pdf_path
        
        if not os.path.exists(pdf_path):
            logger.error(f"PDF file not found: {pdf_path}")
            abort(404, description="PDF file not found")
        
        logger.info(f"Downloading PDF: {pdf_path}")
        return send_file(pdf_path, as_attachment=True)
    
    except Exception as e:
        logger.error(f"Error downloading PDF for book {book_id}: {str(e)}")
        logger.error(traceback.format_exc())
        abort(500, description="Internal server error during PDF download")

@app.route('/api/v1/books/<int:book_id>/preview', methods=['GET'])
def get_pdf_preview(book_id):
    try:
        logger.info(f"Attempting to get preview for book {book_id}")
        book = DatabaseManager.get_book_by_id(book_id)
        
        if not book:
            logger.warning(f"Book not found for preview: {book_id}")
            abort(404, description="Book not found")
        
        pdf_path = book.pdf_path
        
        # Get query parameters
        page = int(request.args.get('page', 0))
        scale = float(request.args.get('scale', 1.0))

        logger.info(f"Generating preview for {pdf_path}, page {page}, scale {scale}")
        
        # Generate preview
        preview_image = PDFPreview.generate_preview(pdf_path, page, scale)
        total_pages = PDFPreview.get_total_pages(pdf_path)

        logger.info(f"Preview generated successfully for book {book_id}")
        return send_file(
            preview_image, 
            mimetype='image/png',
            as_attachment=False
        )

    except Exception as e:
        logger.error(f"Error in get_pdf_preview for book {book_id}: {str(e)}")
        logger.error(traceback.format_exc())
        abort(500, description=f"Internal server error generating preview: {str(e)}")

@app.route('/api/v1/books/<int:book_id>/page-count', methods=['GET'])
def get_book_page_count(book_id):
    try:
        logger.info(f"Retrieving page count for book {book_id}")
        book = DatabaseManager.get_book_by_id(book_id)
        
        if not book:
            logger.warning(f"Book not found for page count: {book_id}")
            abort(404, description="Book not found")
        
        pdf_path = book.pdf_path
        total_pages = PDFPreview.get_total_pages(pdf_path)

        logger.info(f"Page count retrieved: {total_pages} for book {book_id}")
        return jsonify({"total_pages": total_pages})

    except Exception as e:
        logger.error(f"Error retrieving page count for book {book_id}: {str(e)}")
        logger.error(traceback.format_exc())
        abort(500, description="Internal server error retrieving page count")

# Advanced Search Route
@app.route('/api/v1/books/search', methods=['GET'])
def search_books():
    try:
        query = request.args.get('q', '').strip()
        logger.info(f"Search query received: {query}")
        
        if not query:
            logger.info("Empty search query")
            return jsonify([])
        
        books = DatabaseManager.get_all_books()
        
        # Case-insensitive search across multiple fields
        filtered_books = [
            book for book in books 
            if (query.lower() in book.title.lower() or 
                query.lower() in book.author.lower() or 
                query.lower() in book.category.lower())
        ]
        
        logger.info(f"Search returned {len(filtered_books)} results")
        return jsonify([book.to_dict() for book in filtered_books])

    except Exception as e:
        logger.error(f"Error in book search: {str(e)}")
        logger.error(traceback.format_exc())
        abort(500, description="Internal server error during book search")

# Error Handlers with Detailed Logging
@app.errorhandler(404)
def not_found(error):
    logger.warning(f"Not Found Error: {str(error)}")
    return jsonify({
        "error": "Not Found",
        "message": str(error)
    }), 404

@app.errorhandler(500)
def server_error(error):
    logger.error(f"Internal Server Error: {str(error)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    return jsonify({
        "error": "Internal Server Error",
        "message": "An unexpected error occurred"
    }), 500

# Initialization Function
def initialize_app():
    try:
        # Ensure logs directory exists
        os.makedirs('app_logs', exist_ok=True)
        
        logger.info("Initializing application")
        DatabaseManager.init_db()
        DatabaseManager.insert_sample_data()
        logger.info("Application initialization complete")
    except Exception as e:
        logger.error(f"Initialization error: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Main Execution
if __name__ == '__main__':
    try:
        initialize_app()
        logger.info("Starting Flask application")
        app.run(
            host='0.0.0.0', 
            port=3000, 
            debug=True
        )
    except Exception as e:
        logger.critical(f"Critical error starting application: {str(e)}")
        logger.critical(traceback.format_exc())
