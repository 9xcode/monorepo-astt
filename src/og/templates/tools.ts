import type { OGData } from '../../../integrations/og-cache/generator.ts';

export function toolsTemplate(data: OGData & { faviconUrl?: string }): string {
  return `
    <div style="width: 1200px; height: 630px; display: flex; flex-direction: column; background-image: linear-gradient(to bottom right, #0f0f13, #18181b); color: white; position: relative; font-family: 'Roboto'; overflow: hidden;">
      
      <!-- Subtle top radial glow fake (using a huge absolute flex div with transparency mask fake) -->
      <div style="position: absolute; top: -300px; left: -100px; width: 800px; height: 800px; background-image: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%); border-radius: 400px; border: 0px solid transparent; display: flex;"></div>

      <!-- Left Indigo Accent Bar -->
      <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background-image: linear-gradient(to bottom, #4f46e5, #818cf8); display: flex;"></div>

      <!-- Main Content Container -->
      <div style="display: flex; flex-direction: row; width: 100%; height: 570px; padding-top: 60px; padding-left: 60px; padding-right: 60px;">
        
        <!-- Left Column: Copy -->
        <div style="display: flex; flex-direction: column; width: 65%; padding-right: 40px;">
          
          <!-- Brand Header -->
          <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 40px;">
            <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: #6366f1; border-radius: 12px; margin-right: 16px; overflow: hidden;">
              ${data.faviconUrl ? `<img src="${data.faviconUrl}" style="width: 32px; height: 32px; object-fit: contain;" />` : ''}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 24px; font-weight: bold; color: #d4d4d8; line-height: 1;">${data.siteName}</span>
              <span style="font-size: 14px; color: #a1a1aa; margin-top: 4px;">${data.domain}</span>
            </div>
          </div>

          <!-- Category Badge -->
          <div style="display: flex; align-items: center; padding: 6px 16px; background-color: rgba(99,102,241,0.2); border-radius: 999px; margin-bottom: 24px;">
            <span style="font-size: 14px; font-weight: bold; color: #818cf8; text-transform: uppercase; letter-spacing: 1px;">
              ${data.category}
            </span>
          </div>

          <!-- Title -->
          <div style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 64px; font-weight: bold; color: white; line-height: 1.1; margin-bottom: 24px;">
            ${data.title}
          </div>

          <!-- Description -->
          <div style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 24px; color: #a1a1aa; line-height: 1.5; max-width: 650px;">
            ${data.description}
          </div>
        </div>

        <!-- Right Column: Abstract UI Panel -->
        <div style="display: flex; align-items: center; justify-content: flex-end; width: 35%;">
          <div style="display: flex; flex-direction: column; width: 340px; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 24px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
            <!-- Mock Header -->
            <div style="display: flex; width: 100%; height: 32px; background-color: #27272a; border-radius: 6px; margin-bottom: 24px;"></div>
            
            <!-- Mock Input 1 -->
            <div style="display: flex; width: 60%; height: 16px; background-color: #3f3f46; border-radius: 4px; margin-bottom: 8px;"></div>
            <div style="display: flex; width: 100%; height: 40px; background-color: #27272a; border-radius: 8px; margin-bottom: 20px;"></div>
            
            <!-- Mock Input 2 -->
            <div style="display: flex; flex-direction: row; width: 100%; gap: 12px; margin-bottom: 24px;">
              <div style="display: flex; flex-direction: column; width: 50%;">
                <div style="display: flex; width: 70%; height: 16px; background-color: #3f3f46; border-radius: 4px; margin-bottom: 8px;"></div>
                <div style="display: flex; width: 100%; height: 40px; background-color: #27272a; border-radius: 8px;"></div>
              </div>
              <div style="display: flex; flex-direction: column; width: 50%;">
                <div style="display: flex; width: 50%; height: 16px; background-color: #3f3f46; border-radius: 4px; margin-bottom: 8px;"></div>
                <div style="display: flex; width: 100%; height: 40px; background-color: #4f46e5; border-radius: 8px;"></div>
              </div>
            </div>
            
            <!-- Mock Result Highlight -->
            <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 100%; padding-top: 20px; border-top: 1px solid #27272a;">
              <div style="display: flex; width: 40px; height: 16px; background-color: #3f3f46; border-radius: 4px;"></div>
              <div style="display: flex; width: 100px; height: 24px; background-color: #818cf8; border-radius: 4px;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Footer Bar -->
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 60px; background-color: #09090b; border-top: 1px solid #27272a; display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding-left: 40px; padding-right: 40px;">
        <div style="display: flex; flex-direction: row; align-items: center;">
          <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background-color: #6366f1; border-radius: 6px; margin-right: 12px; overflow: hidden;">
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
