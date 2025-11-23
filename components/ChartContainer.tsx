// components/ChartContainer.tsx

'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';

// 定义 prop 类型，保持你的原始定义，但将其独立出来
interface ChartContainerProps {
    children: React.ReactNode;
    // width 保持 string | number (支持 100% 或 500)
    width: string | number; 
    // height 保持 number
    height: number; 
}

export default function ChartContainer({ children, width, height }: ChartContainerProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return (
            <div style={{ width: width, height: height, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6b7280' }}>
                图表加载中...
            </div>
        );
    }

    // 最终修复点：我们断言 width 属性是 Recharts 期望的 string 类型。
    // Recharts 库通常使用 string 类型来表示尺寸 ('100%', '500px' 等)。
    // 即使你传入了数字 500，Recharts 内部也会将其转换为 '500'。
    return (
        <ResponsiveContainer width={width as string} height={height}>
            {children}
        </ResponsiveContainer>
    );
}