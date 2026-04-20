import { getAdoptionApplications, getHelpRequests } from "../core/api.js";
import { formatDate } from "../core/utils.js";
import { renderPageLayout, renderSectionShell } from "../components/layout.js";

function escapeAdmin(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatAdminDate(value) {
    if (!value) {
        return "—";
    }

    try {
        return formatDate(value);
    } catch {
        return escapeAdmin(value);
    }
}

function renderAdminStat(label, value, accent = "") {
    return `
        <article class="admin-stat-card reveal" data-reveal>
            <span class="admin-stat-card__label">${escapeAdmin(label)}</span>
            <strong class="admin-stat-card__value ${accent}">${escapeAdmin(value)}</strong>
        </article>
    `;
}

function renderAdminTable(title, lead, rows, columns) {
    if (!rows.length) {
        return `
            <section class="admin-panel-card reveal" data-reveal>
                <div class="stack">
                    <div>
                        <h3 class="card__title">${escapeAdmin(title)}</h3>
                        <p class="meta-copy">${escapeAdmin(lead)}</p>
                    </div>
                    <div class="admin-empty-state">
                        Записей пока нет. Как только кто-то заполнит форму, данные появятся здесь автоматически.
                    </div>
                </div>
            </section>
        `;
    }

    return `
        <section class="admin-panel-card admin-table-card reveal" data-reveal>
            <div class="stack">
                <div class="admin-panel-card__head">
                    <div>
                        <h3 class="card__title">${escapeAdmin(title)}</h3>
                        <p class="meta-copy">${escapeAdmin(lead)}</p>
                    </div>
                    <span class="chip is-brand">${rows.length} записей</span>
                </div>
                <div class="admin-table-wrapper">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                ${columns.map((column) => `<th>${escapeAdmin(column.label)}</th>`).join("")}
                            </tr>
                        </thead>
                        <tbody>
                            ${rows
                                .map(
                                    (row) => `
                                        <tr>
                                            ${columns
                                                .map((column) => {
                                                    const value = typeof column.render === "function"
                                                        ? column.render(row)
                                                        : row[column.key];
                                                    return `<td>${escapeAdmin(value)}</td>`;
                                                })
                                                .join("")}
                                        </tr>
                                    `
                                )
                                .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    `;
}

function renderJsonBlock(title, filePath, payload) {
    return `
        <section class="admin-panel-card reveal" data-reveal>
            <div class="stack">
                <div class="admin-panel-card__head">
                    <div>
                        <h3 class="card__title">${escapeAdmin(title)}</h3>
                        <p class="meta-copy">Источник данных: <code>${escapeAdmin(filePath)}</code></p>
                    </div>
                </div>
                <pre class="admin-json-block">${escapeAdmin(JSON.stringify(payload, null, 2))}</pre>
            </div>
        </section>
    `;
}

function renderRecentFeed(items) {
    if (!items.length) {
        return `
            <div class="admin-empty-state">
                Пока нет новых событий для ленты.
            </div>
        `;
    }

    return `
        <div class="admin-feed">
            ${items
                .map(
                    (item) => `
                        <article class="admin-feed__item">
                            <div class="admin-feed__meta">
                                <span class="chip ${item.kind === "help" ? "is-accent" : "is-brand"}">${item.kind === "help" ? "Помощь" : "Пристройство"}</span>
                                <span>${escapeAdmin(formatAdminDate(item.createdAt))}</span>
                            </div>
                            <strong>${escapeAdmin(item.name || "Без имени")}</strong>
                            <span class="meta-copy">${escapeAdmin(item.message || item.helpType || item.petType || "Без комментария")}</span>
                        </article>
                    `
                )
                .join("")}
        </div>
    `;
}

export async function renderAdminPage({ site }) {
    const [adoptionApplications, helpRequests] = await Promise.all([
        getAdoptionApplications(),
        getHelpRequests()
    ]);

    const adoptionRows = [...adoptionApplications].reverse();
    const helpRows = [...helpRequests].reverse();
    const latestEntries = [...adoptionRows.map((item) => ({ ...item, kind: "adoption" })), ...helpRows.map((item) => ({ ...item, kind: "help" }))]
        .sort((left, right) => String(right.createdAt ?? "").localeCompare(String(left.createdAt ?? "")))
        .slice(0, 6);

    const latestRecord = latestEntries[0]?.createdAt ? formatAdminDate(latestEntries[0].createdAt) : "Пока нет";

    const content = `
        ${renderSectionShell({
            eyebrow: "JSON-база заявок",
            title: "Админ-панель с живыми данными из JSON-хранилища",
            lead: "Здесь видно, кто и что отправил через формы сайта. Это уже не абстрактная БД на словах, а конкретные записи из файлов storage.",
            className: "admin-section-shell",
            content: `
                <div class="admin-stat-grid">
                    ${renderAdminStat("Анкет на пристройство", adoptionRows.length, "is-brand")}
                    ${renderAdminStat("Заявок на помощь", helpRows.length, "is-accent")}
                    ${renderAdminStat("Всего записей", adoptionRows.length + helpRows.length)}
                    ${renderAdminStat("Последняя активность", latestRecord)}
                </div>
            `
        })}
        <section class="section">
            <div class="container">
                <div class="admin-dashboard-grid">
                    ${renderAdminTable(
                        "Анкеты на пристройство",
                        "Все записи из storage/adoption-applications.json",
                        adoptionRows,
                        [
                            { key: "createdAt", label: "Дата", render: (row) => formatAdminDate(row.createdAt) },
                            { key: "name", label: "Имя" },
                            { key: "phone", label: "Телефон" },
                            { key: "email", label: "Email" },
                            { key: "petType", label: "Тип питомца" },
                            { key: "selectedPet", label: "Выбранный питомец" },
                            { key: "message", label: "Комментарий" }
                        ]
                    )}
                    <section class="admin-panel-card reveal" data-reveal>
                        <div class="stack">
                            <div class="admin-panel-card__head">
                                <div>
                                    <h3 class="card__title">Последние действия</h3>
                                    <p class="meta-copy">Сводная лента по всем формам сайта.</p>
                                </div>
                                <button class="button button--secondary button--small" type="button" data-admin-refresh>
                                    Обновить
                                </button>
                            </div>
                            ${renderRecentFeed(latestEntries)}
                        </div>
                    </section>
                </div>
            </div>
        </section>
        <section class="section">
            <div class="container">
                <div class="admin-dashboard-grid">
                    ${renderAdminTable(
                        "Заявки на помощь",
                        "Все записи из storage/help-requests.json",
                        helpRows,
                        [
                            { key: "createdAt", label: "Дата", render: (row) => formatAdminDate(row.createdAt) },
                            { key: "name", label: "Имя" },
                            { key: "email", label: "Email" },
                            { key: "phone", label: "Телефон" },
                            { key: "helpType", label: "Тип помощи" },
                            { key: "amount", label: "Сумма" },
                            { key: "message", label: "Комментарий" }
                        ]
                    )}
                    ${renderJsonBlock("Сырой JSON: анкеты", "storage/adoption-applications.json", adoptionRows)}
                    ${renderJsonBlock("Сырой JSON: помощь", "storage/help-requests.json", helpRows)}
                </div>
            </div>
        </section>
    `;

    return {
        markup: renderPageLayout({
            pageKey: "admin",
            site,
            hero: {
                eyebrow: "Админ-панель",
                title: "Все заявки сайта в одном месте",
                lead: "Панель подтягивает реальные данные из JSON-хранилища и показывает, кто отправил форму, когда и с каким содержанием.",
                actions: [
                    { href: "/help/", label: "Перейти к форме помощи", variant: "secondary" },
                    { href: "/adopt/", label: "Перейти к анкете", variant: "primary" }
                ],
                note: {
                    title: "Что здесь видно",
                    items: [
                        "Анкеты на пристройство",
                        "Заявки на помощь приюту",
                        "Сырые JSON-данные для прозрачной проверки"
                    ]
                }
            },
            content
        }),
        hydrate() {
            const refreshButton = document.querySelector("[data-admin-refresh]");

            if (!refreshButton) {
                return;
            }

            refreshButton.addEventListener("click", () => {
                window.location.reload();
            });
        }
    };
}
