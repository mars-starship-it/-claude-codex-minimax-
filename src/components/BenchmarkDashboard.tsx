import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList
} from 'recharts';
import { Settings, Calculator, Clock, DollarSign, Zap, Database, Trophy, TrendingUp } from 'lucide-react';
import { DEFAULT_MODELS, SCENARIOS, LLMModel, TaskScenario } from '../data/models';
import { cn } from '../lib/utils';

export default function BenchmarkDashboard() {
  const [models, setModels] = useState<LLMModel[]>(DEFAULT_MODELS);
  const [activeScenario, setActiveScenario] = useState<TaskScenario>(SCENARIOS[1]);
  const [customInput, setCustomInput] = useState(activeScenario.avgInputTokens);
  const [customOutput, setCustomOutput] = useState(activeScenario.avgOutputTokens);
  const [customIterations, setCustomIterations] = useState(activeScenario.iterations);

  // Update custom values when scenario changes
  const handleScenarioChange = (scenario: TaskScenario) => {
    setActiveScenario(scenario);
    setCustomInput(scenario.avgInputTokens);
    setCustomOutput(scenario.avgOutputTokens);
    setCustomIterations(scenario.iterations);
  };

  const results = useMemo(() => {
    return models.map(model => {
      const totalInput = customInput * customIterations;
      const totalOutput = customOutput * customIterations;
      
      const costInput = (totalInput / 1_000_000) * model.inputPricePerM;
      const costOutput = (totalOutput / 1_000_000) * model.outputPricePerM;
      const totalCost = costInput + costOutput;
      
      const timeSeconds = totalOutput / model.avgSpeedTokensPerSec;
      const timeMinutes = timeSeconds / 60;

      return {
        ...model,
        totalCost,
        timeMinutes,
        // Calculate a simple "Value Score": Quality / Cost (higher is better)
        // Normalized to avoid division by zero or extreme numbers
        valueScore: (model.codingScore / (totalCost + 0.0001)) 
      };
    }).sort((a, b) => a.totalCost - b.totalCost);
  }, [models, customInput, customOutput, customIterations]);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold tracking-tight">LLM 编程成本与质量基准测试</h1>
        </div>
        <p className="text-gray-600 max-w-2xl">
          估算并比较主要 LLM 提供商的编程任务成本、时长以及编程质量。
          综合分析性价比，助您选择最适合的模型。
        </p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Section */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              场景配置
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">任务类型</label>
                <div className="grid grid-cols-1 gap-2">
                  {SCENARIOS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleScenarioChange(s)}
                      className={cn(
                        "text-left px-3 py-2 rounded-lg text-sm transition-all border",
                        activeScenario.id === s.id 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-medium" 
                          : "bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600"
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>输入 Token (每轮)</span>
                    <span className="font-mono text-gray-500">{customInput.toLocaleString()}</span>
                  </label>
                  <input 
                    type="range" 
                    min="100" 
                    max="100000" 
                    step="100"
                    value={customInput}
                    onChange={(e) => setCustomInput(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>输出 Token (每轮)</span>
                    <span className="font-mono text-gray-500">{customOutput.toLocaleString()}</span>
                  </label>
                  <input 
                    type="range" 
                    min="50" 
                    max="8000" 
                    step="50"
                    value={customOutput}
                    onChange={(e) => setCustomOutput(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>迭代次数 / 对话轮数</span>
                    <span className="font-mono text-gray-500">{customIterations}</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    step="1"
                    value={customIterations}
                    onChange={(e) => setCustomIterations(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 font-mono mt-4">
                总输入: {(customInput * customIterations).toLocaleString()} tokens<br/>
                总输出: {(customOutput * customIterations).toLocaleString()} tokens
              </div>
            </div>
          </div>

          {/* Model Pricing Config (Simplified) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-500" />
              模型假设
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>价格估算基于每 100 万 (1M) Token (美元)。质量评分为估算值 (0-100)。</p>
              <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                {models.map(m => (
                  <div key={m.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div>
                      <div className="font-medium text-gray-900">{m.name}</div>
                      <div className="text-xs text-gray-500">
                        入: ${m.inputPricePerM} / 出: ${m.outputPricePerM} | 质量: {m.codingScore}
                      </div>
                    </div>
                    <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {m.avgSpeedTokensPerSec} t/s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Visualization Section */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Quality vs Cost Scatter Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              质量 vs 成本分析 (越靠左上角性价比越高)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="totalCost" 
                    name="总成本" 
                    unit="$" 
                    tickFormatter={(val) => `$${val.toFixed(2)}`}
                    label={{ value: '总成本 (美元)', position: 'bottom', offset: 0 }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="codingScore" 
                    name="编程质量" 
                    domain={[70, 100]} 
                    label={{ value: '编程质量评分 (0-100)', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-sm">
                            <p className="font-bold mb-1">{data.name}</p>
                            <p className="text-indigo-600">成本: ${data.totalCost.toFixed(4)}</p>
                            <p className="text-emerald-600">质量评分: {data.codingScore}</p>
                            <p className="text-gray-500 text-xs mt-1">性价比指数: {data.valueScore.toFixed(0)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Models" data={results} fill="#8884d8">
                    {results.map((entry, index) => (
                      <React.Fragment key={`cell-${index}`}>
                        <circle cx={0} cy={0} r={8} fill={entry.color} stroke="#fff" strokeWidth={2} />
                        <text x={0} y={-15} textAnchor="middle" fill="#374151" fontSize={11} fontWeight={500}>{entry.name}</text>
                      </React.Fragment>
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">预估成本 (美元)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(val) => `$${val.toFixed(2)}`} />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(4)}`, '总成本']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="totalCost" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">编程质量评分 (估算)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.sort((a,b) => b.codingScore - a.codingScore)} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                    <Tooltip 
                      formatter={(value: number) => [`${value} 分`, '质量评分']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="codingScore" radius={[0, 4, 4, 0]} barSize={20}>
                      {results.map((entry, index) => (
                        <cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="codingScore" position="right" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">详细明细</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">按成本排序</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">模型</th>
                    <th className="px-6 py-3 text-right">总成本</th>
                    <th className="px-6 py-3 text-right">质量评分</th>
                    <th className="px-6 py-3 text-right">时长</th>
                    <th className="px-6 py-3 text-right">性价比指数</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.sort((a,b) => a.totalCost - b.totalCost).map((r, i) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}></span>
                        {r.name}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-indigo-600 font-semibold">
                        ${r.totalCost.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-emerald-600">
                        {r.codingScore}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-600">
                        {r.timeMinutes.toFixed(2)} 分
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-500 font-mono">{Math.round(r.valueScore).toLocaleString()}</span>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${(r.valueScore / Math.max(...results.map(m => m.valueScore))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-2 text-indigo-800 font-medium">
                <Trophy className="w-4 h-4" />
                最佳质量
              </div>
              {(() => {
                const bestQuality = [...results].sort((a, b) => b.codingScore - a.codingScore)[0];
                return (
                  <>
                    <div className="text-2xl font-bold text-indigo-900">{bestQuality.name}</div>
                    <div className="text-sm text-indigo-600 mt-1">
                      评分: {bestQuality.codingScore} / 100
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-2 text-emerald-800 font-medium">
                <DollarSign className="w-4 h-4" />
                性价比之王
              </div>
              {(() => {
                const bestValue = [...results].sort((a, b) => b.valueScore - a.valueScore)[0];
                return (
                  <>
                    <div className="text-2xl font-bold text-emerald-900">{bestValue.name}</div>
                    <div className="text-sm text-emerald-600 mt-1">
                      质量/成本比最高
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-2 text-amber-800 font-medium">
                <Zap className="w-4 h-4" />
                最快速
              </div>
              {(() => {
                const fastest = [...results].sort((a, b) => a.timeMinutes - b.timeMinutes)[0];
                return (
                  <>
                    <div className="text-2xl font-bold text-amber-900">{fastest.name}</div>
                    <div className="text-sm text-amber-600 mt-1">
                      {fastest.timeMinutes.toFixed(2)} 分钟
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
