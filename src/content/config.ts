import { z, defineCollection } from 'astro:content';

const experienceCollection = defineCollection({
    type: 'content',
    schema: z.object({
        role: z.string(),
        company: z.string(),
        period: z.string(),
        order: z.number(),
    }),
});

const projectsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        technologies: z.array(z.string()),
        order: z.number().optional(),
        githubUrl: z.string().optional(),
        demoUrl: z.string().optional(),
    }),
});

export const collections = {
    'experience': experienceCollection,
    'projects': projectsCollection,
};
