import React, { useEffect, useRef } from 'react';
import TagCloud from 'TagCloud';

const skills = [
    'Python', 'LLMs', 'RAG', 'Gradio', 'Astro.js', 'React', 'Spring Boot', 'Java', 'C#', 'MySQL', 'SAP HANA', 'VB.NET', 'FastReport', 'Maven', 'Frontend', 'Backend', 'POO', 'Stripe'
];

export default function SkillsGlobe() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            // Limpiar el contenedor antes de inicializar para evitar duplicados (React Strict Mode bug con bibliotecas que mutan el DOM)
            containerRef.current.innerHTML = '';

            TagCloud(containerRef.current, skills, {
                radius: 250,
                maxSpeed: 'normal',
                initSpeed: 'normal',
                keep: true,
            });
        }

        return () => {
            // Cleanup cleanup si es necesario
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div className="flex justify-center items-center w-full min-h-[500px] overflow-visible">
            <div
                ref={containerRef}
                className="text-sky-400 font-bold text-lg cursor-pointer mx-auto flex items-center justify-center p-4 bg-transparent"
            ></div>
        </div>
    );
}
