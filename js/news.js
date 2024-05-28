// Функция для запроса новостей с сервера
async function fetchNews() {
    try {
        const response = await fetch('/all_news');
        const news = await response.json();

        console.log(news);
        return news;
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

// Функция для отрисовки карточек новостей на странице
async function renderNews() {
    const newsContainer = document.querySelector('.news-cards');
    const news = await fetchNews();

    // Очищаем контейнер с новостями перед добавлением новых
    newsContainer.innerHTML = '';

    // Отрисовываем каждую новость
    news.forEach((item) => {
        const photoUrl = item.photoUrl || 'https://catherineasquithgallery.com/uploads/posts/2021-03/1614636507_39-p-fon-shkola-dlya-fotoshopa-43.jpg';
        
        const newsCardHTML = `
            <div class="news-card">
                <div class="bg-news-card">
                    <img src="${photoUrl}" alt="${item.title}">
                </div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <a href="news_detail.html" class="news-btn">
                    <img src="images/arrow-news.png" alt="arrow" draggable="false">
                </a>
            </div>
        `;

        newsContainer.insertAdjacentHTML('beforeend', newsCardHTML);
    });
}

// Вызываем функцию для отрисовки карточек новостей при загрузке страницы
document.addEventListener('DOMContentLoaded', renderNews);
