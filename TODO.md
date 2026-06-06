# TODO - Chat Popup Rollback

- [ ] Remove chat placeholder from `index.html`
- [ ] Remove chat component loading from `assets/js/scripts.js` (`chat-popup-container`, chat mapping, and `initChatPopup()` call)
- [x] Remove chat component loading from `assets/js/scripts.js` (rollback completed by rewriting file)
- [ ] Delete the entire `initChatPopup()` function (and any chat-only code in `scripts.js`)
- [x] Delete `components/chat-popup.html`
- [x] Delete `assets/css/chat-popup.css`
- [x] Remove `@import url('./chat-popup.css');` from `assets/css/styles.css`
- [x] Verify no remaining `chat-popup` / `chatBubble` / `chatBody` / `chatFooter` / `initChatPopup` references in the project
- [ ] Final manual verification: navbar, floating bar, gallery/lightbox, scroll reveal, and pre-existing analytics still behave correctly

