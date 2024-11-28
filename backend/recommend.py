import pandas as pd
import numpy as np

# 加載用戶數據
file_ceec = './data/CEEC向量.xlsx'
file_mbti = './data/MBTI向量.xlsx'
df_ceec = pd.read_excel(file_ceec)
df_mbti = pd.read_excel(file_mbti)

# 合併用戶的 CEEC 和 MBTI 特徵
user_features_df = pd.merge(df_mbti, df_ceec, on="user_id", how="inner")
user_features = user_features_df.drop(columns=["user_id"]).values

# 加載新 MBTI 延伸數據
file_new_mbti_human = './data/newMBTI延伸人.xlsx'
file_new_mbti_sky = './data/newMBTI延伸天.xlsx'
file_new_mbti_self = './data/newMBTI延伸我.xlsx'
file_new_mbti_object = './data/newMBTI延伸物.xlsx'

df_mbti_human = pd.read_excel(file_new_mbti_human)
df_mbti_sky = pd.read_excel(file_new_mbti_sky)
df_mbti_self = pd.read_excel(file_new_mbti_self)
df_mbti_object = pd.read_excel(file_new_mbti_object)

# 加載新 CEEC 延伸數據
file_new_ceec_human = './data/newCEEC延伸人.xlsx'
file_new_ceec_sky = './data/newCEEC延伸天.xlsx'
file_new_ceec_self = './data/newCEEC延伸我.xlsx'
file_new_ceec_object = './data/newCEEC延伸物.xlsx'

df_ceec_human = pd.read_excel(file_new_ceec_human)
df_ceec_sky = pd.read_excel(file_new_ceec_sky)
df_ceec_self = pd.read_excel(file_new_ceec_self)
df_ceec_object = pd.read_excel(file_new_ceec_object)

# 合併 MBTI 和 CEEC 的延伸數據到課程特徵中
course_df = pd.concat([df_mbti_human, df_mbti_sky, df_mbti_self, df_mbti_object,
                       df_ceec_human, df_ceec_sky, df_ceec_self, df_ceec_object], ignore_index=True)

from sklearn.metrics.pairwise import cosine_similarity

# 使用 MBTI 和 CEEC 數據來計算相似度
def calculate_matching_score(user_mbti, user_ceec, course_df):
    # 為課程計算 MBTI 和 CEEC 匹配分數
    course_df['matching_score'] = course_df.apply(
        lambda row: (
            0.5 * (1 if row['最相似的MBTI類型'].startswith(user_mbti) else row['相似度']) +
            0.5 * (1 if row['最相似的CEEC類型'] == user_ceec else row['相似度'])
        ), axis=1
    )
    return course_df

# 推薦函數，為每個用戶推薦最相似的課程
def recommend_courses(user_index, user_mbti, user_ceec, course_df, top_n=5):
    # 計算匹配分數
    course_df = calculate_matching_score(user_mbti, user_ceec, course_df)
    # 根據匹配分數排序
    recommended_courses = course_df.sort_values(by='matching_score', ascending=False).head(top_n)['課程名稱'].values
    return recommended_courses
