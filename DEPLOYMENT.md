# Deployment Guide

## Frontend Deployment

### Environment Variables
Create a `.env.production` file or set these variables in your hosting platform:

```bash
# Production API URL (replace with your backend URL)
VITE_API_URL=https://your-backend-domain.com

# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

### Build Commands
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build (optional)
npm run preview
```

### Platform-Specific Deployment

#### Vercel
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

#### Netlify
1. Drag `dist` folder to Netlify or connect GitHub
2. Set environment variables in site settings
3. The `_redirects` file is already configured for SPA routing

#### Self-hosted (Apache/Nginx)
For Apache, create `.htaccess` in your build directory:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

For Nginx:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Backend Deployment

### Environment Variables
```bash
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS - Add your production frontend URL
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Production
NODE_ENV=production
```

### Common Deployment Platforms

#### Heroku
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set ALLOWED_ORIGINS=https://your-frontend.com
git push heroku main
```

#### Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

#### DigitalOcean App Platform
1. Create app from GitHub
2. Set environment variables
3. Configure build and run commands

## Troubleshooting

### Common Issues

1. **404 on page refresh**
   - Ensure `_redirects` file exists in `public/` folder
   - Check your hosting platform's SPA configuration

2. **CORS errors**
   - Update `ALLOWED_ORIGINS` in backend environment
   - Check `VITE_API_URL` in frontend environment

3. **API calls failing**
   - Verify `VITE_API_URL` is set correctly
   - Check network tab for actual URLs being called

4. **Build failures**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check for TypeScript errors: `npm run type-check`

### Health Check URLs
- Frontend: `https://your-frontend.com/`
- Backend: `https://your-backend.com/api/health` (if implemented)

## Performance Optimization

1. **Code Splitting**: Already configured in `vite.config.ts`
2. **Image Optimization**: Use WebP format for images
3. **CDN**: Enable on your hosting platform
4. **Gzip**: Enable compression on your server