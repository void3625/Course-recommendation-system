import pandas as pd
import os

import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    encoding="utf-8"
)





# 獲取當前腳本的目錄
base_dir = os.path.dirname(os.path.abspath(__file__))

# 文件路徑指向 data 資料夾
file_ceec_human = os.path.join(base_dir, 'data', 'AllCEEC人2.0.xlsx')
file_ceec_sky = os.path.join(base_dir, 'data', 'AllCEEC天2.0.xlsx')
file_ceec_self = os.path.join(base_dir, 'data', 'AllCEEC我2.0.xlsx')
file_ceec_object = os.path.join(base_dir, 'data', 'AllCEEC物2.0.xlsx')

file_mbti_human = os.path.join(base_dir, 'data', 'AllMBTI人2.0.xlsx')
file_mbti_sky = os.path.join(base_dir, 'data', 'AllMBTI天2.0.xlsx')
file_mbti_self = os.path.join(base_dir, 'data', 'AllMBTI我2.0.xlsx')
file_mbti_object = os.path.join(base_dir, 'data', 'AllMBTI物2.0.xlsx')

try:
    # 讀取所有 CEEC 文件
    df_ceec_human = pd.read_excel(file_ceec_human)
    df_ceec_sky = pd.read_excel(file_ceec_sky)
    df_ceec_self = pd.read_excel(file_ceec_self)
    df_ceec_object = pd.read_excel(file_ceec_object)

    # 讀取所有 MBTI 文件
    df_mbti_human = pd.read_excel(file_mbti_human)
    df_mbti_sky = pd.read_excel(file_mbti_sky)
    df_mbti_self = pd.read_excel(file_mbti_self)
    df_mbti_object = pd.read_excel(file_mbti_object)

    # 合併所有數據到一個 DataFrame
    course_df = pd.concat([
        df_ceec_human, df_ceec_sky, df_ceec_self, df_ceec_object,
        df_mbti_human, df_mbti_sky, df_mbti_self, df_mbti_object
    ], ignore_index=True)
    print("所有文件加載成功，數據已合併到 course_df。")

except FileNotFoundError as e:
    print(f"找不到文件: {e}")
    course_df = None  # 如果文件未找到，設置為 None
except Exception as e:
    print(f"讀取文件時出現錯誤: {e}")
    course_df = None

# 基於 MBTI 前四個字母的匹配邏輯
def calculate_matching_score_mbti_prefix(user_mbti, user_ceec, course_df):
    """
    根據用戶的 MBTI 前四個字母和 CEEC 匹配課程分數。
    """
    # 提取 MBTI 和 CEEC 的相關列
    mbti_columns = [col for col in course_df.columns if col in user_mbti]
    ceec_columns = [col for col in course_df.columns if col in user_ceec]

    # 如果沒有找到匹配的列，拋出錯誤
    if not mbti_columns:
        raise ValueError(f"用戶的 MBTI 類型 '{user_mbti}' 未找到對應列。")
    if not ceec_columns:
        raise ValueError(f"用戶的 CEEC 類型 '{user_ceec}' 未找到對應列。")

    # 填補空值以避免 NaN 的影響
    course_df[mbti_columns] = course_df[mbti_columns].fillna(0)
    course_df[ceec_columns] = course_df[ceec_columns].fillna(0)

    # 計算 MBTI 和 CEEC 的匹配分數
    course_df['MBTI_score'] = course_df[mbti_columns].max(axis=1)
    course_df['CEEC_score'] = course_df[ceec_columns].max(axis=1)

    # 加權計算最終匹配分數
    course_df['matching_score'] = 0.4 * course_df['MBTI_score'] + 0.6 * course_df['CEEC_score']
    
    return course_df


COLUMN_MAPPING = {
    'id': '課程編號',           # 確保這裡填的是數據文件中的實際欄位名
    '課程名稱': '課程名稱',
    'matching_score': '匹配分數',
    'MBTI_type': 'MBTI類型',
    'CEEC_type': 'CEEC類型',
    'link': '課程鏈接',
    'category': '課程分類'
}


def recommend_courses_mbti_prefix(user_mbti, user_ceec, course_df, top_n=10):
    """
    根據用戶 MBTI 前四個字母和 CEEC 推薦課程。
    """
    # 計算匹配分數
    updated_df = calculate_matching_score_mbti_prefix(user_mbti, user_ceec, course_df)

    # 確保數據中存在需要的欄位
    required_columns = ['課程名稱', 'matching_score']  # 只保留必要欄位
    missing_columns = [col for col in required_columns if col not in updated_df.columns]
    if missing_columns:
        raise ValueError(f"以下欄位在數據中缺失: {missing_columns}")

    # 根據匹配分數進行排序，選取前 N 名課程
    recommended_courses = updated_df[['課程名稱', 'matching_score']].sort_values(
        by='matching_score', ascending=False
    ).head(top_n)

    # 格式化輸出
    results = recommended_courses.apply(
        lambda row: {
            "course_name": row['課程名稱'],
            "matching_score": f"{row['matching_score'] * 100:.2f}%"
        },
        axis=1
    ).tolist()

    return results

print("數據文件中的欄位名稱:")
print(course_df.columns)

# 測試代碼
if __name__ == "__main__":
    if course_df is not None:
        try:
            user_mbti_prefix = 'INFP'
            user_ceec_type = 'R'
            recommended_courses = recommend_courses_mbti_prefix(user_mbti_prefix, user_ceec_type, course_df, top_n=10)
            print("推薦課程如下：")
            print(recommended_courses)
        except ValueError as e:
            print(f"錯誤: {e}")
        except Exception as e:
            print(f"未知錯誤: {e}")
    else:
        print("無法進行推薦，因為 course_df 未成功創建。")
