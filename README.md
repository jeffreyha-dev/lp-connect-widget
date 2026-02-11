# LivePerson + Amazon Connect Widget

A Next.js widget that embeds Amazon Connect CCP (Contact Control Panel) within LivePerson Agent Workspace.

## Features

- ✅ Amazon Connect CCP embedded in LivePerson widget
- ✅ Glassmorphic UI with premium design
- ✅ Authentication handling with login popup
- ✅ TypeScript support
- ✅ Tailwind CSS styling

## Prerequisites

- Node.js 18+ 
- Amazon Connect instance
- LivePerson Agent Workspace access
- AWS account with proper permissions

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_CONNECT_INSTANCE_URL=https://your-instance.my.connect.aws/ccp-v2/
NEXT_PUBLIC_CONNECT_REGION=your-region
```

### 3. AWS Configuration

In AWS Console → Amazon Connect → Application Integration:

Add these domains to **Approved Origins**:
- Your deployment domain (e.g., `https://your-app.vercel.app`)
- LivePerson domain: `https://ause1.le.liveperson.net` (adjust for your region)

### 4. Run Development Server

```bash
npm run dev
```

## Deployment

Deploy to Vercel, Netlify, AWS, or Google Cloud. See specific guides for details:

- [AWS Deployment](./docs/02-AWS-DEPLOYMENT.md)
- [GCP Deployment](./docs/04-GCP-DEPLOYMENT.md)

```bash
npm run build
```

## LivePerson Integration

1. In LivePerson Agent Workspace, create a new custom widget
2. Set the widget URL to your deployed application
3. Configure widget permissions (see `LIVEPERSON_SETUP.md`)

## Known Limitations

- **Microphone Access**: Browser security restricts microphone access in nested iframes. This widget now includes:
  - ✅ Programmatic microphone permission request
  - ✅ Enhanced HTTP headers (Permissions-Policy + Feature-Policy)
  - ⚠️ May still require LivePerson iframe configuration
  
  See [`MICROPHONE_ACTIVATION.md`](./MICROPHONE_ACTIVATION.md) for implementation details and testing instructions.

## Documentation

- [`LIVEPERSON_SETUP.md`](./LIVEPERSON_SETUP.md) - LivePerson configuration guide
- [`02-AWS-DEPLOYMENT.md`](./docs/02-AWS-DEPLOYMENT.md) - AWS Deployment Guide
- [`04-GCP-DEPLOYMENT.md`](./docs/04-GCP-DEPLOYMENT.md) - Google Cloud Deployment Guide
- [`05-CUSTOM-WIDGET-CONNECTIVITY.md`](./docs/05-CUSTOM-WIDGET-CONNECTIVITY.md) - Connectivity & Data Guide
- [`FINAL_STATUS.md`](./FINAL_STATUS.md) - Current status and limitations

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Amazon Connect Streams SDK
- Framer Motion

## License

MIT
