package storage

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// ResolveDataPath resolves the relative or absolute filesystem path for a data file.
// It honors NCD_DATA_DIR environment variable or searches standard repository locations.
func ResolveDataPath(filename string) string {
	if custom := os.Getenv("NCD_DATA_DIR"); custom != "" {
		return filepath.Join(custom, filename)
	}

	candidates := []string{
		filepath.Join(".", "backend", "data", filename),
		filepath.Join(".", "data", filename),
		filepath.Join("..", "data", filename),
		filepath.Join("..", "..", "data", filename),
		filepath.Join("backend", "data", filename),
	}

	for _, p := range candidates {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}

	return filepath.Join("backend", "data", filename)
}

// LoadJSON reads and decodes a JSON file into the specified target pointer.
func LoadJSON[T any](filename string, target *T) error {
	path := ResolveDataPath(filename)
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read file %s: %w", path, err)
	}
	if err := json.Unmarshal(data, target); err != nil {
		return fmt.Errorf("unmarshal %s: %w", path, err)
	}
	return nil
}

// SaveJSON encodes data with indentation and atomically writes it to disk.
func SaveJSON[T any](filename string, data T) error {
	path := ResolveDataPath(filename)
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("mkdir %s: %w", dir, err)
	}
	raw, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal %s: %w", path, err)
	}
	if err := os.WriteFile(path, raw, 0644); err != nil {
		return fmt.Errorf("write file %s: %w", path, err)
	}
	return nil
}
