'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

const defaultHtmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Welcome to AI Coach Pro</h1>
  
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
    Transform your personal and professional growth with AI Coach Pro - your intelligent companion for achieving meaningful goals and milestones.
  </p>

  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
    <h2 style="color: #1e40af; margin-bottom: 15px;">Key Features:</h2>
    <ul style="list-style-type: none; padding: 0;">
      <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
        ✨ Smart Goal Setting &amp; Tracking
      </li>
      <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
        📈 Progress Visualization
      </li>
      <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
        🤖 AI-Powered Insights
      </li>
      <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
        🎯 Milestone Management
      </li>
    </ul>
  </div>

  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
    Start your journey today and experience the power of intelligent goal coaching!
  </p>

  <div style="text-align: center; margin-top: 30px;">
    <a href="http://sim2k.sytes.net" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
      Get Started Now
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

  <p style="color: #6b7280; font-size: 14px; text-align: center;">
    &copy; 2025 AI Coach Pro. All rights reserved.
  </p>
</div>
`;

export default function EmailTestPage() {
  const [to, setTo] = useState('sim.2k.uk@gmail.com');
  const [subject, setSubject] = useState('Welcome to AI Coach Pro');
  const [htmlBody, setHtmlBody] = useState(defaultHtmlBody);
  const [files, setFiles] = useState<FileList | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSend = useCallback(async () => {
    setIsLoading(true);
    setFeedback('Sending email...');

    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', htmlBody);
      
      if (files) {
        Array.from(files).forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch('/api/send-test-email', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setFeedback('Email sent successfully!');
    } catch (error) {
      setFeedback(`Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [to, subject, htmlBody, files]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Email Test Page</h1>
      
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">To:</label>
            <Input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Enter recipient email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject:</label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">HTML Body:</label>
            <Textarea
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder="Enter HTML content"
              className="h-96 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Attachments:</label>
            <Input
              type="file"
              onChange={handleFileChange}
              multiple
              className="mb-2"
            />
            {files && (
              <div className="text-sm text-gray-600">
                Selected files: {Array.from(files).map(f => f.name).join(', ')}
              </div>
            )}
          </div>

          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </Card>

      {feedback && (
        <Card className="p-4 mt-4">
          <h2 className="text-lg font-semibold mb-2">Feedback:</h2>
          <div className="bg-gray-50 p-4 rounded">
            {feedback}
          </div>
        </Card>
      )}

      <Card className="p-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Preview:</h2>
        <div 
          className="bg-white p-4 rounded border"
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />
      </Card>
    </div>
  );
}
