package handlers

import (
	"database/sql"

	"bizgenie-api/internal/config"
	"bizgenie-api/internal/services"
)

type Handlers struct {
	db                  *sql.DB
	cfg                 *config.Config
	productService      *services.ProductService
	categoryService     *services.CategoryService
	blogService         *services.BlogService
	blogCategoryService *services.BlogCategoryService
	contactService      *services.ContactService
	authService         *services.AuthService
	searchService       *services.SearchService
	userService         *services.UserService
	slackService        *services.SlackService
	videoDemoService    *services.VideoDemoService
	socialMediaService  *services.SocialMediaService
}

func New(db *sql.DB, cfg *config.Config) *Handlers {
	return &Handlers{
		db:                  db,
		cfg:                 cfg,
		productService:      services.NewProductService(db),
		categoryService:     services.NewCategoryService(db),
		blogService:         services.NewBlogService(db),
		blogCategoryService:  services.NewBlogCategoryService(db),
		contactService:      services.NewContactService(db),
		authService:         services.NewAuthService(cfg.JWTSecret),
		searchService:       services.NewSearchService(db),
		userService:         services.NewUserService(db),
		slackService:        services.NewSlackService(cfg.SlackWebhookURL),
		videoDemoService:    services.NewVideoDemoService(db),
		socialMediaService:  services.NewSocialMediaService(db),
	}
}
