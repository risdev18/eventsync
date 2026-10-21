'use client';

export interface CertificateData {
  recipientName: string;
  eventTitle: string;
  branchName: string;
  awardCategory: string;
  placementText: string;
  placement?: 1 | 2 | 3;
  teamName?: string;
  issueDate: string;
  eventDate: string;
  certificateNumber: string;
  collegeName: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
  qrCodeUrl: string;
  themePrimaryColor?: string;
  themeBgColor?: string;
}

export const CHATGPT_PROMPT_SUGGESTION = `Create a beautiful, responsive HTML/CSS landscape certificate template for our college event management platform.
Requirements:
1. Landscape aspect ratio (width: 100%, aspect-ratio: 1.414 / 1).
2. Use dynamic placeholders:
   - {{student_name}} : Name of the student
   - {{event_title}} : Title of the event
   - {{award_category}} : Achievement / Participation title
   - {{placement}} : 1st Place / 2nd Place / Participant
   - {{branch_name}} : Academic department
   - {{issue_date}} : Date of certificate issuance
   - {{certificate_number}} : Unique verification code
   - {{signatory_1_name}} & {{signatory_1_title}} : Faculty coordinator
   - {{signatory_2_name}} & {{signatory_2_title}} : Head of Department
   - {{qr_code}} : Scannable QR code verification image
3. Use inline CSS or self-contained styles with elegant borders, gold accents, and professional typography.`;

