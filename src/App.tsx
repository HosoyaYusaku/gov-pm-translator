import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Check, Download, Sparkles, Briefcase, AlertCircle, 
  FileText, AlertTriangle, ShieldCheck, Users, Layers, Zap, 
  Cpu, Key, Settings2, XCircle, Terminal, Eye, Lock, Trash2 
} from 'lucide-react'
import html2canvas from 'html2canvas'

// --- 定数設定 ---
const GEMINI_MODEL = 'gemini-2.5-flash-lite';

const SYSTEM_PROMPT = `
You are an expert Project Manager.
Analyze the user's task description and map it to a PMBOK Knowledge Area.
Return ONLY a JSON object with the following structure (no markdown):
{
  "label": "Professional PM Term (e.g. Stakeholder Management)",
  "text": "A professional description in Japanese (approx 30 chars)",
  "iconKey": "One of: AlertTriangle, Users, FileText, ShieldCheck, Layers, Zap, Briefcase"
}
`;

// --- 型定義 ---
type Mode = 'standard' | 'ai';

type SkillCategory = {
  label: string;
  text: string;
  icon: any;
  color: string;
  bg: string;
  isError?: boolean;
};

type DebugLog = {
  prompt: string;
  input: string;
  response: string;
};

// アイコンマップ
const ICON_MAP: Record<string, any> = {
  AlertTriangle, Users, FileText, ShieldCheck, Layers, Zap, Briefcase, AlertCircle
};

// --- スタンダードモード（辞書ロジック） ---
const analyzeTextStandard = (inputText: string): SkillCategory => {
  const text = inputText.trim().toLowerCase();
  
  const dictionary = [
    { keys: ['怒', 'クレーム', '苦情', '謝', '詫', 'トラブル', '事故', '緊急'], label: 'クライシスマネジメント', text: '不測の事態における迅速な課題解決とリスク極小化', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { keys: ['調整', '合意', '相談', '依頼', '電話', 'メール', '会議', '説明', '窓口', '対応'], label: 'ステークホルダーマネジメント', text: '多様な関係者との利害調整および合意形成のリード', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { keys: ['企画', '案', '立案', '仕様', '要件', '検討', '決', 'ルール', '方針'], label: 'プロジェクト計画・構想', text: '実現可能性を考慮した業務要件定義および実装計画の策定', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { keys: ['チェック', '確認', 'ミス', '修正', '校正', 'テスト', '検算', '監査'], label: '品質管理 (QA/QC)', text: '成果物の品質基準策定および厳格な検証プロセスの遂行', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { keys: ['日程', 'スケジュール', '納期', '期限', '進行', '管理', '段取り', '工程'], label: '工程管理 (Time Mgmt)', text: 'WBSに基づく厳密な進捗管理とリソースの最適配分', icon: Layers, color: 'text-orange-600', bg: 'bg-orange-50' },
    { keys: ['データ', '集計', '入力', 'エクセル', '数字', '分析', '計算', 'システム'], label: 'データドリブン・オペレーション', text: '定量的データに基づく業務プロセスの可視化と効率化', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  for (const cat of dictionary) {
    if (cat.keys.some(k => text.includes(k))) {
      return { ...cat };
    }
  }

  return {
    label: 'ジェネラル・アドミニストレーション',
    text: '組織運営を円滑化するための定常業務の確実な遂行',
    icon: Briefcase,
    color: 'text-slate-500',
    bg: 'bg-slate-50'
  };
};

// --- AIモード（API呼び出し） ---
const callGeminiAPI = async (text: string, apiKey: string): Promise<{ result: SkillCategory, log: DebugLog }> => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [ { parts: [{ text: text }] } ]
      })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message || 'API Error');
    
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("No content generated");

    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      result: {
        label: parsed.label,
        text: parsed.text,
        icon: ICON_MAP[parsed.iconKey] || Briefcase,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
      },
      log: {
        prompt: SYSTEM_PROMPT,
        input: text,
        response: cleanJson
      }
    };

  } catch (e: any) {
    return {
      result: {
        label: 'API Error',
        text: `接続失敗: ${e.message}`,
        icon: XCircle,
        color: 'text-red-500',
        bg: 'bg-red-50',
        isError: true
      },
      log: { prompt: SYSTEM_PROMPT, input: text, response: JSON.stringify(e.message) }
    };
  }
};

