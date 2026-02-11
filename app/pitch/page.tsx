"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize, Phone, ShieldCheck, Zap, Server, Code, Layers } from "lucide-react";
import Slide from "./components/Slide";

export default function PitchDeck() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: "intro",
            title: "LivePerson + Amazon Connect",
            subtitle: "The Unified Agent Experience",
            content: (
                <div className="flex flex-col items-center justify-center h-full gap-12">
                    <div className="relative w-64 h-64">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-4 border-dashed border-blue-500/30"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-4 rounded-full border-4 border-dashed border-purple-500/30"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-6xl">🚀</div>
                        </div>
                    </div>
                    <div className="text-center max-w-2xl">
                        <p className="text-3xl font-light leading-relaxed text-gray-300">
                            Embedding enabling voice capabilities directly within the
                            <span className="text-orange-400 font-semibold mx-2">LivePerson Agent Workspace</span>.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "problem",
            title: "The Problem",
            subtitle: "Context Switching & Fragmentation",
            content: (
                <div className="grid grid-cols-2 gap-12 h-full items-center">
                    <div className="space-y-8">
                        <div className="bg-red-500/10 p-8 rounded-2xl border border-red-500/20">
                            <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3">
                                <span className="text-3xl">😫</span> Agent Fatigue
                            </h3>
                            <p className="text-lg text-gray-300">
                                Alt-tabbing between LivePerson for chat and Amazon Connect for calls breaks focus and increases handle time.
                            </p>
                        </div>
                        <div className="bg-orange-500/10 p-8 rounded-2xl border border-orange-500/20">
                            <h3 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-3">
                                <span className="text-3xl">📉</span> Data Silos
                            </h3>
                            <p className="text-lg text-gray-300">
                                Customer context is lost when switching tools. Agents have to ask for information the customer already provided.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md aspect-square bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50 p-8 flex flex-col gap-4 opacity-50 blur-sm grayscale hover:grayscale-0 hover:blur-0 transition-all duration-500">
                            <div className="w-full h-8 bg-gray-700 rounded-md animate-pulse"></div>
                            <div className="w-3/4 h-8 bg-gray-700 rounded-md animate-pulse"></div>
                            <div className="w-full h-32 bg-gray-700 rounded-md animate-pulse mt-4"></div>
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-4xl text-white/20 rotate-12">
                                FRAGMENTED
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "solution",
            title: "The Solution",
            subtitle: "One Workspace to Rule Them All",
            content: (
                <div className="flex flex-col h-full gap-8">
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { icon: Zap, title: "Zero Context Switching", text: "CCP Embedded directly in the widget sidebar." },
                            { icon: Phone, title: "Click-to-Call", text: "Dial directly from chat conversations." },
                            { icon: ShieldCheck, title: "Secure & Compliant", text: "Leverages standard AWS & LP security models." },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm"
                            >
                                <feature.icon className="w-10 h-10 text-blue-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-6xl block mb-4">🖥️ + 📞</span>
                            <span className="text-2xl font-medium text-gray-300">Unified Interface</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "features",
            title: "Key Features",
            subtitle: "Designed for the Modern Agent",
            content: (
                <div className="grid grid-cols-2 gap-8 h-full">
                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="bg-green-500/20 p-3 rounded-lg"><Phone className="w-6 h-6 text-green-400" /></div>
                            <div>
                                <h3 className="text-xl font-bold">Smart Phone Detection</h3>
                                <p className="text-gray-400">Automatically identifies phone numbers from visitor info, surveys, and chat transcripts.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-purple-500/20 p-3 rounded-lg"><Layers className="w-6 h-6 text-purple-400" /></div>
                            <div>
                                <h3 className="text-xl font-bold">Glassmorphic Design</h3>
                                <p className="text-gray-400">Premium UI that feels native to modern operating systems.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-blue-500/20 p-3 rounded-lg"><ShieldCheck className="w-6 h-6 text-blue-400" /></div>
                            <div>
                                <h3 className="text-xl font-bold">Robust Permissions</h3>
                                <p className="text-gray-400">Handles microphone and clipboard access with graceful fallbacks.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-6 border border-white/10 flex flex-col justify-center gap-4">
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Detected Number</div>
                            <div className="text-3xl font-mono text-white">+1 (555) 012-3456</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 text-center text-green-400 font-semibold cursor-pointer hover:bg-green-600/30 transition">
                                Call
                            </div>
                            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-center text-gray-300 font-semibold cursor-pointer hover:bg-gray-700/70 transition">
                                Copy
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "architecture",
            title: "Architecture",
            subtitle: "Secure, Scalable, Serverless",
            content: (
                <div className="flex flex-col h-full justify-center">
                    <div className="grid grid-cols-3 gap-4 text-center mb-12">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <div className="text-purple-400 font-bold mb-2">LivePerson</div>
                            <div className="text-sm text-gray-500">Agent Workspace</div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-green-500"></div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <div className="text-green-400 font-bold mb-2">Next.js Widget</div>
                            <div className="text-sm text-gray-500">Embedded Iframe</div>
                        </div>
                    </div>

                    <div className="flex justify-center mb-12">
                        <div className="h-12 w-1 bg-gray-600"></div>
                    </div>

                    <div className="max-w-md mx-auto w-full bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                        <div className="text-blue-400 font-bold mb-2">Amazon Connect</div>
                        <div className="text-sm text-gray-500">Streams SDK + CCP</div>
                    </div>
                </div>
            )
        },
        {
            id: "tech-stack",
            title: "Tech Stack",
            subtitle: "Built for Performance",
            content: (
                <div className="grid grid-cols-2 gap-6 place-content-center h-full">
                    {[
                        { name: "Next.js 16", icon: Code, color: "text-white" },
                        { name: "React 19", icon: Code, color: "text-blue-400" },
                        { name: "Tailwind CSS", icon: Zap, color: "text-sky-400" },
                        { name: "Framer Motion", icon: Layers, color: "text-pink-500" },
                        { name: "Amazon Connect Streams", icon: Server, color: "text-orange-400" },
                        { name: "TypeScript", icon: Code, color: "text-blue-600" },
                    ].map((tech, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className="bg-gray-800/40 p-6 rounded-xl border border-gray-700 flex items-center gap-4 hover:border-blue-500/50 hover:bg-gray-800/60 transition-colors"
                        >
                            <tech.icon className={`w-8 h-8 ${tech.color}`} />
                            <span className="text-xl font-semibold">{tech.name}</span>
                        </motion.div>
                    ))}
                </div>
            )
        },
        {
            id: "closing",
            title: "Ready to Deploy",
            subtitle: "Next Steps",
            content: (
                <div className="text-center h-full flex flex-col justify-center items-center gap-8">
                    <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                        Production Ready
                    </h3>
                    <p className="text-2xl text-gray-400 max-w-2xl">
                        The widget is fully functional, documented, and ready for deployment to Vercel/AWS.
                    </p>
                    <button
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1"
                        onClick={() => window.location.href = '/'}
                    >
                        Launch Demo
                    </button>
                </div>
            )
        }
    ];

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "space") {
                handleNext();
            } else if (e.key === "ArrowLeft") {
                handlePrev();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const progress = ((currentSlide + 1) / slides.length) * 100;

    return (
        <div className="h-screen w-screen bg-gray-950 text-white overflow-hidden flex flex-col relative font-sans">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="flex-1 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        <Slide
                            title={slides[currentSlide].title}
                            subtitle={slides[currentSlide].subtitle}
                        >
                            {slides[currentSlide].content}
                        </Slide>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls & Progress */}
            <div className="relative z-20 p-6 flex items-center justify-between border-t border-white/5 bg-gray-900/50 backdrop-blur-md">
                <div className="text-sm text-gray-500">
                    Slide {currentSlide + 1} of {slides.length}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handlePrev}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-500"
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
