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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 16px;
      overflow: hidden;
    }

    /* Header styles */
    .header {
      background: linear-gradient(to right, #4f46e5, #7c3aed);
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
      color: #1f2937;
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 20px;
    }

    .content p {
      margin: 0 0 24px;
      color: #4b5563;
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
      background: linear-gradient(to right, #4f46e5, #7c3aed);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
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

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body { background-color: #1e1e1e; }
      .wrapper { background-color: #1e1e1e; }
      .main { color: #f3f4f6; }
      .content { background-color: #1e293b; }
      .content h1 { color: #f3f4f6; }
      .content p { color: #e2e8f0; }
      .content li { color: #e2e8f0; }
      .footer { background-color: #1e1e1e; color: #94a3b8; }
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
          <p>♥️ from Indianapolis</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`; 