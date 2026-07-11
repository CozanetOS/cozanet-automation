import EventEmitter from 'eventemitter3';
import pino from 'pino';

const logger = pino({ name: 'EventTriggers' });

export class EventTriggers {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  on(event: string, handler: (...args: any[]) => void): void {
    logger.info({ event }, 'Registering event listener');
    this.emitter.on(event, handler);
  }

  trigger(event: string, payload: any): void {
    logger.info({ event, payload }, 'Triggering event');
    this.emitter.emit(event, payload);
  }

  removeAll(event: string): void {
    logger.info({ event }, 'Removing all event listeners');
    this.emitter.removeAllListeners(event);
  }
}
