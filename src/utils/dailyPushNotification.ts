export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM"
  lastNotificationDate?: string; // ISO date string
}

/**
 * DailyPushNotification Logic Block
 * Handles checking and triggering daily practice notifications
 */
export class DailyPushNotification {
  private static instance: DailyPushNotification;
  private settings: NotificationSettings;
  private checkInterval?: NodeJS.Timeout;

  private constructor() {
    this.settings = this.loadSettings();
    this.requestPermissionIfNeeded();
  }

  public static getInstance(): DailyPushNotification {
    if (!DailyPushNotification.instance) {
      DailyPushNotification.instance = new DailyPushNotification();
    }
    return DailyPushNotification.instance;
  }

  private loadSettings(): NotificationSettings {
    try {
      const stored = localStorage.getItem('notification-settings');
      return stored ? JSON.parse(stored) : { enabled: false, time: '09:00' };
    } catch {
      return { enabled: false, time: '09:00' };
    }
  }

  private saveSettings(): void {
    localStorage.setItem('notification-settings', JSON.stringify(this.settings));
  }

  public updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    if (this.settings.enabled) {
      this.startChecking();
    } else {
      this.stopChecking();
    }
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  private async requestPermissionIfNeeded(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    return new Promise((resolve) => {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log("Notifications allowed");
          localStorage.setItem("notificationsEnabled", "true");
          resolve(true);
        } else {
          console.log("Notifications denied");
          localStorage.setItem("notificationsEnabled", "false");
          resolve(false);
        }
      });
    });
  }

  public async enableNotifications(): Promise<boolean> {
    const hasPermission = await this.requestPermissionIfNeeded();
    
    if (hasPermission) {
      this.updateSettings({ enabled: true });
      return true;
    } else {
      this.updateSettings({ enabled: false });
      return false;
    }
  }

  private shouldShowNotification(): boolean {
    if (!this.settings.enabled) return false;
    if (Notification.permission !== 'granted') return false;

    const now = new Date();
    const [targetHours, targetMinutes] = this.settings.time.split(':').map(Number);
    
    // Check if current time matches target time (within 1 minute window)
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const isTimeMatch = currentHours === targetHours && currentMinutes === targetMinutes;
    
    if (!isTimeMatch) return false;

    // Check if we already sent notification today
    const today = now.toDateString();
    if (this.settings.lastNotificationDate === today) {
      return false;
    }

    return true;
  }

  private showNotification(): void {
    if (!this.shouldShowNotification()) return;

    if (Notification.permission === "granted") {
      const notification = new Notification("Time to Practice!", {
        body: "Tap to translate 3 English words into Armenian.",
        icon: "/icons/icon-192x192.png"
      });

      notification.onclick = () => {
        window.focus();
        // Navigate to practice page with notification parameter
        const url = new URL(window.location.href);
        url.searchParams.set('notification', 'true');
        url.hash = '#practice';
        window.location.href = url.toString();
        notification.close();
      };
    }

    // Mark that we sent notification today
    const today = new Date().toDateString();
    this.updateSettings({ lastNotificationDate: today });
  }

  public checkAndNotify(): void {
    this.showNotification();
  }

  public startChecking(): void {
    this.stopChecking();
    
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkAndNotify();
    }, 60000); // 60 seconds

    // Also check immediately
    this.checkAndNotify();
  }

  public stopChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  public initialize(): void {
    if (this.settings.enabled) {
      this.startChecking();
    }
  }

  public destroy(): void {
    this.stopChecking();
  }
}

// Export singleton instance
export const dailyPushNotification = DailyPushNotification.getInstance();