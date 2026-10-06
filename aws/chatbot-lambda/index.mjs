import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const MODEL_ID = process.env.MODEL_ID || 'us.anthropic.claude-haiku-4-5-20251001-v1:0';

// Uno o varios orígenes separados por coma, p. ej. "https://midominio.com,http://localhost:4321"
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

const MAX_MESSAGES = 10;
const MAX_CHARS = 1000;
const MAX_TOKENS = 400;

const SYSTEM_PROMPT = 'Eres el Agente de IA de José Antonio Chi May. Responde de forma breve, profesional y amigable (máximo 2 párrafos). Eres directo. Información de José: Ingeniero en Sistemas Computacionales (Tec de Mérida). Software Engineer, Full Stack (Java & React) y AI Developer. Experiencia: Operaciones TI en Galletas Dondé (SAP HANA, ADV Web con Java MVC y PostgreSQL, migración de Sistema Envíos con C#, .NET y SQL Server). Antes, Programador Java Jr en EFISYS (Core SAFI, Java 1.8). Proyectos: E-commerce Algorithm (React, Spring Boot). Skills: Python, LLMs, RAG, Astro.js. Si preguntan algo fuera de su perfil, desvía a su experiencia.';

// Se crea fuera del handler para reutilizarlo entre invocaciones
const client = new BedrockRuntimeClient({});

const respond = (statusCode, corsHeaders, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    body: body ? JSON.stringify(body) : ''
});

// Converse exige que la conversación empiece con "user", alterne roles y termine en "user"
export const sanitizeMessages = (messages) => {
    const cleaned = messages
        .filter(msg => msg && typeof msg.text === 'string' && msg.text.trim())
        .map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            text: msg.text.trim().slice(0, MAX_CHARS)
        }))
        .slice(-MAX_MESSAGES);

    while (cleaned.length && cleaned[0].role !== 'user') cleaned.shift();

    const merged = [];
    for (const msg of cleaned) {
        const last = merged[merged.length - 1];
        if (last && last.role === msg.role) {
            last.content[0].text += `\n${msg.text}`;
        } else {
            merged.push({ role: msg.role, content: [{ text: msg.text }] });
        }
    }
    return merged;
};

export const handler = async (event) => {
    const method = event.requestContext?.http?.method;
    const origin = (event.headers?.origin || '').replace(/\/$/, '');

    if (!ALLOWED_ORIGINS.includes(origin)) {
        return respond(403, {}, { error: 'Origin not allowed' });
    }

    const corsHeaders = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };

    if (method === 'OPTIONS') return respond(204, corsHeaders);
    if (method !== 'POST') return respond(405, corsHeaders, { error: 'Method not allowed' });

    let payload;
    try {
        const rawBody = event.isBase64Encoded
            ? Buffer.from(event.body || '', 'base64').toString('utf-8')
            : event.body;
        payload = JSON.parse(rawBody || '{}');
    } catch {
        return respond(400, corsHeaders, { error: 'Invalid JSON body' });
    }

    if (!Array.isArray(payload?.messages)) {
        return respond(400, corsHeaders, { error: 'Valid messages array is required' });
    }

    const messages = sanitizeMessages(payload.messages);
    if (!messages.length || messages[messages.length - 1].role !== 'user') {
        return respond(400, corsHeaders, { error: 'Last message must be from the user' });
    }

    try {
        const result = await client.send(new ConverseCommand({
            modelId: MODEL_ID,
            system: [{ text: SYSTEM_PROMPT }],
            messages,
            inferenceConfig: { maxTokens: MAX_TOKENS }
        }));

        const text = (result.output?.message?.content || [])
            .map(block => block.text || '')
            .join('')
            .trim();

        return respond(200, corsHeaders, { text });
    } catch (error) {
        console.error('Error invocando Bedrock:', error);
        return respond(500, corsHeaders, { error: 'Internal server error while processing chat' });
    }
};
