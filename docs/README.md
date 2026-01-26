# Documentation

Complete technical documentation for the LivePerson + Amazon Connect Widget.

## Quick Start

1. **[Setup Requirements](01-SETUP-REQUIREMENTS.md)** - Prerequisites, environment setup, and troubleshooting
2. **[AWS Deployment Guide](02-AWS-DEPLOYMENT.md)** - Deploy to AWS cloud (Amplify, EC2, ECS, App Runner)
3. **[Architecture Documentation](03-ARCHITECTURE.md)** - System design, components, and integration details

## Documentation Overview

### 01-SETUP-REQUIREMENTS.md

Complete setup guide covering:
- System requirements (Node.js, npm, Git)
- AWS account and IAM setup
- Amazon Connect instance configuration
- LivePerson workspace prerequisites
- Development environment setup
- Environment variables
- Security and permissions
- Common troubleshooting issues

**Start here** if you're setting up the project for the first time.

---

### 02-AWS-DEPLOYMENT.md

Comprehensive deployment guide with:
- Four hosting options comparison (Amplify, EC2, ECS, App Runner)
- Step-by-step deployment instructions for each option
- Domain and SSL certificate configuration
- Environment variables and secrets management
- Security configuration (CORS, permissions)
- Monitoring and logging setup
- CI/CD pipeline examples
- Cost optimization strategies

**Use this** when ready to deploy to production.

---

### 03-ARCHITECTURE.md

Technical architecture documentation including:
- High-level system architecture
- Component breakdown and responsibilities
- LivePerson and Amazon Connect integration patterns
- 3-level phone number detection pipeline
- Security architecture and browser permissions
- Technology stack details
- Design patterns and best practices
- Data flow diagrams

**Reference this** to understand how the system works.

---

## Additional Resources

### Project Files

- [README.md](../README.md) - Project overview and quick start
- [LIVEPERSON_SETUP.md](../LIVEPERSON_SETUP.md) - LivePerson widget configuration
- [MICROPHONE_ACTIVATION.md](../MICROPHONE_ACTIVATION.md) - Microphone permission details
- [FINAL_STATUS.md](../FINAL_STATUS.md) - Current project status

### Key Source Files

- [CCPContainer.tsx](../app/components/CCPContainer.tsx) - Main widget component
- [useLPTag.ts](../app/hooks/useLPTag.ts) - LivePerson SDK hook
- [page.tsx](../app/page.tsx) - Application entry point
- [next.config.ts](../next.config.ts) - Next.js configuration

### External Documentation

- [Amazon Connect Streams API](https://github.com/amazon-connect/amazon-connect-streams)
- [LivePerson Agent SDK](https://developers.liveperson.com/agent-workspace-sdk-overview.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Amplify Documentation](https://docs.amplify.aws/)

---

## Getting Help

### Common Issues

1. **CCP not loading**: Check [01-SETUP-REQUIREMENTS.md#troubleshooting](01-SETUP-REQUIREMENTS.md#troubleshooting)
2. **Microphone blocked**: See [03-ARCHITECTURE.md#security-architecture](03-ARCHITECTURE.md#security-architecture)
3. **Deployment failures**: Review [02-AWS-DEPLOYMENT.md#troubleshooting-deployment-issues](02-AWS-DEPLOYMENT.md#troubleshooting-deployment-issues)

### Support Channels

- **Amazon Connect**: AWS Support or Amazon Connect documentation
- **LivePerson**: LivePerson support portal or account manager
- **Project Issues**: GitHub issues (if applicable)

---

**Documentation Version**: 1.0  
**Last Updated**: 2026-01-26
