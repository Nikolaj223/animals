import { escapeHtml, formatDate, formatWeight, getSpeciesLabel, renderChipList } from "../core/utils.js";

export function renderMetricGrid(stats) {
    return `
        <div class="metric-grid">
            ${stats
                .map(
                    (item) => `
                        <article class="metric-card">
                            <div class="metric-card__value">${escapeHtml(item.value)}</div>
                            <span class="metric-card__label">${escapeHtml(item.label)}</span>
                        </article>
                    `
                )
                .join("")}
        </div>
    `;
}

export function renderAnimalCard(animal) {
    const illnesses = animal.illnesses.length
        ? animal.illnesses[0]
        : "Серьезных перенесенных заболеваний не указано";

    return `
        <article class="card reveal" data-reveal data-species="${escapeHtml(animal.species)}">
            <div class="card__media">
                <img src="${escapeHtml(animal.image)}" alt="${escapeHtml(animal.imageAlt)}" loading="lazy">
            </div>
            <div class="card__body">
                <div class="card__headline">
                    <h3 class="card__title">${escapeHtml(animal.name)}</h3>
                    <div class="card__meta card__meta--animal">
                        ${renderChipList([getSpeciesLabel(animal.species), animal.age], "is-brand")}
                        <span class="chip is-accent">${escapeHtml(animal.status)}</span>
                    </div>
                </div>
                <p class="card-copy">${escapeHtml(animal.description)}</p>
                <ul class="card__list card__facts">
                    <li><strong>Порода:</strong> <span>${escapeHtml(animal.breed)}</span></li>
                    <li><strong>Вес:</strong> <span>${escapeHtml(formatWeight(animal.weightKg))}</span></li>
                    <li><strong>Заболевания:</strong> <span>${escapeHtml(illnesses)}</span></li>
                    <li><strong>Прививки:</strong> <span>${escapeHtml(animal.vaccinations.join(", "))}</span></li>
                </ul>
                <div class="card__actions">
                    <a class="button button--secondary button--small" href="/animal/?slug=${encodeURIComponent(animal.slug)}">
                        Подробнее
                    </a>
                    <a class="button button--primary button--small" href="/adopt/?pet=${encodeURIComponent(animal.slug)}">
                        Хочу приютить
                    </a>
                </div>
            </div>
        </article>
    `;
}

export function renderNewsCard(item) {
    return `
        <article class="card reveal" data-reveal>
            <div class="card__media">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
            </div>
            <div class="card__body news-card">
                <div class="card__meta">
                    ${renderChipList([item.badge], "is-brand")}
                    <span class="news-card__date">${escapeHtml(formatDate(item.date))}</span>
                </div>
                <h3 class="card__title">${escapeHtml(item.title)}</h3>
                <p class="card-copy">${escapeHtml(item.summary)}</p>
                <ul class="card__list">
                    ${item.highlights
                        .slice(0, 3)
                        .map((point) => `<li><span>•</span><span>${escapeHtml(point)}</span></li>`)
                        .join("")}
                </ul>
            </div>
        </article>
    `;
}

export function renderValueCard(value) {
    return `
        <article class="card value-card reveal" data-reveal>
            <div class="card__body">
                <span class="chip is-accent">Подход</span>
                <h3 class="card__title">${escapeHtml(value.title)}</h3>
                <p class="card-copy">${escapeHtml(value.text)}</p>
            </div>
        </article>
    `;
}

export function renderHelpCard(option) {
    return `
        <article class="card help-card reveal" data-reveal>
            <div class="card__body">
                <span class="chip is-brand">${escapeHtml(option.accent)}</span>
                <h3 class="card__title">${escapeHtml(option.title)}</h3>
                <p class="card-copy">${escapeHtml(option.text)}</p>
            </div>
        </article>
    `;
}

export function renderTimelineCard(item, index) {
    return `
        <article class="card timeline-card reveal" data-step="${index + 1}" data-reveal>
            <div class="card__body">
                <h3 class="card__title">${escapeHtml(item.title)}</h3>
                <p class="card-copy">${escapeHtml(item.text)}</p>
            </div>
        </article>
    `;
}

export function renderMiniAnimal(animal) {
    return `
        <article class="mini-animal reveal" data-reveal>
            <img src="${escapeHtml(animal.image)}" alt="${escapeHtml(animal.imageAlt)}">
            <div class="stack">
                <strong>${escapeHtml(animal.name)}</strong>
                <span class="meta-copy">${escapeHtml(animal.description)}</span>
                <a class="text-link" href="/animal/?slug=${encodeURIComponent(animal.slug)}">Открыть карточку</a>
            </div>
        </article>
    `;
}
