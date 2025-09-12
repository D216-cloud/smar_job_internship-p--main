# Render Deployment Instructions

## 🚀 Deploy Frontend to Render

### 1. **Create New Static Site**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Static Site"
3. Connect your GitHub repository

### 2. **Build Settings**
```bash
# Build Command:
npm install && npm run build

# Publish Directory:
dist

# Environment Variables:
VITE_API_URL=https://your-backend-domain.com
VITE_EMAILJS_PUBLIC_KEY=7UYxI2LzDsWb243Sz
VITE_EMAILJS_SERVICE_ID=service_ln5yal9
VITE_EMAILJS_TEMPLATE_ID=template_x7aa6da
```

### 3. **Add Custom Headers (in Render Dashboard)**
Go to Settings → Headers and add:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
```

### 4. **Enable History API Fallback**
In Render Settings → Redirects/Rewrites, add:
```
Source: /*
Destination: /index.html
Status: 200 (Rewrite)
```

## 🔧 Deploy Backend to Render

### 1. **Create New Web Service**
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Set root directory to `backend` (if separate repo)

### 2. **Build Settings**
```bash
# Build Command:
npm install

# Start Command:
npm start

# Environment Variables:
MONGO_URI=mongodb+srv://...
PORT=10000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ALLOWED_ORIGINS=https://your-frontend-domain.onrender.com
NODE_ENV=production
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Job not found" error**
   - Check if `VITE_API_URL` is set correctly
   - Verify backend is accessible
   - Check browser network tab for 404s

2. **CORS errors**
   - Update `ALLOWED_ORIGINS` in backend
   - Ensure frontend URL is correct

3. **404 on page refresh**
   - Verify `_redirects` file is in `public/` folder
   - Check Render routing settings

4. **Build failures**
   - Check build logs in Render dashboard
   - Verify all environment variables are set

### Test Your Deployment:
1. ✅ Homepage loads: `https://your-site.onrender.com/`
2. ✅ Login works: `https://your-site.onrender.com/login`
3. ✅ Job application: `https://your-site.onrender.com/user/apply/[jobId]`
4. ✅ API calls work (check Network tab)

## 📝 Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and responding
- [ ] Environment variables configured
- [ ] CORS properly set up
- [ ] All routes working (no 404s)
- [ ] Database connected
- [ ] File uploads working
- [ ] Email notifications working

## 🌐 Production URLs
Update these in your environment:
- Frontend: `https://careersnap-rum4.onrender.com`
- Backend: `https://your-backend-name.onrender.com`