import { escapeHtml, renderChipList } from "../core/utils.js";

const navigation = [
    { key: "home", href: "/", label: "Главная" },
    { key: "about", href: "/about/", label: "О приюте" },
    { key: "news", href: "/news/", label: "Новости" },
    { key: "catalog", href: "/catalog/", label: "Каталог животных" },
    { key: "help", href: "/help/", label: "Помощь приюту" }
];

function renderAction(action) {
    return `<a class="button button--${escapeHtml(action.variant ?? "secondary")}" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`;
}

function renderHeader(pageKey, site) {
    return `
        <header class="site-header">
            <div class="container-wide site-header__inner">
                <a class="brand" href="/">
                    <span class="brand__mark">ЛП</span>
                    <span>
                        <span class="brand__title">${escapeHtml(site.brand.name)}</span>
                        <span class="brand__subtitle">${escapeHtml(site.brand.tagline)}</span>
                    </span>
                </a>
                <button
                    class="nav-toggle"
                    type="button"
                    aria-expanded="false"
                    aria-label="Открыть навигацию"
                    data-nav-toggle
                >
                    ☰
                </button>
                <nav class="site-nav" data-site-nav>
                    ${navigation
                        .map(
                            (item) => `
                                <a class="site-nav__link${pageKey === item.key ? " is-active" : ""}" href="${item.href}">
                                    ${escapeHtml(item.label)}
                                </a>
                            `
                        )
                        .join("")}
                </nav>
                <a class="button button--primary header-cta" href="/adopt/">Хочу приютить</a>
            </div>
        </header>
    `;
}

function renderHero(hero) {
    if (!hero) {
        return "";
    }

    return `
        <section class="hero">
            <div class="container-wide">
                <div class="hero__panel reveal" data-reveal>
                    <div class="hero__content">
                        <div class="hero__copy">
                            <span class="eyebrow">${escapeHtml(hero.eyebrow)}</span>
                            <h1 class="hero-title">${escapeHtml(hero.title)}</h1>
                            <p class="hero-lead">${escapeHtml(hero.lead)}</p>
                            ${hero.actions?.length ? `<div class="hero__actions">${hero.actions.map(renderAction).join("")}</div>` : ""}
                            ${hero.facts?.length ? `<div class="hero__facts">${renderChipList(hero.facts)}</div>` : ""}
                        </div>
                        ${
                            hero.note
                                ? `
                                    <aside class="hero__aside">
                                        <div class="hero-note">
                                            <div class="hero-note__title">${escapeHtml(hero.note.title)}</div>
                                            <ul class="hero-note__list">
                                                ${hero.note.items
                                                    .map(
                                                        (item) => `
                                                            <li class="hero-note__item">
                                                                <span>•</span>
                                                                <span>${escapeHtml(item)}</span>
                                                            </li>
                                                        `
                                                    )
                                                    .join("")}
                                            </ul>
                                        </div>
                                    </aside>
                                `
                                : ""
                        }
                    </div>
                </div>
            </div>
        </section>
    `;
}

export function renderSectionShell({ eyebrow, title, lead = "", content, className = "" }) {
    return `
        <section class="section">
            <div class="container">
                <div class="section-shell ${className} reveal" data-reveal>
                    <div class="section-head">
                        ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
                        <h2 class="section-title">${escapeHtml(title)}</h2>
                        ${lead ? `<p class="section-lead">${escapeHtml(lead)}</p>` : ""}
                    </div>
                    ${content}
                </div>
            </div>
        </section>
    `;
}

export function renderQuoteBand(quote) {
    return `
        <section class="section">
            <div class="container">
                <div class="quote-band reveal" data-reveal>
                    <p class="quote-band__text">${escapeHtml(quote.text)}</p>
                    <strong>${escapeHtml(quote.author)}</strong>
                </div>
            </div>
        </section>
    `;
}

function renderFooter(site) {
    return `
        <footer class="footer">
            <div class="container-wide">
                <div class="footer__panel">
                    <section>
                        <h2 class="footer__title">${escapeHtml(site.brand.name)}</h2>
                        <p class="footer__copy">
                            Современный сайт приюта с каталогом животных, честной медицинской картой и рабочими формами
                            заявок.
                        </p>
                        <p class="footer__note">Основан в ${escapeHtml(site.brand.founded)} году, ${escapeHtml(site.brand.city)}.</p>
                    </section>
                    <section>
                        <h2 class="footer__title">Контакты</h2>
                        <ul class="footer__list">
                            <li>${escapeHtml(site.contacts.phone)}</li>
                            <li>${escapeHtml(site.contacts.email)}</li>
                            <li>${escapeHtml(site.contacts.address)}</li>
                            <li>${escapeHtml(site.contacts.schedule)}</li>
                        </ul>
                    </section>
                    <section>
                        <h2 class="footer__title">Разделы</h2>
                        <ul class="footer__list">
                            ${navigation
                                .map((item) => `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`)
                                .join("")}
                            <li><a href="/adopt/">Хочу приютить</a></li>
                            <li><a href="/admin/">Админ-панель</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </footer>
    `;
}

export function renderChatWidget() {
    return `
        <div class="chat-widget" data-chat>
            <button type="button" class="button button--primary chat-widget__toggle" data-chat-toggle>
                Задать вопрос
            </button>
            <div class="chat-widget__panel" aria-hidden="true">
                <div class="chat-widget__head">
                    <strong>Задайте вопрос</strong>
                    <div>Подскажу по пристройству, посещению и помощи приюту.</div>
                </div>
                <div class="chat-widget__body" data-chat-messages></div>
                <div class="chat-widget__quick" data-chat-quick></div>
                <form class="chat-widget__form" data-chat-form>
                    <label class="visually-hidden" for="chat-question">Ваш вопрос</label>
                    <input id="chat-question" type="text" name="question" data-chat-input placeholder="Задайте вопрос">
                    <button type="submit" class="button button--secondary button--small">Отправить</button>
                </form>
            </div>
        </div>
    `;
}

export function renderPageLayout({ pageKey, site, hero, content }) {
    return `
        <div class="page-shell">
            ${renderHeader(pageKey, site)}
            ${renderHero(hero)}
            <main>${content}</main>
            ${renderFooter(site)}
            ${renderChatWidget()}
        </div>
    `;
}

export function initSiteChrome() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-site-nav]");

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
}
