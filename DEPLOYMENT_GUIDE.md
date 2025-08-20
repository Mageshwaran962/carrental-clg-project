# 🚀 Backend Deployment Guide - Render.com

## Step-by-Step Deployment Instructions

### **1. Prepare Your Repository**

First, make sure your backend code is in a GitHub repository:

```bash
# If not already a Git repository
git init
git add .
git commit -m "Initial commit - Ready for deployment"

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/car-rental-backend.git
git branch -M main
git push -u origin main
```

### **2. Sign Up for Render**

1. Go to [https://render.com](https://render.com)
2. Sign up using your GitHub account
3. This will give Render access to your repositories

### **3. Create New Web Service**

1. **Click "New +" → "Web Service"**
2. **Connect Repository**: Select your car-rental project repository
3. **Configure Service**:
   - **Name**: `car-rental-backend` (or your preferred name)
   - **Region**: Choose closest to your location
   - **Branch**: `main`
   - **Root Directory**: `backend` (important!)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### **4. Set Environment Variables**

In Render dashboard, go to **Environment** tab and add these variables:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://mageshwaran962:0GALNJ60HG65wEWf@cluster0.f3nrbzy.mongodb.net/car-rental-db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
EMAIL_SERVICE=gmail
EMAIL_USERNAME=royalcarsproject@gmail.com
EMAIL_PASSWORD=bekn iryq dgdu ihpe
EMAIL_FROM=royalcarsproject@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FROM_NAME=Car Rental Service
```

### **5. Deploy**

1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Your backend will be available at**: `https://your-service-name.onrender.com`

### **6. Test Your Deployed API**

Once deployed, test these endpoints:

```bash
# Test cars endpoint
curl https://your-service-name.onrender.com/api/v1/cars

# Test contact endpoint (POST)
curl -X POST https://your-service-name.onrender.com/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","subject":"Test","message":"Hello"}'
```

## 🌐 **Your New Backend URLs**

After deployment, your backend will be available at:

- **Base URL**: `https://your-service-name.onrender.com`
- **API Base**: `https://your-service-name.onrender.com/api/v1`

### **Example Endpoints:**

- `https://your-service-name.onrender.com/api/v1/cars`
- `https://your-service-name.onrender.com/api/v1/bookings`
- `https://your-service-name.onrender.com/api/v1/contact`
- `https://your-service-name.onrender.com/api/v1/auth/register`
- `https://your-service-name.onrender.com/api/v1/auth/login`

## 🔄 **Update Frontend Configuration**

After deployment, update your frontend `.env` file:

```env
# Replace with your actual Render URL
REACT_APP_API_URL=https://your-service-name.onrender.com/api/v1
```

## ⚡ **Free Tier Limitations**

- **750 hours/month** (enough for development)
- **Sleeps after 15 minutes** of inactivity
- **500MB RAM**
- **First request might be slow** (cold start)

## 🚀 **Alternative Free Hosting Options**

### **Railway.app**

- Similar to Render
- Good performance
- Easy GitHub integration

### **Cyclic.sh**

- Unlimited hours on free tier
- Serverless deployment
- Good for APIs

### **Vercel** (for serverless functions)

- Convert Express routes to serverless functions
- Excellent performance
- Automatic scaling

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Build Fails**: Check that `package.json` has correct start script
2. **Environment Variables**: Ensure all required vars are set
3. **Database Connection**: Verify MongoDB Atlas connection string
4. **Port Issues**: Make sure your app uses `process.env.PORT`

### **Logs Access:**

- Go to your Render dashboard
- Click on your service
- Click "Logs" tab to see real-time logs

## 📱 **Next Steps After Deployment**

1. **Test all endpoints** with your new URL
2. **Update frontend** to use new backend URL
3. **Test booking flow** end-to-end
4. **Test email functionality**
5. **Set up monitoring** (optional)

Your backend is now live and ready for production use! 🎉
