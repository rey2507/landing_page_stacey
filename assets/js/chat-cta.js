/**
 * chat-cta.js
 * Manages Call-to-Action cards and timed membership sequences.
 */

let pendingMembershipTimeout = null;

window.clearPendingMembershipTimeout = function() {
    if (pendingMembershipTimeout !== null) {
        clearTimeout(pendingMembershipTimeout);
        pendingMembershipTimeout = null;
    }
};

window.showGalleryMessage = function() {
    if (!window.staceyChatInitialized) {
        if (typeof initChatPopup === "function") initChatPopup();
        else return;
    }

    if (typeof openPanel === "function") openPanel();

    const messages = document.getElementById("chatMessages");
    if (!messages) return;

    // Use the globally exposed message function
    if (typeof window.addMessageGlobal === 'function') {
        window.addMessageGlobal(
            "If you're curious, I do keep a private gallery with content that never appears here ✨"
        );
    }

    const card = document.createElement("div");
    card.className = "chat-cta-message";

    card.innerHTML = `
        <h4>Private Gallery</h4>
        <p>Exclusive content, extra photos, and private updates.</p>
        <a href="https://www.fanvue.com/lowkeyhotgirl" target="_blank" rel="noopener">
            View Gallery
        </a>
    `;

    messages.appendChild(card);

    // Record for rollback if enabled
    if (window.recordingResponse && window.historyStack && window.historyStack.length > 0) {
        window.historyStack[window.historyStack.length - 1].responseNodes.push(card);
    }

    window.clearPendingMembershipTimeout();
    pendingMembershipTimeout = setTimeout(() => {
        pendingMembershipTimeout = null;
        window.showMembershipMessage();
    }, 2500);
};

window.showMembershipMessage = function() {
    if (!window.staceyChatInitialized) {
        if (typeof initChatPopup === "function") initChatPopup();
        else return;
    }

    if (typeof openPanel === "function") openPanel();

    const messages = document.getElementById("chatMessages");
    if (!messages) return;

    if (typeof window.addMessageGlobal === 'function') {
        window.addMessageGlobal(
            "Some people also join my membership because they want more regular updates 💕"
        );
    }

    const card = document.createElement("div");
    card.className = "chat-cta-message";

    card.innerHTML = `
        <h4>Membership</h4>
        <p>Exclusive posts, updates, and extra content.</p>
        <a href="https://www.patreon.com/cw/lowkeyhotgirl" target="_blank" rel="noopener">
            Join Membership
        </a>
    `;

    messages.appendChild(card);

    if (window.recordingResponse && window.historyStack && window.historyStack.length > 0) {
        window.historyStack[window.historyStack.length - 1].responseNodes.push(card);
    }
};