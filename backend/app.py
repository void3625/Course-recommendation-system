from flask import Flask, request, jsonify
from recommend import recommend_courses, course_df

app = Flask(__name__)

@app.route('/api/recommend', methods=['POST'])
def recommend():
    user_data = request.get_json()
    user_index = user_data['user_index']  # 接收用戶索引
    user_mbti = user_data['user_mbti']    # 接收用戶的 MBTI 類型
    user_ceec = user_data['user_ceec']    # 接收用戶的 CEEC 類型
    
    recommendations = recommend_courses(user_index, user_mbti, user_ceec, course_df)
    return jsonify({'recommended_courses': recommendations.tolist()})

if __name__ == '__main__':
    app.run(debug=True)
