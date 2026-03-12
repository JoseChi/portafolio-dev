import React from 'react';
import { ui, defaultLang } from '../i18n/ui';

export default function Hero({ lang = defaultLang }: { lang?: 'es' | 'en' }) {
    const t = (key: keyof typeof ui[typeof defaultLang]) => ui[lang][key] || ui[defaultLang][key];

    return (
        <section className="relative overflow-hidden flex flex-col justify-center min-h-[80vh] px-6 sm:px-12 md:px-24">
            {/* Background patterns */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-950 to-emerald-950/30 -z-10"></div>

            {/* Animated gradient blob */}
            <div className="absolute top-1/2 left-0 sm:left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -z-10 animate-blob"></div>
            <div className="absolute top-1/2 right-0 sm:right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] -z-10 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-blob animation-delay-4000"></div>

            <div className="max-w-7xl mx-auto w-full pt-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Column (Text) */}
                <div className="order-2 lg:order-1 flex flex-col justify-center">
                    <h2 className="text-sky-400 font-medium tracking-wider uppercase mb-5 text-sm sm:text-base animate-fade-in-up">
                        {t('hero.greeting')}
                    </h2>

                    <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-500 leading-[1.1] pb-2">
                        Jose Antonio Chi May.
                    </h1>

                    <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-300 mb-8 leading-tight">
                        {t('hero.role').split('|').map((part, index) => (
                            <React.Fragment key={index}>
                                <span className={index === 1 ? "inline-block" : ""}>{part.trim()}</span>
                                {index < 2 && <span className={index === 0 ? "text-sky-500 mx-2" : "text-emerald-500 mx-2"}>|</span>}
                            </React.Fragment>
                        ))}
                    </p>

                    <p className="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10">
                        {t('hero.description')}
                    </p>

                    <div className="flex gap-6 mb-8 mt-2">
                        <a href="https://www.linkedin.com/in/jose-antonio-chi-may/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 hover:scale-110 transition-transform" aria-label="LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-8 h-8 sm:w-10 sm:h-10">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                        <a href="https://github.com/JoseChi" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 hover:scale-110 transition-transform" aria-label="GitHub">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-8 h-8 sm:w-10 sm:h-10">
                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <a href="#proyectos" className="px-8 py-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-medium transition-all shadow-md hover:shadow-lg hover:shadow-sky-500/50 hover:-translate-y-0.5 inline-block text-center">
                            {t('nav.projects')}
                        </a>
                        <a href="/CV_Jose_Antonio_Chi.pdf" target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition-all shadow-md hover:shadow-lg hover:shadow-slate-700/50 hover:-translate-y-0.5 inline-block text-center">
                            {t('nav.cv')}
                        </a>
                    </div>
                </div>

                {/* Right Column (Photo) */}
                <div className="order-1 lg:order-2 flex justify-center lg:justify-end items-center animate-float">
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-1 bg-gradient-to-r from-blue-400 to-emerald-500 shadow-[0_0_30px_rgba(56,189,248,0.5),_0_0_60px_rgba(16,185,129,0.4)] animate-slow-pulse">
                        <img
                            src="/assets/perfil.png"
                            alt="Jose Antonio Chi May"
                            className="rounded-full w-full h-full object-cover border-4 border-slate-950"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
