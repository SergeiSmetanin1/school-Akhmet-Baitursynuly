document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const passwordForm = document.getElementById('passwordForm');
    const adminContainer = document.querySelector('.admin-container');
    const correctPassword = '1234'; // Установите ваш пароль здесь

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
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        }
    });
    

    document.getElementById('deleteContentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const contentType = document.getElementById('deleteContentType').value;
        const contentId = document.getElementById('contentId').value;

        try {
            const response = await fetch(`/${contentType}/${contentId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            console.log(data);
            alert(data.message);
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Функция для отправки запроса на получение всех новостей
    async function getAllNews() {
        try {
            const response = await fetch('/all_news');
            const data = await response.json();
            console.log('All News:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Функция для отправки запроса на получение всех мероприятий
    async function getAllEvents() {
        try {
            const response = await fetch('/all_events');
            const data = await response.json();
            console.log('All Events:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Назначение обработчиков для кнопок получения списка новостей и мероприятий
    document.getElementById('getAllNewsBtn').addEventListener('click', getAllNews);
    document.getElementById('getAllEventsBtn').addEventListener('click', getAllEvents);
});