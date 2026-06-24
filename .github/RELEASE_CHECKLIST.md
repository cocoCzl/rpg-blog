# Release Checklist

Use this before publishing a new template version.

- [ ] `npm install`
- [ ] `npm run check`
- [ ] `npm run test:integration`
- [ ] `npm run check:template` on a configured sample blog
- [ ] Verify setup profiles: `plain`, `comments`, `rpg`, and `manual`
- [ ] Review README, README.zh-CN, CUSTOMIZATION, DEPLOYMENT, and UPGRADING for changed behavior
- [ ] Confirm `.env.example` and `.env.production.example` list every required variable
- [ ] Confirm demo posts are useful as examples and not written like project-specific content
- [ ] Tag the release and include upgrade notes for long-lived forks
