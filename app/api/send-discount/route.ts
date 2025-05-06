// app/api/send-discount/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '@/emails/DiscountEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, recaptchaToken } = await request.json();
    
    if (!email || !recaptchaToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Verify reCAPTCHA with timeout
    const recaptchaResponse = await Promise.race([
      fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        { method: 'POST' }
      ),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('reCAPTCHA verification timeout')), 5000)
      )
    ]);
    
    // Type assertion for the response
    const recaptchaData = await (recaptchaResponse as Response).json();
    
    if (!recaptchaData.success) {
      console.error('reCAPTCHA failed:', recaptchaData);
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA verification failed' }, 
        { status: 400 }
      );
    }

    // Generate discount code
    const discountCode = `WELCOME10`;

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: 'Noir Clothing <offers@noir-clothing.com>', // Update with your actual domain
      to: email,
      subject: 'Your 10% Discount Code',
      react: EmailTemplate({ discountCode }),
    });

    if (emailResponse.error) {
      throw new Error(`Email sending failed: ${emailResponse.error.message}`);
    }

    return NextResponse.json({ success: true, message: 'Discount code sent' });
  } catch (error) {
    console.error('Error in discount API:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }, 
      { status: 500 }
    );
  }
}