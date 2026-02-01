#!/bin/bash

# Sync script to copy template files from nexus-playground to ../nexus
# This maintains the Nexus template structure in a separate folder

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="$(cd "$SOURCE_DIR/.." && pwd)/nexus"

echo -e "${BLUE}🔄 Syncing Nexus template files...${NC}"
echo "Source: $SOURCE_DIR"
echo "Destination: $DEST_DIR"
echo ""

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Function to sync a file or directory
sync_item() {
    local item=$1
    local source="$SOURCE_DIR/$item"
    local dest="$DEST_DIR/$item"
    
    if [ -e "$source" ]; then
        echo -e "${GREEN}✓${NC} Syncing: $item"
        
        # Create parent directory if needed
        mkdir -p "$(dirname "$dest")"
        
        # Use rsync for efficient syncing
        if [ -d "$source" ]; then
            rsync -a --delete "$source/" "$dest/"
        else
            rsync -a "$source" "$dest"
        fi
    else
        echo "⚠️  Skipping (not found): $item"
    fi
}

# Sync .github items
sync_item ".github/agents"
sync_item ".github/prompts"
sync_item ".github/skills"
sync_item ".github/copilot-instructions.md"

# Sync .nexus items
sync_item ".nexus/docs"
sync_item ".nexus/memory"
sync_item ".nexus/templates"

# Sync root files
sync_item "AGENTS.md"

# Sync .vscode items
sync_item ".vscode/mcp.json"

echo ""
echo -e "${GREEN}✅ Sync complete!${NC}"
echo "Files synced to: $DEST_DIR"
