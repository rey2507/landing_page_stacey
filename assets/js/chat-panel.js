// These functions control the chat panel's visibility and state.
// They query for 'panel' and 'bubble' directly as they are moved out of the initChatPopup's closure.

function openPanel() {
    const panel = document.getElementById("chatPanel");
    const bubble = document.getElementById("chatBubble");
    if (!panel || !bubble) return; // Safety check for DOM elements

    panel.classList.add("active");
    panel.classList.add("fullscreen"); // Always add fullscreen
    bubble.style.display = "none"; // Always hide bubble when panel is open

    panel.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "chat-open"
    );
}

function closePanel() {
    const panel = document.getElementById("chatPanel");
    const bubble = document.getElementById("chatBubble");
    if (!panel || !bubble) return; // Safety check for DOM elements

    panel.classList.remove("active");
    panel.classList.remove("fullscreen"); // Always remove fullscreen
    bubble.style.display = ""; // Always show bubble when panel is closed
    panel.setAttribute(
        "aria-hidden",
        "true"
    );

    bubble.style.display = "";

    document.body.classList.remove(
        "chat-open"
    );
}

function togglePanel() {
    const panel = document.getElementById("chatPanel");
    if (!panel) return; // Safety check for DOM element

    if (
        panel.classList.contains("active")
    ) {
        closePanel();
    } else {
        openPanel();
    }
}