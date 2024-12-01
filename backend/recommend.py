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
    # 為課程計算 MBTI 和 CEEC 匹配分數
    def get_matching_score(row):
        # 確保 '最相似的MBTI類型' 為字串
        mbti_value = row['最相似的MBTI類型']
        if pd.isna(mbti_value):
            mbti_value = ''  # 將 NaN 值轉換為空字串
        else:
            mbti_value = str(mbti_value)  # 保證 mbti_value 是字串

        # MBTI 匹配邏輯
        mbti_score = 0.4 * (1 if mbti_value.startswith(user_mbti) else row['相似度'])

        # 確保 '最相似的CEEC類型' 為字串
        ceec_value = row['最相似的CEEC類型']
        if pd.isna(ceec_value):
            ceec_value = ''  # 將 NaN 值轉換為空字串
        else:
            ceec_value = str(ceec_value)  # 保證 ceec_value 是字串

        # CEEC 匹配邏輯
        if len(ceec_value) == 1:
            # 當課程的 CEEC 類型只有一個字母時，與用戶的第一個字母匹配，得高分
            ceec_score = 1.0 if ceec_value == user_ceec[0] else row['相似度']
        else:
            # 正常匹配情況，前兩個字母進行比較
            ceec_score = 1.0 if ceec_value[:2] == user_ceec[:2] else row['相似度']
        
        # 加權合併 MBTI 和 CEEC 的分數
        matching_score = 0.4 * mbti_score + 0.6 * ceec_score
        return matching_score
    
    # 找到包含非字串或空值的行
    invalid_rows = course_df[course_df['最相似的CEEC類型'].apply(lambda x: not isinstance(x, str))]
    if not invalid_rows.empty:
        print("以下是包含非字串類型的 '最相似的CEEC類型' 欄位的行：")
        print(invalid_rows)

    # 對每個課程應用匹配分數計算邏輯
    course_df['matching_score'] = course_df.apply(get_matching_score, axis=1)
    return course_df

# 推薦函數，為每個用戶推薦最相似的課程
def recommend_courses(user_mbti, user_ceec, top_n=10):
    # 計算匹配分數
    updated_course_df = calculate_matching_score(user_mbti, user_ceec, course_df)
    # 根據匹配分數排序
    recommended_courses = updated_course_df.sort_values(by='matching_score', ascending=False).head(top_n)['課程名稱'].values
    return recommended_courses
