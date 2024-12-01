document.addEventListener('DOMContentLoaded', function() {
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

    // 發送請求到 Flask API 以獲取推薦結果
    fetch('http://localhost:5000/api/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        mode: 'cors'
    })
    .then(response => response.json())
    .then(data => {
        recommendationList.innerHTML = '';

        if (data.recommended_courses && data.recommended_courses.length > 0) {
            data.recommended_courses.forEach((recommendation, index) => {
                const item = document.createElement('div');
                item.classList.add('recommendation-item');
                item.innerHTML = `
                    <h2>${index + 1}. ${recommendation}</h2>
                    <p>這裡是關於${recommendation}的詳細描述。您可以根據需要添加更多信息。</p>
                `;
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
    })
    .catch(error => {
        console.error('獲取推薦結果時發生錯誤:', error);
    });
});
