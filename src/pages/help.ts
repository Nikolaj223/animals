import { renderHelpCard } from "../components/cards.js";
import { renderHelpForm } from "../components/forms.js";
import { renderPageLayout, renderSectionShell } from "../components/layout.js";

export async function renderHelpPage({ site }) {
    const content = `
        ${renderSectionShell({
            eyebrow: "Реквизиты",
            title: "Все способы помощи собраны в одном месте",
            lead: "Выберите удобный способ поддержки: пожертвование, вещи первой необходимости или помощь делом.",
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
                lead: "Мы будем рады любой поддержке: финансовой, предметной или волонтерской.",
                actions: [
                    { href: "#help-form", label: "Открыть форму", variant: "primary" },
                    { href: "/catalog/", label: "Посмотреть животных", variant: "secondary" }
                ],
                note: {
                    title: "Как можно помочь",
                    items: [
                        "Сделать пожертвование",
                        "Передать корм, лекарства или вещи",
                        "Присоединиться как волонтер"
                    ]
                }
            },
            content
        })
    };
}
