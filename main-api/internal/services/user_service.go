package services

import (
	"database/sql"

	"bizgenie-api/internal/logger"
	"bizgenie-api/internal/models"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) GetUserByUsername(username string) (*models.User, error) {
	logger.Debug("Querying user by username: %s", username)
	// Use LOWER() for case-insensitive username lookup
	query := `SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE LOWER(username) = LOWER($1)`
	var u models.User
	err := s.db.QueryRow(query, username).Scan(&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.Debug("User not found in database: %s (case-insensitive)", username)
		} else {
			logger.ErrorWithErr("Database error when querying user by username", err)
		}
		return nil, err
	}
	logger.Debug("User found: ID=%d, username=%s (queried as: %s)", u.ID, u.Username, username)
	return &u, nil
}

func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	query := `SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1`
	var u models.User
	err := s.db.QueryRow(query, email).Scan(&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *UserService) GetUsers(limit, offset int) ([]models.User, error) {
	query := `SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`
	rows, err := s.db.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		err := rows.Scan(&u.ID, &u.Username, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}

	return users, nil
}

func (s *UserService) GetUserByID(id int) (*models.User, error) {
	query := `SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1`
	var u models.User
	err := s.db.QueryRow(query, id).Scan(&u.ID, &u.Username, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *UserService) CreateUser(u *models.User, passwordHash string) error {
	query := `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at`
	err := s.db.QueryRow(query, u.Username, u.Email, passwordHash, u.Role).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
	return err
}

func (s *UserService) UpdateUser(id int, u *models.User) error {
	query := `UPDATE users SET username = $2, email = $3, role = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING updated_at`
	err := s.db.QueryRow(query, id, u.Username, u.Email, u.Role).Scan(&u.UpdatedAt)
	return err
}

func (s *UserService) DeleteUser(id int) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := s.db.Exec(query, id)
	return err
}
