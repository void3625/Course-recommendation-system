from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from recommend import recommend_all_strategies, course_df

from get_db_connection import get_db_connection

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s', encoding='utf-8')

@app.route('/api/recommend', methods=['POST'])
def recommend():
    """
    接收用戶 MBTI 和 CEEC，返回三種推薦策略的結果，MBTI+CEEC 帶有權重計算。
    """
    if request.method == "OPTIONS":
        response = jsonify({"message": "Preflight allowed"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.status_code = 200
        return response

    user_data = request.get_json()
    user_id = user_data.get('user_id')
    mbti_weight = user_data.get('mbti_weight', 0.4)  # 默認 MBTI 權重
    ceec_weight = user_data.get('ceec_weight', 0.6)  # 默認 CEEC 權重

    if not user_data or 'user_id' not in user_data:
        response = jsonify({"error": "Invalid request. 'user_id' is required."})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        return response, 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT "mbti", "ceec" FROM users WHERE id = %s', (user_id,))
        user_record = cursor.fetchone()

        if user_record:
            user_mbti, user_ceec = user_record

            # 提取前兩個字母，並移除逗號
            user_ceec = ''.join(user_ceec.split(',')[:2]).strip()

            # 確保 course_df 已加載
            if course_df is None:
                return jsonify({"error": "課程數據未加載"}), 500

            # 調用推薦函數
            recommendations = recommend_all_strategies(user_mbti, user_ceec, course_df, top_n=5,
                                                        mbti_weight=mbti_weight, ceec_weight=ceec_weight)
            response = jsonify(recommendations)
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
            return response, 200
        else:
            response = jsonify({"error": "找不到指定的使用者 ID"})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
            return response, 404

    except Exception as e:
        response = jsonify({"error": f"Error generating recommendations: {str(e)}"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        return response, 500
    
    finally:
        if 'cursor' in locals() and cursor is not None:
            cursor.close()
        if 'conn' in locals() and conn is not None:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)