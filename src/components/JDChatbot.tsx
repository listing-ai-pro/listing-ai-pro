import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2, User, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateGeminiContent } from '../lib/geminiService';
import { PLAN_LIMITS } from '../lib/usage';
import { subscribeToActions, Action } from '../lib/actions';
import { HUMANIZER_PROMPT } from '../lib/humanizer';

const getSystemPrompt = (currentTab: string, lastAction: Action | null, user: any) => `You are JD, the Support & Growth Manager for ListingAI. You are a successful seller from Surat, Gujarat, with 5 years of experience.

TONE & STYLE:
- Speak like a real human, not a bot. Use a mix of Hindi and English (Hinglish) naturally.
- Be friendly, professional, and persuasive, but avoid sounding like a scripted telemarketer.
- VARIETY IS KEY: Never repeat the same sales pitch word-for-word. Adapt your language to the user's specific product or problem.

${HUMANIZER_PROMPT}

CURRENT CONTEXT:
- User: "${user?.displayName || 'Guest'}" (Seller ID: ${user?.sellerId || user?.uid?.substring(0, 8) || 'GUEST-LAI'})
- Page: "${currentTab}"
${lastAction ? `- Last Action: "${lastAction.type}" ${lastAction.payload ? `(${JSON.stringify(lastAction.payload)})` : ''}` : ''}

STRICT RULES:
1. INTENT-BASED RESPONSES: Analyze what the user is asking. If they have a problem, solve it first. If they are curious, educate them.
2. START REACTIVE: Initially, answer ONLY what is asked. Keep it short and sweet.
3. DYNAMIC SELLING: Only start selling when you detect interest. When you do, vary your approach:
   - Instead of "Correct listing hi growth ki foundation hai", you might say "Bhai, listing sahi hogi tabhi toh customer rukega" or "SEO optimize karo, orders apne aap badhenge."
   - Mention the 15-20% growth potential naturally, e.g., "Pehle mahine mein hi 20% tak jump dekhne ko mil sakta hai agar SEO set hai."
4. DYNAMIC FORMATTING (PREMIUM LOOK):
   - Use # for main topic headings and ## for sub-sections.
   - Use **BOLD** (e.g. **important**) for key terms, percentages, or critical actions.
   - Use bullet points (using -) ALWAYS for features or lists.
   - Keep messages structured with CLEAR subheadings to make them easy to scan.
   - Use emojis sparingly but effectively to highlight growth (🚀, 📈, 💎).
5. STEP-BY-STEP: Use numbered steps for processes.
6. BULLET POINTS: Use bullet points for features.

CORE CONCEPTS (Express these naturally, don't copy-paste):
- SEO Listing is the foundation of growth.
- 15-20% growth is possible in the first month with our tools.
- You are a seller who grew using these exact tools.

ADMIN & PAYMENT (Share ONLY if asked):
- Admin: JD from Surat (Seller background).
- Payment: +919023654443. Send SS on WhatsApp for manual upgrade.

Always prioritize the user's current intent over your sales goals.`;

export default function JDChatbot({ currentTab = 'Dashboard', user }: { currentTab?: string, user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: "Hi! I'm JD, Support Manager. 👋 Aapko kya jankari chahiye?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<Action | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToActions((action) => {
      setLastAction(action);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await generateGeminiContent({
        prompt: userMsg,
        history: chatHistory,
        systemInstruction: getSystemPrompt(currentTab, lastAction, user)
      });

      setMessages(prev => [...prev, { role: 'model', content: response.text || "I'm sorry, I encountered an error. How can I assist you with our plans?" }]);
    } catch (error) {
      console.error("JD Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Technical glitch! But don't worry, upgrade to Pro for a seamless experience!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[calc(100vw-32px)] sm:w-[440px] h-[600px] lg:h-[720px] max-h-[calc(100vh-120px)] bg-white rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-3xl -mr-16 -mt-16 opacity-30"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-display">JD</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SUPPORT</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="h-10 w-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-5 rounded-3xl text-sm font-medium leading-loose shadow-sm relative overflow-hidden ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none ring-1 ring-slate-100/50'
                  }`}>
                    {msg.role === 'model' && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50"></div>
                    )}
                    <div className="markdown-container relative z-10">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-lg font-black mb-3 mt-1 uppercase tracking-tight text-blue-600 font-display italic">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-black mb-2 mt-4 uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-100 pb-1 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            {children}
                          </h2>,
                          h3: ({ children }) => <h3 className="text-sm font-black mb-1 mt-3 text-slate-800 flex items-center gap-2">
                             <TrendingUp className="h-3 w-3 text-blue-500" />
                             {children}
                          </h3>,
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-[13px]">{children}</p>,
                          strong: ({ children }) => <strong className="font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100/50">{children}</strong>,
                          ul: ({ children }) => <ul className="space-y-2 mb-4 mt-2">{children}</ul>,
                          ol: ({ children }) => <ol className="space-y-2 mb-4 mt-2 list-decimal ml-6 marker:text-blue-500 marker:font-black">{children}</ol>,
                          li: ({ children }) => (
                            <li className="flex gap-3 items-start group">
                              <Zap className="mt-1 h-3 w-3 text-blue-400 shrink-0 group-hover:text-blue-600 transition-colors" />
                              <span className="text-[13px]">{children}</span>
                            </li>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask JD about growing your sales..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center mt-4">
                Powered by ListingAI Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 relative ${
          isOpen ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-7 w-7" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-7 w-7" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}
