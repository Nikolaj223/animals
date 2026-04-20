import { renderHelpCard } from "../components/cards.js";
import { renderHelpForm } from "../components/forms.js";
import { renderPageLayout, renderSectionShell } from "../components/layout.js";

export async function renderHelpPage({ site }) {
    const content = `
        ${renderSectionShell({
            eyebrow: "Реквизиты",
            title: "Все способы помощи собраны в одном месте",
            lead: "На странице есть и реквизиты, и рабочая онлайн-форма. Дальше сюда можно безболезненно подключить почту или CRM.",
            content: `
                <div class="requisites-grid">
                    ${site.payments
                        .map(
                            (item) => `
                                <article class="requisite-card reveal" data-reveal>
                                    <span class="requisite-card__label">${item.label}</span>
                                    <span class="requisite-card__value">${item.value}</span>
                                </article>
                            `
                        )
                        .join("")}
                </div>
            `
        })}
        ${renderSectionShell({
            eyebrow: "Направления помощи",
            title: "Можно выбрать удобный формат поддержки",
            lead: "Финансы, лекарства, волонтерство — блок адаптирован под реальный разговор с посетителем сайта.",
            content: `<div class="help-grid">${site.helpOptions.map(renderHelpCard).join("")}</div>`
        })}
        <section class="section">
            <div class="container">
                ${renderHelpForm()}
            </div>
        </section>
    `;

    return {
        markup: renderPageLayout({
            pageKey: "help",
            site,
            hero: {
                eyebrow: "Помощь приюту",
                title: "Финансовая, предметная и волонтерская поддержка без путаницы",
                lead: "Раздел сделан так, чтобы человек быстро понял, как помочь, и мог сразу отправить заявку через форму.",
                actions: [
                    { href: "#help-form", label: "Открыть форму", variant: "primary" },
                    { href: "/catalog/", label: "Посмотреть животных", variant: "secondary" }
                ],
                note: {
                    title: "Что уже реализовано",
                    items: [
                        "Реквизиты на странице",
                        "Рабочая форма с сохранением в JSON",
                        "Отдельный путь для дальнейшего подключения email"
                    ]
                }
            },
            content
        })
    };
}
