'use client';

import { useState } from 'react';
import { welcomeFreeTemplate, welcomePremiumTemplate } from '@/lib/email/templates';

const templates = {
  'welcome-free': {
    name: 'Welcome (Free)',
    render: () => welcomeFreeTemplate({ upgradeLink: process.env.NEXT_PUBLIC_STRIPE_LINK }),
    parameters: {
      upgradeLink: process.env.NEXT_PUBLIC_STRIPE_LINK
    }
  },
  'welcome-premium': {
    name: 'Welcome (Premium)',
    render: welcomePremiumTemplate,
    parameters: {}
  }
} as const;

type TemplateKey = keyof typeof templates;

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('welcome-free');
  const [showRawHtml, setShowRawHtml] = useState(false);

  const renderedTemplate = templates[selectedTemplate].render();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Template Preview</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Preview and test email templates in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Template Controls</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as TemplateKey)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                >
                  {Object.entries(templates).map(([key, { name }]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showRawHtml}
                    onChange={(e) => setShowRawHtml(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show Raw HTML</span>
                </label>
              </div>

              {/* Template Parameters */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Parameters</h3>
                <div className="space-y-2">
                  {Object.entries(templates[selectedTemplate].parameters).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium">{key}:</span> {value?.toString()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {/* Email Preview Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Email Content */}
              <div className="p-6">
                {showRawHtml ? (
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                    {renderedTemplate}
                  </pre>
                ) : (
                  <div 
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderedTemplate }} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 