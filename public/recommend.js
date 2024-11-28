document.addEventListener('DOMContentLoaded', function() {
    const recommendationList = document.querySelector('.recommendation-list');
    const recommendations = [
        '推薦結果1',
        '推薦結果2',
        '推薦結果3',
        '推薦結果4',
        '推薦結果5',
        '推薦結果6',
        '推薦結果7',
        '推薦結果8',
        '推薦結果9',
        '推薦結果10'
    ];

    recommendations.forEach((recommendation, index) => {
        const item = document.createElement('div');
        item.classList.add('recommendation-item');
        item.innerHTML = `
            <h2>${index + 1}. ${recommendation}</h2>
            <p>這裡是關於${recommendation}的詳細描述。您可以根據需要添加更多信息。</p>
        `;
        recommendationList.appendChild(item);
    });
});