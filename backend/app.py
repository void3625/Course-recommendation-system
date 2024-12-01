from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from recommend import recommend_courses
from get_db_connection import get_db_connection


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
logging.basicConfig(level=logging.DEBUG)

@app.route('/api/recommend', methods=['POST', 'OPTIONS'])
def recommend():
    if request.method == "OPTIONS":
        response = jsonify({"message": "Preflight allowed"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.status_code = 200
        return response

    user_data = request.get_json()
    user_id = user_data.get('user_id')
    logging.debug(f"Received recommendation request for user_id={user_id}")

    user_data = request.get_json()
    logging.debug(f"Received request data: {user_data}")

    if not user_data or 'user_id' not in user_data:
        logging.warning("No valid user_id found in the request data.")
        response = jsonify({"error": "Invalid request. 'user_id' is required."})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        return response, 400



    # 初始化連接和游標
    conn = None
    cursor = None

    try:
        # 從資料庫中提取用戶資料
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT "MBTI", "CEEC" FROM public.users WHERE id = %s', (user_id,))
        user_record = cursor.fetchone()

        if user_record:
            user_mbti, user_ceec = user_record
            logging.debug(f"User data retrieved: MBTI={user_mbti}, CEEC={user_ceec}")

            # 預處理 CEEC 字段，只取前兩個字母並去除逗號
            user_ceec = ''.join(user_ceec.split(',')[:2])

            # 調用推薦函數
            recommendations = recommend_courses(user_mbti, user_ceec)
            logging.info(f"Recommendations generated for user_id={user_id}")

            response = jsonify({"recommended_courses": recommendations.tolist()})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
            return response, 200
        else:
            logging.warning(f"No user found with user_id={user_id}")
            response = jsonify({"error": "找不到指定的使用者 ID"})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
            return response, 404

    except Exception as e:
        logging.error(f"Error while generating recommendations: {str(e)}", exc_info=True)
        response = jsonify({"error": f"Error generating recommendations: {str(e)}"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        return response, 500

    finally:
        # 安全地關閉游標和連接
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)


