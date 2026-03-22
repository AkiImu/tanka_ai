import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Quote, Sparkles, Loader2, RefreshCw, Send } from 'lucide-react';
import { generateTanka, TankaResult } from './services/tankaService';

export default function App() {
  const [feeling, setFeeling] = useState('');
  const [result, setResult] = useState<TankaResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeling.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await generateTanka(feeling);
      setResult(data);
    } catch (err) {
      console.error("Tanka Generation Error:", err);
      const message = err instanceof Error ? err.message : '短歌の生成に失敗しました。';
      setError(`${message} もう一度お試しください。`);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFeeling('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-stone-200">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-stone-800 mb-3">
            短歌AI
          </h1>
          <p className="text-stone-500 text-sm md:text-base font-medium tracking-wide uppercase">
            心を詠み、言葉を紡ぐ
          </p>
        </motion.div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="feeling" className="block font-serif text-xl text-stone-700 mb-4 text-center">
                    今のあなたの気持ちを、言葉にしてみてください
                  </label>
                  <textarea
                    id="feeling"
                    value={feeling}
                    onChange={(e) => setFeeling(e.target.value)}
                    placeholder="例：仕事帰りの夕暮れが綺麗で、少し寂しい気持ちになった。"
                    className="w-full h-32 p-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-stone-200 transition-all resize-none text-stone-800 placeholder:text-stone-300"
                    required
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isLoading || !feeling.trim()}
                    className="group relative flex items-center gap-2 px-8 py-4 bg-stone-800 text-white rounded-full font-medium hover:bg-stone-700 disabled:bg-stone-300 transition-all shadow-lg hover:shadow-xl active:scale-95 overflow-hidden"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>詠んでいます...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <span>短歌を生成する</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
              
              {error && (
                <p className="mt-4 text-center text-red-500 text-sm">{error}</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Famous Tanka */}
              <section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Quote size={120} />
                </div>
                <div className="flex items-center gap-2 text-stone-400 mb-6">
                  <Quote size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">古典・名歌からの提案</span>
                </div>
                
                <div className="text-center mb-8">
                  <p className="font-serif text-2xl md:text-3xl leading-relaxed text-stone-800 mb-4 whitespace-pre-wrap">
                    {result.famousTanka.poem}
                  </p>
                  <p className="font-serif text-lg text-stone-500">— {result.famousTanka.poet}</p>
                </div>
                
                <div className="bg-stone-50 rounded-2xl p-6">
                  <p className="text-stone-600 text-sm leading-relaxed italic">
                    {result.famousTanka.explanation}
                  </p>
                </div>
              </section>

              {/* Manyoshu Tanka */}
              <section className="bg-stone-50 rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 p-4 opacity-5">
                  <Quote size={120} className="rotate-180" />
                </div>
                <div className="flex items-center gap-2 text-stone-400 mb-6">
                  <Quote size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">万葉集からの提案</span>
                </div>
                
                <div className="text-center mb-8">
                  <p className="font-serif text-2xl md:text-3xl leading-relaxed text-stone-800 mb-4 whitespace-pre-wrap">
                    {result.manyoshuTanka.poem}
                  </p>
                  <p className="font-serif text-lg text-stone-500">— {result.manyoshuTanka.poet}</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 border border-stone-100">
                  <p className="text-stone-600 text-sm leading-relaxed italic">
                    {result.manyoshuTanka.explanation}
                  </p>
                </div>
              </section>

              {/* Generated Tanka */}
              <section className="bg-stone-800 rounded-3xl shadow-xl p-8 md:p-12 text-white relative overflow-hidden">
                <div className="absolute -bottom-10 -left-10 opacity-10">
                  <Sparkles size={200} />
                </div>
                <div className="flex items-center gap-2 text-stone-400 mb-6">
                  <PenTool size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">あなたへの新作短歌</span>
                </div>

                <div className="text-center mb-8 relative z-10">
                  <p className="font-serif text-2xl md:text-3xl leading-relaxed mb-6 whitespace-pre-wrap">
                    {result.generatedTanka.poem}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 relative z-10">
                  <p className="text-stone-200 text-sm leading-relaxed">
                    {result.generatedTanka.explanation}
                  </p>
                </div>
              </section>

              <div className="flex justify-center">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 text-stone-500 hover:text-stone-800 transition-colors font-medium"
                >
                  <RefreshCw size={18} />
                  <span>別の気持ちを詠む</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-stone-100 via-stone-300 to-stone-100 opacity-50" />
    </div>
  );
}
