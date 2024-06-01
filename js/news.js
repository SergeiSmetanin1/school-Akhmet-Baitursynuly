const containerNewsDetail = document.querySelector('#container-news-details');
const newsContainer = document.querySelector('.news-cards');
const sectionNews = document.querySelector('.section-news');
const sectionNewsDetails = document.querySelector('.section-news-details');

// Функция для запроса новостей с сервера
async function fetchNews() {
    try {
        const response = await fetch('/all_news');
        const news = await response.json();
        return news;
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

// Функция для обрезания строки до первых 10 слов
function truncateDescription(description) {
    const words = description.split(' ');
    if (words.length <= 10) {
        return description;
    } else {
        return words.slice(0, 20).join(' ') + '...';
    }
}

// Функция для отрисовки карточек новостей на странице
async function renderNews() {
    const news = await fetchNews();

    // Очищаем контейнер с новостями перед добавлением новых
    newsContainer.innerHTML = '';

    // Отрисовываем каждую новость
    news.forEach((item) => {
        const photoUrl = item.photoUrl || 'https://catherineasquithgallery.com/uploads/posts/2021-03/1614636507_39-p-fon-shkola-dlya-fotoshopa-43.jpg';
        
        // Обрезаем описание новости до первых 10 слов
        const truncatedDescription = truncateDescription(item.description);
        
        const newsCardHTML = `
            <div class="news-card">
                <div class="bg-news-card">
                    <img src="${photoUrl}" alt="${item.title}">
                </div>
                <h3>${item.title}</h3>
                <p>${truncatedDescription}</p>
                <a class="news-btn" data-id="${item._id}">
                    <img src="images/arrow-news.png" alt="arrow" draggable="false">
                </a>
            </div>
        `;

        newsContainer.insertAdjacentHTML('beforeend', newsCardHTML);
    });
}

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в JavaScript начинаются с 0, поэтому добавляем 1
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

const renderNewsDetails = async (id) => {
    sectionNews.classList.add('hide');
    sectionNewsDetails.classList.remove('hide');

    containerNewsDetail.innerHTML = '';
    const newsList = await fetchNews();
    
    const news = newsList.find(newsItem => newsItem._id === id);
    console.log(news);
    if (news) {
        // Преобразуем дату в нужный формат
        const formattedDate = formatDate(news.date);
        
        const newsDetailsCard = `
            <button class="close-btn">
                <img src="images/arrow-news.png" alt="arrow" draggable="false">
            </button>
            <div class="news-detail-image">
                <img src="${news.photoUrl}" alt="${news.title}">
            </div>
            <div class="news-detail-content">
                <h2>"${news.title}"</h2>
                <p class="highlight-text">${news.description}</p>
                <p class="date-text">${formattedDate}</p>
            </div>
        `;
        containerNewsDetail.insertAdjacentHTML('beforeend', newsDetailsCard);
        // Здесь вы можете использовать переменную newsDetailsCard для отображения подробностей новости
    } else {
        console.log(`Новость с id ${id} не найдена.`);
    }
}

// Добавляем обработчик события для кнопки "close-btn"
containerNewsDetail.addEventListener('click', (e) => {
    const target = e.target;
    
    // Проверяем, что была нажата кнопка "close-btn"
    if (target.closest('.close-btn')) {
        // Показываем основной контейнер с новостями и скрываем контейнер с деталями новости
        sectionNewsDetails.classList.add('hide');
        sectionNews.classList.remove('hide');
        containerNewsDetail.innerHTML = '';
    } else {
        console.log(5);
    }
});

newsContainer.addEventListener('click', (e) => {
    const target = e.target;

    const btnNewsDetails = target.closest('.news-btn');

    if (btnNewsDetails) {
        renderNewsDetails(btnNewsDetails.dataset.id)
    } 
});

document.addEventListener('DOMContentLoaded', renderNews);
