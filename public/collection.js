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

            // 修改為愛心按鈕
            const favoriteButton = document.createElement('button');
            favoriteButton.className = 'favorite-button favorited'; // 預設為已收藏（紅色實心）

           // 刪除收藏的按鈕邏輯
           favoriteButton.onclick = async () => {
            if (favoriteButton.classList.contains('favorited')) {
                // 刪除收藏
                try {
                    const response = await fetch(`/api/courses/favorites/${favorite.course_id}`, {
                        method: 'DELETE',
                    });
        
                    if (response.ok) {
                        alert('收藏已刪除！');
                        favoriteButton.classList.remove('favorited');
                        favoriteButton.classList.add('temp-unfavorited'); // 暫時未收藏狀態
                    } else {
                        alert('刪除失敗，請稍後再試。');
                    }
                } catch (error) {
                    console.error('刪除錯誤:', error);
                    alert('發生錯誤，請稍後再試。');
                }
                } else if (favoriteButton.classList.contains('temp-unfavorited')) {
                    // 重新收藏
                    try {
                        const response = await fetch('/api/courses/collect', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                course_id: favorite.course_id, // 使用 course_id 而不是 id
                                course_name: favorite.course_name,
                                MBTI_type: favorite.mbti_type,
                                CEEC_type: favorite.ceec_type,
                                link: favorite.link,
                                category: favorite.category,
                            }),
                        });
            
                        if (response.ok) {
                            const result = await response.json();
                            alert('收藏已恢復！');
            
                            // 更新收藏 ID
                            favorite.course_id = result.collection.course_id; // 更新為 course_id
            
                            favoriteButton.classList.add('favorited');
                            favoriteButton.classList.remove('temp-unfavorited');
                        } else {
                            alert('收藏失敗，請稍後再試。');
                        }
                    } catch (error) {
                        console.error('重新收藏錯誤:', error);
                        alert('發生錯誤，請稍後再試。');
                    }
                }
            };
            

            
            favoriteItem.appendChild(title);
            favoriteItem.appendChild(description);
            favoriteItem.appendChild(link);
            favoriteItem.appendChild(favoriteButton);

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