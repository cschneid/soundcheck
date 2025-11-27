# 022: Deployment Setup

## Summary
Configure deployment to Vercel (or similar) for public access.

## Acceptance Criteria
- [ ] Production build works correctly
- [ ] Environment variables configured
- [ ] Spotify redirect URI updated for production
- [ ] HTTPS enabled (required for SDK)
- [ ] Deployed and accessible

## Technical Details

### Build Verification
```bash
npm run build
npm run preview  # Test production build locally
```

### Vercel Setup
1. Connect GitHub repo to Vercel
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### Environment Variables (Vercel)
```
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_REDIRECT_URI=https://your-app.vercel.app/callback
```

### Spotify Dashboard Updates
Add production redirect URI:
- `https://your-app.vercel.app/callback`

### Domain (Optional)
- Can use Vercel's free subdomain initially
- Custom domain can be added later

### Build Optimizations
- Vite handles minification
- Consider code splitting if bundle is large
- Check bundle size with `npm run build -- --report`

### Headers (vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

## Testing
**Pre-deployment:**
1. Build locally: `npm run build`
2. Test with preview: `npm run preview`
3. All features work in production build

**Post-deployment:**
1. Access production URL
2. OAuth flow works with production redirect
3. Playback works over HTTPS
4. No console errors

## Dependencies
- 019_main-app-flow
- 021_error-handling

## Estimated Complexity
Small
