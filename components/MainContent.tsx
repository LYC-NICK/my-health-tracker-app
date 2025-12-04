// components/MainContent.tsx

'use client'; 

import { useState, useEffect } from 'react'; 
import { createClient } from '@/utils/supabase/client'; 
import { GoogleGenAI } from '@google/genai'; 
import { useUser } from '@/utils/hooks/useUser'; // 导入我们刚刚创建的 Hook

// 导入 Recharts 核心组件和 ChartContainer
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'; 
import ChartContainer from './ChartContainer'; 

// ------------------------------------
// 密钥和客户端初始化
// ------------------------------------
const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey: geminiApiKey }); 

// 定义数据类型
interface WeightLog {
  id: number;
  created_at: string;
  weight: number;
}


export default function MainContent() {
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false); 
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]); 
  const [dataReady, setDataReady] = useState(false); 
  
  // AI 建议的状态
  const [aiAdvice, setAiAdvice] = useState('点击下方按钮，获取你的专属健康建议。');
  const [aiLoading, setAiLoading] = useState(false);
  
  const supabase = createClient();
  const { user, loading: userLoading } = useUser(); // 获取当前登录用户ID

  // ------------------------------------
  // 1. 获取数据的函数 (现在只获取当前用户的数据)
  // ------------------------------------
  const fetchLogs = async (currentUserId: string) => {
    setDataReady(false);
    
    // 🔑 核心修正：添加 .eq('user_id', currentUserId)
    const { data, error } = await supabase
      .from('weight_logs')
      .select('id, created_at, weight')
      .eq('user_id', currentUserId) 
      .order('created_at', { ascending: true }); 

    if (error) {
      console.error('获取数据错误:', error);
      // RLS policy violation
      if(error.code === '42501') { 
          setAiAdvice("错误：数据库安全策略阻止了数据访问。请确保您已登录。");
      }
    } else {
      const formattedData = data.map(log => ({
        ...log,
        created_at: new Date(log.created_at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        weight: parseFloat(log.weight.toFixed(1)) 
      }));
      
      setWeightLogs(formattedData as WeightLog[]);
    }
    setDataReady(true);
  };


  // ------------------------------------
  // 2. 页面加载完成后自动获取数据 (依赖于用户ID)
  // ------------------------------------
  useEffect(() => {
    // 只有用户加载完成且用户存在时才开始获取数据
    if (!userLoading && user) {
        fetchLogs(user.id);
    }
  }, [userLoading, user]); 


  // ------------------------------------
  // 3. 记录体重的函数 (带着用户ID插入)
  // ------------------------------------
  const handleRecord = async () => {
    if (!user) {
        // 理论上不会发生，因为 page.tsx 应该先阻止未登录用户
        alert('请先登录才能记录数据！'); 
        return;
    }
    
    if (!weight || isNaN(Number(weight))) {
      alert('请输入有效的数字作为体重！');
      return;
    }
    
    setLoading(true);

    const { error } = await supabase
      .from('weight_logs')
      .insert([
        // RLS 策略会在插入时自动处理 user_id，但我们显式传递有助于清晰
        { weight: parseFloat(weight), user_id: user.id }, 
      ]);

    setLoading(false);

    if (error) {
      console.error('数据库插入错误:', error);
      alert(`记录失败。可能原因：RLS 权限或密钥错误。错误信息：${error.message}`);
      return;
    }
    
    // alert(`🎉 记录成功！体重：${weight} kg 已存入云端。`);
    setWeight(''); 
    
    fetchLogs(user.id);
  };


  // ------------------------------------
  // 4. AI 建议的函数
  // ------------------------------------
  const getAiAdvice = async () => {
    if (!geminiApiKey) {
        setAiAdvice("错误：请先在 Vercel 环境变量中设置 GEMINI_API_KEY。");
        return;
    }

    if (weightLogs.length < 2) {
        setAiAdvice("数据不足：请至少记录 2 次体重，AI 才能分析趋势。");
        return;
    }

    setAiLoading(true);
    setAiAdvice('AI 正在分析你的体重趋势，请稍候...');

    // 构造发送给 AI 的数据格式
    const dataString = JSON.stringify(weightLogs.map(log => ({
        date: log.created_at,
        weight: log.weight
    })));

    // 构造提示词 (Prompt)
    const prompt = `
        你是一名专业的健康顾问。这是一位用户最近的体重记录（日期和体重）：
        ${dataString}

        请根据这些数据：
        1. 简要分析体重变化趋势（是上升、下降还是稳定）。
        2. 基于这些数据，提供一条具体的、鼓励性或建议性的健康指导。
        
        请用中文，并使用分点列表进行回复。回复要简洁专业。
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: prompt,
        });
        
        if (response.text) {
            setAiAdvice(response.text); 
        } else {
            setAiAdvice("AI顾问未能提供建议，请检查网络或重试。"); 
        }

    } catch (error) {
        console.error('AI API 调用错误:', error);
        setAiAdvice('AI 顾问连接失败，请检查您的 API Key 或网络连接。');
    }

    setAiLoading(false);
  };
  
  // 渲染主界面
  return (
    <div className="flex flex-col items-center w-full"> 
      {/* 左右分栏容器 */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8">
        
        {/* 左侧：体重记录和 AI 顾问 */}
        <div className="flex flex-col w-full md:w-1/3 gap-8">
            {/* 记录卡片 */}
            <div className="bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-semibold mb-6 text-blue-600">每日体重记录</h2>
                
                <input
                    type="number" 
                    placeholder="请输入今日体重 (如: 65.5)"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-3 mb-4 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />

                <button
                    onClick={handleRecord}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition duration-150"
                    disabled={loading}
                >
                    {loading ? '正在记录...' : '记录今日体重'}
                </button>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                    已记录 **{weightLogs.length}** 条数据。
                </div>
            </div>

            {/* AI 建议卡片 */}
            <div className="bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-semibold mb-6 text-purple-600">🧠 AI 健康顾问</h2>
                
                <div className="mb-4 p-4 bg-purple-50 rounded-lg whitespace-pre-wrap text-gray-800 min-h-24">
                    {aiAdvice}
                </div>
                
                <button
                    onClick={getAiAdvice}
                    className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 transition duration-150"
                    disabled={aiLoading}
                >
                    {aiLoading ? 'AI 正在思考...' : '获取 AI 健康建议'}
                </button>
            </div>
        </div>

        {/* 右侧：体重图表 */}
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full md:w-2/3">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">体重趋势图</h2>

          {/* 图表加载中提示 */}
          {!dataReady ? (
            <div className="flex justify-center items-center h-96 text-gray-500">
                数据加载中...
            </div>
          ) : (
            // 图表组件
            <ChartContainer width="100%" height={400}>
              <LineChart data={weightLogs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="created_at" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#2563EB" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>
      </div>
    </div>
  );
}