export default function App() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>('standard');
  const [apiKey, setApiKey] = useState('');
  const [inputs, setInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [aiResults, setAiResults] = useState<SkillCategory[]>([]);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // 初期化時にセッションストレージからキーを読み込む
  useEffect(() => {
    const savedKey = sessionStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    sessionStorage.setItem('gemini_api_key', key);
  };

  // キー削除（共用PC用）
  const clearApiKey = () => {
    setApiKey('');
    sessionStorage.removeItem('gemini_api_key');
  };

  const addInput = () => {
    if (!currentInput.trim()) return;
    setInputs([...inputs, currentInput]);
    setCurrentInput('');
  };

  const processTranslation = async () => {
    setIsProcessing(true);
    setDebugLogs([]);
    
    if (mode === 'standard') {
      const results = inputs.map(input => analyzeTextStandard(input));
      setAiResults(results);
    } else {
      const promises = inputs.map(input => callGeminiAPI(input, apiKey));
      const rawResults = await Promise.all(promises);
      setAiResults(rawResults.map(r => r.result));
      setDebugLogs(rawResults.map(r => r.log));
    }
    
    setStep(2);
    setIsProcessing(false);
  };

  const handleDownload = async () => {
    if (resultRef.current) {
      const canvas = await html2canvas(resultRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = 'gov_pm_skills.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center max-w-2xl mx-auto font-sans text-slate-800">
      <AnimatePresence mode="wait">
        
        {/* STEP 0: トップ画面 */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8 w-full max-w-md mx-auto"
          >
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-[2rem] w-24 h-24 mx-auto flex items-center justify-center shadow-2xl">
                <Sparkles size={44} />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
                Gov PM Translator
              </h1>
              <div className="space-y-2">
                <p className="text-lg font-bold text-slate-700">
                  「ただの事務」を、<br/>「市場価値のあるスキル」へ。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  あなたが毎日当たり前にこなしている業務を、<br/>
                  <span className="text-slate-800 font-bold bg-yellow-100 px-1">世界標準のプロジェクトマネジメント用語</span><br/>
                  に置き換えて翻訳・言語化します。
                </p>
              </div>
            </div>

            {/* モード選択 */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex relative shadow-sm">
              <button
                onClick={() => setMode('standard')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'standard' ? 'bg-slate-100 text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Zap size={18} /> Standard
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'ai' ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Cpu size={18} /> AI Mode
              </button>
            </div>

            {/* AIモードの説明欄 */}
            <AnimatePresence>
              {mode === 'ai' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden text-left"
                >
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-4 mt-2">
                    <div className="flex gap-3 items-start">
                      <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600 shrink-0">
                        <Cpu size={20} />
                      </div>
                      <div className="text-xs leading-relaxed text-indigo-900">
                        <span className="font-bold block mb-1 text-sm">AIがあなたの仕事を「解釈」します</span>
                        入力された業務内容（文脈）をGemini AIが読み解き、最も適切なPMBOK（プロジェクト管理知識体系）の用語へ高度に変換します。
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
                        <Key size={12} /> Google Gemini API Keyを設定してください
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          value={apiKey}
                          onChange={(e) => saveApiKey(e.target.value)}
                          placeholder="AI Studio Keyを入力..."
                          className="flex-1 bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                        />
                        {apiKey && (
                          <button 
                            onClick={clearApiKey}
                            className="bg-white text-red-500 border border-red-100 hover:bg-red-50 rounded-xl px-3 py-2 flex items-center justify-center transition-colors shadow-sm"
                            title="キー情報を削除"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      {/* 共用PC向けの注意書き */}
                      <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 ml-1">
                        ⚠️ 共用PCの方は、使用後に必ず削除ボタンでキーを消去してください。
                      </p>
                    </div>

                    {/* セキュリティ・スペック注釈 */}
                    <div className="grid gap-2">
                      <div className="flex gap-2 items-start bg-white/60 p-2 rounded-lg border border-indigo-100/50">
                        <Lock size={14} className="text-green-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-500 leading-tight">
                          <span className="font-bold text-slate-700">高セキュリティ:</span> 入力データとAPIキーは、あなたのブラウザからGoogleへ直接送信されます。当アプリのサーバーは経由・保存しません。
                        </p>
                      </div>
                      <div className="flex gap-2 items-start bg-white/60 p-2 rounded-lg border border-indigo-100/50">
                        <Zap size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-500 leading-tight">
                          <span className="font-bold text-slate-700">最適化モデル:</span> コストパフォーマンスと応答速度に優れたモデル <code>{GEMINI_MODEL}</code> を使用します。
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setStep(1)}
              disabled={mode === 'ai' && !apiKey}
              className={`w-full py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${mode === 'ai' ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
            >
              {mode === 'ai' ? 'AIモードで開始' : 'スタンダードで開始'} <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* STEP 1: 入力画面 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-md mx-auto space-y-6"
          >
            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">業務の棚卸し</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === 'ai' ? 'AIが文脈を読み取ります' : 'キーワード辞書で変換します'}
                </p>
              </div>
              <div className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${mode === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                {mode === 'ai' ? <Cpu size={12}/> : <Zap size={12}/>}
                {mode === 'ai' ? 'Gemini Mode' : 'Standard'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 min-h-[240px] flex flex-col gap-3">
              {inputs.map((text, i) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="bg-slate-50 px-4 py-3 rounded-xl text-slate-700 text-sm flex items-center gap-3 border border-slate-100 group">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${mode === 'ai' ? 'bg-indigo-500 group-hover:bg-indigo-400' : 'bg-slate-500 group-hover:bg-slate-400'}`} />
                  <span className="break-all">{text}</span>
                </motion.div>
              ))}
              {inputs.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-3">
                  <Settings2 size={32} className="text-slate-400" />
                  <p className="text-xs text-center leading-relaxed">
                    最近やった仕事を<br/>思いつくままに入力してください
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addInput()}
                placeholder="例：クレーム電話対応、資料作成..."
                className="flex-1 p-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm text-sm"
              />
              <button onClick={addInput} disabled={!currentInput.trim()} className="bg-slate-800 disabled:bg-slate-200 text-white p-4 rounded-2xl shadow-md transition-colors">
                <Check />
              </button>
            </div>

            {inputs.length >= 1 && (
              <button
                onClick={processTranslation}
                disabled={isProcessing}
                className={`w-full text-white py-4 rounded-2xl font-bold shadow-xl mt-4 flex items-center justify-center gap-2 transition-all ${mode === 'ai' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'} ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isProcessing ? <span className="animate-pulse">解析中...</span> : <><Sparkles size={18} className="text-yellow-400" /> PMスキルに変換</>}
              </button>
            )}
          </motion.div>
        )}

        {/* STEP 2: 結果画面 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto"
          >
            <div ref={resultRef} className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 mb-6 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-[100px] -z-0 opacity-40 bg-gradient-to-br ${mode === 'ai' ? 'from-indigo-100 to-purple-100' : 'from-slate-100 to-cyan-50'}`} />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Project Management Portfolio</h3>
                  <h2 className="text-2xl font-extrabold text-slate-800">自治体PM 経歴書</h2>
                </div>
                {mode === 'ai' && (
                   <div className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md self-start flex items-center gap-1">
                     <Cpu size={10} /> Powered by Gemini
                   </div>
                )}
              </div>

              <div className="space-y-6 relative z-10">
                {aiResults.map((result, i) => {
                  const Icon = result.icon;
                  return (
                    <div key={i} className="group">
                      <div className="flex gap-4 items-start">
                        <div className={`mt-1 p-2 rounded-xl shrink-0 ${result.bg} ${result.color}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[10px] font-bold mb-0.5 ${result.color} uppercase tracking-wider`}>
                            {result.label}
                          </div>
                          <div className={`text-sm font-bold leading-snug mb-1 ${result.isError ? 'text-red-600' : 'text-slate-700'}`}>
                            {result.text}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                             <span className="line-through decoration-slate-300 opacity-60 truncate max-w-[200px] inline-block">{inputs[i]}</span>
                          </div>
                        </div>
                      </div>
                      {i !== inputs.length - 1 && <div className="h-px bg-slate-50 w-full mt-4 ml-14" />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 pt-4 border-t border-slate-100 flex justify-between items-end relative z-10">
                <div className="text-[10px] text-slate-400 leading-tight">Generated by<br/><span className="font-bold text-slate-600">Gov PM Translator</span></div>
                <div className="text-4xl filter drop-shadow-sm">🏅</div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3 mb-8">
              <button onClick={() => { setInputs([]); setStep(0); setAiResults([]); setDebugLogs([]); }} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors">
                最初に戻る
              </button>
              <button onClick={handleDownload} className={`flex-1 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors ${mode === 'ai' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                <Download size={18} /> 画像保存
              </button>
            </div>

            {/* AIデバッグ/教育モード（AIモード時のみ表示） */}
            {mode === 'ai' && debugLogs.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                <button 
                  onClick={() => setShowDebug(!showDebug)}
                  className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2"><Terminal size={14} /> AIの裏側を覗いてみる（学習用ログ）</span>
                  {showDebug ? <Eye size={14} /> : <Eye className="opacity-50" size={14} />}
                </button>
                
                <AnimatePresence>
                  {showDebug && (
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: 'auto' }} 
                      exit={{ height: 0 }} 
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-slate-900 text-green-400 text-[10px] font-mono space-y-4 overflow-x-auto">
                        {debugLogs.map((log, i) => (
                          <div key={i} className="space-y-1 border-b border-slate-800 pb-4 last:border-0">
                            <div className="text-slate-500"># Task {i + 1} Analysis</div>
                            <div><span className="text-blue-400">Input:</span> "{log.input}"</div>
                            <div className="opacity-50"><span className="text-purple-400">System Prompt:</span> {log.prompt.trim().substring(0, 40)}...</div>
                            <div><span className="text-yellow-400">AI Response (JSON):</span></div>
                            <pre className="text-slate-300 whitespace-pre-wrap break-all bg-slate-950 p-2 rounded border border-slate-800">
                              {log.response}
                            </pre>
                          </div>
                        ))}
                        <div className="text-slate-500 pt-2 text-center">--- End of Stream ---</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}