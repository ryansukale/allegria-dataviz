# Releases

The repository uses two long-lived branches:

- `develop` is for alpha development and publishes with the npm `next` tag.
- `main` is the production branch for stable releases and publishes with the npm `latest` tag.

Release work starts from `develop` on a short-lived branch. After documentation, tests, and build checks pass, merge it into `develop`. Stable release preparation is then merged into `main`.

Before a stable release, run:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm test
pnpm pack --dry-run
```

The release command must be run from `main` and with an explicit version, for example `pnpm release:prod 1.0.0`. It creates the matching Git tag and publishes the package to npm.
