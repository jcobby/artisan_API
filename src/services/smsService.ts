export async function sendSms(phone: string, message: string): Promise<void> {
    // TODO: Integrate with real SMS provider (e.g., Twilio, Africa's Talking, etc.)
    // For now, we just log so you can see OTPs during development.
    console.log(`Sending SMS to ${phone}: ${message}`);
}

