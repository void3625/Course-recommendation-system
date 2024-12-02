function showCategory(category) {
    const sections = document.querySelectorAll('.course-category');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(category).style.display = 'block';
}

document.addEventListener('DOMContentLoaded', fetchFavorites);

async function fetchFavorites() {
    try {
        const response = await fetch('/api/courses/favorites');
        if (!response.ok) {
            throw new Error('無法獲取收藏課程');
        }
        const favorites = await response.json();
        displayFavorites(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
    }
}

function displayFavorites(favorites) {
    const categories = {
        'sky': document.getElementById('sky'),
        'people': document.getElementById('people'),
        'thing': document.getElementById('thing'),
        'self': document.getElementById('self')
    };

    for (const category in categories) {
        const categoryDiv = categories[category];
        categoryDiv.innerHTML = '<h2>' + getCategoryName(category) + '</h2>';
    }

    favorites.forEach(favorite => {
        const category = favorite.category;
        const categoryDiv = categories[category];
        if (categoryDiv) {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'recommendation-item';

            const title = document.createElement('h2');
            title.textContent = favorite.course_name;

            const description = document.createElement('p');
            description.textContent = `MBTI類型: ${favorite.mbti_type} | CEEC類型: ${favorite.ceec_type}`;

            const link = document.createElement('a');
            link.href = favorite.link;
            link.textContent = '查看課程';

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '刪除收藏';
            deleteButton.onclick = async () => {
                try {
                    const response = await fetch(`/api/courses/favorites/${favorite.id}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        alert('收藏已刪除！');
                        fetchFavorites();
                    } else {
                        alert('刪除失敗，請稍後再試。');
                    }
                } catch (error) {
                    console.error('刪除錯誤:', error);
                    alert('發生錯誤，請稍後再試。');
                }
            };

            favoriteItem.appendChild(title);
            favoriteItem.appendChild(description);
            favoriteItem.appendChild(link);
            favoriteItem.appendChild(deleteButton);

            categoryDiv.appendChild(favoriteItem);
        }
    });
}

function getCategoryName(category) {
    switch (category) {
        case 'sky':
            return '天';
        case 'people':
            return '人';
        case 'thing':
            return '物';
        case 'self':
            return '我';
        default:
            return '';
    }
}