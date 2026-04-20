import { submitForm } from "../core/api.js";
import { escapeHtml, getSpeciesLabel } from "../core/utils.js";

function selected(value, currentValue) {
    return value === currentValue ? "selected" : "";
}

export function renderAdoptionForm(selectedAnimal = null) {
    const selectedSpecies = selectedAnimal?.species ?? "";
    const selectedLabel = selectedAnimal
        ? `${selectedAnimal.name} · ${getSpeciesLabel(selectedAnimal.species)}`
        : "";

    return `
        <div class="form-card">
            <div class="stack">
                <div>
                    <span class="eyebrow">Анкета будущего хозяина</span>
                    <h2 class="section-title">Хочу приютить</h2>
                    <p class="section-lead">
                        Расскажите немного о себе, и мы подберем мягкий сценарий знакомства с питомцем.
                    </p>
                </div>
                ${selectedLabel ? `<span class="chip is-brand">${escapeHtml(`Вы выбрали: ${selectedLabel}`)}</span>` : ""}
                <form data-async-form data-form-type="adoption">
                    <input type="hidden" name="selectedPet" value="${escapeHtml(selectedAnimal?.slug ?? "")}">
                    <div class="form-grid">
                        <label class="form-field">
                            <span class="form-label">Ваше имя *</span>
                            <input type="text" name="name" placeholder="Диана" required>
                        </label>
                        <label class="form-field">
                            <span class="form-label">Телефон *</span>
                            <input type="tel" name="phone" placeholder="+7 (999) 123-45-67" required>
                        </label>
                        <label class="form-field">
                            <span class="form-label">Email</span>
                            <input type="email" name="email" placeholder="mail@example.ru">
                        </label>
                        <label class="form-field">
                            <span class="form-label">Кого хотите приютить? *</span>
                            <select name="petType" required>
                                <option value="">Выберите питомца</option>
                                <option value="dog" ${selected("dog", selectedSpecies)}>Собаку</option>
                                <option value="cat" ${selected("cat", selectedSpecies)}>Кошку</option>
                                <option value="any" ${selected("any", selectedSpecies)}>Пока выбираю</option>
                            </select>
                        </label>
                        <label class="form-field">
                            <span class="form-label">Формат жилья *</span>
                            <select name="housing" required>
                                <option value="">Выберите вариант</option>
                                <option value="flat">Квартира</option>
                                <option value="house">Частный дом</option>
                                <option value="mixed">Есть и дом, и квартира</option>
                            </select>
                        </label>
                        <label class="form-field">
                            <span class="form-label">Опыт с животными</span>
                            <select name="experience">
                                <option value="beginner">Это будет первый питомец</option>
                                <option value="had-pets">Питомцы уже были</option>
                                <option value="have-pets">Дома уже живут животные</option>
                            </select>
                        </label>
                        <label class="form-field form-field--full">
                            <span class="form-label">Комментарий</span>
                            <textarea
                                name="message"
                                placeholder="Например: дома есть дети, нужен спокойный питомец, предпочитаю взрослую собаку и т.д."
                            ></textarea>
                        </label>
                        <label class="form-field form-field--full checkbox">
                            <input type="checkbox" name="agreement" value="yes" required>
                            <span>Согласен на обработку данных для обратной связи по заявке.</span>
                        </label>
                    </div>
                    <div class="stack">
                        <button class="button button--primary" type="submit">Отправить анкету</button>
                        <div class="form-feedback" data-form-feedback></div>
                    </div>
                </form>
            </div>
        </div>
    `;
}

export function renderHelpForm() {
    return `
        <div class="form-card" id="help-form">
            <div class="stack">
                <div>
                    <span class="eyebrow">Онлайн-форма помощи</span>
                    <h2 class="section-title">Поддержать приют</h2>
                    <p class="section-lead">
                        Заявка сохранится в JSON-хранилище. Позже сюда легко подключается email-уведомление.
                    </p>
                </div>
                <form data-async-form data-form-type="help">
                    <div class="form-grid">
                        <label class="form-field">
                            <span class="form-label">Имя *</span>
                            <input type="text" name="name" placeholder="Ваше имя" required>
                        </label>
                        <label class="form-field">
                            <span class="form-label">Email *</span>
                            <input type="email" name="email" placeholder="mail@example.ru" required>
                        </label>
                        <label class="form-field">
                            <span class="form-label">Телефон</span>
                            <input type="tel" name="phone" placeholder="+7 (999) 123-45-67">
                        </label>
                        <label class="form-field">
                            <span class="form-label">Чем хотите помочь? *</span>
                            <select name="helpType" required>
                                <option value="">Выберите вариант</option>
                                <option value="donation">Денежное пожертвование</option>
                                <option value="medicine">Лекарства или корм</option>
                                <option value="volunteer">Волонтерская помощь</option>
                            </select>
                        </label>
                        <label class="form-field">
                            <span class="form-label">Сумма, если это донат</span>
                            <input type="number" min="0" step="100" name="amount" placeholder="3000">
                        </label>
                        <label class="form-field form-field--full">
                            <span class="form-label">Комментарий *</span>
                            <textarea
                                name="message"
                                placeholder="Например: готов закрыть лекарства для Марфы, могу помочь фотосъемкой, хочу оформить регулярный донат."
                                required
                            ></textarea>
                        </label>
                        <label class="form-field form-field--full checkbox">
                            <input type="checkbox" name="agreement" value="yes" required>
                            <span>Согласен на обработку данных для связи по заявке.</span>
                        </label>
                    </div>
                    <div class="stack">
                        <button class="button button--primary" type="submit">Отправить заявку</button>
                        <div class="form-feedback" data-form-feedback></div>
                    </div>
                </form>
            </div>
        </div>
    `;
}

export function initAsyncForms() {
    document.querySelectorAll("[data-async-form]").forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!form.reportValidity()) {
                return;
            }

            const formType = form.getAttribute("data-form-type");
            const feedback = form.querySelector("[data-form-feedback]");
            const submitButton = form.querySelector('button[type="submit"]');
            const formData = new FormData(form);
            const payload = Object.fromEntries(
                Array.from(formData.entries()).map(([key, value]) => [key, String(value).trim()])
            );

            payload.sourcePage = window.location.pathname;

            const endpoint = formType === "help" ? "/api/help-requests" : "/api/adoption-applications";
            const storageKey =
                formType === "help" ? "lapa_help_requests_local" : "lapa_adoption_requests_local";

            if (feedback) {
                feedback.textContent = "Сохраняем заявку...";
                feedback.className = "form-feedback";
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Отправляем...";
            }

            try {
                const result = await submitForm(endpoint, payload, storageKey);

                if (feedback) {
                    feedback.textContent = result.message;
                    feedback.className = "form-feedback is-success";
                }

                form.reset();
            } catch (error) {
                if (feedback) {
                    feedback.textContent =
                        error instanceof Error ? error.message : "Не удалось сохранить форму.";
                    feedback.className = "form-feedback is-error";
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent =
                        formType === "help" ? "Отправить заявку" : "Отправить анкету";
                }
            }
        });
    });
}
