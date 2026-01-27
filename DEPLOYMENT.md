# ParikshaX Deployment Guide

## 🚀 Production Deployment Options

This guide covers deploying ParikshaX to production environments.

## Option 1: Vercel (Frontend) + Heroku (Backend) + MongoDB Atlas

### Step 1: MongoDB Atlas Setup

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Shared" (Free tier)
   - Select region closest to your users
   - Click "Create Cluster"

3. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

4. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password
   - Set role to "Read and write to any database"
   - Click "Add User"

5. **Get Connection String**
   - Go to "Databases"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Step 2: Backend Deployment (Heroku)

1. **Install Heroku CLI**
```bash
# Windows
choco install heroku-cli

# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Prepare Backend**
```bash
cd server

# Create .gitignore if not exists
echo "node_modules/
.env
*.log" > .gitignore

# Initialize git if needed
git init
git add .
git commit -m "Initial commit"
```

4. **Create Heroku App**
```bash
heroku create parikshax-api

# Or with custom name
heroku create your-app-name
```

5. **Set Environment Variables**
```bash
heroku config:set MONGO_URI="your-mongodb-atlas-connection-string"
heroku config:set PORT=5000
heroku config:set REPORT_SECRET="your-secure-random-key"
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN="https://your-frontend-domain.vercel.app"
```

6. **Deploy**
```bash
git push heroku main

# Or if you're on master branch
git push heroku master
```

7. **Verify Deployment**
```bash
heroku open
heroku logs --tail
```

### Step 3: Frontend Deployment (Vercel)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Update API URL**

Edit `client/src/pages/ExamPage.jsx` and replace all instances of:
```javascript
http://localhost:5000
```
with:
```javascript
https://your-heroku-app.herokuapp.com
```

Or better, use environment variables:

Create `client/.env.production`:
```env
VITE_API_URL=https://your-heroku-app.herokuapp.com
```

Update API calls to use:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

4. **Deploy to Vercel**
```bash
cd client
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? parikshax
# - Directory? ./
# - Override settings? No
```

5. **Set Environment Variables**
```bash
vercel env add VITE_API_URL production
# Enter: https://your-heroku-app.herokuapp.com
```

6. **Deploy Production**
```bash
vercel --prod
```

## Option 2: AWS (Full Stack)

### Architecture
- **EC2**: Node.js backend
- **S3 + CloudFront**: React frontend
- **DocumentDB**: MongoDB-compatible database

### Backend (EC2)

1. **Launch EC2 Instance**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t2.micro (free tier)
   - Security group: Allow ports 22, 80, 443, 5000

2. **Connect and Setup**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone your repository
git clone your-repo-url
cd ParikashX/server

# Install dependencies
npm install

# Set environment variables
nano .env
# Add your production variables

# Start with PM2
pm2 start index.js --name parikshax-api
pm2 startup
pm2 save
```

3. **Setup Nginx Reverse Proxy**
```bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/parikshax
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/parikshax /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Frontend (S3 + CloudFront)

1. **Build React App**
```bash
cd client
npm run build
```

2. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create bucket with unique name
   - Enable static website hosting
   - Set index document: index.html

3. **Upload Build**
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

4. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Default root object: index.html
   - Enable HTTPS
   - Custom error response: 404 → /index.html (for React Router)

## Option 3: Docker Deployment

### Create Dockerfiles

**Backend Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
```

**Frontend Dockerfile** (`client/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf** (`client/nginx.conf`):
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker Compose

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: parikshax-db
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./server
    container_name: parikshax-api
    restart: always
    environment:
      MONGO_URI: mongodb://admin:password@mongodb:27017/parikshax?authSource=admin
      PORT: 5000
      REPORT_SECRET: your-secret-key
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: ./client
    container_name: parikshax-web
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## Post-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Use strong REPORT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Implement authentication
- [ ] Regular security updates

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging (CloudWatch/Papertrail)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure alerts
- [ ] Monitor database performance

### Performance
- [ ] Enable CDN for static assets
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Enable gzip compression
- [ ] Set up database indexes

### Backup
- [ ] Configure automated database backups
- [ ] Test restore procedures
- [ ] Document backup schedule

## Environment Variables Reference

### Backend (.env)
```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/parikshax

# Server
PORT=5000
NODE_ENV=production

# Security
REPORT_SECRET=your-64-character-random-secret
JWT_SECRET=your-jwt-secret

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Optional
DATA_RETENTION_DAYS=90
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-domain.com
```

## Troubleshooting

### CORS Errors
Update `server/index.js`:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

### MongoDB Connection Issues
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure network access is configured

### Build Failures
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Clear build
rm -rf dist
npm run build
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ALB, Nginx)
- Deploy multiple backend instances
- Implement session affinity if needed

### Database Scaling
- Enable MongoDB replica sets
- Configure read replicas
- Implement caching (Redis)

### CDN
- Use CloudFront, Cloudflare, or Fastly
- Cache static assets
- Enable edge caching

---

**Deployment Complete! 🎉**

Your ParikshaX application is now live and ready for production use.
