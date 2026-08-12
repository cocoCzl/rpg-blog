# Release Checklist

Use this before publishing a new template version.

- [ ] Fresh clone followed by `npm ci`
- [ ] `npm run check`
- [ ] `npm run test:visual`
- [ ] `npm run check:template` on a configured sample blog
- [ ] Verify setup modes: `keep`, `starter`, and `clear`
- [ ] Review README, README.zh-CN, CUSTOMIZATION, DEPLOYMENT, and UPGRADING for changed behavior
- [ ] Verify amd64 and arm64 Docker builds and package metadata
- [ ] Confirm `.env.example` lists every required variable
- [ ] Confirm demo posts are useful as examples and not written like project-specific content
- [ ] Tag the release and include upgrade notes for long-lived forks
- [ ] Apply the repository settings in `GITHUB_RELEASE.md`
