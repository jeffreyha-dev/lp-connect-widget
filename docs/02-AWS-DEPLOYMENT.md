# AWS Cloud Deployment Guide

This guide provides comprehensive instructions for deploying the LivePerson + Amazon Connect Widget to Amazon Web Services (AWS) cloud infrastructure.

## Table of Contents

- [Deployment Overview](#deployment-overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Hosting Options Comparison](#hosting-options-comparison)
- [Option 1: AWS Amplify (Recommended)](#option-1-aws-amplify-recommended)
- [Option 2: Amazon EC2](#option-2-amazon-ec2)
- [Option 3: Amazon ECS with Fargate](#option-3-amazon-ecs-with-fargate)
- [Option 4: AWS App Runner](#option-4-aws-app-runner)
- [Domain and SSL Configuration](#domain-and-ssl-configuration)
- [Environment Variables and Secrets](#environment-variables-and-secrets)
- [Security Configuration](#security-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [CI/CD Pipeline Setup](#cicd-pipeline-setup)
- [Cost Optimization](#cost-optimization)

---

## Deployment Overview

### Architecture Components

The deployment consists of:

1. **Application Hosting**: Next.js application serving the widget
2. **Amazon Connect Instance**: Pre-configured CCP endpoint
3. **DNS/Domain**: Custom domain with SSL certificate
4. **CDN** (Optional): CloudFront for global distribution
5. **Monitoring**: CloudWatch for logs and metrics

### Deployment Flow

```
Local Development → Build & Test → Deploy to AWS → Configure Domain → Update LivePerson Widget URL
```

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Completed [01-SETUP-REQUIREMENTS.md](file:///Users/jeha/Documents/Code/lp-connect-widget/docs/01-SETUP-REQUIREMENTS.md)
- [ ] Amazon Connect instance created and configured
- [ ] AWS account with appropriate IAM permissions
- [ ] Domain name (or willing to use AWS-provided domain)
- [ ] Environment variables documented
- [ ] Application tested locally (`npm run build` succeeds)
- [ ] Git repository set up (for Amplify/CI/CD)

---

## Hosting Options Comparison

| Feature | AWS Amplify | EC2 | ECS Fargate | App Runner |
|---------|-------------|-----|-------------|------------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Next.js Support** | Native | Manual | Manual | Good |
| **Auto-Scaling** | Yes | Manual | Yes | Yes |
| **SSL Certificate** | Automatic | Manual | Manual | Automatic |
| **CI/CD Integration** | Built-in | Manual | Manual | Built-in |
| **Cost (Low Traffic)** | $ | $$ | $ | $ |
| **Cost (High Traffic)** | $$ | $$$ | $$ | $$ |
| **Maintenance** | Low | High | Medium | Low |
| **Best For** | Next.js apps | Full control | Containers | Simple deploys |

**Recommendation**: Use **AWS Amplify** for easiest deployment with Next.js optimization.

---

## Option 1: AWS Amplify (Recommended)

AWS Amplify provides the simplest deployment path for Next.js applications with automatic builds, SSL, and CDN.

### Prerequisites

- Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit)
- Code pushed to repository

### Step 1: Push Code to Git Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Add remote and push
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Create Amplify App

1. **Navigate to AWS Amplify Console**
   - Go to [AWS Console → Amplify](https://console.aws.amazon.com/amplify/)
   - Click **New app** → **Host web app**

2. **Connect Repository**
   - Select your Git provider (GitHub, GitLab, etc.)
   - Authorize AWS Amplify
   - Select repository and branch (e.g., `main`)

3. **Configure Build Settings**
   
   Amplify should auto-detect Next.js. Verify the build settings:
   
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Add Environment Variables**
   
   In Amplify Console → App Settings → Environment variables:
   
   ```
   NEXT_PUBLIC_CONNECT_INSTANCE_URL = https://your-instance.my.connect.aws/ccp-v2/
   NEXT_PUBLIC_CONNECT_REGION = us-east-1
   ```

5. **Deploy**
   - Click **Save and deploy**
   - Wait for build to complete (~3-5 minutes)
   - Note the Amplify-provided URL (e.g., `https://main.d1234abcd.amplifyapp.com`)

### Step 3: Configure Custom Domain (Optional)

1. **Add Domain**
   - In Amplify Console → Domain management → Add domain
   - Enter your domain name
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Amplify automatically provisions SSL certificate via ACM
   - Wait for DNS validation (~15 minutes)

### Step 4: Update Amazon Connect Approved Origins

Add your Amplify URL to Amazon Connect:

1. Go to Amazon Connect Console → Application Integration
2. Add to Approved Origins:
   ```
   https://main.d1234abcd.amplifyapp.com
   https://your-custom-domain.com  # if using custom domain
   ```

### Step 5: Configure LivePerson Widget

Update your LivePerson widget URL to point to the Amplify deployment.

### Continuous Deployment

Amplify automatically rebuilds and deploys on every push to the connected branch.

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Amplify automatically detects and deploys
```

---

## Option 2: Amazon EC2

Deploy on a virtual server with full control over the environment.

### Step 1: Launch EC2 Instance

1. **Navigate to EC2 Console**
   - Go to [AWS Console → EC2](https://console.aws.amazon.com/ec2/)
   - Click **Launch Instance**

2. **Configure Instance**
   - **Name**: `lp-connect-widget-server`
   - **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS
   - **Instance type**: `t3.micro` (free tier) or `t3.small` for production
   - **Key pair**: Create or select existing SSH key
   - **Network settings**:
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere
     - Allow HTTPS (port 443) from anywhere

3. **Launch Instance**

### Step 2: Connect and Setup Server

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@<instance-public-ip>

# Update system
sudo yum update -y  # Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs  # Amazon Linux
# OR
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs  # Ubuntu

# Install git
sudo yum install -y git  # Amazon Linux
# OR
sudo apt install -y git  # Ubuntu

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 3: Deploy Application

```bash
# Clone repository
cd /home/ec2-user
git clone <your-repo-url>
cd lp-connect-widget

# Install dependencies
npm ci

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_CONNECT_INSTANCE_URL=https://your-instance.my.connect.aws/ccp-v2/
NEXT_PUBLIC_CONNECT_REGION=us-east-1
EOF

# Build application
npm run build

# Start with PM2
pm2 start npm --name "lp-widget" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy

```bash
# Install Nginx
sudo yum install -y nginx  # Amazon Linux
# OR
sudo apt install -y nginx  # Ubuntu

# Create Nginx configuration
sudo tee /etc/nginx/conf.d/lp-widget.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux
# OR
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Deployment Updates

```bash
# SSH into server
ssh -i your-key.pem ec2-user@<instance-public-ip>

# Pull latest changes
cd /home/ec2-user/lp-connect-widget
git pull

# Rebuild and restart
npm ci
npm run build
pm2 restart lp-widget
```

---

## Option 3: Amazon ECS with Fargate

Deploy as a containerized application with automatic scaling.

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

Update `next.config.ts` to enable standalone output:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... existing config
};
```

### Step 2: Build and Push to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name lp-connect-widget --region us-east-1

# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t lp-connect-widget .

# Tag image
docker tag lp-connect-widget:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/lp-connect-widget:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/lp-connect-widget:latest
```

### Step 3: Create ECS Cluster and Task Definition

1. **Create ECS Cluster**
   - Go to [ECS Console](https://console.aws.amazon.com/ecs/)
   - Create cluster with Fargate

2. **Create Task Definition**
   - Launch type: Fargate
   - Task memory: 1GB
   - Task CPU: 0.5 vCPU
   - Container:
     - Image: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/lp-connect-widget:latest`
     - Port mappings: 3000
     - Environment variables: Add `NEXT_PUBLIC_*` variables

3. **Create Service**
   - Desired tasks: 2 (for high availability)
   - Load balancer: Application Load Balancer
   - Target group: Create new, port 3000

### Step 4: Configure Application Load Balancer

- Add HTTPS listener with ACM certificate
- Configure health checks: `/` endpoint
- Add security group rules

---

## Option 4: AWS App Runner

Simplified container deployment with automatic scaling.

### Step 1: Prepare Source

Option A: Use ECR image (from ECS steps above)
Option B: Connect to GitHub repository

### Step 2: Create App Runner Service

1. Go to [App Runner Console](https://console.aws.amazon.com/apprunner/)
2. Create service
3. Configure:
   - Source: ECR or GitHub
   - Build settings: Automatic (for GitHub)
   - Port: 3000
   - Environment variables: Add `NEXT_PUBLIC_*` variables
4. Deploy

### Step 3: Configure Custom Domain

- Add custom domain in App Runner console
- Update DNS records as instructed
- SSL certificate automatically provisioned

---

## Domain and SSL Configuration

### Using Route 53 for DNS

1. **Register or Transfer Domain**
   - Go to [Route 53 Console](https://console.aws.amazon.com/route53/)
   - Register new domain or transfer existing

2. **Create Hosted Zone**
   - Automatically created for registered domains
   - Or create manually for external domains

3. **Add DNS Records**
   
   For Amplify:
   - Amplify handles this automatically
   
   For EC2/ECS/App Runner:
   - Create A record pointing to load balancer or instance IP
   - Or CNAME record for App Runner URL

### SSL Certificate with ACM

1. **Request Certificate**
   - Go to [Certificate Manager](https://console.aws.amazon.com/acm/)
   - Request public certificate
   - Add domain name(s)
   - Choose DNS validation

2. **Validate Domain**
   - Add CNAME records to Route 53 (automatic if using Route 53)
   - Wait for validation (~5-30 minutes)

3. **Attach to Load Balancer/Amplify**
   - Certificate automatically used by Amplify
   - For ALB: Add HTTPS listener with certificate

---

## Environment Variables and Secrets

### AWS Systems Manager Parameter Store

For sensitive configuration:

```bash
# Store parameters
aws ssm put-parameter \
  --name "/lp-widget/connect-url" \
  --value "https://your-instance.my.connect.aws/ccp-v2/" \
  --type "String"

aws ssm put-parameter \
  --name "/lp-widget/connect-region" \
  --value "us-east-1" \
  --type "String"
```

### AWS Secrets Manager

For highly sensitive data:

```bash
# Create secret
aws secretsmanager create-secret \
  --name lp-widget-config \
  --secret-string '{"connectUrl":"https://...","region":"us-east-1"}'
```

### Access in Application

Update deployment to fetch from Parameter Store/Secrets Manager at runtime (requires IAM permissions).

---

## Security Configuration

### Security Groups

**For EC2/ECS**:

- Inbound rules:
  - Port 80 (HTTP) from 0.0.0.0/0
  - Port 443 (HTTPS) from 0.0.0.0/0
  - Port 22 (SSH) from your IP only (EC2)

### IAM Roles

Create IAM role with permissions:
- CloudWatch Logs (write)
- Systems Manager Parameter Store (read)
- Secrets Manager (read, if used)

### CORS Headers

Already configured in [next.config.ts](file:///Users/jeha/Documents/Code/lp-connect-widget/next.config.ts):

```typescript
headers: [
  {
    key: 'Permissions-Policy',
    value: 'microphone=(self "https://jeffreyha.my.connect.aws" "https://ause1.le.liveperson.net"), ...'
  }
]
```

Update with your actual domains before deployment.

---

## Monitoring and Logging

### CloudWatch Logs

**For Amplify**: Automatic logging to CloudWatch

**For EC2/ECS**:

1. Install CloudWatch agent
2. Configure log groups
3. Stream application logs

```bash
# PM2 logs to CloudWatch (EC2)
pm2 install pm2-cloudwatch
pm2 set pm2-cloudwatch:aws_region us-east-1
pm2 set pm2-cloudwatch:log_group_name lp-widget-logs
```

### CloudWatch Metrics

Monitor:
- CPU utilization
- Memory usage
- Request count
- Error rates
- Response times

### Alarms

Create CloudWatch alarms for:
- High error rate (>5%)
- High response time (>2s)
- Low health check success rate

---

## CI/CD Pipeline Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_CONNECT_INSTANCE_URL: ${{ secrets.CONNECT_URL }}
          NEXT_PUBLIC_CONNECT_REGION: ${{ secrets.CONNECT_REGION }}
      
      - name: Deploy to Amplify
        # Amplify auto-deploys on push
        run: echo "Amplify handles deployment"
      
      # OR for EC2
      - name: Deploy to EC2
        uses: easingthemes/ssh-deploy@v2
        env:
          SSH_PRIVATE_KEY: ${{ secrets.EC2_SSH_KEY }}
          REMOTE_HOST: ${{ secrets.EC2_HOST }}
          REMOTE_USER: ec2-user
          TARGET: /home/ec2-user/lp-connect-widget
```

---

## Cost Optimization

### Estimated Monthly Costs

| Hosting Option | Low Traffic | Medium Traffic | High Traffic |
|----------------|-------------|----------------|--------------|
| **Amplify** | $5-10 | $20-50 | $100-300 |
| **EC2 (t3.micro)** | $8 | $8-15 | $50-200 |
| **ECS Fargate** | $15-25 | $30-80 | $150-500 |
| **App Runner** | $10-15 | $25-60 | $100-400 |

*Estimates include compute, data transfer, and load balancing. Actual costs vary.*

### Cost Reduction Tips

1. **Use Free Tier**: EC2 t3.micro, Amplify build minutes
2. **Right-Size Instances**: Start small, scale as needed
3. **Enable Auto-Scaling**: Scale down during low traffic
4. **Use CloudFront**: Reduce origin requests
5. **Optimize Images**: Reduce bandwidth costs
6. **Reserved Instances**: For predictable workloads (EC2)
7. **Spot Instances**: For non-critical environments

### Cost Monitoring

- Enable AWS Cost Explorer
- Set up billing alarms
- Tag resources for cost allocation

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Application accessible via HTTPS
- [ ] Amazon Connect CCP loads correctly
- [ ] Microphone permissions work (or popup fallback)
- [ ] Phone number detection functioning
- [ ] LivePerson widget integration working
- [ ] SSL certificate valid
- [ ] CloudWatch logs streaming
- [ ] Monitoring alarms configured
- [ ] Backup/disaster recovery plan in place

---

## Troubleshooting Deployment Issues

### Build Failures

**Check**:
- Node.js version compatibility
- Environment variables set correctly
- Dependencies installed (`npm ci`)

### CCP Not Loading in Production

**Verify**:
- Amazon Connect Approved Origins includes production URL
- HTTPS enabled (required)
- CORS headers configured correctly

### High Latency

**Solutions**:
- Enable CloudFront CDN
- Use region closer to users
- Optimize Next.js build (static generation)

---

**Last Updated**: 2026-01-26
