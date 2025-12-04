// components/AuthUI.tsx

'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // 导入客户端 Supabase 实例

// 假设您使用了 Shadcn/ui 的 Button, Input, Label 组件
// 如果没有，请将导入替换为您的项目中实际使用的组件，或者使用基本的 HTML 标签
// import { Button } from '@/components/ui/button'; 
// import { Input } from '@/components/ui/input';   
// import { Label } from '@/components/ui/label';   

// 简化版本，使用原生 HTML 元素和 Tailwind CSS
const AuthUI = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  const handleAuth = async () => {
    setLoading(true);
    setMessage('');

    // 根据当前模式选择注册还是登录
    const action = isSigningUp ? supabase.auth.signUp : supabase.auth.signInWithPassword;
    
    const { error, data } = await action({ email, password });

    setLoading(false);

    if (error) {
      // 捕获常见错误，如邮箱已存在、密码错误等
      setMessage(`认证失败: ${error.message}`);
    } else if (isSigningUp && data.user) {
      // 注册成功提示
      setMessage('注册成功！请检查你的邮箱进行验证（如果 Supabase 开启了邮箱验证）。');
    } else {
      // 登录成功或注册成功且无需验证（本地测试）
      setMessage('成功进入！页面将自动刷新...');
      // 强制刷新页面，让 page.tsx 重新检查用户状态
      window.location.reload(); 
    }
  };

  const formTitle = isSigningUp ? '注册新账号' : '登录现有账号';
  const buttonText = isSigningUp ? '注册' : '登录';
  const switchModeText = isSigningUp ? '已有账号？去登录' : '没有账号？去注册';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-2xl rounded-xl border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800">{formTitle}</h2>
        
        {/* 邮箱输入 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        
        {/* 密码输入 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input 
            id="password" 
            type="password" 
            placeholder="请输入密码 (至少6位)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
          
        {/* 登录/注册按钮 */}
        <button 
          onClick={handleAuth} 
          disabled={loading}
          className="w-full p-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
        >
          {loading ? '处理中...' : buttonText}
        </button>
          
        {/* 提示信息 */}
        {message && (
          <p className={`text-sm text-center ${message.includes('失败') ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p >
        )}

        {/* 切换模式链接 */}
        <button 
          onClick={() => setIsSigningUp(!isSigningUp)}
          className="w-full text-sm text-blue-600 hover:text-blue-800 transition duration-150 mt-4"
        >
          {switchModeText}
        </button>
      </div>
    </div>
  );
};

export default AuthUI;