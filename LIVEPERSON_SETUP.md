# LivePerson Widget Configuration for Microphone Access

## Problem
The Amazon Connect CCP loads successfully in the LivePerson widget, but microphone access is blocked due to browser security policies for nested iframes.

## Solution
Configure the LivePerson Agent Workspace Widget to grant microphone and camera permissions.

## Steps

### 1. Access LivePerson Widget Configuration
In your LivePerson account:
1. Go to **Agent Workspace Configuration**
2. Navigate to **Widgets** section
3. Find your "Amazon Connect" widget configuration

### 2. Add Permissions to Widget Configuration
The widget iframe needs to include the `allow` attribute. Update your widget configuration JSON:

```json
{
  "name": "Amazon Connect",
  "url": "https://animal-coupon-polyphonic-gave.trycloudflare.com",
  "permissions": {
    "microphone": true,
    "camera": true
  }
}
```

**OR** if LivePerson uses a different format, you may need to add this in the widget's advanced settings:

```
allow="microphone https://jeffreyha.my.connect.aws https://animal-coupon-polyphonic-gave.trycloudflare.com; camera https://jeffreyha.my.connect.aws"
```

### 3. Alternative: Modify via LivePerson API
If you have access to LivePerson's Widget API, you can set the permissions programmatically:

```javascript
lpTag.agentSDK.command('setWidgetPermissions', {
  widgetId: 'amazon-connect-widget',
  permissions: {
    microphone: true,
    camera: true
  }
});
```

### 4. Contact LivePerson Support
If you cannot find these settings in the UI, contact LivePerson support and request:
- Enable microphone and camera permissions for your custom widget
- Provide them with your widget URL and the Amazon Connect CCP domain

## Verification
After configuration:
1. Reload the LivePerson Agent Workspace
2. Open the Amazon Connect widget
3. The browser should prompt for microphone permission
4. Click "Allow" - the CCP should now work with audio

## Important Notes
- This is a LivePerson configuration issue, not your application code
- The `Permissions-Policy` header in your Next.js app is correct
- The nested iframe requires parent (LivePerson) to explicitly grant permissions
