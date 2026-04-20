import { renderMetricGrid, renderTimelineCard, renderValueCard } from "../components/cards.js";
import { renderPageLayout, renderQuoteBand, renderSectionShell } from "../components/layout.js";

export async function renderAboutPage({ site }) {
    const content = `
        <section class="section">
            <div class="container">
                ${renderMetricGrid(site.stats)}
            </div>
        </section>
        ${renderSectionShell({
            eyebrow: "Что важно команде",
            title: "Не просто спасение, а полноценный путь до новой семьи",
            lead: "Мы помогаем животным пройти путь от спасения и лечения до спокойной жизни в новой семье.",
            content: `<div class="value-grid">${site.values.map(renderValueCard).join("")}</div>`
        })}
        ${renderSectionShell({
            eyebrow: "Как проходит путь питомца",
            title: "От карантина до договора пристройства",
            lead: "Так будущие хозяева понимают, как мы заботимся о питомцах на каждом этапе.",
            content: `<div class="timeline">${site.timeline.map(renderTimelineCard).join("")}</div>`
        })}
        ${renderSectionShell({
            eyebrow: "Фотографии приюта",
            title: "Фотографии приюта и животных",
            lead: "",
            content: `
                <div class="media-grid">
                    <div class="media-card">
                        <img src="/assets/media/shelter-overview.jpg" alt="Общий вид приюта">
                    </div>
                    <div class="media-grid__stack">
                        <div class="media-card">
                            <img src="/assets/media/volunteers.jpg" alt="Волонтеры помогают животным">
                        </div>
                        <div class="media-card">
                            <img src="/assets/media/dogs-group.jpg" alt="Собаки в приюте">
                        </div>
                    </div>
                </div>
            `
        })}
        ${renderQuoteBand(site.quote)}
    `;

    return {
        markup: renderPageLayout({
            pageKey: "about",
            site,
            hero: {
                eyebrow: "О приюте",
                title: "Приют, в котором важны забота, прозрачность и уважение к каждому питомцу",
                lead: "Здесь мы рассказываем о миссии, ценностях и ежедневной работе команды простым и человеческим языком.",
                actions: [
                    { href: "/catalog/", label: "Открыть каталог", variant: "primary" },
                    { href: "/help/", label: "Поддержать приют", variant: "secondary" }
                ],
                note: {
                    title: "Что для нас важно",
                    items: [
                        "Бережное отношение к каждому животному",
                        "Открытая и понятная работа команды",
                        "Подготовка питомцев к спокойной жизни дома"
                    ]
                }
            },
            content
        })
    };
}
