# Custom Widget Connectivity Guide

This guide details how to configure the LivePerson Agent Workspace to connect with this widget and explains the underlying communication architecture.

## Table of Contents

- [Integration Overview](#integration-overview)
- [LivePerson Agent Workspace Setup](#liveperson-agent-workspace-setup)
- [Communication Architecture](#communication-architecture)
- [Data Exchange API](#data-exchange-api)
- [Troubleshooting Connectivity](#troubleshooting-connectivity)

---

## Integration Overview

The widget runs as an `iframe` within the LivePerson Agent Workspace. Connectivity is established using the **LivePerson Agent Workspace Widget SDK** (`client-SDK.min.js`).

**Key capabilities:**
- **Two-way Communication**: Send/receive data between widget and LivePerson.
- **Context Awareness**: Access chat info, visitor info, and agent details.
- **Microphone/Camera Access**: Requires specific permission grants in LivePerson.

---

## LivePerson Agent Workspace Setup

### 1. Create the Custom Widget

1. Log in to your LivePerson account as an Administrator.
2. Navigate to **Campaign Builder** > **Data Sources** > **Custom Widgets** (or **Agent Workspace Configuration** > **Widgets** depending on your version).
3. Click **Add Widget**.
4. Configure the basic settings:
   - **Name**: `Amazon Connect CCP`
   - **Description**: `Embedded Amazon Connect Softphone`
   - **URL**: Enter your deployed application URL (e.g., `https://your-app-id.run.app` or `https://your-domain.com`).

### 2. Configure Permissions (Crucial)

To allow the Amazon Connect CCP to access the microphone, you must explicitly grant permissions in the widget configuration.

**Method A: UI Configuration**
If your version of LivePerson allows checking boxes for permissions:
- [x] Audit (Microphone)
- [x] Video (Camera) - *Optional, if video calls are used*

**Method B: Advanced JSON Configuration**
If you have an "Advanced" or "JSON" editor mode for the widget:

```json
{
  "name": "Amazon Connect CCP",
  "url": "https://your-deploy-url.com",
  "permissions": {
    "microphone": true,
    "camera": true
  }
}
```

**Method C: Custom URL Parameters / Support**
Some older setups require contacting LivePerson Support to add the `allow="microphone; camera"` attribute to the iframe.

### 3. Assign to Agent Workspace

1. Go to **Agent Workspace Configuration**.
2. Determine where the widget should appear (e.g., "Main Container" or "Side Widget").
3. Add the **Amazon Connect CCP** widget to the desired location.
4. Assign to specific Skills or Agent Groups if necessary.

---

## Communication Architecture

The widget uses the `lp-connect-widget/src/hooks/useAgentChat.ts` (or similar) hook to initialize the SDK.

### Initialization Flow

1. **Widget Loads**: Next.js app starts in the iframe.
2. **SDK Load**: `client-SDK.min.js` is loaded via script tag (usually in `layout.tsx` or `index.html`).
3. **Connection**: `lpTag.agentSDK.init()` is called to handshake with the parent window.

```typescript
// Example initialization pattern
useEffect(() => {
  const initSDK = async () => {
    if (window.lpTag?.agentSDK) {
      window.lpTag.agentSDK.init({
        notificationCallback: onNotify,
        visitorFocusedCallback: onVisitorFocused,
        visitorBlurredCallback: onVisitorBlurred
      });
    }
  };
  initSDK();
}, []);
```

---

## Data Exchange API

The widget can effectively "talk" to LivePerson using the following methods.

### 1. Binding to Data (`bind`)

Listen for updates to specific data keys.

```typescript
// Subscribe to visitor name changes
window.lpTag.agentSDK.bind('visitorInfo.visitorName', (data) => {
  console.log('Visitor Name:', data);
});
```

**Common Keys:**
- `visitorInfo.visitorName`
- `chatInfo.chatId`
- `agentInfo.agentName`

### 2. Getting Data (`get`)

Retrieve a snapshot of data one time.

```typescript
window.lpTag.agentSDK.get('chatInfo', (data) => {
  console.log('Current Chat Info:', data);
}, (err) => {
  console.error('Error fetching chat info:', err);
});
```

### 3. Sending Commands (`command`)

Perform actions in the Agent Workspace.

```typescript
// Write a line to the chat transcript
window.lpTag.agentSDK.command('Write ChatLine', {
  text: 'Hello from Amazon Connect!'
});
```

---

## Troubleshooting Connectivity

### "LivePerson SDK not found"

- **Cause**: The widget is running outside of LivePerson (e.g., `localhost` standalone).
- **Solution**: This is expected behavior for local dev. Use mock data or query parameters to simulate the environment if needed.

### Microphone Blocked

- **Cause**: Missing `allow` attribute on the iframe.
- **Solution**: Verify Step 2 in "LivePerson Agent Workspace Setup". Without the parent iframe granting permission, the widget cannot access the mic, even if the user clicks "Allow".

### CSP / CORS Errors

- **Cause**: Content Security Policy blocking the widget or Connect specifics.
- **Solution**:
    - Ensure your widget domain is HTTPS.
    - Check browser console for `Refused to frame...` errors.
    - Add your widget domain to **Approved Origins** in Amazon Connect.

---

**Last Updated**: 2026-02-11
