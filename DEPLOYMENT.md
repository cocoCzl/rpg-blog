# Offline Docker deployment

Configure and write locally, then upload one architecture-specific package. The server does not need Git, Node.js, npm, or container-registry access.

## Requirements

- Local: Node.js `>=22.12.0`, Docker Engine/Desktop, and Docker Buildx.
- Server: Ubuntu/Debian with Docker Engine and the Compose plugin.
- A domain resolving to the server, with TCP ports 80 and 443 open.

## Build the package

Enter the final URL, such as `https://blog.example.com`, during `npm run setup`. Then run:

```bash
npm run doctor -- --deploy --platform linux/amd64
npm run package:deploy -- --platform linux/amd64
```

Use `linux/arm64` for an ARM server. `amd64` is the default when `--platform` is omitted. The generated filename includes the architecture.

The package contains the blog and Caddy images, Compose and Caddy configuration, a platform manifest, SHA-256 checksum, and installer.

## Install or update

```bash
tar -xzf rpg-blog-*-amd64.tar.gz
cd rpg-blog-*-amd64
sudo ./install.sh
```

The installer rejects corrupt archives and CPU mismatches, loads the offline images, waits for the blog to become healthy, and preserves Caddy certificate volumes across updates.

To publish changes, rebuild the matching package locally, upload it, and run the new installer again.

## Troubleshooting

- Architecture: `uname -m` (`x86_64` means amd64; `aarch64` means arm64).
- DNS: ensure the domain resolves to the server public IP.
- Ports: nothing else may bind 80 or 443.
- Status: `sudo docker compose --project-name rpg-blog --project-directory /opt/rpg-blog ps`
- Logs: `sudo docker compose --project-name rpg-blog --project-directory /opt/rpg-blog logs -f`
