import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUGGESTED_QUESTIONS = [
    '💼 Resumen de experiencia',
    '🚀 Proyectos destacados',
    '💻 Stack tecnológico',
    '📫 ¿Cómo contactarlo?'
];

const SYSTEM_PROMPT = 'Eres el Agente de IA de José Antonio Chi May. Responde de forma breve, profesional y amigable (máximo 2 párrafos). Eres directo. Información de José: Ingeniero en Sistemas Computacionales (Tec de Mérida). Software Engineer, Full Stack (Java & React) y AI Developer. Experiencia: Operaciones TI en Galletas Dondé (SAP HANA, ADV Web con Java MVC y PostgreSQL, migración de Sistema Envíos con C#, .NET y SQL Server). Antes, Programador Java Jr en EFISYS (Core SAFI, Java 1.8). Proyectos: E-commerce Algorithm (React, Spring Boot). Skills: Python, LLMs, RAG, Astro.js. Si preguntan algo fuera de su perfil, desvía a su experiencia.';

type Role = 'user' | 'model';

interface Message {
    role: Role;
    text: string;
}

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: '¡Hola! Soy el asistente virtual de José Antonio. ¿Qué te gustaría saber sobre su experiencia como Full Stack o AI Developer?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const sendMessage = async (e?: React.FormEvent, textOverride?: string) => {
        if (e) e.preventDefault();

        const messageText = textOverride || input;

        if (!messageText.trim() || isLoading) return;

        const userMessage = messageText.trim();
        setInput('');

        // Add user message immediately
        const newMessages: Message[] = [...messages, { role: 'user', text: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Initialize the client
            const genAI = new GoogleGenerativeAI(import.meta.env.PUBLIC_GOOGLE_API_KEY);

            // Configure the model
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                systemInstruction: SYSTEM_PROMPT
            });

            // Formatear el historial completo de mensajes para el SDK de Gemini
            const formattedContents = newMessages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            // Send the user's message con todo el contexto
            const result = await model.generateContent({ contents: formattedContents });
            const responseText = result.response.text();

            // Add the AI's response
            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (error) {
            console.error('Error enviando mensaje a Gemini:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'Oops, ocurrió un error resolviendo el mensaje.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedClick = (questionText: string) => {
        sendMessage(undefined, questionText);
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[450px] h-[650px] max-h-[calc(100vh-8rem)] bg-slate-900 border border-sky-500/50 rounded-xl flex flex-col shadow-[0_0_20px_rgba(56,189,248,0.8)] overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-slate-800 border-b border-sky-500/30 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                            </span>
                            <h3 className="font-bold text-slate-100 text-sm">Habla con mi Agente de IA</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-900/50 scroll-smooth">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-sm self-end'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm self-start'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {messages.length === 1 && (
                            <div className="grid grid-cols-1 gap-3 mt-4 px-2">
                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestedClick(q)}
                                        className="bg-slate-800 border border-sky-500/30 text-sky-300 hover:bg-blue-600 hover:text-white hover:border-sky-400 rounded-full py-3 px-4 text-center w-full text-sm font-medium cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                        {isLoading && (
                            <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl rounded-tl-sm self-start border border-slate-700/50 text-sm italic shadow-sm w-fit">
                                Escribiendo...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={sendMessage} className="p-3 border-t border-sky-500/30 bg-slate-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-500 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors shadow-md disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Callout Bubble (Visible when closed) */}
            {!isOpen && (
                <div className="fixed bottom-24 right-10 z-50 animate-float">
                    <div className="bg-blue-600 text-white text-sm font-medium px-4 py-3 rounded-2xl rounded-br-sm shadow-[0_4px_20px_rgba(56,189,248,0.4)] border border-sky-500/50 whitespace-nowrap">
                        ¡Hola! 👋 Soy la IA de José. ¿Hablamos?
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.8)] transition-all duration-300 hover:scale-110 flex items-center justify-center animate-float ${isOpen ? 'bg-slate-800 border border-sky-500 text-sky-400 hover:bg-slate-700' : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(56,189,248,0.6)]'}`}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                )}
            </button>
        </>
    );
}
