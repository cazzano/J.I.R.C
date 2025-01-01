// Save this as main_2.go
package main

import (
    "database/sql"
    "os"
    "github.com/gofiber/fiber/v2"
    _ "github.com/mattn/go-sqlite3"
)

// Models
type Book struct {
    ID              int      `json:"id"`
    Title           string   `json:"title"`
    Author          string   `json:"author"`
    Category        string   `json:"category"`
    Description     string   `json:"description"`
    CoverImage      string   `json:"cover_image"`
    PublicationYear int      `json:"publication_year"`
    ISBN            string   `json:"isbn"`
    PDFPath         string   `json:"pdf_path"`
    Reviews         []Review `json:"reviews"`
}

type Review struct {
    ID     int    `json:"id"`
    BookID int    `json:"book_id"`
    Text   string `json:"text"`
    Author string `json:"author"`
}

// Database connection
var db *sql.DB

// Database Operations
func initDB() error {
    var err error
    db, err = sql.Open("sqlite3", "./books.db")
    if err != nil {
        return err
    }

    return createTables()
}

func closeDB() {
    if db != nil {
        db.Close()
    }
}

func createTables() error {
    createTablesSQL := `
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
    );

    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER,
        text TEXT NOT NULL,
        author TEXT NOT NULL,
        FOREIGN KEY(book_id) REFERENCES books(id)
    );`

    _, err := db.Exec(createTablesSQL)
    return err
}

func insertSampleData() error {
    var count int
    if err := db.QueryRow("SELECT COUNT(*) FROM books").Scan(&count); err != nil {
        return err
    }
    
    if count > 0 {
        return nil // Data already exists
    }

    tx, err := db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    bookStmt := `
    INSERT INTO books (
        title, author, category, description, cover_image, 
        publication_year, isbn, pdf_path
    ) VALUES (
        'The Sealed Nectar',
        'Safiur Rahman Mubarakpuri',
        'Biography',
        'Biography of Prophet Muhammad (peace be upon him)',
        'https://example.com/cover1.jpg',
        1979,
        '978-9960-899-55-8',
        './pdfs/sealed-nectar.pdf'
    )`

    result, err := tx.Exec(bookStmt)
    if err != nil {
        return err
    }

    bookID, err := result.LastInsertId()
    if err != nil {
        return err
    }

    reviewStmt := `
    INSERT INTO reviews (book_id, text, author) VALUES 
    (?, 'An excellent biography that provides detailed insights.', 'Abdullah')`

    if _, err := tx.Exec(reviewStmt, bookID); err != nil {
        return err
    }

    return tx.Commit()
}

func getBooks(c *fiber.Ctx) error {
    rows, err := db.Query(`
        SELECT id, title, author, category, description, 
               cover_image, publication_year, isbn, pdf_path 
        FROM books
    `)
    if err != nil {
        return fiber.NewError(fiber.StatusInternalServerError, "Failed to fetch books")
    }
    defer rows.Close()

    var books []Book
    for rows.Next() {
        var book Book
        if err := rows.Scan(
            &book.ID, &book.Title, &book.Author, &book.Category,
            &book.Description, &book.CoverImage, &book.PublicationYear,
            &book.ISBN, &book.PDFPath,
        ); err != nil {
            continue
        }
        
        if reviews, err := getBookReviews(book.ID); err == nil {
            book.Reviews = reviews
        }
        
        books = append(books, book)
    }

    if len(books) == 0 {
        books = []Book{}
    }

    return c.JSON(books)
}

func getBookReviews(bookID int) ([]Review, error) {
    rows, err := db.Query("SELECT id, text, author FROM reviews WHERE book_id = ?", bookID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var reviews []Review
    for rows.Next() {
        var review Review
        if err := rows.Scan(&review.ID, &review.Text, &review.Author); err != nil {
            return nil, err
        }
        review.BookID = bookID
        reviews = append(reviews, review)
    }

    return reviews, nil
}

func downloadPDF(c *fiber.Ctx) error {
    id := c.Params("id")
    
    var pdfPath string
    err := db.QueryRow("SELECT pdf_path FROM books WHERE id = ?", id).Scan(&pdfPath)
    if err != nil {
        return fiber.NewError(fiber.StatusNotFound, "Book not found")
    }

    if _, err := os.Stat(pdfPath); os.IsNotExist(err) {
        return fiber.NewError(fiber.StatusNotFound, "PDF file not found")
    }

    return c.Download(pdfPath)
}

func setupRoutes(app *fiber.App) {
    api := app.Group("/api/v1")
    
    books := api.Group("/books")
    books.Get("/", getBooks)
    books.Get("/:id/download", downloadPDF)
}