export const CHATGPT_TEMPLATE_PRESETS: { [key: string]: { name: string; description: string; template: string } } = {
  royal_gold: {
    name: 'ChatGPT Royal Gold Diploma',
    description: 'Majestic collegiate diploma layout with ornate gold frame, starburst crest, and classic serif calligraphy.',
    template: `<div style="width: 100%; aspect-ratio: 1.414 / 1; background: #0A0D17; color: #F8FAFC; border: 8px solid #D4AF37; padding: 36px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; font-family: 'Times New Roman', serif; position: relative; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
  <div style="border: 2px solid #F59E0B; height: 100%; padding: 24px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; text-align: center; background: radial-gradient(circle at 50% 30%, #171E36 0%, #0A0D17 80%);">
    <div>
      <div style="font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #D4AF37; margin-bottom: 4px;">{{college_name}}</div>
      <div style="font-size: 10px; opacity: 0.7; letter-spacing: 2px; text-transform: uppercase;">Department of {{branch_name}} • Official Certification</div>
      <h1 style="font-size: 26px; color: #F59E0B; text-transform: uppercase; margin: 12px 0 4px 0; letter-spacing: 2px;">{{award_category}}</h1>
      <div style="display: inline-block; padding: 2px 14px; border-radius: 20px; background: rgba(212,175,55,0.15); border: 1px solid #D4AF37; font-size: 10px; color: #D4AF37;">HONORARY RECOGNITION • {{placement}}</div>
    </div>
    
    <div style="margin: 16px 0;">
      <div style="font-style: italic; font-size: 13px; opacity: 0.8; margin-bottom: 6px;">This certificate is proudly conferred upon</div>
      <div style="font-size: 34px; font-weight: bold; color: #FFFFFF; letter-spacing: 1px; border-bottom: 2px solid #D4AF37; display: inline-block; padding-bottom: 4px; min-width: 280px;">{{student_name}}</div>
      <div style="font-size: 12px; opacity: 0.85; margin-top: 10px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.4;">
        for exceptional technical proficiency, leadership, and notable innovation in <strong>{{event_title}}</strong>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 14px;">
      <div style="text-align: center; width: 150px;">
        <div style="font-style: italic; font-size: 13px; color: #FDE68A;">{{signatory_1_name}}</div>
        <div style="height: 1px; background: rgba(255,255,255,0.3); margin: 3px 0;"></div>
        <div style="font-size: 9px; opacity: 0.65;">{{signatory_1_title}}</div>
      </div>

      <div style="text-align: center;">
        <div>{{qr_code}}</div>
        <div style="font-size: 8px; font-family: monospace; opacity: 0.7; margin-top: 2px;">ID: {{certificate_number}}</div>
      </div>

      <div style="text-align: center; width: 150px;">
        <div style="font-style: italic; font-size: 13px; color: #FDE68A;">{{signatory_2_name}}</div>
        <div style="height: 1px; background: rgba(255,255,255,0.3); margin: 3px 0;"></div>
        <div style="font-size: 9px; opacity: 0.65;">{{signatory_2_title}}</div>
      </div>
    </div>
  </div>
</div>`,
  },
  modern_minimal: {
    name: 'ChatGPT Modern Minimalist Tech',
    description: 'Clean modern dark slate tech aesthetic with emerald cyber accents and crisp geometric typography.',
    template: `<div style="width: 100%; aspect-ratio: 1.414 / 1; background: #0F172A; color: #F8FAFC; border: 4px solid #10B981; padding: 32px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; font-family: system-ui, -apple-system, sans-serif; border-radius: 16px; position: relative;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
    <div>
      <div style="font-size: 11px; font-weight: 700; color: #34D399; letter-spacing: 2px; text-transform: uppercase;">{{college_name}}</div>
      <div style="font-size: 9px; color: #94A3B8;">Division of {{branch_name}} • Tech Hackathon Series</div>
    </div>
    <div style="background: rgba(16,185,129,0.1); border: 1px solid #10B981; padding: 4px 12px; border-radius: 8px; font-size: 10px; font-weight: bold; color: #10B981;">
      {{placement}}
    </div>
  </div>

  <div style="text-align: center; margin: auto 0;">
    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 3px; color: #94A3B8; margin-bottom: 6px;">{{award_category}}</div>
    <div style="font-size: 12px; color: #CBD5E1; margin-bottom: 8px;">Conferred with distinction upon</div>
    <div style="font-size: 32px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; margin-bottom: 12px; background: linear-gradient(to right, #FFFFFF, #34D399); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">{{student_name}}</div>
    <div style="font-size: 13px; color: #94A3B8; max-width: 480px; margin: 0 auto; line-height: 1.5;">
      In recognition of successful technical contribution in <span style="color: #F8FAFC; font-weight: bold;">{{event_title}}</span> conducted on {{event_date}}.
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px;">
    <div style="text-align: left;">
      <div style="font-size: 12px; font-weight: bold; color: #F1F5F9;">{{signatory_1_name}}</div>
      <div style="font-size: 9px; color: #64748B;">{{signatory_1_title}}</div>
    </div>
    <div style="text-align: center;">
      <div>{{qr_code}}</div>
      <div style="font-size: 8px; font-family: monospace; color: #64748B; margin-top: 2px;">{{certificate_number}}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 12px; font-weight: bold; color: #F1F5F9;">{{signatory_2_name}}</div>
      <div style="font-size: 9px; color: #64748B;">{{signatory_2_title}}</div>
    </div>
  </div>
</div>`,
  },
  cyber_neon: {
    name: 'ChatGPT Cyberpunk Neon Grid',
    description: 'High-tech terminal style with glowing cyan borders, digital matrix aesthetics, and futuristic verification elements.',
    template: `<div style="width: 100%; aspect-ratio: 1.414 / 1; background: #050814; color: #E2E8F0; border: 4px solid #00F0FF; padding: 30px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; font-family: monospace; border-radius: 12px; box-shadow: 0 0 30px rgba(0,240,255,0.3); position: relative;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,240,255,0.3); padding-bottom: 12px;">
    <div>
      <div style="font-size: 12px; color: #00F0FF; font-weight: bold; letter-spacing: 2px;">&gt; {{college_name}} //</div>
      <div style="font-size: 9px; color: #94A3B8;">NODE: {{branch_name}} // SECURE VERIFICATION</div>
    </div>
    <div style="border: 1px solid #E000FF; padding: 4px 10px; border-radius: 4px; font-size: 9px; color: #E000FF; background: rgba(224,0,255,0.1);">
      STATUS: {{placement}}
    </div>
  </div>

  <div style="text-align: center; margin: 16px 0;">
    <div style="font-size: 11px; color: #38BDF8; letter-spacing: 3px;">[ OFFICIAL DIGITAL RECORD ]</div>
    <h2 style="font-size: 22px; color: #00F0FF; margin: 6px 0 10px 0; text-transform: uppercase;">{{award_category}}</h2>
    <div style="font-size: 11px; opacity: 0.7;">PROUDLY ISSUED TO RECIPIENT:</div>
    <div style="font-size: 30px; font-weight: bold; color: #FFFFFF; text-shadow: 0 0 12px #00F0FF; margin: 6px 0;">{{student_name}}</div>
    <div style="font-size: 11px; color: #94A3B8; max-width: 460px; margin: 0 auto; line-height: 1.4;">
      For demonstration of exceptional software architecture and computational problem solving in <strong>{{event_title}}</strong>.
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(0,240,255,0.3); padding-top: 12px;">
    <div>
      <div style="font-size: 11px; font-weight: bold; color: #38BDF8;">{{signatory_1_name}}</div>
      <div style="font-size: 8px; color: #64748B;">{{signatory_1_title}}</div>
    </div>
    <div style="text-align: center;">
      <div>{{qr_code}}</div>
      <div style="font-size: 8px; color: #00F0FF;">HASH: {{certificate_number}}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: bold; color: #38BDF8;">{{signatory_2_name}}</div>
      <div style="font-size: 8px; color: #64748B;">{{signatory_2_title}}</div>
    </div>
  </div>
</div>`,
  },
};

