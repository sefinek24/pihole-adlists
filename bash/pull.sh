#!/bin/bash

# Function: get UTC date or datetime
utc_now() {
  if [[ "$1" == "date" ]]; then
    date -u +"%Y-%m-%d"
  else
    date -u +"%Y-%m-%d %H:%M:%S"
  fi
}

# Paths
repo_path="/home/sefinek/node/blocklist" # Path to the repository
logs_dir="$repo_path/www/public/logs" # Directory to store logs
log_file="$logs_dir/pull_$(utc_now date).log" # Path to the log file

# Check if Git is installed
if ! command -v git &>/dev/null; then
  echo "❌ Git is not installed! Please install Git."
  exit 1
fi

# Prepare the environment
mkdir -p "$logs_dir"

# Run git pull and install dependencies
{
    echo "========================================== $(utc_now) UTC =========================================="
    echo

    if cd "$repo_path"; then
        if git pull; then
            npm install --omit=dev
            echo -e "\n✔️ Success! Finished at: $(utc_now) UTC"
        else
            echo -e "\n❌ Error during Git operations!"
        fi
        echo
    else
        echo "❌ Repository path not found: $repo_path"
    fi
} >>"$log_file"
