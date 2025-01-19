package main

import (
	"database/sql"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

const (
    secretKey = "your_super_secret_key"
)

// Credentials represents user authentication data
type Credentials struct {
    Email    string `json:"email"`
    Password string `json:"password"`
    IsAdmin  bool   `json:"is_admin"`
}

// generateJWTToken creates a new JWT token for authentication
func generateJWTToken(email string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "email": email,
        "exp":   time.Now().Add(24 * time.Hour).Unix(),
    })

    return token.SignedString([]byte(secretKey))
}

// LoginHandler manages user login process
func loginHandler(db *sql.DB) fiber.Handler {
    return func(c *fiber.Ctx) error {
        var loginData Credentials
        if err := c.BodyParser(&loginData); err != nil {
            return c.Status(400).JSON(fiber.Map{
                "success": false,
                "message": "Invalid request",
            })
        }

        email := strings.TrimSpace(strings.ToLower(loginData.Email))
        password := strings.TrimSpace(loginData.Password)

        var user Credentials
        err := db.QueryRow(`
            SELECT email FROM credentials
            WHERE email = ? AND password = ? AND is_admin = 1
        `, email, password).Scan(&user.Email)

        if err != nil {
            return c.Status(401).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Credentials",
            })
        }

        // Create JWT token
        tokenString, err := generateJWTToken(email)
        if err != nil {
            log.Printf("Token generation error: %v", err)
            return c.Status(500).JSON(fiber.Map{
                "success": false,
                "message": "Token generation failed",
            })
        }

        return c.JSON(fiber.Map{
            "success": true,
            "token":   tokenString,
            "message": "Login Successful",
        })
    }
}

// ValidateTokenHandler checks the validity of a JWT token
func validateTokenHandler(db *sql.DB) fiber.Handler {
    return func(c *fiber.Ctx) error {
        type TokenRequest struct {
            Token string `json:"token"`
        }

        var req TokenRequest
        if err := c.BodyParser(&req); err != nil {
            return c.Status(400).JSON(fiber.Map{
                "valid":   false,
                "message": "Invalid request",
            })
        }

        token, err := jwt.Parse(req.Token, func(token *jwt.Token) (interface{}, error) {
            return []byte(secretKey), nil
        })

        if err != nil {
            return c.Status(401).JSON(fiber.Map{
                "valid":   false,
                "message": "Invalid token",
            })
        }

        if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
            email := claims["email"].(string)

            // Additional DB validation
            var user Credentials
            err := db.QueryRow(`
                SELECT email FROM credentials
                WHERE email = ? AND is_admin = 1
            `, email).Scan(&user.Email)

            if err != nil {
                return c.Status(401).JSON(fiber.Map{
                    "valid":   false,
                    "message": "User not found",
                })
            }

            return c.JSON(fiber.Map{
                "valid": true,
                "email": email,
            })
        }

        return c.Status(401).JSON(fiber.Map{
            "valid":   false,
            "message": "Invalid token",
        })
    }
}

// AddAdminHandler allows adding new admin users
func addAdminHandler(db *sql.DB) fiber.Handler {
    return func(c *fiber.Ctx) error {
        var admin Credentials
        if err := c.BodyParser(&admin); err != nil {
            return c.Status(400).JSON(fiber.Map{
                "success": false,
                "message": "Invalid request",
            })
        }

        _, err := db.Exec(`
            INSERT INTO credentials
            (email, password, is_admin) VALUES (?, ?, ?)
        `, admin.Email, admin.Password, 1)

        if err != nil {
            return c.Status(400).JSON(fiber.Map{
                "success": false,
                "message": "Email already exists",
            })
        }

        return c.Status(201).JSON(fiber.Map{
            "success": true,
            "message": "Admin added successfully",
        })
    }
}
