import { getAnimals } from "../core/api.js";
import { renderPageLayout, renderSectionShell } from "../components/layout.js";
import { escapeHtml, formatWeight, getQueryParam, getSpeciesLabel, renderChipList } from "../core/utils.js";

function renderAnimalContent(animal) {
    return `
        ${renderSectionShell({
            eyebrow: "Карточка животного",
            title: `История ${animal.name} и вся важная информация для новой семьи`,
            lead: "Здесь собраны данные, которые обычно теряются между чатом, таблицей и устными комментариями волонтера.",
            content: `
                <div class="detail-layout">
                    <div class="stack">
                        <div class="detail-photo">
                            <img src="${escapeHtml(animal.image)}" alt="${escapeHtml(animal.imageAlt)}">
                        </div>
                        <div class="detail-card stack">
                            <h3 class="card__title">История</h3>
                            <p class="meta-copy">${escapeHtml(animal.story)}</p>
                            <div class="cluster">
                                ${renderChipList(animal.traits, "is-accent")}
                            </div>
                        </div>
                    </div>
                    <aside class="detail-sidebar">
                        <div class="detail-card">
                            <div class="detail-kv">
                                <div class="detail-kv__row"><strong>Вид</strong><span>${escapeHtml(getSpeciesLabel(animal.species))}</span></div>
                                <div class="detail-kv__row"><strong>Порода</strong><span>${escapeHtml(animal.breed)}</span></div>
                                <div class="detail-kv__row"><strong>Возраст</strong><span>${escapeHtml(animal.age)}</span></div>
                                <div class="detail-kv__row"><strong>Вес</strong><span>${escapeHtml(formatWeight(animal.weightKg))}</span></div>
                                <div class="detail-kv__row"><strong>Пол</strong><span>${escapeHtml(animal.sex)}</span></div>
                                <div class="detail-kv__row"><strong>Стерилизация</strong><span>${animal.sterilized ? "Да" : "Нет"}</span></div>
                                <div class="detail-kv__row"><strong>Статус</strong><span>${escapeHtml(animal.status)}</span></div>
                            </div>
                        </div>
                        <div class="detail-card stack">
                            <h3 class="card__title">Кратко о характере</h3>
                            <p class="meta-copy">${escapeHtml(animal.description)}</p>
                            <a class="button button--primary" href="/adopt/?pet=${encodeURIComponent(animal.slug)}">Подать анкету на ${escapeHtml(animal.name)}</a>
                        </div>
                    </aside>
                </div>
            `
        })}
        ${renderSectionShell({
            eyebrow: "Медицинская информация",
            title: "Прививки и перенесенные заболевания",
            lead: "Карточка делает медицинский блок прозрачным, чтобы пользователь понимал особенности ухода заранее.",
            content: `
                <div class="detail-lists">
                    <div class="detail-card stack">
                        <h3 class="card__title">Перенесенные заболевания</h3>
                        <div class="stack">
                            ${animal.illnesses
                                .map((item) => `<div class="chip is-brand">${escapeHtml(item)}</div>`)
                                .join("")}
                        </div>
                    </div>
                    <div class="detail-card stack">
                        <h3 class="card__title">Прививки и профилактика</h3>
                        <div class="stack">
                            ${animal.vaccinations
                                .map((item) => `<div class="chip is-accent">${escapeHtml(item)}</div>`)
                                .join("")}
                        </div>
                    </div>
                </div>
            `
        })}
    `;
}

export async function renderAnimalPage({ site }) {
    const animals = await getAnimals();
    const slug = getQueryParam("slug");
    const animal = animals.find((item) => item.slug === slug) ?? null;

    if (!animal) {
        return {
            markup: renderPageLayout({
                pageKey: "catalog",
                site,
                hero: {
                    eyebrow: "Карточка животного",
                    title: "Питомец не найден",
                    lead: "Проверьте ссылку или вернитесь в каталог, чтобы выбрать карточку заново.",
                    actions: [{ href: "/catalog/", label: "Вернуться в каталог", variant: "primary" }]
                },
                content: `
                    <section class="section">
                        <div class="container">
                            <div class="empty-state reveal" data-reveal>
                                Возможно, карточка была удалена или ссылка открылась без параметра <code>slug</code>.
                            </div>
                        </div>
                    </section>
                `
            })
        };
    }

    return {
        markup: renderPageLayout({
            pageKey: "catalog",
            site,
            hero: {
                eyebrow: "Подробная карточка",
                title: `${animal.name} ищет дом`,
                lead: animal.description,
                actions: [
                    { href: `/adopt/?pet=${encodeURIComponent(animal.slug)}`, label: "Хочу приютить", variant: "primary" },
                    { href: "/catalog/", label: "Назад в каталог", variant: "secondary" }
                ],
                facts: [getSpeciesLabel(animal.species), animal.age, formatWeight(animal.weightKg)],
                note: {
                    title: "Почему карточка полезна",
                    items: [
                        "Понятен медицинский статус",
                        "Есть история и бытовые особенности",
                        "Сразу виден путь к анкете"
                    ]
                }
            },
            content: renderAnimalContent(animal)
        })
    };
}
