import pandas as pd
import logging
import os

# 加載新 MBTI 和 CEEC 的延伸數據
base_dir = os.path.dirname(os.path.abspath(__file__))

file_new_mbti_human = os.path.join(base_dir, 'data', 'newMBTI延伸人.xlsx')
file_new_mbti_sky = os.path.join(base_dir, 'data', 'newMBTI延伸天.xlsx')
file_new_mbti_self = os.path.join(base_dir, 'data', 'newMBTI延伸我.xlsx')
file_new_mbti_object = os.path.join(base_dir, 'data', 'newMBTI延伸物.xlsx')

file_new_ceec_human = os.path.join(base_dir, 'data', 'newCEEC延伸人.xlsx')
file_new_ceec_sky = os.path.join(base_dir, 'data', 'newCEEC延伸天.xlsx')
file_new_ceec_self = os.path.join(base_dir, 'data', 'newCEEC延伸我.xlsx')
file_new_ceec_object = os.path.join(base_dir, 'data', 'newCEEC延伸物.xlsx')

try:
    df_mbti_human = pd.read_excel(file_new_mbti_human)
    df_mbti_sky = pd.read_excel(file_new_mbti_sky)
    df_mbti_self = pd.read_excel(file_new_mbti_self)
    df_mbti_object = pd.read_excel(file_new_mbti_object)

    df_ceec_human = pd.read_excel(file_new_ceec_human)
    df_ceec_sky = pd.read_excel(file_new_ceec_sky)
    df_ceec_self = pd.read_excel(file_new_ceec_self)
    df_ceec_object = pd.read_excel(file_new_ceec_object)

    # 合併 MBTI 和 CEEC 的延伸數據到課程特徵中
    course_df = pd.concat([df_mbti_human, df_mbti_sky, df_mbti_self, df_mbti_object,
                           df_ceec_human, df_ceec_sky, df_ceec_self, df_ceec_object], ignore_index=True)
                     


except FileNotFoundError as e:
    print(f"找不到文件: {e}")
except Exception as e:
    print(f"讀取文件時出現錯誤: {e}")

def calculate_matching_score(user_mbti, user_ceec, course_df):
    # 計算每個課程的匹配分數
    def get_matching_score(row):
        # MBTI 匹配計算
        mbti_value = row['最相似的MBTI類型']
        mbti_similarity = row['相似度']
        if pd.isna(mbti_value) or pd.isna(mbti_similarity):
            mbti_score = 0  # 無法匹配時得 0 分
        elif mbti_value == user_mbti:
            mbti_score = mbti_similarity  # 使用相似度作為分數
        else:
            mbti_score = 0  # 不匹配時得 0 分

        # CEEC 匹配計算
        ceec_value = row['最相似的CEEC類型']
        ceec_similarity = row['相似度']
        if pd.isna(ceec_value) or pd.isna(ceec_similarity):
            ceec_score = 0  # 無法匹配時得 0 分
        elif len(ceec_value) == 1:
            ceec_score = ceec_similarity if ceec_value == user_ceec[0] else 0
        elif len(ceec_value) >= 2:
            ceec_score = ceec_similarity if ceec_value[:2] == user_ceec[:2] else 0
        else:
            ceec_score = 0

        # 加權合併分數
        matching_score = 0.4 * mbti_score + 0.6 * ceec_score
        return matching_score

    # 找到包含無效數據的行並警告
    invalid_rows = course_df[course_df['相似度'].isna()]
    if not invalid_rows.empty:
        print("以下是相似度為空的行：")
        print(invalid_rows)

    # 計算匹配分數
    course_df['matching_score'] = course_df.apply(get_matching_score, axis=1)
    return course_df

# 推薦函數，為每個用戶推薦最相似的課程
def recommend_courses(user_mbti, user_ceec, top_n=10):
    # 計算匹配分數
    updated_course_df = calculate_matching_score(user_mbti, user_ceec, course_df)
    
    # 根據匹配分數排序，選出 Top N 課程
    recommended_courses = updated_course_df.sort_values(by='matching_score', ascending=False).head(top_n)

    # 檢查並處理 NaN 值
    recommended_courses = recommended_courses.fillna('不匹配')  # 將 NaN 替換為 '不匹配'

    # 回傳更多欄位讓前端能存入資料庫：id, MBTI_type, CEEC_type, link, category 都可以加入
    results = recommended_courses.apply(
        lambda row: {
            "id": row['id'],
            "課程名稱": row['課程名稱'],
            "matching_score": f"{row['matching_score'] * 100:.2f}%",  # 轉換為百分比格式
            "最相似的MBTI類型": row['最相似的MBTI類型'],
            "最相似的CEEC類型": row['最相似的CEEC類型'],
            "MBTI_type": row['MBTI_type'],
            "CEEC_type": row['CEEC_type'],
            "link": row['link'],
            "category": row['category']
        },
        axis=1
    ).tolist()

    return results


