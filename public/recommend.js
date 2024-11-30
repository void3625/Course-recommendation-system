document.addEventListener('DOMContentLoaded', function() {
    const recommendationList = document.querySelector('.recommendation-list');

    // 假設這裡會有用戶的 MBTI 和 CEEC 數據，你需要從 URL 或者 localStorage 中獲取這些數據
    const userData = {
        user_index: 0,  // 假設你有用戶索引
        user_mbti: "INTJ",  // 用戶的 MBTI 類型
        user_ceec: "SE"  // 用戶的 CEEC 類型
    };

    // 發送請求到 Flask API 以獲取推薦結果
    fetch('http://127.0.0.1:5000/api/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        // 清空現有的推薦列表（如果有）
        recommendationList.innerHTML = '';

        // 檢查 API 是否返回了推薦結果
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
            // 如果沒有推薦結果，顯示提示
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
