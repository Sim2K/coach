import { QueueItem, EmailMessage, EmailStatus, EmailPriority, EmailOptions } from '../types';
import { EMAIL_CONSTANTS } from '../constants';

class EmailQueue {
  private static instance: EmailQueue;
  private queue: Map<string, QueueItem>;
  private processing: boolean;

  private constructor() {
    this.queue = new Map();
    this.processing = false;
  }

  public static getInstance(): EmailQueue {
    if (!EmailQueue.instance) {
      EmailQueue.instance = new EmailQueue();
    }
    return EmailQueue.instance;
  }

  public async addToQueue(
    message: EmailMessage,
    options?: EmailOptions
  ): Promise<string> {
    const id = generateQueueId();
    const queueItem: QueueItem = {
      id,
      message,
      status: 'pending',
      priority: options?.priority || 'normal',
      attempts: 0,
      createdAt: new Date(),
      scheduledFor: options?.scheduled,
    };
    this.queue.set(id, queueItem);
    
    if (!this.processing) {
      this.processQueue();
    }

    return id;
  }

  public getQueueItem(id: string): QueueItem | undefined {
    return this.queue.get(id);
  }

  public updateQueueItem(id: string, updates: Partial<QueueItem>): boolean {
    const item = this.queue.get(id);
    if (!item) return false;

    this.queue.set(id, { ...item, ...updates });
    return true;
  }

  public removeFromQueue(id: string): boolean {
    return this.queue.delete(id);
  }

  public getQueueStatus(): {
    total: number;
    pending: number;
    processing: number;
    sent: number;
    failed: number;
  } {
    let pending = 0, processing = 0, sent = 0, failed = 0;

    this.queue.forEach(item => {
      switch (item.status) {
        case 'pending': pending++; break;
        case 'processing': processing++; break;
        case 'sent': sent++; break;
        case 'failed': failed++; break;
      }
    });

    return {
      total: this.queue.size,
      pending,
      processing,
      sent,
      failed,
    };
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;

    this.processing = true;
    while (this.queue.size > 0) {
      const nextBatch = this.getNextBatch();
      if (nextBatch.length === 0) break;

      await Promise.all(
        nextBatch.map(async (item) => {
          try {
            // This will be implemented in email-service.ts
            // await sendEmail(item.message);
            this.updateQueueItem(item.id, { status: 'sent' });
          } catch (error) {
            const newAttempts = item.attempts + 1;
            const status: EmailStatus = 
              newAttempts >= EMAIL_CONSTANTS.LIMITS.RETRY_ATTEMPTS 
                ? 'failed' 
                : 'pending';

            this.updateQueueItem(item.id, {
              status,
              attempts: newAttempts,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        })
      );

      // Rate limiting
      await new Promise(resolve => 
        setTimeout(resolve, 1000 / EMAIL_CONSTANTS.LIMITS.RATE_LIMIT * nextBatch.length)
      );
    }
    this.processing = false;
  }

  private getNextBatch(): QueueItem[] {
    const now = new Date();
    const batch: QueueItem[] = [];
    const priorities: EmailPriority[] = ['high', 'normal', 'low'];

    for (const priority of priorities) {
      const queueItems = Array.from(this.queue.values());
      for (const item of queueItems) {
        if (
          batch.length >= EMAIL_CONSTANTS.LIMITS.BATCH_SIZE ||
          item.status !== 'pending' ||
          item.priority !== priority ||
          (item.scheduledFor && item.scheduledFor > now)
        ) {
          continue;
        }
        batch.push(item);
      }
      if (batch.length >= EMAIL_CONSTANTS.LIMITS.BATCH_SIZE) break;
    }

    return batch;
  }
}

const generateQueueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const emailQueue = EmailQueue.getInstance();
