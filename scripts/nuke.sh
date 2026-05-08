#!/bin/bash

# ==============================================================================
# VERBOSE INTERACTIVE NUKE SCRIPT
# ==============================================================================

# Setup paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Safety Checks
if [ -z "$ROOT_DIR" ] || [ "$ROOT_DIR" = "/" ]; then
    echo "❌ Error: Invalid project root detected. Aborting."
    exit 1
fi

echo "🛡️  Nuke Script initialized for: $ROOT_DIR"
echo "----------------------------------------------------------------"

# Helper function for y/n prompts
confirm() {
    printf "❓ %s (y/n): " "$1"
    read -r answer
    case "$answer" in
        [yY][eE][sS]|[yY]) return 0 ;;
        *) return 1 ;;
    esac
}

# Helper function to list and delete
list_and_delete() {
    local label="$1"
    local pattern="$2"
    local search_path="$3"
    local is_path="$4" # If true, use -path instead of -name

    echo "🔍 Searching for $label..."
    
    if [ "$is_path" = "true" ]; then
        TARGETS=$(find "$ROOT_DIR" -path "$pattern" -type d -prune)
    else
        TARGETS=$(find "$ROOT_DIR" -name "$pattern" -type d -prune)
    fi

    if [ -z "$TARGETS" ]; then
        echo "✅ No $label found."
        echo "----------------------------------------------------------------"
        return
    fi

    echo "⚠️  The following folders will be deleted:"
    echo "$TARGETS" | sed 's/^/   - /'
    
    if confirm "Delete these $label folders?"; then
        echo "🗑️  Deleting..."
        echo "$TARGETS" | xargs rm -rfv
        echo "✅ $label cleaned."
    else
        echo "⏭️  Skipped $label."
    fi
    echo "----------------------------------------------------------------"
}

# ------------------------------------------------------------------------------
# INTERACTIVE CLEANING
# ------------------------------------------------------------------------------

# 1. Node Modules
list_and_delete "node_modules" "node_modules"

# 2. Astro/Turbo/Svelte Artifacts
list_and_delete "Astro Cache (.astro)" ".astro"
list_and_delete "Build Output (dist)" "dist"
list_and_delete "Turbo Cache (.turbo)" ".turbo"
list_and_delete "Svelte Cache (.svelte-kit)" ".svelte-kit"

# 3. OG Images
list_and_delete "OG Image Cache (public/.../og)" "*/public/*/og" "" "true"

# 4. Auto-generated Widgets (src/generated)
list_and_delete "Generated Widget Map (src/generated)" "*/src/generated" "" "true"

# 5. Lockfile (Special Case)
if [ -f "$ROOT_DIR/pnpm-lock.yaml" ]; then
    echo "🔍 Found pnpm-lock.yaml"
    if confirm "Delete pnpm-lock.yaml?"; then
        rm -fv "$ROOT_DIR/pnpm-lock.yaml"
        echo "✅ Lockfile removed."
    else
        echo "⏭️  Skipped lockfile."
    fi
    echo "----------------------------------------------------------------"
fi

echo "✨ Cleaning complete."
