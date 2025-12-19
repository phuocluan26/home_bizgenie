package services

import (
	"database/sql"
	"fmt"

	"bizgenie-api/internal/models"
)

type ContactService struct {
	db *sql.DB
}

func NewContactService(db *sql.DB) *ContactService {
	return &ContactService{db: db}
}

func (s *ContactService) GetContacts(status string, limit, offset int) ([]models.Contact, error) {
	query := `SELECT id, name, email, phone, company, message, status, created_at FROM contacts WHERE 1=1`
	args := []interface{}{}
	argPos := 1

	if status != "" {
		query += " AND status = $1"
		args = append(args, status)
		argPos++
	}

	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argPos, argPos+1)
	args = append(args, limit, offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []models.Contact
	for rows.Next() {
		var c models.Contact
		err := rows.Scan(&c.ID, &c.Name, &c.Email, &c.Phone, &c.Company, &c.Message, &c.Status, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		contacts = append(contacts, c)
	}

	return contacts, nil
}

func (s *ContactService) GetContactByID(id int) (*models.Contact, error) {
	query := `SELECT id, name, email, phone, company, message, status, created_at FROM contacts WHERE id = $1`
	var c models.Contact
	err := s.db.QueryRow(query, id).Scan(&c.ID, &c.Name, &c.Email, &c.Phone, &c.Company, &c.Message, &c.Status, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (s *ContactService) CreateContact(c *models.Contact) error {
	query := `INSERT INTO contacts (name, email, phone, company, message, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`
	err := s.db.QueryRow(query, c.Name, c.Email, c.Phone, c.Company, c.Message, c.Status).Scan(&c.ID, &c.CreatedAt)
	return err
}

func (s *ContactService) UpdateContactStatus(id int, status string) error {
	query := `UPDATE contacts SET status = $2 WHERE id = $1`
	_, err := s.db.Exec(query, id, status)
	return err
}

func (s *ContactService) DeleteContact(id int) error {
	query := `DELETE FROM contacts WHERE id = $1`
	_, err := s.db.Exec(query, id)
	return err
}
