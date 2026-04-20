const SPECIES_LABELS = {
    cat: "Кошка",
    dog: "Собака"
};

export function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function formatDate(value) {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date(value));
}

export function formatWeight(value) {
    return `${Number(value).toLocaleString("ru-RU")} кг`;
}

export function getSpeciesLabel(species) {
    return SPECIES_LABELS[species] ?? "Питомец";
}

export function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

export function renderChipList(items, variant = "") {
    return items
        .filter(Boolean)
        .map((item) => `<span class="chip${variant ? ` ${variant}` : ""}">${escapeHtml(item)}</span>`)
        .join("");
}

export function slugToTitle(slug) {
    if (!slug) {
        return "";
    }

    return slug
        .split("-")
        .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
        .join(" ");
}
