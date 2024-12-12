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
    # Load CEEC files
    df_ceec_human = pd.read_excel(file_ceec_human, engine='openpyxl')
    df_ceec_sky = pd.read_excel(file_ceec_sky, engine='openpyxl')
    df_ceec_self = pd.read_excel(file_ceec_self, engine='openpyxl')
    df_ceec_object = pd.read_excel(file_ceec_object, engine='openpyxl')
    
    # Combine CEEC data
    combined_ceec_df = pd.concat(
        [df_ceec_human, df_ceec_sky, df_ceec_self, df_ceec_object],
        ignore_index=True
    )
    
    # Load MBTI files
    df_mbti_human = pd.read_excel(file_mbti_human, engine='openpyxl')
    df_mbti_sky = pd.read_excel(file_mbti_sky, engine='openpyxl')
    df_mbti_self = pd.read_excel(file_mbti_self, engine='openpyxl')
    df_mbti_object = pd.read_excel(file_mbti_object, engine='openpyxl')
    
    # Combine MBTI data
    combined_mbti_df = pd.concat(
        [df_mbti_human, df_mbti_sky, df_mbti_self, df_mbti_object],
        ignore_index=True
    )
    
    # Save combined results
    combined_ceec_df.to_csv('combined_ceec_path', encoding='utf-8-sig', index=False)
    combined_mbti_df.to_csv('combined_mbti_path', encoding='utf-8-sig', index=False)

     # Ensure the key column is named consistently
    combined_ceec_df.rename(columns={'課程名稱': '課程名稱'}, inplace=True)
    combined_mbti_df.rename(columns={'課程名稱': '課程名稱'}, inplace=True)
    combined_ceec_df['來源'] = 'CEEC'
    combined_mbti_df['來源'] = 'MBTI'
    # Merge the two dataframes on course_name
    course_df = pd.merge(combined_ceec_df, combined_mbti_df, on='課程名稱', how='outer', suffixes=('_ceec', '_mbti'))
    
    # Save the merged dataframe
    course_df.to_csv('merged_path', encoding='utf-8-sig', index=False)
except FileNotFoundError as e:
    print(f"找不到文件: {e}")
    course_df = None  # 如果文件未找到，設置為 None
except Exception as e:
    print(f"讀取文件時出現錯誤: {e}")
    course_df = None

def recommend_all_strategies(user_mbti, user_ceec, course_df, top_n=5, mbti_weight=0.4, ceec_weight=0.6):
    """
    根據使用者的 MBTI 和 CEEC 進行推薦，包括單獨的 MBTI、單獨的 CEEC，以及 MBTI+CEEC 加正推薦。
    """
    recommendations = {}

    # MBTI 推薦邏輯
    if user_mbti in combined_mbti_df.columns:
        mbti_courses = combined_mbti_df.nlargest(top_n, user_mbti)[['課程名稱', user_mbti]]
        recommendations['MBTI'] = mbti_courses['課程名稱'].tolist()
    else:
        recommendations['MBTI'] = []

    # CEEC 推薦邏輯
    ceec_prefix = user_ceec[0]  # 首字母
    ceec_full = user_ceec       # 完整類型

    if ceec_prefix in combined_ceec_df.columns or ceec_full in combined_ceec_df.columns:
        ceec_scores = combined_ceec_df[[col for col in [ceec_prefix, ceec_full] if col in combined_ceec_df.columns]].max(axis=1)
        ceec_courses = combined_ceec_df.loc[ceec_scores.nlargest(top_n).index, ['課程名稱']]
        recommendations['CEEC'] = ceec_courses['課程名稱'].tolist()
    else:
        recommendations['CEEC'] = []

    # MBTI+CEEC 推薦
    if user_mbti in combined_mbti_df.columns and (ceec_prefix in combined_ceec_df.columns or ceec_full in combined_ceec_df.columns):
        mbti_scores = combined_mbti_df[user_mbti] if user_mbti in combined_mbti_df.columns else 0
        ceec_scores = combined_ceec_df[[col for col in [ceec_prefix, ceec_full] if col in combined_ceec_df.columns]].max(axis=1).fillna(0)
        course_df['combined_score'] = (
            mbti_weight * mbti_scores +
            ceec_weight * ceec_scores
        )
        combined_courses = course_df.nlargest(top_n, 'combined_score')[['課程名稱', 'combined_score']]
        recommendations['MBTI+CEEC'] = combined_courses['課程名稱'].tolist()
    else:
        recommendations['MBTI+CEEC'] = []

    return recommendations
