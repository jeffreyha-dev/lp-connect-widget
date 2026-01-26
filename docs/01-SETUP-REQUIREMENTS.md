# Setup Requirements

This guide covers all prerequisites and setup steps required to develop and deploy the LivePerson + Amazon Connect Widget.

## Table of Contents

- [System Requirements](#system-requirements)
- [AWS Prerequisites](#aws-prerequisites)
- [Amazon Connect Setup](#amazon-connect-setup)
- [LivePerson Prerequisites](#liveperson-prerequisites)
- [Development Environment Setup](#development-environment-setup)
- [Environment Configuration](#environment-configuration)
- [Security and Permissions](#security-and-permissions)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Required Software

| Software | Minimum Version | Recommended Version | Purpose |
|----------|----------------|---------------------|---------|
| Node.js | 18.0.0 | 20.x LTS | JavaScript runtime |
| npm | 9.0.0 | 10.x | Package manager |
| Git | 2.30.0 | Latest | Version control |

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

### Operating System Support

- **macOS**: 11.0 (Big Sur) or later
- **Windows**: 10 or later (WSL2 recommended for development)
- **Linux**: Ubuntu 20.04+, Debian 11+, or equivalent

---

## AWS Prerequisites

### AWS Account Requirements

1. **Active AWS Account**
   - Sign up at [aws.amazon.com](https://aws.amazon.com)
   - Credit card required for account verification
   - Free tier available for testing

2. **IAM User with Appropriate Permissions**
   
   Required AWS service permissions:
   - Amazon Connect (full access or read-only for CCP)
   - CloudFront (if using CDN)
   - Route 53 (for custom domains)
   - Certificate Manager (for SSL/TLS)
   - Amplify/EC2/ECS (depending on hosting choice)

3. **AWS CLI** (Optional but recommended)
   
   ```bash
   # Install AWS CLI
   # macOS
   brew install awscli
   
   # Windows
   # Download from: https://aws.amazon.com/cli/
   
   # Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   
   # Configure credentials
   aws configure
   ```

---

## Amazon Connect Setup

### Create Amazon Connect Instance

1. **Navigate to Amazon Connect Console**
   - Go to [AWS Console → Amazon Connect](https://console.aws.amazon.com/connect/)
   - Click **Create instance**

2. **Configure Instance**
   - **Identity management**: Choose Amazon Connect user management (recommended for testing)
   - **Instance alias**: Choose a unique name (e.g., `my-company-connect`)
   - **Administrator**: Create or specify admin user
   - **Telephony options**: Enable both inbound and outbound calling
   - **Data storage**: Accept defaults or customize S3 buckets

3. **Note Your Instance Details**
   
   After creation, record:
   - **Instance URL**: `https://[your-alias].my.connect.aws`
   - **Instance ARN**: Found in instance settings
   - **Region**: AWS region where instance is deployed (e.g., `us-east-1`)

### Configure CCP Access

1. **Access Instance Settings**
   - Open your Amazon Connect instance
   - Go to **Application integration** in left sidebar

2. **Add Approved Origins**
   
   Add the following domains to allow CCP embedding:
   
   ```
   # Development
   http://localhost:3000
   
   # Production (replace with your actual domain)
   https://your-app-domain.com
   
   # LivePerson domains (adjust for your region)
   https://ause1.le.liveperson.net
   https://va.le.liveperson.net
   https://sy.le.liveperson.net
   ```

3. **Enable Softphone**
   - Ensure **Softphone** is enabled in telephony settings
   - This allows browser-based calling via CCP

---

## LivePerson Prerequisites

### LivePerson Account Access

1. **Agent Workspace Access**
   - Active LivePerson Conversational Cloud account
   - Agent or Administrator role
   - Access to Agent Workspace configuration

2. **Custom Widget Permissions**
   - Permission to create/manage custom widgets
   - Access to widget configuration settings
   - Contact your LivePerson account manager if needed

### Required LivePerson Information

Record the following from your LivePerson account:

- **Account ID**: Found in account settings
- **LivePerson Domain**: Your region-specific domain
  - North America: `va.le.liveperson.net` or `va.liveperson.net`
  - EMEA: `lo.le.liveperson.net`
  - APAC: `sy.le.liveperson.net` or `ause1.le.liveperson.net`

---

## Development Environment Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd lp-connect-widget

# Or if starting fresh
mkdir lp-connect-widget
cd lp-connect-widget
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install
```

**Expected Dependencies:**

```json
{
  "dependencies": {
    "amazon-connect-streams": "^2.22.0",
    "framer-motion": "^12.28.1",
    "lucide-react": "^0.562.0",
    "next": "16.1.4",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### 3. Verify Installation

```bash
# Check for errors
npm list

# Run development server test
npm run dev
```

---

## Environment Configuration

### Create Environment File

Create `.env.local` in the project root:

```bash
# Amazon Connect Configuration
NEXT_PUBLIC_CONNECT_INSTANCE_URL=https://your-instance.my.connect.aws/ccp-v2/
NEXT_PUBLIC_CONNECT_REGION=us-east-1

# Optional: LivePerson Configuration
NEXT_PUBLIC_LP_ACCOUNT_ID=your-account-id
NEXT_PUBLIC_LP_DOMAIN=ause1.le.liveperson.net
```

### Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_CONNECT_INSTANCE_URL` | Yes | Amazon Connect CCP URL | `https://my-instance.my.connect.aws/ccp-v2/` |
| `NEXT_PUBLIC_CONNECT_REGION` | Yes | AWS region code | `us-east-1`, `us-west-2` |
| `NEXT_PUBLIC_LP_ACCOUNT_ID` | No | LivePerson account ID | `12345678` |
| `NEXT_PUBLIC_LP_DOMAIN` | No | LivePerson region domain | `ause1.le.liveperson.net` |

> **Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never store secrets in these variables.

---

## Security and Permissions

### Browser Permissions

The widget requires specific browser permissions to function:

1. **Microphone Access** (for voice calls)
   - Required for Amazon Connect softphone
   - Must be granted at both widget and parent (LivePerson) iframe levels

2. **Popup Windows** (for authentication and fallback CCP)
   - Amazon Connect login popup
   - Fallback CCP window when microphone is blocked

3. **Clipboard Access** (for phone number copy feature)
   - May be restricted in nested iframes
   - Fallback method implemented for restricted environments

### HTTPS Requirement

> **CRITICAL**: This widget MUST be served over HTTPS in production.

Browser security policies require HTTPS for:
- Microphone/camera access
- Clipboard API
- Secure cookies
- Cross-origin communication

**Development Exception**: `localhost` is treated as secure context and works with HTTP.

### CORS Configuration

The widget communicates with:
- Amazon Connect CCP (configured in Connect console)
- LivePerson Agent Workspace (configured in widget settings)

Ensure CORS is properly configured in:
1. Amazon Connect → Application Integration → Approved Origins
2. Next.js configuration ([next.config.ts](file:///Users/jeha/Documents/Code/lp-connect-widget/next.config.ts))

---

## Troubleshooting

### Common Setup Issues

#### Node.js Version Mismatch

**Symptom**: Build errors or dependency installation failures

**Solution**:
```bash
# Use nvm to manage Node.js versions
nvm install 20
nvm use 20

# Or download from nodejs.org
```

#### Amazon Connect CCP Not Loading

**Symptom**: Blank iframe or "Failed to load CCP" error

**Checklist**:
- [ ] Verify `NEXT_PUBLIC_CONNECT_INSTANCE_URL` is correct
- [ ] Check Amazon Connect → Application Integration → Approved Origins
- [ ] Ensure URL ends with `/ccp-v2/`
- [ ] Verify instance is in correct AWS region
- [ ] Check browser console for CORS errors

#### Microphone Permission Denied

**Symptom**: "Microphone Blocked" warning appears

**Causes**:
1. Browser denied permission
2. Not running on HTTPS (in production)
3. Parent iframe (LivePerson) not configured with microphone permissions

**Solutions**:
1. Check browser permissions: `chrome://settings/content/microphone`
2. Use HTTPS in production
3. Contact LivePerson support to add iframe `allow="microphone"` attribute
4. Use popup mode as fallback (automatic in widget)

#### LivePerson SDK Not Found

**Symptom**: Console warning "LivePerson SDK not found"

**Expected Behavior**: This warning is normal during local development outside LivePerson environment.

**In Production**: If this appears in LivePerson Agent Workspace:
- Verify widget is properly configured in LivePerson
- Check widget URL is correct
- Ensure widget has proper permissions

### Development Server Issues

#### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Getting Help

If you encounter issues not covered here:

1. **Check Browser Console**: Look for error messages and warnings
2. **Review Amazon Connect Logs**: Check CloudWatch logs for your instance
3. **LivePerson Support**: Contact for widget configuration issues
4. **AWS Support**: For Amazon Connect instance issues
5. **Project Issues**: File a GitHub issue with:
   - Error messages
   - Browser console logs
   - Environment details (OS, Node version, browser)

---

## Next Steps

After completing setup:

1. **Test Locally**: Run `npm run dev` and verify CCP loads
2. **Review Architecture**: Read [03-ARCHITECTURE.md](file:///Users/jeha/Documents/Code/lp-connect-widget/docs/03-ARCHITECTURE.md)
3. **Deploy to AWS**: Follow [02-AWS-DEPLOYMENT.md](file:///Users/jeha/Documents/Code/lp-connect-widget/docs/02-AWS-DEPLOYMENT.md)
4. **Configure LivePerson**: Set up custom widget in Agent Workspace

---

**Last Updated**: 2026-01-26
