# Project rules

- Keep the downloadable résumé at the existing public CV URL while replacing its bytes for updates, because the local preview and download behavior depend on that stable public path.
- Serve certification issuer logos from the site's hosted asset origin with a local fallback icon, because local preview routes for CDN asset paths return HTML rather than images.
