#!/bin/bash

# Backend Deployment Checklist Script
echo "🚀 Car Rental Backend Deployment Checklist"
echo "=========================================="

echo ""
echo "✅ Pre-deployment Checklist:"
echo "1. ✅ MongoDB Atlas connection string ready"
echo "2. ✅ Gmail SMTP credentials configured"
echo "3. ✅ Package.json has correct start script"
echo "4. ✅ Environment variables template ready"
echo ""

echo "📋 Quick Deployment Commands:"
echo ""
echo "1. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for production deployment'"
echo "   git push origin main"
echo ""

echo "2. Go to Render.com and:"
echo "   - Create new Web Service"
echo "   - Select your GitHub repository"
echo "   - Set Root Directory: backend"
echo "   - Set Build Command: npm install"
echo "   - Set Start Command: npm start"
echo ""

echo "3. Add Environment Variables (copy from .env.production):"
echo "   NODE_ENV=production"
echo "   MONGO_URI=mongodb+srv://..."
echo "   JWT_SECRET=your_secret"
echo "   EMAIL_USERNAME=royalcarsproject@gmail.com"
echo "   EMAIL_PASSWORD=bekn iryq dgdu ihpe"
echo ""

echo "4. After deployment, your API will be available at:"
echo "   https://your-service-name.onrender.com/api/v1"
echo ""

echo "5. Update frontend .env with new URL:"
echo "   REACT_APP_API_URL=https://your-service-name.onrender.com/api/v1"
echo ""

echo "🎉 Your backend will be live in 5-10 minutes!"
echo ""
echo "📊 Test your deployed API endpoints:"
echo "   - GET /api/v1/cars (get cars)"
echo "   - POST /api/v1/contact (contact form)"
echo "   - POST /api/v1/bookings (create booking)"
echo "   - POST /api/v1/auth/register (user registration)"
