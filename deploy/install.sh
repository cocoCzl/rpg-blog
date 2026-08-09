#!/usr/bin/env sh
set -eu

PACKAGE_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
INSTALL_DIR=/opt/rpg-blog

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run this script with sudo: sudo ./install.sh"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Engine and the Docker Compose plugin first."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is required."
  exit 1
fi

for file in images.tar compose.yaml Caddyfile .env; do
  if [ ! -f "$PACKAGE_DIR/$file" ]; then
    echo "Deployment package is incomplete: missing $file"
    exit 1
  fi
done

mkdir -p "$INSTALL_DIR"
cp "$PACKAGE_DIR/compose.yaml" "$PACKAGE_DIR/Caddyfile" "$PACKAGE_DIR/.env" "$INSTALL_DIR/"

echo "Loading local Docker images..."
docker load -i "$PACKAGE_DIR/images.tar"

echo "Starting rpg-blog..."
docker compose --project-name rpg-blog --project-directory "$INSTALL_DIR" up -d --remove-orphans
docker compose --project-name rpg-blog --project-directory "$INSTALL_DIR" ps

echo "Deployment complete. Caddy will obtain and renew the HTTPS certificate automatically."
