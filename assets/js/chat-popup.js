function safeChatExecute(fn, label = "chat-op") {
    try {
        if (!window.__chatBootLocked) {
            console.warn(label + " blocked: chat not ready");
            return;
        }
        return fn();
    } catch (err) {
        console.error(label + " failed:", err);
    }
}

window.__chatFailRecovery = function () {
    console.warn("Recovering chat state...");
    if (typeof resetChat === "function") resetChat();
};

function initChatPopup() {
    if (window.__chatBootLocked) return;
    window.__chatBootLocked = false;

    if (window.staceyChatInitialized) return;
    window.staceyChatInitialized = true;

    window.createReplyOptions = createReplyOptions;

    // These variables are now globally exposed for chat-cta.js to integrate
    // and are managed directly on the window object.

    const bubble = document.getElementById("chatBubble");
    const panel = document.getElementById("chatPanel");
    const closeBtn = document.getElementById("closeChat");
    const clearBtn = document.getElementById("clearChat");
    const messages = document.getElementById("chatMessages");
    const suggestions = document.getElementById("chatSuggestions");
    const ctaArea = document.getElementById("chatCtaArea");
    const resetBtn =
    document.getElementById(
        "resetChat"
    );

    if (!bubble || !panel || !messages || !suggestions || !ctaArea) {
        console.error("Chat init failed: missing DOM elements");
        return;
    }

    let isDragging = false;
    let dragStarted = false;
    let hasDragged = false;

    let offsetX = 0;
    let offsetY = 0;

    let conversationCompleted = false; // This remains local
    let currentReplyOptions = [];

    const flows = {
        hello: {
            label: "👋 Hi Stacey",
            messages: ["Aww hey 😊", "I'm happy you stopped by.", "Tell me something...", "What made you click?"],
            nextOptions: ["cute", "photos", "curious"]
        },
        tour: {
            label: "📸 Show me around",
            messages: ["Most people start with my photos 📸", "Then they usually discover a few hidden things.", "Some of my favorite content isn't public."],
            nextOptions: ["photos", "gallery"]
        },
        gallery: {
            label: "✨ What's the surprise gallery?",
            messages: ["The private gallery is where I post things that never reach social media.", "A lot more personal.", "A little more fun too 😏"],
            nextOptions: []
        },
        private: {
            label: "🔥 Wanna see Private Gallery?",
            messages: ["Maybe 😏", "I keep some things away from the public page.", "If you're curious, here's where I share them 👇"],
            nextOptions: []
        },
        cute: {
            label: "You looked cute",
            messages: ["Stop it, you're making me blush 🙈", "But thank you..."],
            nextOptions: ["tour", "gallery"]
        },
        photos: {
            label: "Your photos",
            messages: ["The public gallery is a good start 📸", "There's also a private collection with extra content."],
            nextOptions: ["gallery"]
        },
        curious: {
            label: "Just curious",
            messages: ["Curiosity is a good thing!", "Let me show you around 💕"],
            nextOptions: ["tour"]
        },
        show_gallery: {
            label: "Show gallery",
            messages: ["If you're curious, I can show you where it is ✨"],
            nextOptions: []
        }
    };

    window.addMessageGlobal = function(text, type = "stacey") { // Assign to global var

        const msg = document.createElement("div");

        msg.className = `message-bubble ${type}`;
        msg.textContent = text;

        messages.appendChild(msg);
    
        if (window.recordingResponse && window.historyStack.length > 0 && type === "stacey") { // Use global recordingResponse and historyStack
            window.historyStack[window.historyStack.length - 1].responseNodes.push(msg);
        }
    
        messages.scrollTo({
            top: messages.scrollHeight,
            behavior: "smooth"
        });

        return msg;
    }

    // clearPendingMembershipTimeout, showGalleryMessage, showMembershipMessage are now in chat-cta.js

    async function handleFlow(flowKey) {
        const data = flows[flowKey];
        if (!data) return;

        for (const text of data.messages) {
            await sendStaceyMessage(text, 1200);
        }

        if (data.nextOptions?.length) {
            createReplyOptions(data.nextOptions);
            window.stopRollbackSession();
        } else {
            window.showGalleryMessage();
            window.stopRollbackSession(4000);
        }
    }

    function createReplyOptions(options = []) {
        currentReplyOptions = options;

        document
            .querySelectorAll(".chat-inline-options")
            .forEach(el => el.remove());

        const wrapper = document.createElement("div");
        wrapper.className = "chat-inline-options";

        options.forEach(key => {
            const data = flows[key];
            if (!data) return;
            const btn = document.createElement("button");
            btn.className = "chat-inline-option";
            btn.textContent = data.label;

            btn.addEventListener("click", (e) => {
                e.stopPropagation();

                const userBubble = window.addMessageGlobal(data.label, "user");

                wrapper.remove();

                window.startRollbackSession( // Use global recordingResponse and historyStack
                    userBubble,
                    options
                );
                safeChatExecute(
                    () => handleFlow(key),
                    "handleFlow"
                );
            });
            wrapper.appendChild(btn);
        });

        const backBtn = document.createElement("button");
        backBtn.className = "chat-inline-option back";
        backBtn.textContent = "← Back";
        backBtn.addEventListener("click", () => {
            safeChatExecute(() => window.rollbackLastSelection(), "rollback");
        });
        wrapper.appendChild(backBtn);

        messages.appendChild(wrapper);
        if (window.recordingResponse && window.historyStack.length > 0) { // Use global recordingResponse and historyStack
            const lastItem = window.historyStack[window.historyStack.length - 1];
            lastItem.responseNodes.push(wrapper);
            lastItem.optionWrapper = wrapper;
        }
        messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {

        if (document.getElementById("typingBubble")) return;

        const typing = document.createElement("div");

        typing.id = "typingBubble";
        typing.className = "message-bubble stacey";

        typing.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;

        messages.appendChild(typing);

        messages.scrollTo({
            top: messages.scrollHeight,
            behavior: "smooth"
        });
    }

    function hideTyping() {

        document
            .getElementById("typingBubble")
            ?.remove();
    }

    async function sendStaceyMessage(text, delay = 900) {

        showTyping();

        await new Promise(resolve =>
            setTimeout(resolve, delay)
        );

        hideTyping();

        window.addMessageGlobal(text, "stacey"); // Use global addMessage
    }

    function resetChat() {

        window.clearPendingMembershipTimeout();
        messages.innerHTML = "";
        window.historyStack = [];
        window.recordingResponse = false;
        currentReplyOptions = [];


        window.addMessageGlobal(
            "Hey 😊"
        );

        window.addMessageGlobal(
            "Thanks for stopping by."
        );

        window.addMessageGlobal(
            "Feel free to chat with me below 💕"
        );

        createReplyOptions([
            "hello",
            "tour",
            "gallery",
            "private"
        ]);
    }

    bubble.addEventListener(
        "click",
        () => {

            if (hasDragged) {

                hasDragged = false;
                return;
            }

            togglePanel();
        }
    );

    closeBtn?.addEventListener(
        "click",
        closePanel
    );

    resetBtn?.addEventListener(
        "click",
        resetChat
    );


    clearBtn?.addEventListener(
        "click",
        () => {
            safeChatExecute(
                () => window.rollbackLastSelection(),
                "rollback"
            );
        }
    );

    document.addEventListener(
        "keydown",
        (e) => {

            if (
                e.key === "Escape" &&
                panel.classList.contains("active")
            ) {
                closePanel();
            }
        }
    );

    document.addEventListener(
        "click",
        (e) => {

            if (
                panel.classList.contains("active") &&
                !panel.contains(e.target) &&
                !bubble.contains(e.target)
            ) {
                closePanel();
            }
        }
    );

    suggestions.addEventListener("click", (e) => {
        const chip = e.target.closest(".suggestion-chip");
        if (!chip) return;

        const flowKey = chip.dataset.flow;
        const userBubble = window.addMessageGlobal(chip.textContent, "user");
        window.startRollbackSession(userBubble, [...currentReplyOptions]);
        suggestions.innerHTML = "";
        safeChatExecute(
            () => handleFlow(flowKey),
            "handleFlow"
        );
    });

    bubble.addEventListener(
        "mousedown",
        startDrag
    );

    bubble.addEventListener(
        "touchstart",
        startDrag,
        { passive: false }
    );

    function startDrag(e) {

        isDragging = true;
        dragStarted = false;
        hasDragged = false;

        bubble.classList.add(
            "dragging"
        );

        const rect =
            bubble.getBoundingClientRect();

        const clientX =
            e.touches
                ? e.touches[0].clientX
                : e.clientX;

        const clientY =
            e.touches
                ? e.touches[0].clientY
                : e.clientY;

        offsetX =
            clientX - rect.left;

        offsetY =
            clientY - rect.top;

        document.addEventListener(
            "mousemove",
            onDrag
        );

        document.addEventListener(
            "touchmove",
            onDrag,
            { passive: false }
        );

        document.addEventListener(
            "mouseup",
            stopDrag
        );

        document.addEventListener(
            "touchend",
            stopDrag
        );
    }

    function onDrag(e) {

        if (!isDragging) return;

        const clientX =
            e.touches
                ? e.touches[0].clientX
                : e.clientX;

        const clientY =
            e.touches
                ? e.touches[0].clientY
                : e.clientY;

        const x = Math.min(
            Math.max(
                -(bubble.offsetWidth * 0.7),
                clientX - offsetX
            ),
            window.innerWidth - bubble.offsetWidth * 0.3
        );

        const y = Math.min(
            Math.max(
                20,
                clientY - offsetY
            ),
            window.innerHeight -
            bubble.offsetHeight -
            20
        );

        if (!dragStarted) {

            const rect =
                bubble.getBoundingClientRect();

            const dist =
                Math.hypot(
                    x - rect.left,
                    y - rect.top
                );

            if (dist > 6) {
                dragStarted = true;
            }
        }

        if (!dragStarted) return;

        bubble.style.left = x + "px";
        bubble.style.top = y + "px";
        bubble.style.right = "auto";
        bubble.style.bottom = "auto";

        hasDragged = true;
    }

    function stopDrag() {

        if (!isDragging) return;

        isDragging = false;

        if (dragStarted) {
            snapToEdge();
        }

        bubble.classList.remove(
            "dragging"
        );

        document.removeEventListener(
            "mousemove",
            onDrag
        );

        document.removeEventListener(
            "touchmove",
            onDrag
        );

        document.removeEventListener(
            "mouseup",
            stopDrag
        );

        document.removeEventListener(
            "touchend",
            stopDrag
        );
    }

    function snapToEdge() {

        const rect =
            bubble.getBoundingClientRect();

        const screenW =
            window.innerWidth;

        const screenH =
            window.innerHeight;

        const snapLeft =
            rect.left <
            screenW / 2;

        const hiddenPart =
            bubble.offsetWidth * 0.65;

        const finalX =
            snapLeft
                ? -hiddenPart
                : screenW -
                  rect.width +
                  hiddenPart;

        const finalY =
            Math.min(
                Math.max(
                    20,
                    rect.top
                ),
                screenH -
                rect.height -
                20
            );

        bubble.style.left =
            finalX + "px";

        bubble.style.top =
            finalY + "px";

        bubble.style.right =
            "auto";

        bubble.style.bottom =
            "auto";
    }

    async function runWelcomeSequence() {

        messages.innerHTML = "";
        window.historyStack = [];
        window.recordingResponse = false;

        await sendStaceyMessage(
            "Hey 😊"
        );

        await sendStaceyMessage(
            "You actually caught me online."
        );

        await sendStaceyMessage(
            "Most people are here because they're curious 👀"
        );

        await sendStaceyMessage(
            "Tap one of the options below and I'll show you around 💕"
        );

        createReplyOptions([
            "hello",
            "tour",
            "gallery",
            "private"
        ]);
    }

    setTimeout(() => {
        openPanel();
        if (window.innerWidth <= 768) {
            runWelcomeSequence();
        } else {
            resetChat();
        }
    }, 1200);

    window.__chatBootLocked = true;
}