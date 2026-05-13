export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const firstName = formData.get('firstName')?.trim() || '';
    const lastName  = formData.get('lastName')?.trim()  || '';
    const email     = formData.get('email')?.trim()     || '';
    const type      = formData.get('type')?.trim()      || 'General Enquiry';
    const message   = formData.get('message')?.trim()   || '';

    // Basic validation
    if (!firstName || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send via MailChannels (free on Cloudflare Pages — no API key needed)
    const emailPayload = {
      personalizations: [
        {
          to: [{ email: 'get@mth.com', name: 'MT Højgaard Maldives' }],
          reply_to: { email: email, name: `${firstName} ${lastName}` },
        },
      ],
      from: {
        email: 'hello@mth-mv.com', // ← replace with your verified sender domain
        name:  'MT Højgaard Maldives Website',
      },
      subject: `${type} — MT Højgaard Maldives`,
      content: [
        {
          type: 'text/plain',
          value: [
            `Name:         ${firstName} ${lastName}`,
            `Email:        ${email}`,
            `Enquiry Type: ${type}`,
            ``,
            `Message:`,
            message,
          ].join('\n'),
        },
        {
          type: 'text/html',
          value: `
            <table style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:560px">
              <tr><td style="padding:24px 0 8px"><strong style="font-size:18px">New Enquiry — MT Højgaard Maldives</strong></td></tr>
              <tr><td style="padding:4px 0"><strong>Name:</strong> ${firstName} ${lastName}</td></tr>
              <tr><td style="padding:4px 0"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:4px 0"><strong>Enquiry Type:</strong> ${type}</td></tr>
              <tr><td style="padding:16px 0 4px"><strong>Message:</strong></td></tr>
              <tr><td style="padding:8px 16px;background:#f5f5f5;border-left:3px solid #b8923a;white-space:pre-wrap">${message}</td></tr>
            </table>
          `,
        },
      ],
    };

    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('MailChannels error:', err);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send email.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Submit function error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
