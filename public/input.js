document.addEventListener('DOMContentLoaded', async function () {
    // 從後端獲取登入使用者的 ID
    const userIdResponse = await fetch('/api/users/getUserId');
    const userData = await userIdResponse.json();

    if (userData.user_id) {
        const userId = userData.user_id; // 取得登入使用者的 ID
        console.log('登入的使用者 ID:', userId);


        // 保存 user_id 到 localStorage 以便在其他頁面中使用
        localStorage.setItem('user_id', userId);

        const mbtiTypes = [
            'ISTJ - 檢查者', 'ISFJ - 守護者', 'INFJ - 提倡者', 'INTJ - 建築師',
            'ISTP - 鑑定者', 'ISFP - 探險家', 'INFP - 調停者', 'INTP - 邏輯學家',
            'ESTP - 企業家', 'ESFP - 表演者', 'ENFP - 冒險家', 'ENTP - 辯論家',
            'ESTJ - 總經理', 'ESFJ - 執政官', 'ENFJ - 主人公', 'ENTJ - 指揮官'
        ];

        const mbtiDescriptions = {
            ISTJ: {
                title: '檢查者 (ISTJ)',
                description: '負責任、有條理，善於執行計劃，是可靠的實務派。他們注重細節，喜歡遵循規則和制度，確保工作順利完成。',
                strengths: '優點：可靠、務實、負責任，擅長管理和執行。',
                weaknesses: '挑戰：可能顯得過於保守，對變化的適應能力稍弱。'
            },
            ISFJ: {
                title: '守護者 (ISFJ)',
                description: '溫和且有耐心，重視傳統與穩定，願意為他人提供支持。他們擅長維護人際關係。',
                strengths: '優點：同理心強、體貼、可靠，擅長照顧他人。',
                weaknesses: '挑戰：可能過於自我犧牲，容易感到壓力過大。'
            },
            INFJ: {
                title: '提倡者 (INFJ)',
                description: '理想主義者，具有遠見和洞察力，善於理解他人的內心世界。他們有強烈的使命感，想要改變世界。',
                strengths: '優點：有創造力、同理心、善於長期規劃。',
                weaknesses: '挑戰：可能過於理想化，容易對現實感到失望。'
            },
            INTJ: {
                title: '建築師 (INTJ)',
                description: '擁有邏輯性與果斷力，喜歡設計與規劃長遠目標。他們擅長分析和制定戰略。',
                strengths: '優點：有遠見、獨立、擅長解決複雜問題。',
                weaknesses: '挑戰：可能顯得冷漠，對情感需求較為忽略。'
            },
            ISTP: {
                title: '鑑定者 (ISTP)',
                description: '實際且靈活，喜歡處理具體的問題與工具。他們善於應對緊急情況，並能迅速找到解決方法。',
                strengths: '優點：冷靜、務實、適應力強，擅長解決實際問題。',
                weaknesses: '挑戰：可能缺乏長期計劃，對人際互動較為冷淡。'
            },
            ISFP: {
                title: '探險家 (ISFP)',
                description: '內向而有創意，喜歡追求和表達美感。他們通常溫和，並對周圍的事物充滿欣賞。',
                strengths: '優點：創造力豐富、隨和、體貼，擅長藝術表達。',
                weaknesses: '挑戰：可能過於敏感，容易受到批評影響。'
            },
            INFP: {
                title: '調停者 (INFP)',
                description: '理想主義者，內心世界豐富，對他人有深刻的理解。他們追求真理與理想，並希望幫助他人。',
                strengths: '優點：有創造力、同理心、忠於自己的價值觀。',
                weaknesses: '挑戰：可能過於理想化，與現實脫節，容易感到沮喪。'
            },
            INTP: {
                title: '邏輯學家 (INTP)',
                description: '富有好奇心和分析能力，熱衷於理解複雜的理論。他們喜歡思考，並尋找知識的真相。',
                strengths: '優點：理性、創新、擅長解決問題。',
                weaknesses: '挑戰：可能過於理性，忽略情感需求。'
            },
            ESTP: {
                title: '企業家 (ESTP)',
                description: '行動派，喜歡冒險與挑戰。他們擅長快速解決問題，並樂於享受當下。',
                strengths: '優點：靈活、機智、充滿活力，擅長應變。',
                weaknesses: '挑戰：可能衝動，對細節缺乏耐心。'
            },
            ESFP: {
                title: '表演者 (ESFP)',
                description: '熱愛生活且充滿魅力，喜歡與人互動。他們追求快樂，並善於激勵他人。',
                strengths: '優點：外向、熱情、擅長社交。',
                weaknesses: '挑戰：可能過於追求外界認可，對長期目標缺乏關注。'
            },
            ENFP: {
                title: '冒險家 (ENFP)',
                description: '充滿創造力和熱情，對新事物充滿好奇，並激勵他人一起追求目標。',
                strengths: '優點：創意豐富、感染力強、擅長啟發他人。',
                weaknesses: '挑戰：可能缺乏專注，容易分心。'
            },
            ENTP: {
                title: '辯論家 (ENTP)',
                description: '喜歡挑戰傳統觀念，並探索新領域。他們具有創新思維和辯論能力。',
                strengths: '優點：聰明、創新、富有挑戰精神。',
                weaknesses: '挑戰：可能過於爭辯，忽略他人感受。'
            },
            ESTJ: {
                title: '總經理 (ESTJ)',
                description: '務實且負責任，注重效率與秩序。他們擅長組織與管理，是可靠的領導者。',
                strengths: '優點：果斷、組織力強、目標導向。',
                weaknesses: '挑戰：可能過於僵化，缺乏靈活性。'
            },
            ESFJ: {
                title: '執政官 (ESFJ)',
                description: '關心他人，注重和諧與團結。他們擅長維護人際關係，是團隊中的重要角色。',
                strengths: '優點：善於照顧他人、體貼、有責任感。',
                weaknesses: '挑戰：可能過於在意他人看法，忽略自身需求。'
            },
            ENFJ: {
                title: '主人公 (ENFJ)',
                description: '具有強大的領導力和感染力，擅長啟發和激勵他人，並注重團隊合作。',
                strengths: '優點：有同理心、擅長激勵他人、領導力強。',
                weaknesses: '挑戰：可能過於關注他人，忽略自我需求。'
            },
            ENTJ: {
                title: '指揮官 (ENTJ)',
                description: '果敢且有遠見，擅長計畫與組織大規模的事務。他們追求效率與目標實現。',
                strengths: '優點：果斷、遠見卓識、領導力強。',
                weaknesses: '挑戰：可能顯得冷酷，忽略情感需求。'
            }
        };

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

            const mbtiCode = type.split(' - ')[0]; // 取得 MBTI 縮寫

            option.addEventListener('click', () => {
                document.querySelectorAll('.mbti-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                mbtiInput.value = mbtiCode; // 設定選中的 MBTI 值
            });

            // 顯示 MBTI 詳細介紹
            option.addEventListener('mouseover', () => {
                const details = mbtiDescriptions[mbtiCode];
                if (details) {
                    mbtiText.innerHTML = `
                        <strong>${details.title}</strong><br>
                        <p>${details.description}</p>
                        <p>${details.strengths}</p>
                        <p>${details.weaknesses}</p>
                    `;
                    mbtiImage.src = `./image/MBTI/${mbtiCode}.jpg`; // 更新圖片
                    mbtiDetail.style.display = 'block'; // 顯示詳細框
                }
            });

            // 當滑鼠離開時隱藏詳細介紹框
            option.addEventListener('mouseout', () => {
                mbtiDetail.style.display = 'none';
            });

            mbtiSelector.appendChild(option);
        });

        // 使用 Sortable.js 初始化拖拉排序功能
        new Sortable(document.getElementById('ceec-order'), {
            animation: 150, // 設定拖拉動畫的速度
            ghostClass: 'sortable-ghost', // 拖拉中的項目的特殊樣式
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
