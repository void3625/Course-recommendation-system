document.addEventListener('DOMContentLoaded', function() {
    const mbtiTypes = [
        'ISTJ - 檢查者', 'ISFJ - 守護者', 'INFJ - 提倡者', 'INTJ - 建築師',
        'ISTP - 鑑定者', 'ISFP - 探險家', 'INFP - 調停者', 'INTP - 邏輯學家',
        'ESTP - 企業家', 'ESFP - 表演者', 'ENFP - 冒險家', 'ENTP - 辯論家',
        'ESTJ - 總經理', 'ESFJ - 執政官', 'ENFJ - 主人公', 'ENTJ - 指揮官'
    ];

    const mbtiSelector = document.getElementById('mbti-selector');
    const mbtiInput = document.getElementById('mbti');

    mbtiTypes.forEach(type => {
        const option = document.createElement('div');
        option.className = 'mbti-option';
        option.textContent = type;
        option.addEventListener('click', () => {
            document.querySelectorAll('.mbti-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            mbtiInput.value = type.split(' - ')[0];
        });
        mbtiSelector.appendChild(option);
    });

    const ceecContainer = document.getElementById('ceec-order');
    const ceecItems = ceecContainer.querySelectorAll('.ceec-item');

    ceecItems.forEach(item => {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
        item.addEventListener('dragover', dragOver);
        item.addEventListener('drop', drop);
    });

    function dragStart() {
        this.classList.add('dragging');
    }

    function dragEnd() {
        this.classList.remove('dragging');
    }

    function dragOver(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(ceecContainer, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            ceecContainer.appendChild(draggable);
        } else {
            ceecContainer.insertBefore(draggable, afterElement);
        }
    }

    function drop(e) {
        e.preventDefault();
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.ceec-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});