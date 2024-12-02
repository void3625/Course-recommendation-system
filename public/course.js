function showCategory(category) {
    const sections = document.querySelectorAll('.course-category');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(category).style.display = 'block';
}

// 獲取課程數據
document.addEventListener('DOMContentLoaded', fetchCourses);

async function fetchCourses() {
    try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const courses = await response.json();
        displayCourses(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}

function displayCourses(courses) {
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

    courses.forEach(course => {
        const category = course.category;
        const categoryDiv = categories[category];
        if (categoryDiv) {
            const courseItem = document.createElement('div');
            courseItem.className = 'recommendation-item';

            const courseTitle = document.createElement('h2');
            courseTitle.textContent = course.course_name;

            const courseDescription = document.createElement('p');
            courseDescription.textContent = 'MBTI類型: ' + course.MBTI_type + '\nCEEC類型: ' + course.CEEC_type;

            const courseLink = document.createElement('a');
            courseLink.href = course.link;
            courseLink.textContent = '查看課程';

            const favoriteButton = document.createElement('button');
            favoriteButton.textContent = '收藏課程';
            favoriteButton.onclick = async () => {
                try {
                    const response = await fetch('/api/courses/collect', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            course_name: course.course_name,
                            MBTI_type: course.MBTI_type,
                            CEEC_type: course.CEEC_type,
                            link: course.link,
                            category: course.category
                        }),
                    });

                    if (response.ok) {
                        alert('課程已收藏！');
                    } else {
                        alert('收藏失敗，請稍後再試。');
                    }
                } catch (error) {
                    console.error('收藏錯誤:', error);
                    alert('發生錯誤，請稍後再試。');
                }
            };


    courseItem.appendChild(courseTitle);
    courseItem.appendChild(courseDescription);
    courseItem.appendChild(courseLink);
    courseItem.appendChild(favoriteButton);

    categoryDiv.appendChild(courseItem);
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