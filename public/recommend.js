document.addEventListener('DOMContentLoaded', async function () {
    const recommendationList = document.querySelector('.recommendation-list');
    console.log("Recommend page loaded, fetching recommendations...");

    // 從 localStorage 中獲取 user_id
    const user_id = localStorage.getItem('user_id');

    if (!user_id) {
        console.warn('User ID not found in localStorage. Unable to fetch recommendations.');
        recommendationList.innerHTML = `
            <div class="recommendation-item">
                <h2>無法獲取推薦</h2>
                <p>無法找到 user_id，請確認您已經登入並且有有效的用戶資料。</p>
            </div>
        `;
        return;
    }

    const userData = {
        user_id: user_id
    };

    try {
        // 先取得推薦結果
        const recommendResponse = await fetch('http://localhost:5000/api/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            mode: 'cors'
        });
        const recommendData = await recommendResponse.json();

        recommendationList.innerHTML = '';

        if (recommendData.recommended_courses && recommendData.recommended_courses.length > 0) {
            // 再取得使用者收藏的課程清單
            const favoritesResponse = await fetch('/api/courses/favorites');
            const favoritesData = await favoritesResponse.json();
            const favoriteIds = favoritesData.map(fav => fav.course_id);

            recommendData.recommended_courses.forEach((recommendation, index) => {
                const item = document.createElement('div');
                item.classList.add('recommendation-item');

                const course_id = recommendation.id; 
                const course_name = recommendation.課程名稱;
                const MBTI_type = recommendation.MBTI_type || recommendation.最相似的MBTI類型; 
                const CEEC_type = recommendation.CEEC_type || recommendation.最相似的CEEC類型;
                const link = recommendation.link || '#'; 
                const category = recommendation.category || 'unknown';

                // 判斷此課程是否已收藏
                const is_favorited = favoriteIds.includes(course_id);

                item.innerHTML = `
                <div class="course-info">
                    <div class="rank">${index + 1}</div>
                    <div class="course-details">
                        <h2>${course_name}</h2>
                        <p>推薦程度: ${recommendation.matching_score}</p>
                        <p>MBTI: ${MBTI_type}, CEEC: ${CEEC_type}</p>
                        <a href="${link}" target="_blank">查看課程</a>
                    </div>
                </div>
                <div class="course-actions"></div>
            `;
                // 建立收藏按鈕
                const favoriteButton = document.createElement('button');
                favoriteButton.className = 'favorite-button';


                if (is_favorited) {
                    favoriteButton.classList.add('favorited');
                }

                favoriteButton.addEventListener('click', async () => {
                    if (!course_name) {
                        alert('課程名稱錯誤，請稍後再試。');
                        console.error('課程名稱不存在:', recommendation);
                        return;
                    }

                    try {
                        const response = await fetch('/api/courses/collect', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                course_id: course_id,
                                course_name: course_name,
                                MBTI_type: MBTI_type,
                                CEEC_type: CEEC_type,
                                link: link,
                                category: category
                            }),
                        });

                        if (response.ok) {
                            favoriteButton.classList.add('favorited');
                            alert('課程已收藏！');
                        } else if (response.status === 409) {
                            alert('該課程已經在收藏中！');
                        } else {
                            alert('收藏失敗，請稍後再試。');
                        }
                    } catch (error) {
                        console.error('收藏錯誤:', error);
                        alert('發生錯誤，請稍後再試。');
                    }
                });

                item.querySelector('div').appendChild(favoriteButton);
                recommendationList.appendChild(item);
            });
        } else {
            const noResultItem = document.createElement('div');
            noResultItem.classList.add('recommendation-item');
            noResultItem.innerHTML = `
                <h2>無推薦結果</h2>
                <p>目前沒有推薦的課程，請稍後再試。</p>
            `;
            recommendationList.appendChild(noResultItem);
        }
    } catch (error) {
        console.error('獲取推薦結果時發生錯誤:', error);
    }
});
