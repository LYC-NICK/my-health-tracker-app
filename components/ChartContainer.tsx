'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';

export default function ChartContainer({ children, width, height }: { children: React.ReactNode, width: string | number, height: number }) {
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

  return (
    <ResponsiveContainer width={width} height={height}>
      {children}
    </ResponsiveContainer>
  );
}