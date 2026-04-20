const cache = new Map();

async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(payload.message ?? "Не удалось получить данные.");
    }

    return payload;
}

function withCache(key, loader) {
    if (!cache.has(key)) {
        cache.set(key, loader());
    }

    return cache.get(key);
}

function getCachedJson(key, apiPath, staticPath) {
    return withCache(key, () => requestJson(apiPath).catch(() => requestJson(staticPath)));
}

export function getSiteData() {
    return getCachedJson("site", "/api/site", "/data/site.json");
}

export function getFaqData() {
    return getCachedJson("faq", "/api/faq", "/data/faq.json");
}

export function getNews() {
    return getCachedJson("news", "/api/news", "/data/news.json");
}

export function getAnimals() {
    return getCachedJson("animals", "/api/animals", "/data/animals.json");
}

export function getAdoptionApplications() {
    return requestJson("/api/adoption-applications").catch(() =>
        requestJson("/storage/adoption-applications.json")
    );
}

export function getHelpRequests() {
    return requestJson("/api/help-requests").catch(() =>
        requestJson("/storage/help-requests.json")
    );
}

export async function submitForm(url, payload, localStorageKey) {
    try {
        return await requestJson(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        const fallbackEntries = JSON.parse(localStorage.getItem(localStorageKey) ?? "[]");

        fallbackEntries.push({
            ...payload,
            createdAt: new Date().toISOString(),
            mode: "local"
        });

        localStorage.setItem(localStorageKey, JSON.stringify(fallbackEntries));

        return {
            ok: true,
            mode: "local",
            message:
                "Сервер сейчас недоступен. Заявка сохранена локально в браузере и не потеряется до следующего запуска."
        };
    }
}
