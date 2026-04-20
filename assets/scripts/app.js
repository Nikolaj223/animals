import { getFaqData, getSiteData } from "./core/api.js";
import { initChatWidget } from "./components/chat.js";
import { initAsyncForms } from "./components/forms.js";
import { initSiteChrome } from "./components/layout.js";
import { initRevealAnimations } from "./components/reveal.js";
import { renderAboutPage } from "./pages/about.js";
import { renderAdoptPage } from "./pages/adopt.js";
import { renderAdminPage } from "./pages/admin.js";
import { renderAnimalPage } from "./pages/animal.js";
import { renderCatalogPage } from "./pages/catalog.js";
import { renderHelpPage } from "./pages/help.js";
import { renderHomePage } from "./pages/home.js";
import { renderNewsPage } from "./pages/news.js";

const pages = {
    home: renderHomePage,
    about: renderAboutPage,
    news: renderNewsPage,
    catalog: renderCatalogPage,
    animal: renderAnimalPage,
    help: renderHelpPage,
    adopt: renderAdoptPage,
    admin: renderAdminPage
};

function renderCriticalState(message) {
    return `
        <section class="critical-state">
            <div class="critical-state-card">
                <span class="eyebrow">Ошибка загрузки</span>
                <h1 class="section-title">Сайт не смог получить данные</h1>
                <p class="section-lead">${message}</p>
                <a class="button button--primary" href="/">Вернуться на главную</a>
            </div>
        </section>
    `;
}

async function bootstrap() {
    const root = document.getElementById("app");

    if (!root) {
        return;
    }

    const pageKey = document.body.dataset.page ?? "home";
    const renderer = pages[pageKey] ?? renderHomePage;

    try {
        const site = await getSiteData();
        const page = await renderer({ site, pageKey });

        root.innerHTML = page.markup;

        initSiteChrome();
        initAsyncForms();
        initRevealAnimations();

        const faq = await getFaqData();
        initChatWidget(faq);

        if (page.hydrate) {
            page.hydrate();
        }
    } catch (error) {
        console.error(error);
        root.innerHTML = renderCriticalState(
            error instanceof Error ? error.message : "Неизвестная ошибка."
        );
    }
}

document.addEventListener("DOMContentLoaded", () => {
    void bootstrap();
});
