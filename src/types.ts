export interface Animal {
    id: string;
    slug: string;
    name: string;
    species: "cat" | "dog";
    breed: string;
    age: string;
    sex: string;
    weightKg: number;
    illnesses: string[];
    vaccinations: string[];
    sterilized: boolean;
    featured: boolean;
    image: string;
    imageAlt: string;
    description: string;
    story: string;
    traits: string[];
    status: string;
}

export interface NewsItem {
    id: string;
    title: string;
    date: string;
    badge: string;
    image: string;
    summary: string;
    highlights: string[];
}

export interface FaqResponse {
    keywords: string[];
    answer: string;
}

export interface FaqData {
    greeting: string;
    placeholder: string;
    quickQuestions: string[];
    responses: FaqResponse[];
    fallback: string;
}

export interface SiteMetric {
    value: string;
    label: string;
}

export interface SiteValue {
    title: string;
    text: string;
}

export interface SitePayment {
    label: string;
    value: string;
}

export interface SiteData {
    brand: {
        name: string;
        tagline: string;
        city: string;
        founded: string;
    };
    hero: {
        eyebrow: string;
        title: string;
        description: string;
    };
    contacts: {
        phone: string;
        email: string;
        address: string;
        schedule: string;
    };
    stats: SiteMetric[];
    values: SiteValue[];
    timeline: SiteValue[];
    adoptionSteps: string[];
    helpOptions: Array<SiteValue & { accent: string }>;
    payments: SitePayment[];
    quote: {
        text: string;
        author: string;
    };
}
