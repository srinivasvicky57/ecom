const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !senderEmail) {
    const missing = [!apiKey && 'BREVO_API_KEY', !senderEmail && 'EMAIL_FROM'].filter(Boolean);
    const error = new Error(`Email service is not configured: missing ${missing.join(', ')}`);
    error.code = 'EMAIL_CONFIGURATION';
    throw error;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'MS Vastravarna', email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html
      }),
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      const hints = {
        unauthorized: 'Check the Brevo API key (not SMTP key)',
        invalid_parameter: 'Check verified sender email and recipient parameters',
        missing_parameter: 'Check sender and email parameters',
        permission_denied: 'Check transactional email permissions and sender verification',
        account_under_validation: 'Brevo account approval is pending',
        not_enough_credits: 'Check Brevo sending quota or credits'
      };
      const hint = Object.hasOwn(hints, details?.code) ? `: ${details.code}. ${hints[details.code]}` : '';
      const error = new Error(`Email provider rejected request (HTTP ${response.status})${hint}`);
      error.code = 'EMAIL_DELIVERY';
      throw error;
    }
  } catch (cause) {
    if (cause.code === 'EMAIL_DELIVERY') throw cause;
    const error = new Error(cause.name === 'TimeoutError'
      ? 'Email provider timed out after 15 seconds'
      : 'Email provider connection failed; check backend network access and Node.js version');
    error.code = 'EMAIL_DELIVERY';
    throw error;
  }
};

module.exports = { sendEmail };