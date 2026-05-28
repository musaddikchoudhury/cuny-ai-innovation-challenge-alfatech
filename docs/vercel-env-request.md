# Request: Set NEXT_PUBLIC_API_URL in Vercel and redeploy

Hi maintainers — I pushed a feature branch with changes that require the frontend to be built with the correct backend URL. Please add the environment variable in Vercel and redeploy the preview/site.

Repo / branch
- Repository: https://github.com/musaddikchoudhury/cuny-ai-innovation-challenge-alfatech
- Branch: `feat/hardening-ci-e2e-persistence`
- PR preview: https://github.com/musaddikchoudhury/cuny-ai-innovation-challenge-alfatech/pull/new/feat/hardening-ci-e2e-persistence

Environment variable to add (Vercel → Settings → Environment Variables)
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://<your-backend-domain>` (example: `https://api.example.com`)
- Environments: select **Production** and **Preview** (Development optional)

Notes
- The Next.js client reads `NEXT_PUBLIC_API_URL` at build time; the frontend will call this URL for API endpoints such as `/health`, `/match/ledger`, and `/tailor-resume`.
- After adding the variable, trigger a redeploy (Vercel → Deployments → Redeploy) so the build includes the correct URL.

Verification steps (after redeploy)
1. Open the deployed frontend preview or production URL.
2. In browser DevTools Network tab, confirm XHR/fetch requests go to `https://<your-backend-domain>`.
3. Run:

```bash
curl https://<your-backend-domain>/health
```

Expected response: JSON like

```json
{"status":"online","resources_loaded":18}
```

If you'd rather invite `@dhimyjean` or me to Vercel, I can deploy and verify directly. Thanks!
