import { escapeHtml } from "../core/utils.js";

function appendMessage(messagesRoot, text, isUser = false) {
    const wrapper = document.createElement("div");
    wrapper.className = `chat-message${isUser ? " chat-message--user" : ""}`;
    wrapper.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
    messagesRoot.appendChild(wrapper);
    messagesRoot.scrollTop = messagesRoot.scrollHeight;
}

function findAnswer(question, faq) {
    const normalized = question.toLowerCase();

    const matched = faq.responses.find((item) =>
        item.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
    );

    return matched?.answer ?? faq.fallback;
}

export function initChatWidget(faq) {
    const widget = document.querySelector("[data-chat]");
    const toggle = document.querySelector("[data-chat-toggle]");
    const panel = widget?.querySelector(".chat-widget__panel");
    const messages = document.querySelector("[data-chat-messages]");
    const quick = document.querySelector("[data-chat-quick]");
    const form = document.querySelector("[data-chat-form]");
    const input = document.querySelector("[data-chat-input]");

    if (!widget || !toggle || !panel || !messages || !quick || !form || !input) {
        return;
    }

    messages.innerHTML = "";
    appendMessage(messages, faq.greeting);

    quick.innerHTML = faq.quickQuestions
        .map(
            (question) => `
                <button type="button" data-chat-question="${escapeHtml(question)}">
                    ${escapeHtml(question)}
                </button>
            `
        )
        .join("");

    toggle.addEventListener("click", () => {
        const isOpen = widget.classList.toggle("is-open");
        panel.setAttribute("aria-hidden", String(!isOpen));

        if (isOpen) {
            input.focus();
        }
    });

    quick.querySelectorAll("[data-chat-question]").forEach((button) => {
        button.addEventListener("click", () => {
            const question = button.getAttribute("data-chat-question");

            if (!question) {
                return;
            }

            input.value = question;
            form.requestSubmit();
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const question = input.value.trim();

        if (!question) {
            return;
        }

        appendMessage(messages, question, true);
        input.value = "";

        window.setTimeout(() => {
            appendMessage(messages, findAnswer(question, faq));
        }, 320);
    });
}
