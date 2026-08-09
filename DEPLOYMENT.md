# Docker Deployment Package

`rpg-blog` is deployed only through its Docker deployment package. Configure and write locally, generate one archive, then upload it to the server. The server does not need Git, Node.js, npm, or registry access.

## Requirements

- Local machine: Node.js `>=22` and Docker Desktop.
- Server: Ubuntu/Debian with Docker Engine and Docker Compose plugin.
- A domain resolving to the server public IP, with TCP ports `80` and `443` open.

The package includes the blog image and a pinned Caddy image. Caddy obtains and renews HTTPS certificates automatically. The server needs internet access only for ACME certificate validation.

## First deployment

1. Run `npm install` and `npm run setup` locally. Enter your final public URL, such as `https://blog.example.com`, for the site URL.
2. Preview with `npm run dev`, then create the deployment archive:

```bash
npm run package:deploy
```

3. Upload the generated `release/rpg-blog-*.tar.gz` archive using SFTP, a server panel, or another file-transfer tool. On the server:

```bash
tar -xzf rpg-blog-*.tar.gz
cd rpg-blog-*
sudo ./install.sh
```

## Publishing updates

Create a post locally with `npm run new:post`, edit the generated Markdown, preview it, then run `npm run package:deploy` again. Upload the new archive and run `sudo ./install.sh` again on the server. The script replaces the blog container while retaining Caddy certificate data.

This is a static blog: posts are compiled into the Docker image. It intentionally does not include an online editor, database, or web upload feature.

## Troubleshooting

- Certificate failure: verify that DNS points to the server and nothing else uses ports 80/443.
- Status: `sudo docker compose --project-name rpg-blog --project-directory /opt/rpg-blog ps`
- Logs: `sudo docker compose --project-name rpg-blog --project-directory /opt/rpg-blog logs -f`
