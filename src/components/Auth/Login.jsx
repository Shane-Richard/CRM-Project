import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Mail, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin // This resolves to http://localhost:5173/
                }
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
            
            <div className="w-full max-w-[440px] relative z-10">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 group hover:rotate-6 transition-transform">
                        <Mail className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-none mb-2">TXB Inbox CRM</h1>
                    <p className="text-slate-400 font-medium text-[15px]">The future of high-conversion outreach.</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-slate-800 mb-2">Welcome back</h2>
                        <p className="text-sm text-slate-400 font-medium">Connect your workspace to continue.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-shake">
                            <Shield className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10 group overflow-hidden relative"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />
                                <span className="text-[14px] font-black tracking-wide uppercase">Sign in with Google</span>
                                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="mt-10 pt-8 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Standard Features</p>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                'Real-time Sync',
                                'Lead Discovery',
                                'Smart Analytics',
                                'Team Access'
                            ].map((feature) => (
                                <div key={feature} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                                    <span className="text-[11px] font-bold text-slate-600">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="mt-8 text-center animate-in fade-in duration-1000 delay-500">
                    <p className="text-[11px] text-slate-400 font-medium">
                        By continuing, you agree to our <span className="text-slate-900 font-bold hover:underline cursor-pointer">Terms of Service</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
