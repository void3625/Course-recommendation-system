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
def recommend_all_strategies(user_mbti, user_ceec, course_df, top_n=5, mbti_weight=0.4, ceec_weight=0.6):
    """
    同時返回基於 MBTI、CEEC 和 MBTI+CEEC 的推薦結果，其中 MBTI+CEEC 帶有權重計算。
    """
    recommendations = {}

    try:
        # 基於 MBTI 的推薦
        mbti_columns = [col for col in course_df.columns if col in user_mbti]
        if mbti_columns:
            mbti_courses = course_df[course_df[mbti_columns].any(axis=1)].head(top_n)
            recommendations['MBTI'] = mbti_courses['課程名稱'].tolist()
        else:
            recommendations['MBTI'] = []

        # 基於 CEEC 的推薦
        ceec_columns = [col for col in course_df.columns if col in user_ceec]
        if ceec_columns:
            ceec_courses = course_df[course_df[ceec_columns].any(axis=1)].head(top_n)
            recommendations['CEEC'] = ceec_courses['課程名稱'].tolist()
        else:
            recommendations['CEEC'] = []

        # 基於 MBTI+CEEC 的推薦（帶權重計算）
        if mbti_columns and ceec_columns:
            # 填補空值避免 NaN
            course_df[mbti_columns] = course_df[mbti_columns].fillna(0)
            course_df[ceec_columns] = course_df[ceec_columns].fillna(0)

            # 計算分數
            course_df['MBTI_score'] = course_df[mbti_columns].max(axis=1)
            course_df['CEEC_score'] = course_df[ceec_columns].max(axis=1)
            course_df['combined_score'] = (
                mbti_weight * course_df['MBTI_score'] +
                ceec_weight * course_df['CEEC_score']
            )

            # 篩選排序並選取前 N 名
            combined_courses = course_df.sort_values(by='combined_score', ascending=False).head(top_n)
            recommendations['MBTI+CEEC'] = combined_courses['課程名稱'].tolist()
        else:
            recommendations['MBTI+CEEC'] = []

    except Exception as e:
        recommendations['error'] = str(e)

    return recommendations

