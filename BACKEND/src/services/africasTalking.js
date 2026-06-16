const db = require('../config/db');

class AfricaSTalkingService {
  constructor() {
    this.username = process.env.AT_USERNAME || 'sandbox';
    this.apiKey = process.env.AT_API_KEY || '';
    this.useSandbox = process.env.AT_SANDBOX !== 'false';
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    if (!this.apiKey) {
      console.warn('AT_API_KEY not set. SMS/USSD will use simulation mode.');
      return;
    }

    try {
      const africastalking = require('africastalking');
      this.client = africastalking({
        username: this.username,
        apiKey: this.apiKey,
      });
      this.initialized = true;
    } catch (e) {
      console.warn('Africa\'s Talking init failed, using simulation:', e.message);
    }
  }

  async sendSMS(to, message) {
    await this.init();

    if (!this.initialized) {
      console.log(`[SMS SIM] To: ${to}, Message: ${message}`);
      await db.query(
        'INSERT INTO sms_log (phone_number, message, direction, status) VALUES (?, ?, ?, ?)',
        [to, message, 'outbound', 'simulated']
      );
      return { success: true, simulated: true };
    }

    try {
      const result = await this.client.SMS.send({ to: [to], message });
      await db.query(
        'INSERT INTO sms_log (phone_number, message, direction, status) VALUES (?, ?, ?, ?)',
        [to, message, 'outbound', result.SMSMessageData?.Recipients?.[0]?.status || 'sent']
      );
      return { success: true, result };
    } catch (e) {
      console.error('SMS send error:', e);
      return { success: false, error: e.message };
    }
  }

  async sendAirtime(phoneNumber, amount) {
    await this.init();

    if (!this.initialized) {
      console.log(`[AIRTIME SIM] To: ${phoneNumber}, Amount: ${amount}`);
      return { success: true, simulated: true };
    }

    try {
      const result = await this.client.AIRTIME.send({
        recipients: [{ phoneNumber, amount, currencyCode: 'UGX' }],
      });
      return { success: true, result };
    } catch (e) {
      console.error('Airtime send error:', e);
      return { success: false, error: e.message };
    }
  }

  parseUssdBody(body) {
    return {
      sessionId: body.sessionId,
      serviceCode: body.serviceCode,
      phoneNumber: body.phoneNumber,
      text: body.text,
    };
  }

  formatUssdResponse(text, type = 'CON') {
    return `${type} ${text}`;
  }

  getUssdCallbackUrl(baseUrl) {
    return `${baseUrl}/ussd`;
  }
}

module.exports = new AfricaSTalkingService();
