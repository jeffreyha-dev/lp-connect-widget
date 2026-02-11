import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SlideProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    isActive?: boolean;
}

export default function Slide({ children, title, subtitle }: SlideProps) {
    return (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-8 border-b border-white/10 pb-6"
            >
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    {title}
                </h1>
                {subtitle && (
                    <h2 className="text-2xl text-gray-400 mt-2 font-light tracking-wide">
                        {subtitle}
                    </h2>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex-1 overflow-hidden"
            >
                {children}
            </motion.div>
        </div>
    );
}
