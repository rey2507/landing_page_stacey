# Chat Popup Architecture Documentation

This document provides a technical overview of the chat system implemented in `chat-popup.js`.

## 1. Global Variables (Internal State)

The following variables are maintained within the `initChatPopup` scope to manage the chat state:

| Variable | Type | Purpose |
| :--- | :--- | :--- |
| `window.staceyChatInitialized` | Boolean | Prevents multiple initializations of the script. |
| `isDragging` | Boolean | Flag for the active drag state of the bubble. |
| `dragStarted` | Boolean | Distinguishes between a simple click and a drag movement. |
| `hasDragged` | Boolean | Prevents the chat panel from opening if the user was just moving the bubble. |
| `historyStack` | Array | Stores interaction history for the rollback (Back) functionality. |
| `currentReplyOptions` | Array | Stores the current set of flow keys available to the user. |
| `recordingResponse` | Boolean | When true, Stacey's messages are captured into the current history node. |
| `pendingMembershipTimeout` | Number | Reference to the `setTimeout` for the secondary Membership CTA. |
| `flows` | Object | The static configuration of conversation nodes (messages, labels, and branching). |

## 2. Event Listeners

| Target | Event | Action |
| :--- | :--- | :--- |
| `chatBubble` | `click` | Toggles the panel (if no drag occurred). |
| `chatBubble` | `mousedown` / `touchstart` | Starts the drag process. |
| `closeBtn` | `click` | Closes the chat panel. |
| `resetBtn` | `click` | Resets the conversation to the start. |
| `clearBtn` | `click` | Triggers the rollback/undo logic. |
| `suggestions` | `click` | Handles the initial chip-based suggestions. |
| `document` | `keydown` (Esc) | Closes the panel. |
| `document` | `click` | Closes the panel if clicking outside the container. |
| `window` | `resize` | Corrects UI positioning and snaps bubble to edges via `handleResize`. |

## 3. Function List

- `initChatPopup()`: Initializes DOM references, state, and event listeners.
- `addMessage(text, type)`: Factory for message bubbles; handles history recording.
- `startRollbackSession(userMessage, previousOptions)`: Prepares the history stack for a new user interaction.
- `stopRollbackSession()`: Ends the recording of Stacey's response nodes.
- `handleFlow(flowKey)`: The core engine that processes conversation nodes from the `flows` object.
- `createReplyOptions(options)`: Renders branching buttons at the end of a message sequence.
- `showTyping()` / `hideTyping()`: Controls the visual "..." indicator.
- `sendStaceyMessage(text, delay)`: Orchestrates typing animation followed by `addMessage`.
- `openPanel()` / `closePanel()` / `togglePanel()`: Manages the visibility and ARIA states of the chat UI.
- `resetChat()`: Purges state and restarts the desktop welcome flow.
- `rollbackLastSelection()`: Reverts the DOM and state to the previous branching point.
- `startDrag()` / `onDrag()` / `stopDrag()`: Pointer coordinate math and clamping for the bubble.
- `snapToEdge()`: Animates the bubble to a partially hidden state on screen edges.
- `runWelcomeSequence()`: Async sequence for the mobile auto-open flow.

## 4. Function Call Hierarchy

```text
initChatPopup
├── resetChat (Desktop Init)
│   └── addMessage -> createReplyOptions
├── runWelcomeSequence (Mobile Init)
│   └── sendStaceyMessage -> showTyping -> addMessage -> hideTyping
├── togglePanel
│   ├── openPanel
│   └── closePanel
├── handleFlow (User Branching)
│   ├── startRollbackSession
│   ├── sendStaceyMessage (Loop)
│   ├── createReplyOptions
│   └── showGalleryMessage (Terminal)
│       └── showMembershipMessage (Timeout)
└── rollbackLastSelection (Undo Action)
    └── createReplyOptions
```

## 5. Chat Flow Hierarchy

The conversation graph is defined as follows:

- **Initial State**: `[hello, tour, gallery, private]`
- **hello**: Stacey Greeting -> `[cute, photos, curious]`
- **tour**: Orientation -> `[photos, gallery]`
- **cute**: Flirt path -> `[tour, gallery]`
- **photos**: Content info -> `[gallery]`
- **curious**: Generic interest -> `[tour]`
- **gallery / private**: Terminal Nodes -> Trigger CTA Cards

## 6. Rollback Flow

1. User clicks the "Back" button or the Clear button.
2. `rollbackLastSelection` pops the last entry from `historyStack`.
3. It iterates through `responseNodes` (Stacey's messages/cards) and removes them from the DOM.
4. It removes the user's previous selection bubble and the option container.
5. It calls `createReplyOptions` using the `previousOptions` stored in the history object to restore the previous branching point.

## 7. Reset Flow

1. `clearPendingMembershipTimeout` is called to prevent ghost messages.
2. `chatMessages` innerHTML is cleared.
3. State arrays (`historyStack`, `currentReplyOptions`) are reset.
4. Three hard-coded greeting messages are sent.
5. The root level options are rendered via `createReplyOptions`.

## 8. Mobile Flow

1. `initChatPopup` detects a screen width $\le$ 768px.
2. A 1200ms delay is triggered.
3. `openPanel()` is called, adding the `.fullscreen` class and hiding the bubble.
4. `runWelcomeSequence()` executes an `await`-driven series of messages.

## 9. Drag Flow

1. `startDrag` captures the pointer position and relative offset.
2. `onDrag` updates the bubble position, clamped within safe screen boundaries.
3. A 6px movement threshold sets `dragStarted` to prevent accidental panel toggles.
4. `stopDrag` removes listeners and triggers `snapToEdge`.
5. `snapToEdge` determines the closest horizontal side and sets the bubble to `left: -65%` or `right: -65%` of its own width.

## 10. External Dependencies

- **CSS Styles**: Dependent on `assets/css/chat-popup.css` for animations (`bubbleFloat`, `typingBounce`), glassmorphism, and `.fullscreen` / `.active` states.
- **Tailwind CSS**: Used for utility classes in dynamically generated CTA cards.
- **scripts.js**: Provides the `bootChat` loader which ensures `initChatPopup` only runs after the component HTML has been injected.

## 11. DOM Element Dependencies

The script requires the following IDs to be present in the HTML:

| ID | Description |
| :--- | :--- |
| `chatBubble` | The floating trigger element. |
| `chatPanel` | The main glassmorphism panel. |
| `chatMessages` | The message list container. |
| `chatSuggestions` | Header chip area. |
| `closeChat` | Panel exit button. |
| `clearChat` | Rollback/Undo button. |
| `resetChat` | Conversation restart button. |
| `chatCtaArea` | Secondary container for CTAs. |

### Dynamically Generated Elements
- `.message-bubble.stacey`: Inbound messages.
- `.message-bubble.user`: Outbound user choices.
- `.chat-inline-options`: Wrapper for choice buttons.
- `.chat-cta-message`: Visual cards for Fanvue/Patreon links.
- `#typingBubble`: The temporary typing indicator node.
```

<!--
[PROMPT_SUGGESTION]Check for any discrepancies between chat-popup.js and the architecture document.[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Suggest improvements to the drag and snap logic for better mobile UX.[/PROMPT_SUGGESTION]
