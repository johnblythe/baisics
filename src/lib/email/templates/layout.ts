interface EmailLayoutProps {
  subject: string;
  preheader?: string;
  content: string;
  callToAction?: {
    text: string;
    url: string;
  };
  unsubscribeUrl?: string;
}

/**
 * v2a Design System Email Layout
 * Colors: White (#FFFFFF), Navy (#0F172A), Coral (#FF6B6B)
 * Fonts: Outfit (sans-serif), Space Mono (monospace)
 * Tone: Bold, confident, energetic
 */
export const createEmailLayout = ({
  subject,
  preheader = '',
  content,
  callToAction,
  unsubscribeUrl,
}: EmailLayoutProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    /* v2a Design Tokens */
    :root {
      --color-white: #FFFFFF;
      --color-navy: #0F172A;
      --color-navy-light: #1E293B;
      --color-coral: #FF6B6B;
      --color-coral-dark: #EF5350;
      --color-coral-light: #FFE5E5;
      --color-gray-50: #F8FAFC;
      --color-gray-100: #F1F5F9;
      --color-gray-400: #94A3B8;
      --color-gray-600: #475569;
    }

    /* Reset styles */
    body { margin: 0; padding: 0; width: 100%; background-color: #F8FAFC; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; }

    /* Base styles */
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F8FAFC;
      padding: 40px 20px;
    }

    .main {
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-spacing: 0;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0F172A;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 16px;
      overflow: hidden;
    }

    /* Header styles - Bold gradient with coral accent */
    .header {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      padding: 32px 30px;
      text-align: center;
      border-bottom: 4px solid #FF6B6B;
    }

    .logo {
      font-size: 36px;
      font-weight: 800;
      color: #FFFFFF;
      text-decoration: none;
      display: inline-block;
      letter-spacing: -0.5px;
    }

    .logo-accent {
      color: #FF6B6B;
    }

    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 500;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    /* Content styles */
    .content {
      background-color: #FFFFFF;
      padding: 40px 30px;
      line-height: 1.6;
    }

    .content h1 {
      color: #0F172A;
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 20px;
      line-height: 1.2;
    }

    .content h2 {
      color: #0F172A;
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 16px;
    }

    .content p {
      margin: 0 0 24px;
      color: #475569;
      font-size: 16px;
    }

    .content ul {
      margin: 0 0 24px;
      padding-left: 20px;
    }

    .content li {
      margin-bottom: 8px;
      color: #475569;
    }

    .content strong {
      color: #0F172A;
      font-weight: 600;
    }

    .content .highlight {
      color: #FF6B6B;
      font-weight: 600;
    }

    .content code, .content .mono {
      font-family: 'Space Mono', 'Courier New', monospace;
      background-color: #F8FAFC;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 14px;
    }

    /* Button styles - Coral with hover effect */
    .button {
      display: inline-block;
      padding: 16px 32px;
      background-color: #FF6B6B;
      color: #FFFFFF !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
      box-shadow: 0 4px 14px 0 rgba(255, 107, 107, 0.39);
    }

    .button:hover {
      background-color: #EF5350;
    }

    .button-secondary {
      display: inline-block;
      padding: 12px 24px;
      background-color: transparent;
      color: #FF6B6B !important;
      text-decoration: none;
      border: 2px solid #FF6B6B;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      margin: 16px 0;
    }

    /* Footer styles - Navy gradient with coral social icons */
    .footer {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      padding: 32px 24px;
      text-align: center;
      font-size: 14px;
    }

    .footer p {
      margin: 0 0 12px;
      color: rgba(255, 255, 255, 0.7);
    }

    .social-links {
      margin: 20px 0;
    }

    .social-link {
      display: inline-block;
      margin: 0 12px;
      padding: 8px 16px;
      color: #FF6B6B !important;
      text-decoration: none;
      font-weight: 600;
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: 20px;
      transition: all 0.2s ease;
    }

    .social-link:hover {
      background-color: rgba(255, 107, 107, 0.1);
      border-color: #FF6B6B;
    }

    .divider {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin: 20px 0;
    }

    .unsubscribe-link {
      color: rgba(255, 255, 255, 0.5) !important;
      text-decoration: underline;
      font-size: 12px;
    }

    .footer-brand {
      color: #FFFFFF;
      font-weight: 700;
      font-size: 18px;
      margin-bottom: 8px;
    }

    .footer-tagline {
      color: #FF6B6B;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }

    @media screen and (max-width: 600px) {
      .wrapper { padding: 20px 10px; }
      .content { padding: 30px 20px; }
      .header { padding: 24px 20px; }
      .logo { font-size: 28px; }
      .button { padding: 14px 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" role="presentation">
      <tr>
        <td class="header">
          <a href="https://baisics.app" class="logo">baisics<span class="logo-accent">.</span></a>
          <div class="tagline">Fitness for the rest of us</div>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${content}
          ${callToAction ? `
          <div style="text-align: center;">
            <a href="${callToAction.url}" class="button">
              ${callToAction.text}
            </a>
          </div>
          ` : ''}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <div class="footer-brand">baisics</div>
          <div class="footer-tagline">Your fitness journey starts here</div>
          <div class="social-links">
            <a href="https://twitter.com/baisicsapp" class="social-link">Twitter</a>
            <a href="https://instagram.com/baisicsapp" class="social-link">Instagram</a>
          </div>
          <div class="divider"></div>
          <p>&copy; ${new Date().getFullYear()} baisics. All rights reserved.</p>
          <p style="margin-bottom: 16px; color: rgba(255,255,255,0.6);">Made with ♥️ in Indy</p>
          ${unsubscribeUrl ? `
          <a href="${unsubscribeUrl}" class="unsubscribe-link">Unsubscribe from these emails</a>
          ` : ''}
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`; 