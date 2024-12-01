document.addEventListener('DOMContentLoaded', async function () {
    // 先從後端獲取登入的使用者 ID
    const userIdResponse = await fetch('/api/users/getUserId');
    const userData = await userIdResponse.json();

    if (userData.user_id) {
        const userId = userData.user_id;  // 取得登入用戶的 ID
        console.log('Logged in user ID:', userId);
        
        // 保存 user_id 到 localStorage 以便在其他頁面中使用
        localStorage.setItem('user_id', userId);

        const mbtiTypes = [
            'ISTJ - 檢查者', 'ISFJ - 守護者', 'INFJ - 提倡者', 'INTJ - 建築師',
            'ISTP - 鑑定者', 'ISFP - 探險家', 'INFP - 調停者', 'INTP - 邏輯學家',
            'ESTP - 企業家', 'ESFP - 表演者', 'ENFP - 冒險家', 'ENTP - 辯論家',
            'ESTJ - 總經理', 'ESFJ - 執政官', 'ENFJ - 主人公', 'ENTJ - 指揮官'
        ];

        const mbtiSelector = document.getElementById('mbti-selector');
        const mbtiInput = document.getElementById('mbti');
        const mbtiDetail = document.getElementById('mbti-detail');
        const mbtiImage = document.getElementById('mbti-image');
        const mbtiText = document.getElementById('mbti-text');

        // 動態生成 MBTI 選項
        mbtiTypes.forEach(type => {
            const option = document.createElement('div');
            option.className = 'mbti-option';
            option.textContent = type;
            option.addEventListener('click', () => {
                document.querySelectorAll('.mbti-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                mbtiInput.value = type.split(' - ')[0];
            });
            // 顯示 MBTI 詳細介紹
            option.addEventListener('mouseover', () => {
                const description = `${type} - 這是詳細介紹`; // 可以自定義詳細內容
                mbtiText.textContent = description;
                mbtiImage.src = `./image/MBTI/${type.split(' - ')[0]}.jpg`;  // 更新圖片
                mbtiDetail.style.display = 'block'; // 顯示詳細框
            });

            // 當滑鼠離開時隱藏詳細介紹框
            option.addEventListener('mouseout', () => {
                mbtiDetail.style.display = 'none';
            });

            mbtiSelector.appendChild(option);
        });

        // 使用 Sortable.js 初始化拖拉排序功能
        new Sortable(document.getElementById('ceec-order'), {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: function(evt) {
                const sortedItems = Array.from(evt.from.children).map(item => item.dataset.type);
                console.log('排序完成:', sortedItems);
            }
        });

        // 提交表單並儲存到資料庫
        document.getElementById('input-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const mbti = document.getElementById('mbti').value;
            const ceecOrder = Array.from(document.querySelectorAll('.ceec-item')).map(item => item.dataset.type);

            try {
                const response = await fetch('http://localhost:3000/save-user-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, mbti, ceec_order: ceecOrder })
                });

                const result = await response.json();

                if (response.ok) {
                    alert("資料已成功儲存！");
                    window.location.href = 'recommend.html';
                } else {
                    alert("儲存失敗：" + (result.error || "請再試一次。"));
                }
            } catch (error) {
                console.error("錯誤:", error);
                alert("發生錯誤，請稍後再試。");
            }
        });
    } else {
        alert("尚未登入，請先登入！");
    }
});
