import WebApp from '@twa-dev/sdk';
import { TelegramUser, TelegramBalance } from '@/types/telegramTypes';

class TelegramService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      WebApp.ready();
      WebApp.expand();
      this.initialized = true;
      console.log('Telegram WebApp initialized');
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
      throw error;
    }
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!WebApp.initData;
  }

  getCurrentUser(): TelegramUser | null {
    if (!this.isAvailable() || !WebApp.initDataUnsafe.user) {
      return null;
    }

    const user = WebApp.initDataUnsafe.user;
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      is_premium: user.is_premium
    };
  }

  async authenticate(): Promise<TelegramUser | null> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      throw new Error('Telegram WebApp is not available');
    }

    return this.getCurrentUser();
  }

  async getStarsBalance(userId: number): Promise<TelegramBalance> {
    // In a real implementation, this would call your backend
    // For demo purposes, return a mock balance
    return { stars: 1000 };
  }

  async purchaseStars(amount: number): Promise<boolean> {
    try {
      // Use Telegram's invoice system to purchase stars
      WebApp.openInvoice('https://t.me/$${amount}stars', (status) => {
        if (status === 'paid') {
          console.log(`Successfully purchased ${amount} stars`);
          return true;
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to purchase stars:', error);
      return false;
    }
  }

  async spendStars(amount: number, description: string): Promise<boolean> {
    try {
      // In a real implementation, this would call your backend to deduct stars
      console.log(`Spending ${amount} stars for: ${description}`);
      return true;
    } catch (error) {
      console.error('Failed to spend stars:', error);
      return false;
    }
  }

  showAlert(message: string): void {
    WebApp.showAlert(message);
  }

  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      WebApp.showConfirm(message, resolve);
    });
  }

  close(): void {
    WebApp.close();
  }

  setHeaderColor(color: `#${string}` | 'bg_color' | 'secondary_bg_color'): void {
    WebApp.setHeaderColor(color);
  }

  setBackgroundColor(color: `#${string}` | 'bg_color' | 'secondary_bg_color'): void {
    WebApp.setBackgroundColor(color);
  }
}

export const telegramService = new TelegramService();