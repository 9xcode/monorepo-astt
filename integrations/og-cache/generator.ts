import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { html } from 'satori-html';
import fs from 'node:fs';
import path from 'node:path';

export interface OGData {
  title: string;
  description: string;
  category: string;
  collection: string;
  slug: string;
  url: string;
  locale: string | null;
  siteName: string;
  domain: string;
  tagline?: string;
}

export type OGTemplate = (data: OGData) => string;

// Cache font data and favicon base64
let fontData: Buffer | null = null;
let faviconUrl: string | null = null;

export async function generateOgImage(
  data: OGData,
  templateFn: OGTemplate,
  outputPath: string
): Promise<void> {
  if (!fontData) {
    const fontPath = path.resolve(process.cwd(), './public/fonts/Roboto-Bold.ttf');
    fontData = fs.readFileSync(fontPath);
  }
  
  if (!faviconUrl) {
    const faviconPath = path.resolve(process.cwd(), './public/favicon.svg');
    if (fs.existsSync(faviconPath)) {
      const faviconBase64 = fs.readFileSync(faviconPath, 'base64');
      faviconUrl = `data:image/svg+xml;base64,${faviconBase64}`;
    } else {
      faviconUrl = ''; // Fallback
    }
  }

  // Inject favicon string into template if needed (or assume the template has access to it, 
  // but better to pass it in data or keep it simple. Let's pass it via global or import)
  // Actually, template is a pure function. We can just run it. The template can rely on absolute URLs or base64.
  // We'll pass the faviconUrl to the template by injecting it via string replaced or data object.
  // Let's add it to data.
  const templateData = {
    ...data,
    faviconUrl
  };

  const htmlString = templateFn(templateData as any);
  const markup = html(htmlString as any);

  const svg = await satori(markup as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Roboto',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Roboto',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });

  const pngData = resvg.render().asPng();

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, pngData);
}
