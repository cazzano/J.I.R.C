package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
    // Initialize database
    db := initDB()
    defer closeDB(db)

    // Create Fiber app
    app := fiber.New()

    // CORS middleware
    app.Use(cors.New())

    // Define routes
    app.Post("/api/login", loginHandler(db))
    app.Post("/api/validate-token", validateTokenHandler(db))
    app.Post("/api/add-admin", addAdminHandler(db))

    // Start server
    log.Fatal(app.Listen(":5000"))
}
