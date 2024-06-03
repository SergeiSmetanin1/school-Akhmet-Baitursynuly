document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const passwordForm = document.getElementById('passwordForm');
    const adminContainer = document.querySelector('.admin-container');
    const correctPassword = ''; // Установите ваш пароль здесь
    const allNewsContainer = document.querySelector('.all-news-continer__admin');
    const allEventsContainer = document.querySelector('.all-events-container__admin');
    

    modal.style.display = 'block';

    function checkPassword(event) {
        event.preventDefault();
        const password = passwordInput.value;
        if (password === correctPassword) {
            modal.style.display = 'none';
            adminContainer.style.display = 'block';
        } else {
            alert('Incorrect Password');
        }
    }

    passwordForm.addEventListener('submit', checkPassword);

    document.getElementById('addContentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const contentType = document.getElementById('contentType').value;
        const title = document.getElementById('contentTitle').value;
        const description = document.getElementById('contentDescription').value;
        const contentDate = document.getElementById('contentDate').value;
        const contentPhoto = document.getElementById('contentPhoto').files[0];
    
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('photo', contentPhoto);
    
        if (contentType === 'events') {
            formData.append('date', contentDate);
        }
    
        try {
            const uploadResponse = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
    
            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`Upload failed: ${uploadResponse.statusText} - ${errorText}`);
            }
    
            const uploadData = await uploadResponse.json();
    
            const photoUrl = uploadData.photoUrl;
    
            const response = await fetch(`/${contentType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description, photoUrl, date: contentDate })
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Submit failed: ${response.statusText} - ${errorText}`);
            }
    
            const data = await response.json();
            console.log(data);
            alert(data.message);
            renderNewsEvents();
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    });

   

    async function getAllNews() {
        try {
            const response = await fetch('/all_news');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function getAllEvents() {
        try {
            const response = await fetch('/all_events');
            const data = await response.json();
            console.log('All Events:', data);
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Назначение обработчиков для кнопок получения списка новостей и мероприятий

    const renderNewsEvents = async () => {
        allNewsContainer.innerHTML = '';
        allEventsContainer.innerHTML = '';
        const allNewsData = await getAllNews();
        const allEventsData  = await getAllEvents();
        console.log(allEventsData);

        allNewsData.forEach(item => {
            const card = `
                <div class="all-news-card__admin">
                    <img src="${item.photoUrl}" alt="">
                    <h4>${item.title}</h4>
                    <div class="all-news-btns__admin">
                        <button class="delete-btn-admin" data-idNews="${item._id}">Удалить</button>
                        <button class="view-btn-admin">Редактировать</button>
                    </div>
                </div>
            `;
    
            allNewsContainer.insertAdjacentHTML('beforeend', card);
        });
        
        allEventsData.forEach(item => {
            const card = `
                <div class="all-news-card__admin">
                    <img src="${item.photoUrl}" alt="">
                    <h4>${item.title}</h4>
                    <div class="all-news-btns__admin">
                        <button class="delete-btn-admin" data-idNews="${item._id}">Удалить</button>
                        <button class="view-btn-admin">Редактировать</button>
                    </div>
                </div>
            `;
    
            allEventsContainer.insertAdjacentHTML('beforeend', card);
        });
    }

    const deleteAndVeiwNews = async (e) => {
        const target = e.target;
        const btnDelete = target.closest('.delete-btn-admin');
    
        if (btnDelete) {
            const newsId = btnDelete.getAttribute('data-idNews'); // Изменение способа получения значения атрибута
            try {
                const response = await fetch(`/news/${newsId}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message); // Оповещение об успешном удалении
                    renderNewsEvents(); // Обновление списка новостей
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert(`Error: ${error.message}`); // Оповещение об ошибке
            }
        }
    }

    const deleteAndVeiwEvents = async (e) => {
        const target = e.target;
        const btnDelete = target.closest('.delete-btn-admin');
    
        if (btnDelete) {
            const newsId = btnDelete.getAttribute('data-idNews'); 
            try {
                const response = await fetch(`/events/${newsId}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message); 
                    renderNewsEvents(); 
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert(`Error: ${error.message}`); 
            }
        }
    }

    allNewsContainer.addEventListener('click', deleteAndVeiwNews);
    allEventsContainer.addEventListener('click', deleteAndVeiwEvents);
    
    renderNewsEvents();
    
});
