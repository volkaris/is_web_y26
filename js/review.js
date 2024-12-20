document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader");
    const content = document.getElementById("content");



    const getRandomFilter = () => ({
        min: Math.floor(Math.random() * 100),
        max: Math.floor(Math.random() * 100) + 100
    });


    const fetchData = async (filter) => {
        try {
            preloader.classList.remove("hidden");
            content.innerHTML = "";

            const [commentsResponse, photosResponse] = await Promise.all([
                fetch(`https://jsonplaceholder.typicode.com/comments`),
                fetch(`https://jsonplaceholder.typicode.com/photos`)
            ]);

            if (!commentsResponse.ok || !photosResponse.ok) {
                throw new Error("Ошибка загрузки данных");
            }

            const comments = await commentsResponse.json();
            const photos = await photosResponse.json();

            preloader.classList.add("hidden");

            renderContent(comments, photos, filter);
        } catch (error) {
            preloader.classList.add("hidden");
            content.innerHTML = `<div class="error">⚠ Что-то пошло не так: ${error.message}</div>`;
        }
    };


    const renderContent = (comments, photos, filter) => {
        const filteredPhotos = photos.filter(
            (photo) => photo.id >= filter.min && photo.id <= filter.max
        );

        const filteredComments = comments.slice(0, filteredPhotos.length);

        const photoCards = filteredPhotos.map((photo, index) => {
            const comment = filteredComments[index % filteredComments.length];

            return `
                <div class="photo-card">
                    <h3>${photo.title}</h3>
                    <img src="${photo.thumbnailUrl}" alt="${photo.title}">
                  
                    <p><strong>Комментарий:</strong> ${comment.body }</p>
                    <p><strong>Автор:</strong> ${comment?.name}</p>
                </div>
            `;
        });

        content.innerHTML = `<div class="gallery">${photoCards.join("")}</div>`;
    };

    fetchData(getRandomFilter());
});
