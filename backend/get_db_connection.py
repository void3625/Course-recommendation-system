import psycopg2

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
        raise  # 重新拋出異常，讓調用方能感知錯誤