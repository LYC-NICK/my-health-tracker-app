// app/page.tsx

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// 导入你的主内容组件 (客户端组件)
import MainContent from '@/components/MainContent'; 
import AuthUI from '@/components/AuthUI'; // 导入认证组件
// 假设您使用了 Shadcn/ui 的 Button，如果不是，请用基本的 <button> 替换
// import { Button } from '@/components/ui/button'; 

export default async function Index() {
  const supabase = createClient();

  // 服务器端获取用户状态
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 处理用户登出逻辑 (Server Action)
  const handleSignOut = async () => {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    // 重定向到主页，触发未登录状态
    redirect('/'); 
  };

  // 核心逻辑：如果用户未登录，显示 AuthUI
  if (!user) {
    return <AuthUI />;
  }

  // 如果用户已登录，显示应用的主内容
  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-gray-50">
      <header className="w-full max-w-6xl flex justify-between items-center py-4 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800">我的健康身材管理站</h1>
        <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 hidden sm:inline mr-4">
                欢迎, {user.email}
            </span>
            <form action={handleSignOut}>
              <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-lg hover:bg-red-50 transition duration-150"
              >
                 登出
              </button>
            </form>
        </div>
      </header>
      
      {/* 主内容组件，现在已是客户端组件 */}
      <main className="w-full max-w-6xl pt-8">
        <MainContent />
      </main>
    </div>
  );
}