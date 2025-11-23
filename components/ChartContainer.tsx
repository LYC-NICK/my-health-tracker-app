// components/ChartContainer.tsx

'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';

// 定义 prop 类型，保持你原来的定义
interface ChartContainerProps {
    children: React.ReactNode;
    // width 保持 string | number，以便支持 '100%' 或 500
    width: string | number; 
    // height 保持 number，如果你不需要支持 '100%'
    height: number; 
}

export default function ChartContainer({ children, width, height }: ChartContainerProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // 在组件未挂载时渲染占位符
    if (!hasMounted) {
        return (
            <div style={{ width: width, height: height, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6b7280' }}>
                图表加载中...
            </div>
        );
    }

    // 修复点：使用 'as string | number' 类型断言。
    // Recharts 实际上接受 string ('100%') 或 number (500)，
    // 我们强制 TypeScript 接受这两种可能，以解决编译错误。
    return (
        <ResponsiveContainer width={width as string | number} height={height as number}>
            {children}
        </ResponsiveContainer>
    );
}