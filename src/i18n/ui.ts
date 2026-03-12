export const languages = {
    es: 'ES',
    en: 'EN',
};

export const defaultLang = 'es';

export const ui = {
    es: {
        // Nav / General
        'nav.projects': 'Ver Proyectos',
        'nav.cv': 'Descargar CV',

        // Hero
        'hero.greeting': 'Hola, mi nombre es',
        'hero.role': 'Software Engineer | Full Stack Java & React | AI Developer',
        'hero.description': 'Construyo soluciones digitales innovadoras con un enfoque en el rendimiento, la escalabilidad y la creación de experiencias de usuario excepcionales.',

        // Experience
        'experience.title': 'Experiencia Profesional',
        'experience.donde.role': 'Ingeniero en Operaciones TI',
        'experience.donde.company': 'Productos de Harina S.A. de C.V. (Galletas Dondé)',
        'experience.donde.period': 'Mar 2023 - Actualidad',
        'experience.donde.desc': 'Garantizo la estabilidad de sistemas empresariales (incluyendo SAP HANA). Desarrollé el Módulo ADV Web (Java MVC, PostgreSQL) y participé en la migración del Sistema de Envíos (C#, .NET, FastReport, SQL Server).',
        'experience.efisys.role': 'Programador Java Jr & Analista',
        'experience.efisys.company': 'EFISYS',
        'experience.efisys.period': 'Jul 2022 - Sept 2022',
        'experience.efisys.desc': 'Desarrollo en el core bancario SAFI, implementando web services y pantallas web aplicando POO con Java 1.8 y MySQL.',

        // Projects
        'projects.title': 'Proyectos Destacados',
        'projects.algorithm.title': 'E-commerce \'Algorithm\'',
        'projects.algorithm.desc': 'Plataforma integral Full Stack para la gestión de ventas y procesamiento de órdenes con arquitectura en capas.',
        'projects.envios.title': 'Sistema de Envíos',
        'projects.envios.desc': 'Sistema logístico independiente para la gestión y seguimiento de envíos, optimizando tiempos y generación de reportes.',
        'projects.code': 'Código',
        'projects.demo': 'Demo',

        // Education
        'education.title': 'Educación',
        'education.degree': 'Ingeniería en Sistemas Computacionales',
        'education.school': 'Instituto Tecnológico de Mérida',
        'education.period': '2016 - 2022',
        'education.cert.title': 'Certificaciones Destacadas',
        'education.cert.1.title': 'Ingeniería de LLM: Domina IA, Modelos de Lenguaje y Agentes',
        'education.cert.1.date': 'feb. 2026',
        'education.cert.2.title': 'React & Spring Boot: Creando Webapp Full Stack',
        'education.cert.2.date': 'ene. 2025',
        'education.skills.title': 'Skills & Tecnologías',

        // Contact
        'contact.title': '¿Construimos algo increíble juntos?',
        'contact.desc': 'Actualmente estoy abierto a nuevas oportunidades. Ya sea que tengas una propuesta, un proyecto en mente o simplemente quieras saludar, ¡mi bandeja de entrada siempre está abierta!',
        'contact.btn': 'Envíame un correo',
    },
    en: {
        // Nav / General
        'nav.projects': 'View Projects',
        'nav.cv': 'Download CV',

        // Hero
        'hero.greeting': 'Hello, my name is',
        'hero.role': 'Software Engineer | Full Stack Java & React | AI Developer',
        'hero.description': 'I build innovative digital solutions with a focus on performance, scalability, and creating exceptional user experiences.',

        // Experience
        'experience.title': 'Professional Experience',
        'experience.donde.role': 'IT Operations Engineer',
        'experience.donde.company': 'Productos de Harina S.A. de C.V. (Galletas Dondé)',
        'experience.donde.period': 'Mar 2023 - Present',
        'experience.donde.desc': 'I ensure the stability of enterprise systems (including SAP HANA). Developed the ADV Web Module (Java MVC, PostgreSQL) and participated in the Shipping System migration (C#, .NET, FastReport, SQL Server).',
        'experience.efisys.role': 'Jr Java Programmer & Analyst',
        'experience.efisys.company': 'EFISYS',
        'experience.efisys.period': 'Jul 2022 - Sep 2022',
        'experience.efisys.desc': 'Development within the SAFI core banking system, implementing web services and web interfaces using OOP with Java 1.8 and MySQL.',

        // Projects
        'projects.title': 'Featured Projects',
        'projects.algorithm.title': 'E-commerce \'Algorithm\'',
        'projects.algorithm.desc': 'Comprehensive Full Stack platform for sales management and order processing with a layered architecture.',
        'projects.envios.title': 'Shipping System',
        'projects.envios.desc': 'Independent logistics system for shipping management and tracking, optimizing processing times and report generation.',
        'projects.code': 'Code',
        'projects.demo': 'Live Demo',

        // Education
        'education.title': 'Education',
        'education.degree': 'B.S. in Computer Systems Engineering',
        'education.school': 'Merida Institute of Technology',
        'education.period': '2016 - 2022',
        'education.cert.title': 'Featured Certifications',
        'education.cert.1.title': 'LLM Engineering: Master AI, Language Models & Agents',
        'education.cert.1.date': 'Feb 2026',
        'education.cert.2.title': 'React & Spring Boot: Building Full Stack Webapp',
        'education.cert.2.date': 'Jan 2025',
        'education.skills.title': 'Skills & Technologies',

        // Contact
        'contact.title': 'Let\'s build something amazing together',
        'contact.desc': 'I\'m currently open to new opportunities. Whether you have a question, a project in mind, or just want to say hi, my inbox is always open!',
        'contact.btn': 'Send me an email',
    },
} as const;

export function getLangFromUrl(url: URL) {
    const [, lang] = url.pathname.split('/');
    if (lang in ui) return lang as keyof typeof ui;
    return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
    return function t(key: keyof typeof ui[typeof defaultLang]) {
        return ui[lang][key] || ui[defaultLang][key];
    }
}
