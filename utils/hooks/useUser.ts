'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client'; // 客户端 Supabase 实例

// 定义 Hook 返回的状态类型
interface UserState {
  user: User | null;
  loading: boolean;
}

/**
 * 客户端 Hook: 监听和获取当前 Supabase 登录用户状态
 * @returns {UserState} 包含用户对象和加载状态
 */
export const useUser = (): UserState => {
  // 初始化用户状态为加载中
  const [userState, setUserState] = useState<UserState>({ user: null, loading: true });
  const supabase = createClient();

  useEffect(() => {
    // 1. 监听认证状态变化 (登录/登出/Token刷新)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // 根据会话(session)更新用户状态
        setUserState({ user: session?.user ?? null, loading: false });
      }
    );

    // 2. 首次加载时，立即获取一次用户状态，防止延迟
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserState({ user, loading: false });
    };

    fetchUser();

    // 3. 清理监听器：组件卸载时停止监听，避免内存泄漏
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return userState;
};