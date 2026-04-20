import { getAnimals, getNews } from "../core/api.js";
import { renderHelpCard, renderMetricGrid, renderNewsCard, renderAnimalCard } from "../components/cards.js";
import { renderPageLayout, renderQuoteBand, renderSectionShell } from "../components/layout.js";

export async function renderHomePage({ site }) {
    const [animals, news] = await Promise.all([getAnimals(), getNews()]);
    const featuredAnimals = animals.filter((animal) => animal.featured).slice(0, 3);
    const latestNews = news.slice(0, 3);

    const content = `
        <section class="section">
            <div class="container">
                ${renderMetricGrid(site.stats)}
            </div>
        </section>
        ${renderSectionShell({
            eyebrow: "Животные, готовые к дому",
            title: "Карточки с честной информацией, а не просто милыми фото",
            lead: "У каждого питомца есть своя подробная страница с породой, весом, прививками, перенесенными заболеваниями и заметками по характеру.",
            content: `<div class="card-grid home-animal-grid">${featuredAnimals.map(renderAnimalCard).join("")}</div>`
        })}
        ${renderSectionShell({
            eyebrow: "Как мы работаем",
            title: "От спасения до спокойной адаптации дома",
            lead: "Приют устроен так, чтобы новый хозяин видел не только внешность животного, но и всю важную бытовую и медицинскую информацию.",
            content: `
                <div class="about-layout">
                    <div class="stack">
                        <p class="meta-copy">
                            Сначала питомец проходит осмотр, лечение и социализацию. Только потом мы публикуем карточку и начинаем
                            знакомить его с будущими семьями.
                        </p>
                        <div class="stack">
                            ${site.adoptionSteps
                                .map(
                                    (step, index) => `
                                        <div class="chip ${index % 2 === 0 ? "is-brand" : "is-accent"}">${index + 1}. ${step}</div>
                                    `
                                )
                                .join("")}
                        </div>
                    </div>
                    <div class="media-grid">
                        <div class="media-card">
                            <img src="/assets/media/dogs-group.jpg" alt="Собаки в приюте">
                        </div>
                        <div class="media-grid__stack">
                            <div class="media-card">
                                <img src="/assets/media/cats-group.png" alt="Кошки в приюте">
                            </div>
                            <div class="media-card">
                                <img src="/assets/media/volunteers.jpg" alt="Команда волонтеров">
                            </div>
                        </div>
                    </div>
                </div>
            `
        })}
        ${renderSectionShell({
            eyebrow: "Поддержка приюта",
            title: "Помочь можно деньгами, делом или регулярной заботой",
            lead: "На отдельной странице уже собраны реквизиты и рабочая форма заявки на помощь.",
            content: `<div class="help-grid">${site.helpOptions.map(renderHelpCard).join("")}</div><div class="page-cta"><a class="button button--primary" href="/help/">Перейти к помощи приюту</a></div>`
        })}
        ${renderSectionShell({
            eyebrow: "Последние новости",
            title: "Показываем живую работу приюта, а не пустой раздел-заглушку",
            lead: "Пять новостей уже готовы в формате визуальных карточек с фото и ключевыми итогами.",
            content: `<div class="news-grid">${latestNews.map(renderNewsCard).join("")}</div><div class="page-cta"><a class="button button--secondary" href="/news/">Смотреть все новости</a></div>`
        })}
        ${renderQuoteBand(site.quote)}
    `;

    const hero = {
        eyebrow: site.hero.eyebrow,
        title: site.hero.title,
        lead: site.hero.description,
        actions: [
            { href: "/adopt/", label: "Хочу приютить", variant: "primary" },
            { href: "/catalog/", label: "Смотреть каталог", variant: "secondary" }
        ],
        facts: site.stats.slice(0, 3).map((item) => `${item.value} ${item.label}`),
        note: {
            title: "Что уже есть на сайте",
            items: [
                "Каталог животных с подробными карточками",
                "Рабочие формы с сохранением в JSON",
                "Окно «Задать вопрос» с ответами из кода"
            ]
        }
    };

    return {
        markup: renderPageLayout({
            pageKey: "home",
            site,
            hero,
            content
        })
    };
}
