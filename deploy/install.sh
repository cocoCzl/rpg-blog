#!/usr/bin/env sh
set -eu

PACKAGE_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
INSTALL_DIR=/opt/rpg-blog

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

[ "$(id -u)" -eq 0 ] || fail "Run this script with sudo: sudo ./install.sh"
command -v docker >/dev/null 2>&1 || fail "Docker Engine is required."
docker compose version >/dev/null 2>&1 || fail "The Docker Compose plugin is required."

for file in images.tar compose.yaml Caddyfile .env manifest.json SHA256SUMS; do
  [ -f "$PACKAGE_DIR/$file" ] || fail "Deployment package is incomplete: missing $file"
done

target=$(sed -n 's/.*"platform": "\([^"]*\)".*/\1/p' "$PACKAGE_DIR/manifest.json")
case "$(uname -m)" in
  x86_64|amd64) actual=linux/amd64 ;;
  aarch64|arm64) actual=linux/arm64 ;;
  *) fail "Unsupported server architecture: $(uname -m)" ;;
esac
[ "$target" = "$actual" ] || fail "Package targets $target, but this server is $actual. Build the matching package."

cd "$PACKAGE_DIR"
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum -c SHA256SUMS
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 -c SHA256SUMS
else
  fail "sha256sum or shasum is required to verify the package."
fi

mkdir -p "$INSTALL_DIR"
cp compose.yaml Caddyfile .env manifest.json "$INSTALL_DIR/"
echo "Loading verified Docker images..."
docker load -i images.tar
echo "Starting rpg-blog..."
if ! docker compose --project-name rpg-blog --project-directory "$INSTALL_DIR" up -d --wait --wait-timeout 90 --remove-orphans; then
  docker compose --project-name rpg-blog --project-directory "$INSTALL_DIR" ps || true
  docker compose --project-name rpg-blog --project-directory "$INSTALL_DIR" logs --tail=80 || true
  fail "Deployment did not become healthy. Review the status and logs above."
fi
docker compose --project-name rpg-blog --project-directory "$INSTALL_DIR" ps
echo "Deployment complete. Caddy will obtain and renew HTTPS automatically."
