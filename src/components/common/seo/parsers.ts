/**
 * Schema Parser Utilities
 * 
 * Extracts structured data (JSON-LD) from markdown content bodies.
 * Centralizes FAQ and HowTo schema parsing logic that was previously
 * embedded in [tool].astro page frontmatter.
 */

interface FaqItem {
    "@type": "Question";
    name: string;
    acceptedAnswer: {
        "@type": "Answer";
        text: string;
    };
}

interface FaqSchema {
    "@context": "https://schema.org";
    "@type": "FAQPage";
    mainEntity: FaqItem[];
}

interface HowToStep {
    "@type": "HowToStep";
    position: number;
    name: string;
    text: string;
}

interface HowToSchema {
    "@context": "https://schema.org";
    "@type": "HowTo";
    name: string;
    description: string;
    step: HowToStep[];
}

/**
 * Parses FAQ schema from a markdown body.
 * 
 * Looks for a heading containing "Frequently Asked Questions" or "FAQ",
 * then extracts ### sub-headings as questions with their body text as answers.
 * 
 * Supported heading formats:
 * - ## Frequently Asked Questions (FAQ)
 * - ## Frequently Asked Questions
 * - ## FAQ
 * - ## Common Questions
 */
export function parseFaqSchema(body: string | undefined): FaqSchema | null {
    if (!body) return null;

    // Match headings that contain FAQ-related keywords
    const parts = body.split(/^## (?:Frequently Asked Questions(?: \(FAQ\))?|FAQ|Common Questions)\s*$/im);
    const faqSection = parts[1];
    if (!faqSection) return null;

    // Stop at the next ## heading (end of FAQ section)
    const sectionContent = faqSection.split(/\n## /)[0];

    const faqBlocks = sectionContent.split('### ').slice(1);
    const faqItems: FaqItem[] = faqBlocks
        .map(block => {
            const lines = block.split('\n');
            const question = lines[0].replace(/[*_~`"]/g, '').trim();
            const answer = lines.slice(1).join('\n').replace(/[*_~`"]/g, '').trim();
            if (question && answer) {
                return {
                    "@type": "Question" as const,
                    "name": question,
                    "acceptedAnswer": {
                        "@type": "Answer" as const,
                        "text": answer
                    }
                };
            }
            return null;
        })
        .filter((item): item is FaqItem => item !== null);

    if (faqItems.length === 0) return null;

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems
    };
}

/**
 * Parses HowTo schema from a markdown body.
 * 
 * Looks for a heading like "## How to Use the [Tool] Calculator"
 * then extracts numbered steps in the format:
 *   1. **Step Name:** Description text.
 */
export function parseHowToSchema(
    body: string | undefined,
    toolTitle: string,
    description: string
): HowToSchema | null {
    if (!body) return null;

    // Match exactly: "How to Use", "How to Use [Tool Title]", or "How to Use the [Tool Title]"
    const safeTitle = toolTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const headingRegex = new RegExp(`^## How to [Uu]se(?: (?:the )?${safeTitle})?\\s*$`, 'im');
    const parts = body.split(headingRegex);
    const howToSection = parts[1];
    if (!howToSection) return null;

    // Stop at the next ## heading
    const sectionContent = howToSection.split(/\n## /)[0];

    // Strip out all markdown formatting BEFORE parsing so that bold tags
    // around the colon (e.g. `**Step:**`) don't break the regex separator matcher.
    const cleanContent = sectionContent.replace(/[*_~`"]/g, '');

    // Strict but forgiving step parser:
    // Matches: `1. Step Name: text` OR `1. Step name - text`
    const stepRegex = /^\d+\.\s+(.+?)[:\-]\s+(.+)$/gm;
    const steps: { name: string; text: string }[] = [];
    let match;
    while ((match = stepRegex.exec(cleanContent)) !== null) {
        steps.push({ name: match[1].trim(), text: match[2].trim() });
    }

    if (steps.length === 0) return null;

    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": `How to Use the ${toolTitle}`,
        "description": description,
        "step": steps.map((s, i) => ({
            "@type": "HowToStep",
            "position": i + 1,
            "name": s.name,
            "text": s.text
        }))
    };
}

/**
 * Parses a list of features from a markdown body for the WebApplication schema.
 * 
 * Looks for exact headings like "### Features" or "### [Tool name] Features"
 * and extracts bullet points or numbered lists beneath it.
 */
export function parseFeatureList(body: string | undefined, toolTitle?: string): string[] | null {
    if (!body) return null;

    // Build a regex that matches ## Features, ## Key Features, OR ## [Tool Title] Features
    const safeTitle = toolTitle ? `|${toolTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} Features` : '';
    const headingRegex = new RegExp(`^(?:##|###) +(?:Features|Key Features|Core Features|Key Features Used in this File${safeTitle})\\s*$`, 'im');
    
    const parts = body.split(headingRegex);
    
    // If not found, parts[1] is undefined
    const featuresSection = parts[1];
    if (!featuresSection) return null;

    // Stop at the next ## or ### heading
    const sectionContent = featuresSection.split(/\n(?:##|###) /)[0];

    // Extract bullet points (- or *) or numbered items (1.)
    const bulletRegex = /^(?:\d+\.|-|\*)\s+(.+)$/gm;
    const features: string[] = [];
    let match;

    while ((match = bulletRegex.exec(sectionContent)) !== null) {
        // Strip markdown formatting like bold, italic, code from the feature text
        const cleanText = match[1].replace(/[*_~`"]/g, '').trim();
        if (cleanText) {
            features.push(cleanText);
        }
    }

    if (features.length === 0) return null;

    return features;
}
