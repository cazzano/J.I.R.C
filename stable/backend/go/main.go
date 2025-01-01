// Save this as main.go
package main

import (
    "log"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
)

func setupMiddleware(app *fiber.App) {
    app.Use(logger.New())
    app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:5173",
        AllowHeaders: "Origin, Content-Type, Accept",
    }))
}

func main() {
    // Initialize database connection
    if err := initDB(); err != nil {
        log.Fatal("Database initialization failed:", err)
    }
    defer closeDB()

    // Insert sample data (optional - can be removed in production)
    if err := insertSampleData(); err != nil {
        log.Println("Note: Sample data insertion skipped:", err)
    }

    // Create Fiber app
    app := fiber.New(fiber.Config{
        AppName: "Islamic Library API",
        ErrorHandler: func(c *fiber.Ctx, err error) error {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "error": err.Error(),
            })
        },
    })

    // Setup middleware
    setupMiddleware(app)

    // Setup routes
    setupRoutes(app)

    // Start server
    log.Println("Server starting on http://localhost:3000")
    log.Fatal(app.Listen(":3000"))
}
