import os
from google import genai
from google.genai import types

# ----------------------------------------------------
# 使用你提供的密钥进行测试
# ----------------------------------------------------
API_KEY = "AIzaSyCeTsnHtsxgN5QlcizblqY1F8JXzZgJWFI"
print("--- 正在使用提供的密钥进行连接测试 ---")

try:
    # 初始化 AI 客户端
    client = genai.Client(api_key=API_KEY)
    
    # 构建一个简单的测试请求
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='请用中文回答：1加1等于几？'
    )
    
    print("\n✅ 密钥有效！API 调用成功。")
    print(f"AI 回复内容: {response.text.strip()}")
    
except Exception as e:
    print(f"\n❌ 密钥可能无效或有连接问题。")
    print(f"错误信息: {e}")

print("\n--- 测试结束 ---")