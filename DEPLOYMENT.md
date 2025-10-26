# Botswana Courier Platform - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- PostgreSQL 14+ database
- Twilio account (for SMS)
- Google Maps API key
- Domain name (optional but recommended)

## Environment Setup

### 1. Backend Deployment

#### Option A: Deploy to Railway

1. Create account at [Railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Deploy backend:
   ```bash
   cd backend
   railway up
   ```
5. Set environment variables in Railway dashboard:
   - `DATABASE_URL` (automatically set by Railway)
   - `JWT_SECRET`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `GOOGLE_MAPS_API_KEY`
   - `NODE_ENV=production`

#### Option B: Deploy to Render

1. Create account at [Render.com](https://render.com)
2. Create PostgreSQL database
3. Create new Web Service
4. Connect your Git repository
5. Set build command: `cd backend && npm install && npm run build`
6. Set start command: `cd backend && npm start`
7. Add environment variables (same as Railway)

### 2. Database Migration

After deploying backend:

```bash
# SSH into your server or use platform CLI
cd backend
npx prisma migrate deploy
npx prisma generate

# Create initial admin user (optional)
npx prisma studio
```

### 3. Web Dashboard Deployment

#### Deploy to Vercel

1. Create account at [Vercel.com](https://vercel.com)
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Deploy:
   ```bash
   cd web
   vercel
   ```
4. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` (your backend URL)
   - `NEXT_PUBLIC_SOCKET_URL` (your backend URL)
   - `NEXT_PUBLIC_GOOGLE_MAPS_KEY`

### 4. Mobile Apps Deployment

#### iOS Deployment

1. Install Xcode and Xcode Command Line Tools
2. Set up Apple Developer account
3. Configure app signing:
   ```bash
   cd mobile-driver  # or mobile-customer
   expo build:ios
   ```
4. Follow Expo prompts for credentials
5. Submit to App Store via Expo or manually

#### Android Deployment

1. Install Android Studio and SDK
2. Generate keystore:
   ```bash
   keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
3. Build APK:
   ```bash
   cd mobile-driver  # or mobile-customer
   expo build:android
   ```
4. Submit to Google Play Store

## Production Checklist

### Security
- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Set up CORS properly
- [ ] Use environment variables for all secrets

### Performance
- [ ] Enable compression
- [ ] Set up CDN for static assets
- [ ] Configure database connection pooling
- [ ] Set up Redis for caching (optional)
- [ ] Enable Gzip compression

### Monitoring
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure logging (Winston, Logtail)
- [ ] Set up uptime monitoring
- [ ] Configure database backups
- [ ] Set up performance monitoring

### SMS Configuration

For Botswana, Twilio supports SMS delivery. Configure in backend/.env:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890  # Get from Twilio
```

**Note:** Test SMS delivery to Botswana numbers (+267) before going live.

### Database Backup

Set up automated backups:

```bash
# PostgreSQL backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Set up cron job (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh
```

### DNS Configuration

Point your domain to deployments:
- `api.yourdomain.com` → Backend server
- `app.yourdomain.com` → Web dashboard
- `www.yourdomain.com` → Landing page

### SSL Certificates

Most hosting platforms (Vercel, Railway, Render) provide automatic SSL.

For custom servers, use Let's Encrypt:
```bash
sudo apt-get install certbot
sudo certbot --nginx -d yourdomain.com
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Use Redis for session storage
- Use database read replicas

### Vertical Scaling
- Upgrade server resources
- Optimize database queries
- Implement caching strategy
- Use database indexing

## Monitoring & Maintenance

### Health Checks
Monitor these endpoints:
- `GET /health` - Backend health
- Database connectivity
- SMS service status
- Socket.io connections

### Log Monitoring
Check logs regularly:
```bash
# Backend logs
tail -f backend/logs/combined.log

# Error logs
tail -f backend/logs/error.log
```

### Performance Metrics
Monitor:
- API response times
- Database query performance
- SMS delivery rate
- Active Socket.io connections
- Mobile app crash reports

## Troubleshooting

### Backend not starting
- Check DATABASE_URL is correct
- Verify all environment variables are set
- Check port is not already in use
- Review error logs

### SMS not sending
- Verify Twilio credentials
- Check phone number format (+267XXXXXXXX)
- Verify Twilio account has credits
- Check SMS logs in Twilio dashboard

### Mobile app not connecting
- Verify API_URL is correct (use your deployed URL, not localhost)
- Check CORS settings in backend
- Verify SSL certificate is valid
- Test with Postman/curl first

## Support

For deployment issues:
1. Check application logs
2. Review environment variables
3. Test with curl/Postman
4. Check database connectivity
5. Verify external service credentials

## Cost Estimates

**Monthly costs** (approximate):
- Backend hosting (Railway/Render): $5-20
- Database (PostgreSQL): $0-15
- Web hosting (Vercel): $0 (free tier)
- Twilio SMS: ~$0.01 per message
- Google Maps API: $0-200 (depends on usage)
- Domain: $10-20/year
- SSL Certificate: Free (Let's Encrypt)

**Total**: ~$15-50/month + SMS costs

## Next Steps

1. Deploy backend to Railway/Render
2. Deploy web dashboard to Vercel
3. Test all features in production
4. Build and submit mobile apps
5. Set up monitoring and alerts
6. Configure backups
7. Launch! 🚀
