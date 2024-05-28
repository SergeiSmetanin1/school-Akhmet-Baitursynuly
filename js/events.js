// Функция для запроса мероприятий с сервера
async function fetchEvents() {
    try {
        const response = await fetch('/all_events');
        const events = await response.json();
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Функция для отрисовки карточек мероприятий на странице
async function renderEvents() {
    const eventsContainer = document.querySelector('.events-container');
    const events = await fetchEvents();

    // Очищаем контейнер с мероприятиями перед добавлением новых
    eventsContainer.innerHTML = '';

    // Отрисовываем каждое мероприятие
    events.forEach((item) => {
        const photoUrl = item.photoUrl || 'https://catherineasquithgallery.com/uploads/posts/2021-03/1614636507_39-p-fon-shkola-dlya-fotoshopa-43.jpg';
        
        const eventCardHTML = `
            <div class="card-event">
                <div class="event-image">
                    <img src="${photoUrl}" alt="${item.title}">
                </div>
                <div class="description-event">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <div class="signature-event">
                        <p class="admin-event">С уважением,<br>администрация школы</p>
                        <p class="date-event">${new Date(item.date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        `;

        eventsContainer.insertAdjacentHTML('beforeend', eventCardHTML);
    });
}

// Вызываем функцию для отрисовки карточек мероприятий при загрузке страницы
document.addEventListener('DOMContentLoaded', renderEvents);
