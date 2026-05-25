import type { OGData } from '../../../integrations/og-cache/generator.ts';

export function blogTemplate(data: OGData & { faviconUrl?: string }): string {
  return `
    <div style="width: 1200px; height: 630px; display: flex; flex-direction: column; background-image: linear-gradient(to bottom right, #0f0f13, #18181b); color: white; position: relative; font-family: 'Roboto'; overflow: hidden;">
      
      <!-- Subtle top-right radial glow -->
      <div style="position: absolute; top: -200px; right: -100px; width: 700px; height: 700px; background-image: radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0) 70%); border-radius: 350px; display: flex;"></div>

      <!-- Left Emerald/Teal Accent Bar (blog brand colour — distinct from tools indigo) -->
      <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background-image: linear-gradient(to bottom, #059669, #34d399); display: flex;"></div>

      <!-- Main Content Container -->
      <div style="display: flex; flex-direction: row; width: 100%; height: 570px; padding-top: 60px; padding-left: 60px; padding-right: 60px;">
        
        <!-- Left Column: Copy -->
        <div style="display: flex; flex-direction: column; width: 65%; padding-right: 40px;">
          
          <!-- Brand Header -->
          <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 40px;">
            <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: #059669; border-radius: 12px; margin-right: 16px; overflow: hidden;">
              ${data.faviconUrl ? `<img src="${data.faviconUrl}" style="width: 32px; height: 32px; object-fit: contain;" />` : ''}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 24px; font-weight: bold; color: #d4d4d8; line-height: 1;">${data.siteName}</span>
              <span style="font-size: 14px; color: #a1a1aa; margin-top: 4px;">${data.domain}</span>
            </div>
          </div>

          <!-- Category Badge -->
          <div style="display: flex; align-items: center; padding: 6px 16px; background-color: rgba(5,150,105,0.2); border-radius: 999px; margin-bottom: 24px;">
            <span style="font-size: 14px; font-weight: bold; color: #34d399; text-transform: uppercase; letter-spacing: 1px;">
              ${data.category}
            </span>
          </div>

          <!-- Title -->
          <div style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 56px; font-weight: bold; color: white; line-height: 1.1; margin-bottom: 24px;">
            ${data.title}
          </div>

          <!-- Description -->
          <div style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 22px; color: #a1a1aa; line-height: 1.5; max-width: 620px;">
            ${data.description}
          </div>
        </div>

        <!-- Right Column: Abstract Article/Blog panel -->
        <div style="display: flex; align-items: center; justify-content: flex-end; width: 35%;">
          <div style="display: flex; flex-direction: column; width: 320px; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 24px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
            <!-- Blog label -->
            <div style="display: flex; flex-direction: row; align-items: center; gap: 8px; margin-bottom: 20px;">
              <div style="display: flex; width: 28px; height: 28px; background-color: #059669; border-radius: 6px;"></div>
              <span style="font-size: 14px; font-weight: bold; color: #34d399; letter-spacing: 0.5px;">BLOG ARTICLE</span>
            </div>
            
            <!-- Mock text lines representing article content -->
            <div style="display: flex; width: 100%; height: 10px; background-color: #3f3f46; border-radius: 4px; margin-bottom: 8px;"></div>
            <div style="display: flex; width: 85%; height: 10px; background-color: #3f3f46; border-radius: 4px; margin-bottom: 8px;"></div>
            <div style="display: flex; width: 92%; height: 10px; background-color: #3f3f46; border-radius: 4px; margin-bottom: 20px;"></div>

            <!-- Separator -->
            <div style="display: flex; width: 100%; height: 1px; background-color: #27272a; margin-bottom: 20px;"></div>

            <!-- Mock heading 2 -->
            <div style="display: flex; width: 60%; height: 14px; background-color: #52525b; border-radius: 4px; margin-bottom: 12px;"></div>
            <div style="display: flex; width: 95%; height: 10px; background-color: #3f3f46; border-radius: 4px; margin-bottom: 8px;"></div>
            <div style="display: flex; width: 78%; height: 10px; background-color: #3f3f46; border-radius: 4px; margin-bottom: 20px;"></div>

            <!-- Read time badge -->
            <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 100%; padding-top: 16px; border-top: 1px solid #27272a;">
              <div style="display: flex; width: 60px; height: 12px; background-color: #3f3f46; border-radius: 4px;"></div>
              <div style="display: flex; width: 80px; height: 24px; background-color: #059669; border-radius: 6px;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Footer Bar -->
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 60px; background-color: #09090b; border-top: 1px solid #27272a; display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding-left: 40px; padding-right: 40px;">
        <div style="display: flex; flex-direction: row; align-items: center;">
          <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background-color: #059669; border-radius: 6px; margin-right: 12px; overflow: hidden;">
            ${data.faviconUrl ? `<img src="${data.faviconUrl}" style="width: 18px; height: 18px; object-fit: contain;" />` : ''}
          </div>
          <div style="display: flex; flex-direction: row; align-items: center; font-size: 16px; font-weight: bold;">
            <span style="color: #a1a1aa;">${data.siteName}</span>
            <span style="color: #52525b; margin: 0 6px;">—</span>
            <span style="color: #a1a1aa;">${data.tagline}</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: row; align-items: center; background-color: #18181b; padding: 6px 14px; border-radius: 8px; border: 1px solid #27272a;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span style="font-size: 16px; color: #a1a1aa; font-weight: bold;">
            ${data.url}
          </span>
        </div>
      </div>
    
    </div>
  `;
}
