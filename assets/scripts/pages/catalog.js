import { getAnimals } from "../core/api.js";
import { renderAnimalCard } from "../components/cards.js";
import { renderPageLayout, renderSectionShell } from "../components/layout.js";

export async function renderCatalogPage({ site }) {
    const animals = await getAnimals();
    const dogCount = animals.filter((animal) => animal.species === "dog").length;
    const catCount = animals.filter((animal) => animal.species === "cat").length;

    return {
        markup: renderPageLayout({
            pageKey: "catalog",
            site,
            hero: {
                eyebrow: "Каталог животных",
                title: "У каждого питомца есть своя полноценная карточка",
                lead: "Порода, вес, прививки, перенесенные заболевания, история и понятный путь к заявке — все собрано в одной структуре.",
                actions: [
                    { href: "/adopt/", label: "Заполнить анкету", variant: "primary" },
                    { href: "/help/", label: "Помочь приюту", variant: "secondary" }
                ],
                note: {
                    title: "Что уже добавлено",
                    items: [
                        `${animals.length} тестовых карточек животных`,
                        `${dogCount} собак и ${catCount} кошек`,
                        "Фильтрация по виду прямо на странице"
                    ]
                }
            },
            content: renderSectionShell({
                eyebrow: "Выбор питомца",
                title: "Каталог для реального просмотра, а не для заглушки",
                lead: "Фильтры работают на клиенте, а карточки можно открыть в отдельную страницу с подробностями.",
                content: `
                    <div class="catalog-summary">
                        <span class="chip is-brand">Всего: ${animals.length}</span>
                        <span class="chip is-accent">Собаки: ${dogCount}</span>
                        <span class="chip">Кошки: ${catCount}</span>
                        <span class="chip" data-catalog-counter>Показано ${animals.length} из ${animals.length}</span>
                    </div>
                    <div class="catalog-actions">
                        <button class="pill-filter is-active" type="button" data-catalog-filter="all">Все</button>
                        <button class="pill-filter" type="button" data-catalog-filter="dog">Собаки</button>
                        <button class="pill-filter" type="button" data-catalog-filter="cat">Кошки</button>
                    </div>
                    <div class="catalog-grid" data-catalog-grid data-filter="all">
                        ${animals.map(renderAnimalCard).join("")}
                    </div>
                `
            })
        }),
        hydrate() {
            const buttons = Array.from(document.querySelectorAll("[data-catalog-filter]"));
            const grid = document.querySelector("[data-catalog-grid]");
            const counter = document.querySelector("[data-catalog-counter]");

            if (!buttons.length || !grid || !counter) {
                return;
            }

            const updateFilter = (filter) => {
                grid.setAttribute("data-filter", filter);
                buttons.forEach((button) => {
                    button.classList.toggle("is-active", button.getAttribute("data-catalog-filter") === filter);
                });

                const visibleCount = animals.filter(
                    (animal) => filter === "all" || animal.species === filter
                ).length;

                counter.textContent = `Показано ${visibleCount} из ${animals.length}`;
            };

            buttons.forEach((button) => {
                button.addEventListener("click", () => {
                    updateFilter(button.getAttribute("data-catalog-filter") ?? "all");
                });
            });
        }
    };
}
