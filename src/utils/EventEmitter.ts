import { EventHandler } from '../types';

/**
 * シンプルなイベントエミッター実装
 */
export class EventEmitter {
  private events: Map<string, EventHandler[]> = new Map();

  public on<T>(event: string, handler: EventHandler<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler as EventHandler);
  }

  public off<T>(event: string, handler: EventHandler<T>): void {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public emit<T>(event: string, data?: T): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error in event handler for '${event}':`, error);
        }
      });
    }
  }

  public removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  public listenerCount(event: string): number {
    const handlers = this.events.get(event);
    return handlers ? handlers.length : 0;
  }

  public eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}
