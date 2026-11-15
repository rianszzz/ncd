package storage

import (
	"os"
	"path/filepath"
	"testing"
)

type sampleData struct {
	ID    string `json:"id"`
	Count int    `json:"count"`
}

func TestStorageSaveAndLoad(t *testing.T) {
	tempDir := t.TempDir()
	origEnv := os.Getenv("NCD_DATA_DIR")
	_ = os.Setenv("NCD_DATA_DIR", tempDir)
	defer func() {
		_ = os.Setenv("NCD_DATA_DIR", origEnv)
	}()

	filename := "test_sample.json"
	item := sampleData{ID: "sample-1", Count: 42}

	if err := SaveJSON(filename, item); err != nil {
		t.Fatalf("SaveJSON failed: %v", err)
	}

	expectedPath := filepath.Join(tempDir, filename)
	if _, err := os.Stat(expectedPath); err != nil {
		t.Fatalf("file not found at %s: %v", expectedPath, err)
	}

	var loaded sampleData
	if err := LoadJSON(filename, &loaded); err != nil {
		t.Fatalf("LoadJSON failed: %v", err)
	}

	if loaded.ID != item.ID || loaded.Count != item.Count {
		t.Fatalf("mismatched loaded data: expected %+v, got %+v", item, loaded)
	}
}