export function compileCertificateTemplate(rawTemplate: string, data: CertificateData): string {
  if (!rawTemplate || !rawTemplate.trim()) return '';

  const qrHtml = data.qrCodeUrl
    ? `<img src="${data.qrCodeUrl}" alt="Verification QR" style="width: 56px; height: 56px; display: inline-block; background: #FFFFFF; padding: 2px; border-radius: 4px;" />`
    : '';

  return rawTemplate
    .replace(/\{\{student_name\}\}/gi, data.recipientName)
    .replace(/\{\{recipient_name\}\}/gi, data.recipientName)
    .replace(/\{\{event_title\}\}/gi, data.eventTitle)
    .replace(/\{\{branch_name\}\}/gi, data.branchName)
    .replace(/\{\{award_category\}\}/gi, data.awardCategory)
    .replace(/\{\{placement\}\}/gi, data.placementText)
    .replace(/\{\{team_name\}\}/gi, data.teamName || 'Individual')
    .replace(/\{\{issue_date\}\}/gi, data.issueDate)
    .replace(/\{\{event_date\}\}/gi, data.eventDate)
    .replace(/\{\{certificate_number\}\}/gi, data.certificateNumber)
    .replace(/\{\{certificate_id\}\}/gi, data.certificateNumber)
    .replace(/\{\{college_name\}\}/gi, data.collegeName)
    .replace(/\{\{signatory_1_name\}\}/gi, data.signatory1Name)
    .replace(/\{\{signatory_1_title\}\}/gi, data.signatory1Title)
    .replace(/\{\{signatory_2_name\}\}/gi, data.signatory2Name)
    .replace(/\{\{signatory_2_title\}\}/gi, data.signatory2Title)
    .replace(/\{\{theme_primary_color\}\}/gi, data.themePrimaryColor || '#D4AF37')
    .replace(/\{\{theme_bg_color\}\}/gi, data.themeBgColor || '#0A0D17')
    .replace(/\{\{qr_code\}\}/gi, qrHtml);
}
