package main

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

const (
    dbPath = "auth.db"
)

// InitDB sets up the SQLite database and creates necessary tables
func initDB() *sql.DB {
    db, err := sql.Open("sqlite3", dbPath)
    if err != nil {
        log.Fatal(err)
    }

    // Create credentials table
    _, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS credentials (
            id INTEGER PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0
        )
    `)
    if err != nil {
        log.Fatal(err)
    }

    // Insert default admin
    _, err = db.Exec(`
        INSERT OR IGNORE INTO credentials
        (email, password, is_admin) VALUES (?, ?, ?)
    `, "kali@kali.com", "password123", 1)
    if err != nil {
        log.Fatal(err)
    }

    return db
}

// CloseDB safely closes the database connection
func closeDB(db *sql.DB) {
    if db != nil {
        db.Close()
    }
}
