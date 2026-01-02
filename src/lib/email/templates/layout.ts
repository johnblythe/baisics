interface EmailLayoutProps {
  subject: string;
  preheader?: string;
  content: string;
  callToAction?: {
    text: string;
    url: string;
  };
}

const skipCTA = true;

export const createEmailLayout = ({
  subject,
  preheader = '',
  content,
  callToAction,
}: EmailLayoutProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <style>
    /* Reset styles */
    body { margin: 0; padding: 0; width: 100%; background-color: #f8fafc; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; }
    
    /* Base styles */
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
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

    /* Header styles */
    .header {
      background: linear-gradient(135deg, #0F172A, #1E293B);
      padding: 24px 30px;
      text-align: center;
    }
    
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      text-decoration: none;
      display: inline-block;
    }

    .tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin-top: 4px;
    }

    /* Content styles */
    .content {
      background-color: #ffffff;
      padding: 40px 30px;
      line-height: 1.6;
    }

    .content h1 {
      color: #0F172A;
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 20px;
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
      color: #4b5563;
    }

    /* Button styles */
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #FF6B6B;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }

    /* Footer styles */
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }

    @media screen and (max-width: 600px) {
      .wrapper { padding: 20px 10px; }
      .content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" role="presentation">
      <tr>
        <td class="header">
          <a href="https://baisics.app" class="logo">baisics</a>
          <div class="tagline">fitness for the rest of us</div>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${content}
          ${callToAction ? `
          <a href="${callToAction.url}" class="button">
            ${callToAction.text}
          </a>
          ` : ''}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>&copy; ${new Date().getFullYear()} baisics. All rights reserved.</p>
          <p>♥️ from Indy</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`; 