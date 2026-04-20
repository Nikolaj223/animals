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
            lead: "Страница «О приюте» объясняет заказчику и посетителям, почему у проекта есть доверие и понятная система работы.",
            content: `<div class="value-grid">${site.values.map(renderValueCard).join("")}</div>`
        })}
        ${renderSectionShell({
            eyebrow: "Как проходит путь питомца",
            title: "От карантина до договора пристройства",
            lead: "Эту логику мы показываем не списком ради списка, а как прозрачный процесс, который снимает тревогу у будущих хозяев.",
            content: `<div class="timeline">${site.timeline.map(renderTimelineCard).join("")}</div>`
        })}
        ${renderSectionShell({
            eyebrow: "Пространство приюта",
            title: "Визуальный блок с атмосферой и человеческим лицом проекта",
            lead: "Фотографии собраны в асимметричную сетку, чтобы страница не выглядела шаблонной.",
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
                title: "Прозрачный, человечный и аккуратно собранный digital-образ приюта",
                lead: "Здесь мы объясняем миссию, показываем цифры, ценности и рабочий процесс команды без ощущения формальной справки.",
                actions: [
                    { href: "/catalog/", label: "Открыть каталог", variant: "primary" },
                    { href: "/help/", label: "Поддержать приют", variant: "secondary" }
                ],
                note: {
                    title: "Ключевая идея страницы",
                    items: [
                        "Снять тревогу у будущего хозяина",
                        "Показать системный подход команды",
                        "Сделать доверие к приюту визуально ощутимым"
                    ]
                }
            },
            content
        })
    };
}
