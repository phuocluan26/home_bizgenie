package main

import (
	"os"

	"bizgenie-api/internal/config"
	"bizgenie-api/internal/database"
	"bizgenie-api/internal/handlers"
	"bizgenie-api/internal/logger"
	"bizgenie-api/internal/middleware"
	"bizgenie-api/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load environment variables
	cfg, err := config.Load()
	if err != nil {
		logger.FatalWithErr("Failed to load config", err)
	}

	// Initialize logger with configured level
	logger.SetLevelFromString(cfg.LogLevel)
	logger.Info("Logger initialized with level: %s", cfg.LogLevel)

	// Initialize database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		logger.FatalWithErr("Failed to connect to database", err)
	}
	defer db.Close()
	logger.Info("Database connected successfully")

	// Run migrations
	if err := database.RunMigrations(db); err != nil {
		logger.FatalWithErr("Failed to run migrations", err)
	}
	logger.Info("Database migrations completed successfully")

	// Create default admin user if it doesn't exist
	// Set forceUpdate to true to reset password on each startup (useful for development)
	forceUpdate := os.Getenv("FORCE_UPDATE_ADMIN") == "true"
	authService := services.NewAuthService(cfg.JWTSecret)
	if err := database.CreateDefaultAdmin(db, authService.HashPassword, forceUpdate); err != nil {
		logger.Warn("Failed to create default admin user: %v", err)
		// Don't fail startup if admin already exists or other non-critical error
	} else {
		logger.Info("Default admin user checked/created successfully")
	}

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
		logger.Info("Running in production mode")
	} else {
		logger.Info("Running in development mode")
	}

	// Initialize router without default logger (we use custom logger)
	router := gin.New()
	// Disable Gin's default logger to avoid duplicate logs
	router.Use(gin.Recovery())

	// Apply middleware (order matters)
	router.Use(middleware.RequestLogger()) // Log requests first
	router.Use(middleware.CORS())
	router.Use(middleware.ErrorHandler()) // Handle errors last

	// Initialize handlers
	h := handlers.New(db, cfg)

	// Public routes
	api := router.Group("/api")
	{
		// Products
		api.GET("/products", h.GetProducts)
		api.GET("/products/:id", h.GetProductByID)
		api.GET("/products/slug/:slug", h.GetProductBySlug)
		api.GET("/products/search", h.SearchProducts)

		// Categories
		api.GET("/categories", h.GetCategories)
		api.GET("/categories/:id", h.GetCategoryByID)
		api.GET("/categories/slug/:slug", h.GetCategoryBySlug)

		// Blog
		api.GET("/blog", h.GetBlogPosts)
		api.GET("/blog/:id", h.GetBlogPostByID)
		api.GET("/blog/slug/:slug", h.GetBlogPostBySlug)

		// Blog Categories
		api.GET("/blog-categories", h.GetBlogCategories)
		api.GET("/blog-categories/:id", h.GetBlogCategoryByID)
		api.GET("/blog-categories/slug/:slug", h.GetBlogCategoryBySlug)

		// Contact
		api.POST("/contacts", h.CreateContact)

		// Video Demos
		api.GET("/video-demos", h.GetVideoDemos)
		api.GET("/video-demos/:id", h.GetVideoDemoByID)

		// Social Media Links
		api.GET("/social-media-links", h.GetSocialMediaLinks)

		// Auth
		api.POST("/auth/login", h.Login)
		api.POST("/auth/refresh", h.RefreshToken)
	}

	// Admin routes (require JWT)
	admin := router.Group("/api/admin")
	admin.Use(middleware.JWTAuth(cfg.JWTSecret))
	{
		// Products admin
		admin.GET("/products", h.GetAdminProducts)
		admin.POST("/products", h.CreateProduct)
		admin.PUT("/products/:id", h.UpdateProduct)
		admin.DELETE("/products/:id", h.DeleteProduct)
		admin.POST("/products/:id/embedding", h.UpdateProductEmbedding)

		// Categories admin
		admin.POST("/categories", h.CreateCategory)
		admin.PUT("/categories/:id", h.UpdateCategory)
		admin.DELETE("/categories/:id", h.DeleteCategory)

		// Blog admin
		admin.GET("/blog", h.GetAdminBlogPosts)
		admin.POST("/blog", h.CreateBlogPost)
		admin.PUT("/blog/:id", h.UpdateBlogPost)
		admin.DELETE("/blog/:id", h.DeleteBlogPost)

		// Blog Categories admin
		admin.POST("/blog-categories", h.CreateBlogCategory)
		admin.PUT("/blog-categories/:id", h.UpdateBlogCategory)
		admin.DELETE("/blog-categories/:id", h.DeleteBlogCategory)

		// Contacts admin
		admin.GET("/contacts", h.GetContacts)
		admin.GET("/contacts/:id", h.GetContactByID)
		admin.PUT("/contacts/:id/status", h.UpdateContactStatus)
		admin.DELETE("/contacts/:id", h.DeleteContact)

		// Users admin
		admin.GET("/users", h.GetUsers)
		admin.POST("/users", h.CreateUser)
		admin.PUT("/users/:id", h.UpdateUser)
		admin.DELETE("/users/:id", h.DeleteUser)

		// Video Demos admin
		admin.GET("/video-demos", h.GetAdminVideoDemos)
		admin.POST("/video-demos", h.CreateVideoDemo)
		admin.PUT("/video-demos/:id", h.UpdateVideoDemo)
		admin.DELETE("/video-demos/:id", h.DeleteVideoDemo)

		// Social Media Links admin
		admin.GET("/social-media-links", h.GetSocialMediaLinks)
		admin.GET("/social-media-links/:id", h.GetSocialMediaLinkByID)
		admin.POST("/social-media-links", h.CreateSocialMediaLink)
		admin.PUT("/social-media-links/:id", h.UpdateSocialMediaLink)
		admin.DELETE("/social-media-links/:id", h.DeleteSocialMediaLink)
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		logger.FatalWithErr("Failed to start server", err)
	}
}
