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

def recommend_all_strategies(user_mbti, user_ceec, course_df, top_n=5, mbti_weight=0.4, ceec_weight=0.6):
    """
    根據使用者的 MBTI 和 CEEC 進行推薦，包括單獨的 MBTI、單獨的 CEEC，以及 MBTI+CEEC 加權推薦。
    """
    recommendations = {}

    # MBTI 推薦邏輯
    mbti_columns = [col for col in course_df.columns if col == user_mbti]
    logging.debug(f"篩選出的 MBTI 列: {mbti_columns}")

    if mbti_columns:
        mbti_courses = course_df[course_df[mbti_columns].any(axis=1)].head(top_n)
        recommendations['MBTI'] = mbti_courses['課程名稱'].tolist()
    else:
        recommendations['MBTI'] = []

    # CEEC 推薦邏輯
    ceec_prefix = user_ceec[0]  # 首字母
    ceec_full = user_ceec       # 完整類型

    ceec_columns = [col for col in course_df.columns if col == ceec_prefix or col == ceec_full]
    logging.debug(f"篩選出的 CEEC 列: {ceec_columns}")

    if ceec_columns:
        ceec_courses = course_df[course_df[ceec_columns].any(axis=1)].head(top_n)
        recommendations['CEEC'] = ceec_courses['課程名稱'].tolist()
    else:
        recommendations['CEEC'] = []

    # MBTI+CEEC 加權推薦邏輯
    if mbti_columns and ceec_columns:
        # 填補空值以避免計算錯誤
        course_df[mbti_columns] = course_df[mbti_columns].fillna(0)
        course_df[ceec_columns] = course_df[ceec_columns].fillna(0)
        course_df['MBTI_score'] = course_df[mbti_columns].max(axis=1)
        course_df['CEEC_score'] = course_df[ceec_columns].max(axis=1)
        course_df['combined_score'] = (
            mbti_weight * course_df['MBTI_score'] +
            ceec_weight * course_df['CEEC_score']
        )

        combined_courses = course_df.sort_values(by='combined_score', ascending=False).head(top_n)
        recommendations['MBTI+CEEC'] = combined_courses['課程名稱'].tolist()
        logging.debug("MBTI_score 列統計:\n{}".format(course_df['MBTI_score'].describe()))
        logging.debug("CEEC_score 列統計:\n{}".format(course_df['CEEC_score'].describe()))
        logging.debug("combined_score 列統計:\n{}".format(course_df['combined_score'].describe()))

    else:
        recommendations['MBTI+CEEC'] = []

    return recommendations

        
print(course_df.columns)
