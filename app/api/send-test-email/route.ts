import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/email-service';
import { EMAIL_CONSTANTS } from '@/lib/email/constants';

export async function POST(req: NextRequest) {
  try {
    console.log('Starting email send process...');
    const formData = await req.formData();
    
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const html = formData.get('html') as string;
    const attachments = formData.getAll('attachments') as File[];

    console.log('Email details:', {
      to,
      subject,
      attachmentsCount: attachments.length
    });

    // Convert Files to attachment format
    const emailAttachments = await Promise.all(
      attachments.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
        contentType: file.type,
        size: file.size
      }))
    );

    console.log('Attempting to send email...');
    const result = await sendEmail({
      to,
      from: EMAIL_CONSTANTS.EMAIL.FROM,
      subject,
      html,
      attachments: emailAttachments
    });

    console.log('Send email result:', result);

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Email send error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to send email',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
