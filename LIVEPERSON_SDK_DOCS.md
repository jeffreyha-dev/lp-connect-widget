# LivePerson Agent SDK Documentation

This document describes the methods and constants available in the LivePerson Agent Workspace Widget SDK (`client-SDK.min.js`).

## Initialization

### `init(config)`
Initializes communication between the widget and the LivePerson Agent Workspace.
- **Parameters**:
  - `config` (Optional Object):
    - `notificationCallback`: Function triggered on `Notify` events.
    - `visitorFocusedCallback`: Function triggered when the visitor focuses the chat.
    - `visitorBlurredCallback`: Function triggered when the visitor blurs the chat.

## Data Retrieval & Monitoring

### `get(key, success, error)`
Retrieves data for a specific key (e.g., `visitorInfo`, `chatInfo`).
- **Parameters**:
  - `key` (String): The data key to retrieve.
  - `success` (Function): Callback received if retrieval succeeds.
  - `error` (Function): Callback received if retrieval fails.

### `bind(key, valueUpdateCallback, notifyWhenDoneCallback)`
Subscribes to updates for a specific data key.
- **Parameters**:
  - `key` (String): The data key to monitor.
  - `valueUpdateCallback` (Function): Triggered whenever the data changes.
  - `notifyWhenDoneCallback` (Function): Optional. Triggered when the binding is established.

### `unbind(key, valueUpdateCallback, notifyWhenDoneCallback)`
Removes an existing binding.

## Commands & Requests

### `command(cmdName, data, notifyWhenDoneCallback)`
Executes a specialized command in the Agent Workspace.
- **Parameters**:
  - `cmdName` (String): The name of the command (see [Command Names](#command-names)).
  - `data` (Object): Data required by the command.
  - `notifyWhenDoneCallback` (Function): Optional callback upon execution.

### `request(reqName, data, success, error)`
Sends a request and waits for a response.
- **Parameters**:
  - `reqName` (String): The name of the request (see [Request Names](#request-names)).
  - `data` (Object): Data required by the request.
  - `success` (Function): Success callback.
  - `error` (Function): Error callback.

## Helper Methods

- `onNotify(callback)`: Alias for binding to the `Notify` event.
- `onVisitorFocused(callback)`: Alias for binding to the `Visitor Focused` event.
- `onVisitorBlurred(callback)`: Alias for binding to the `Visitor Blurred` event.
- `dispose()`: Safely closes the communication channel.

---

## Constants Reference

### Command Names (`cmdNames`)
| Key | Value |
| :--- | :--- |
| `bind` | `"Bind"` |
| `unbind` | `"Unbind"` |
| `write` | `"Write ChatLine"` |
| `writeSC` | `"Write StructuredContent"` |
| `notify` | `"Send Notification"` |
| `initialize` | `"Initialize"` |

### Request Names (`reqNames`)
| Key | Value |
| :--- | :--- |
| `get` | `"Get"` |
| `setConsumerProfile` | `"Set Consumer Profile"` |
| `setChatNote` | `"Set Chat Note"` |

### Event Names (`eventNames`)
| Key | Value |
| :--- | :--- |
| `notify` | `"Notify"` |
| `visitorFocused` | `"Visitor Focused"` |
| `visitorBlurred` | `"Visitor Blurred"` |

### App Names (`appNames`)
- `manager`: `"iFrame manager"`
- `events`: `"iFrame events"`
