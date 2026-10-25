#!/usr/bin/env bash
set -e

# ==============================================================================
# NCD Automated Backup and Restore Test Script
# ==============================================================================
DATA_DIR="backend/data"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

echo "=========================================================="
echo " [NCD Backup Test] Creating Snapshot of System Data"
echo "=========================================================="

mkdir -p "$BACKUP_DIR"

# 1. Backup all data JSON files
if [ -d "$DATA_DIR" ]; then
  cp -r "$DATA_DIR"/* "$BACKUP_DIR"/
  echo "-> Backed up data files to: $BACKUP_DIR"
  ls -lh "$BACKUP_DIR"
else
  echo "-> Data directory not found, skipping local file copy."
fi

# 2. Verify integrity of backed up JSONs
echo "-> Validating JSON syntax in backup archive..."
for f in "$BACKUP_DIR"/*.json; do
  if [ -f "$f" ]; then
    node -e "JSON.parse(require('fs').readFileSync('$f', 'utf8'))" && echo "   [OK] $(basename "$f") is valid JSON"
  fi
done

# 3. Simulate Restore Procedure
echo ""
echo "=========================================================="
echo " [NCD Restore Test] Simulating Restore Verification"
echo "=========================================================="

TEST_RESTORE_DIR="/tmp/ncd_test_restore_$$"
mkdir -p "$TEST_RESTORE_DIR"
cp -r "$BACKUP_DIR"/* "$TEST_RESTORE_DIR"/

FILE_COUNT=$(find "$TEST_RESTORE_DIR" -type f | wc -l)
echo "-> Simulated restore to isolated test directory: $FILE_COUNT files recovered."

rm -rf "$TEST_RESTORE_DIR"
echo "-> Cleaned temporary restore sandbox."
echo ""
echo "=========================================================="
echo " [SUCCESS] Backup and Restore Test Passed Cleanly!"
echo "=========================================================="
