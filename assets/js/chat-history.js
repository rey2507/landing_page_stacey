/**
 * assets/js/chat-history.js
 * Module for managing conversation history and undo/rollback functionality.
 */

window.historyStack = [];
window.recordingResponse = false;
let stopTimeout = null;

window.startRollbackSession = function(userMessage, previousOptions) {
    if (stopTimeout) {
        clearTimeout(stopTimeout);
        stopTimeout = null;
    }

    if (typeof window.clearPendingMembershipTimeout === 'function') {
        window.clearPendingMembershipTimeout();
    }
    
    window.historyStack.push({
        userBubble: userMessage,
        responseNodes: [],
        previousOptions: previousOptions ? [...previousOptions] : [],
        optionWrapper: null
    });
    window.recordingResponse = true;
};

window.stopRollbackSession = function(delay = 0) {
    if (stopTimeout) clearTimeout(stopTimeout);

    if (delay > 0) {
        stopTimeout = setTimeout(() => {
            window.recordingResponse = false;
            stopTimeout = null;
        }, delay);
    } else {
        window.recordingResponse = false;
    }
};

window.rollbackLastSelection = function() {
    if (window.historyStack.length === 0) return;

    if (stopTimeout) {
        clearTimeout(stopTimeout);
        stopTimeout = null;
    }

    if (typeof window.clearPendingMembershipTimeout === 'function') {
        window.clearPendingMembershipTimeout();
    }

    const lastItem = window.historyStack.pop();

    lastItem.responseNodes
        .slice()
        .reverse()
        .forEach(node => node.remove());

    lastItem.userBubble?.remove();
    lastItem.optionWrapper?.remove();

    window.recordingResponse = false;

    const suggestions = document.getElementById("chatSuggestions");
    if (suggestions) {
        suggestions.innerHTML = "";
    }

    if (
        lastItem.previousOptions &&
        lastItem.previousOptions.length
    ) {
        if (typeof window.createReplyOptions === 'function') {
            window.createReplyOptions(
                lastItem.previousOptions
            );
        }
    }

    const messages = document.getElementById("chatMessages");
    if (messages) {
        messages.scrollTo({
            top: messages.scrollHeight,
            behavior: "smooth"
        });
    }
};