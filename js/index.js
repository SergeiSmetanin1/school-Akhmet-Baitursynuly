document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.custom-slide');
    const nextButton = document.querySelector('.custom-next');
    const prevButton = document.querySelector('.custom-prev');
    let currentIndex = 0;

    function showSlide(index) {
        if (index >= slides.length) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = slides.length - 1;
        } else {
            currentIndex = index;
        }

        const offset = -currentIndex * 100;
        document.querySelector('.custom-slides').style.transform = `translateX(${offset}%)`;
    }

    nextButton.addEventListener('click', () => {
        showSlide(currentIndex + 1);
    });
    
    prevButton.addEventListener('click', () => {
        showSlide(currentIndex - 1);
    });

    // Auto-slide functionality (optional)
    setInterval(() => {
        showSlide(currentIndex + 1);
    }, 10000);

    // Swipe functionality using Hammer.js
    const slider = document.querySelector('.custom-slider');
    const hammer = new Hammer(slider);

    hammer.on('swipeleft', () => {
        showSlide(currentIndex + 1);
    });

    hammer.on('swiperight', () => {
        showSlide(currentIndex - 1);
    });
});


