import { getAnimals } from "../core/api.js";
import { renderMiniAnimal } from "../components/cards.js";
import { renderAdoptionForm } from "../components/forms.js";
import { renderPageLayout, renderSectionShell } from "../components/layout.js";
import { getQueryParam } from "../core/utils.js";

export async function renderAdoptPage({ site }) {
    const animals = await getAnimals();
    const selectedSlug = getQueryParam("pet");
    const selectedAnimal = animals.find((animal) => animal.slug === selectedSlug) ?? null;
    const suggestedAnimals = (selectedAnimal ? animals.filter((animal) => animal.slug !== selectedAnimal.slug) : animals).slice(0, 3);

    const content = `
        <section class="section">
            <div class="container">
                <div class="adopt-layout">
                    ${renderAdoptionForm(selectedAnimal)}
                    <div class="stack">
                        <div class="detail-card">
                            <span class="eyebrow">Как проходит пристройство</span>
                            <h2 class="section-title">Прозрачный и спокойный процесс</h2>
                            <ul class="adopt-checklist">
                                ${site.adoptionSteps.map((item) => `<li><span>•</span><span>${item}</span></li>`).join("")}
                            </ul>
                        </div>
                        <div class="detail-card">
                            <span class="eyebrow">Еще можно посмотреть</span>
                            <h2 class="section-title">Похожие карточки</h2>
                            <div class="mini-animal-grid">
                                ${suggestedAnimals.map(renderMiniAnimal).join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        ${renderSectionShell({
            eyebrow: "Почему анкета важна",
            title: "Она помогает подобрать подходящего питомца, а не просто собрать контакт",
            lead: "Так мы быстрее понимаем ритм вашей семьи, формат жилья и характер будущего друга.",
            content: `
                <div class="stack">
                    <div class="chip is-brand">Анкета сохраняется в JSON-хранилище <code>storage/adoption-applications.json</code></div>
                    <div class="chip is-accent">Позже сюда легко подключается отправка на почту или CRM</div>
                    <div class="chip">Форма уже рабочая и обрабатывается локальным сервером</div>
                </div>
            `
        })}
    `;

    return {
        markup: renderPageLayout({
            pageKey: "adopt",
            site,
            hero: {
                eyebrow: "Хочу приютить",
                title: selectedAnimal ? `Анкета на ${selectedAnimal.name}` : "Анкета будущего хозяина",
                lead: selectedAnimal
                    ? `Вы уже выбрали питомца. Осталось заполнить короткую анкету, и команда подготовит знакомство с ${selectedAnimal.name}.`
                    : "Если вы еще выбираете, анкета тоже подойдет: мы предложим животных под ваш запрос и образ жизни.",
                actions: [
                    { href: "/catalog/", label: "Вернуться в каталог", variant: "secondary" },
                    { href: "/help/", label: "Помочь приюту", variant: "ghost" }
                ],
                note: {
                    title: "Что получает пользователь",
                    items: [
                        "Ясный путь от карточки до анкеты",
                        "Понимание этапов после отправки формы",
                        "Бережную коммуникацию без навязчивости"
                    ]
                }
            },
            content
        })
    };
}
