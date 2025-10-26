import twilio from 'twilio';
import { config } from '../config/env';
import logger from '../utils/logger';

class SMSService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
  }

  /**
   * Send SMS to a phone number
   */
  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      // Ensure phone number is in E.164 format
      const formattedPhone = this.formatPhoneNumber(to);

      const result = await this.client.messages.create({
        body: message,
        from: config.twilio.phoneNumber,
        to: formattedPhone,
      });

      logger.info(`SMS sent to ${formattedPhone}: ${result.sid}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to send SMS: ${error.message}`);
      return false;
    }
  }

  /**
   * Format phone number to E.164 format
   * Assumes Botswana numbers if no country code
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // If number starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // If no country code, add Botswana code (+267)
    if (!cleaned.startsWith('267') && cleaned.length <= 8) {
      cleaned = '267' + cleaned;
    }

    // Add + prefix
    return '+' + cleaned;
  }

  /**
   * Send order confirmation SMS
   */
  async sendOrderConfirmation(phone: string, orderNumber: string, estimatedTime: string): Promise<boolean> {
    const message = `Order ${orderNumber} confirmed! Your package will be picked up soon. Estimated delivery: ${estimatedTime}. Track at: [Your Domain]`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send driver assigned notification
   */
  async sendDriverAssigned(phone: string, orderNumber: string, driverName: string): Promise<boolean> {
    const message = `Driver ${driverName} has been assigned to your order ${orderNumber}. You'll receive updates as your package moves.`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send pickup notification
   */
  async sendPickupNotification(phone: string, orderNumber: string): Promise<boolean> {
    const message = `Your package (${orderNumber}) has been picked up and is on its way to you!`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send delivery completion notification
   */
  async sendDeliveryCompleted(phone: string, orderNumber: string): Promise<boolean> {
    const message = `Your order ${orderNumber} has been delivered! Thank you for using our service.`;
    return this.sendSMS(phone, message);
  }

  /**
   * Send new order to driver
   */
  async sendNewOrderToDriver(phone: string, orderNumber: string, pickupAddress: string): Promise<boolean> {
    const message = `New delivery! Order ${orderNumber}. Pickup: ${pickupAddress}. Open app to accept.`;
    return this.sendSMS(phone, message);
  }
}

export default new SMSService();
