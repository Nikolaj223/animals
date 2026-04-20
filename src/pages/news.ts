import { getNews } from "../core/api.js";
import { renderNewsCard } from "../components/cards.js";
import { renderPageLayout, renderSectionShell } from "../components/layout.js";

export async function renderNewsPage({ site }) {
    const news = await getNews();

    const content = `
        ${renderSectionShell({
            eyebrow: "Лента событий",
            title: "Пять новостей с фотографиями и смыслом",
            lead: "Раздел показывает, что приют живой: здесь есть волонтеры, обновления, события и реальные истории изменений.",
            content: `
                <div class="news-highlight">
                    <div class="media-card">
                        <img src="${news[0].image}" alt="${news[0].title}">
                    </div>
                    <div class="stack">
                        <span class="chip is-brand">${news[0].badge}</span>
                        <h3 class="card__title">${news[0].title}</h3>
                        <p class="meta-copy">${news[0].summary}</p>
                        <div class="stack">
                            ${news[0].highlights
                                .map((point) => `<div class="chip is-accent">${point}</div>`)
                                .join("")}
                        </div>
                    </div>
                </div>
                <div class="news-grid">${news.map(renderNewsCard).join("")}</div>
            `
        })}
    `;

    return {
        markup: renderPageLayout({
            pageKey: "news",
            site,
            hero: {
                eyebrow: "Новости",
                title: "Сайт показывает жизнь приюта не словами, а событиями",
                lead: "Здесь мы рассказываем о жизни приюта, историях питомцев и важных событиях команды.",
                actions: [
                    { href: "/catalog/", label: "Перейти в каталог", variant: "primary" },
                    { href: "/help/", label: "Помочь приюту", variant: "secondary" }
                ],
                note: {
                    title: "В разделе",
                    items: [
                        "Истории питомцев и счастливых переездов",
                        "Новости волонтеров и важных событий",
                        "Короткие итоги с фотографиями"
                    ]
                }
            },
            content
        })
    };
}
