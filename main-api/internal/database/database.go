package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"bizgenie-api/internal/logger"

	_ "github.com/lib/pq"
)

func Connect(databaseURL string) (*sql.DB, error) {
	logger.Debug("Connecting to database...")
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		logger.ErrorWithErr("Failed to open database connection", err)
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		logger.ErrorWithErr("Failed to ping database", err)
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Debug("Database connection established successfully")
	return db, nil
}

func RunMigrations(db *sql.DB) error {
	// First, ensure migrations table exists
	if err := ensureMigrationsTable(db); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	migrationFiles := []string{
		"001_init_schema.sql",
		"002_add_pgvector.sql",
		"003_add_blog_categories.sql",
		"004_add_video_demos.sql",
		"005_add_social_media_links.sql",
	}

	// Get migration directory path
	migrationDir := os.Getenv("MIGRATION_DIR")
	if migrationDir == "" {
		// Default to relative path
		migrationDir = "../../database/migrations"
	}

	logger.Info("Starting database migrations from directory: %s", migrationDir)

	for _, filename := range migrationFiles {

		// Check if migration has already been applied
		version := strings.TrimSuffix(filename, ".sql")
		applied, err := isMigrationApplied(db, version)
		if err != nil {
			logger.ErrorWithErr("Failed to check migration status", err)
			return fmt.Errorf("failed to check migration status for %s: %w", filename, err)
		}

		if applied {
			logger.Info("Migration already applied: %s", filename)
			continue
		}

		filepath := filepath.Join(migrationDir, filename)
		sqlContent, err := os.ReadFile(filepath)
		if err != nil {
			logger.ErrorWithErr("Failed to read migration file", err)
			return fmt.Errorf("failed to read migration file %s: %w", filename, err)
		}

		logger.Info("Running migration: %s", filename)

		// Execute migration in a transaction
		tx, err := db.Begin()
		if err != nil {
			logger.ErrorWithErr("Failed to begin transaction", err)
			return fmt.Errorf("failed to begin transaction for %s: %w", filename, err)
		}

		// Execute migration SQL
		_, err = tx.Exec(string(sqlContent))
		if err != nil {
			tx.Rollback()
			// Check if error is about object already existing (for backward compatibility)
			errStr := err.Error()
			if contains(errStr, "already exists") || contains(errStr, "duplicate key") {
				logger.Warn("Migration %s has objects that already exist, marking as applied", filename)
				// Mark as applied even if objects exist
				if markErr := markMigrationApplied(db, version); markErr != nil {
					logger.ErrorWithErr("Failed to mark migration as applied", markErr)
					return fmt.Errorf("failed to mark migration as applied: %w", markErr)
				}
				logger.Info("Migration %s marked as applied (objects already exist)", filename)
				continue
			}
			logger.ErrorWithErr("Failed to execute migration", err)
			return fmt.Errorf("failed to run migration %s: %w", filename, err)
		}

		// Mark migration as applied
		if err := markMigrationAppliedTx(tx, version); err != nil {
			tx.Rollback()
			logger.ErrorWithErr("Failed to mark migration as applied", err)
			return fmt.Errorf("failed to mark migration as applied: %w", err)
		}

		// Commit transaction
		if err := tx.Commit(); err != nil {
			logger.ErrorWithErr("Failed to commit migration transaction", err)
			return fmt.Errorf("failed to commit migration transaction: %w", err)
		}

		logger.Info("Migration completed successfully: %s", filename)
	}

	return nil
}

// ensureMigrationsTable creates the migrations tracking table if it doesn't exist
func ensureMigrationsTable(db *sql.DB) error {
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
	`
	_, err := db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}
	return nil
}

// isMigrationApplied checks if a migration has already been applied
func isMigrationApplied(db *sql.DB, version string) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM schema_migrations WHERE version = $1`
	err := db.QueryRow(query, version).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// markMigrationApplied marks a migration as applied
func markMigrationApplied(db *sql.DB, version string) error {
	query := `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING`
	_, err := db.Exec(query, version)
	return err
}

// markMigrationAppliedTx marks a migration as applied within a transaction
func markMigrationAppliedTx(tx *sql.Tx, version string) error {
	query := `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING`
	_, err := tx.Exec(query, version)
	return err
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && 
		(s == substr || 
		 strings.Contains(s, substr))
}

// CreateDefaultAdmin creates the default admin user if it doesn't exist
// If forceUpdate is true, it will update the password even if user exists
func CreateDefaultAdmin(db *sql.DB, hashPassword func(string) (string, error), forceUpdate bool) error {
	username := "admin"
	email := "admin@bizgenie.vn"
	password := "Quy@12355"
	role := "admin"

	// Check if admin user already exists
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`
	err := db.QueryRow(checkQuery, username).Scan(&exists)
	if err != nil {
		logger.ErrorWithErr("Failed to check admin user existence", err)
		return fmt.Errorf("failed to check admin user: %w", err)
	}

	// Hash password
	passwordHash, err := hashPassword(password)
	if err != nil {
		logger.ErrorWithErr("Failed to hash admin password", err)
		return fmt.Errorf("failed to hash admin password: %w", err)
	}

	if exists {
		if forceUpdate {
			// Update password for existing admin user
			logger.Info("Admin user '%s' exists, updating password...", username)
			updateQuery := `UPDATE users SET password_hash = $1, email = $2, role = $3 WHERE username = $4`
			_, err = db.Exec(updateQuery, passwordHash, email, role, username)
			if err != nil {
				logger.ErrorWithErr("Failed to update admin user", err)
				return fmt.Errorf("failed to update admin user: %w", err)
			}
			logger.Info("Admin user '%s' password updated successfully", username)
		} else {
			// Admin user already exists, skip creation
			logger.Debug("Admin user '%s' already exists, skipping creation", username)
		}
		return nil
	}

	logger.Info("Creating admin user '%s'...", username)

	// Create admin user
	insertQuery := `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)`
	_, err = db.Exec(insertQuery, username, email, passwordHash, role)
	if err != nil {
		logger.ErrorWithErr("Failed to create admin user", err)
		return fmt.Errorf("failed to create admin user: %w", err)
	}

	logger.Info("Admin user '%s' created successfully", username)
	return nil
}
