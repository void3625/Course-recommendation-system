# 假設您使用 Flask 或類似的後端框架
from flask import Flask, request, jsonify

# 創建 Flask 應用程序的實例
app = Flask(__name__)

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host='localhost',
            user='postgres',
            password='123',
            dbname='usermanagement',
            port='5432'
        )
        return conn
    except Exception as e:
        print(f"資料庫連接錯誤: {e}")
        raise

@app.route('/save-user-data', methods=['POST'])
def save_user_data():
    data = request.json
    user_id = data.get('user_id')
    mbti = data.get('mbti')
    ceec_order = ','.join(data.get('ceec_order', []))  # 將排序列表轉換為字串

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 注意這裡的欄位名稱需要加上雙引號，因為欄位是大寫的
        cursor.execute(
            'UPDATE public.users SET "MBTI" = %s, "CEEC" = %s WHERE id = %s',
            (mbti, ceec_order, user_id)
        )
        conn.commit()
        return jsonify({"message": "資料已成功儲存"}), 200
    except Exception as e:
        print("儲存錯誤:", e)
        conn.rollback()
        # 返回具體錯誤訊息到前端
        return jsonify({"error": f"儲存資料時出錯: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()