from flask import Flask, request, jsonify
from recommend import recommend_courses, course_df

app = Flask(__name__)

@app.route('/api/recommend', methods=['POST'])
def recommend():
    user_data = request.get_json()
    user_index = user_data.get('user_index')
    user_mbti = user_data.get('user_mbti')
    user_ceec = user_data.get('user_ceec')

    # 假設 recommend_courses 返回的是推薦課程的列表
    try:
        recommendations = recommend_courses(user_index, user_mbti, user_ceec, course_df)
        # 返回推薦結果的 JSON 格式
        return jsonify({"recommended_courses": recommendations.tolist()}), 200
    except Exception as e:
        # 如果發生錯誤，返回錯誤信息
        return jsonify({"error": f"Error generating recommendations: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
