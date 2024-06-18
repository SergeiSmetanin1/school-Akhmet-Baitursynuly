document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const passwordForm = document.getElementById('passwordForm');
    const adminContainer = document.querySelector('.admin-container');
    const correctPassword = ''; // Убедитесь, что вы установили правильный пароль
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
            if (!response.ok) {
                throw new Error(`Failed to fetch news: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    }

    async function getAllEvents() {
        try {
            const response = await fetch('/all_events');
            if (!response.ok) {
                throw new Error(`Failed to fetch events: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    }

    const renderNewsEvents = async () => {
        allNewsContainer.innerHTML = '';
        allEventsContainer.innerHTML = '';
        const allNewsData = await getAllNews();
        const allEventsData = await getAllEvents();

        if (allNewsData) {
            allNewsData.forEach(item => {
                const card = `
                    <div class="all-news-card__admin">
                        <img src="${item.photoUrl}" alt="">
                        <h4>${item.title}</h4>
                        <div class="all-news-btns__admin">
                            <button class="delete-btn-admin" data-idNews="${item._id}">Удалить</button>
                            <button class="change-btn-admin" data-idNews="${item._id}">Редактировать</button>
                        </div>
                    </div>
                `;
                allNewsContainer.insertAdjacentHTML('beforeend', card);
            });
        }

        if (allEventsData) {
            allEventsData.forEach(item => {
                const card = `
                    <div class="all-news-card__admin">
                        <img src="${item.photoUrl}" alt="">
                        <h4>${item.title}</h4>
                        <div class="all-news-btns__admin">
                            <button class="delete-btn-admin" data-idEvent="${item._id}">Удалить</button>
                            <button class="change-btn-admin" data-idEvent="${item._id}">Редактировать</button>
                        </div>
                    </div>
                `;
                allEventsContainer.insertAdjacentHTML('beforeend', card);
            });
        }
    }

    const formChange = async (id, type) => {
        const editModal = document.querySelector('#editModal');
        editModal.innerHTML = ``;
        editModal.classList.remove('hide');

        let item;
        if (type === 'news') {
            const allNews = await getAllNews();
            item = allNews.find(newsItem => newsItem._id === id);
        } else if (type === 'events') {
            const allEvents = await getAllEvents();
            item = allEvents.find(eventItem => eventItem._id === id);
        }

        const formChange = `
            <form id="editForm">
                <button id="close-btn__editModal" class="close-btn__editModal">x</button>
                <input type="hidden" id="editId" value="${item._id}">
                <input type="hidden" id="editType" value="${type}">
                <label for="editTitle">Заголовок:</label><br>
                <input type="text" id="editTitle" name="editTitle" value="${item.title}"><br>
                <label for="editDescription">Описание:</label><br>
                <textarea id="editDescription" name="editDescription">${item.description}</textarea><br>
                ${type === 'events' ? `<label for="editDate">Дата:</label><br><input type="date" id="editDate" name="editDate" value="${item.date}"><br>` : ''}
                <button type="submit">Сохранить изменения</button>
                <button type="button" id="closeEditModal">Отмена</button>
            </form>
        `;
        editModal.innerHTML = formChange;

        const closeBtn = document.querySelector('#close-btn__editModal');
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            editModal.classList.add('hide');
        });

        const editForm = document.getElementById('editForm');
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('editId').value;
            const editType = document.getElementById('editType').value;
            const editTitle = document.getElementById('editTitle').value;
            const editDescription = document.getElementById('editDescription').value;
            const editDate = document.getElementById('editDate') ? document.getElementById('editDate').value : null;

            const updatedData = {
                title: editTitle,
                description: editDescription,
                photoUrl: item.photoUrl 
            };

            if (editType === 'events') {
                updatedData.date = editDate;
            }

            try {
                const response = await fetch(`/${editType}/${editId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    renderNewsEvents();
                    editModal.classList.add('hide');
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert(`Error: ${error.message}`);
            }
        });
    }

    const deleteAndChangeNews = async (e) => {
        const target = e.target;
        const btnDelete = target.closest('.delete-btn-admin');
        const changeBtn = target.closest('.change-btn-admin');

        if (btnDelete) {
            const newsId = btnDelete.getAttribute('data-idNews');
            try {
                const response = await fetch(`/news/${newsId}`, {
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

        if (changeBtn) {
            const newsId = changeBtn.getAttribute('data-idNews');
            formChange(newsId, 'news');
        }
    }

    const deleteAndChangeEvents = async (e) => {
        const target = e.target;
        const btnDelete = target.closest('.delete-btn-admin');
        const changeBtn = target.closest('.change-btn-admin');

        if (btnDelete) {
            const eventId = btnDelete.getAttribute('data-idEvent');
            try {
                const response = await fetch(`/events/${eventId}`, {
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

        if (changeBtn) {
            const eventId = changeBtn.getAttribute('data-idEvent');
            formChange(eventId, 'events');
        }
    }

    allNewsContainer.addEventListener('click', deleteAndChangeNews);
    allEventsContainer.addEventListener('click', deleteAndChangeEvents);

    renderNewsEvents();
});