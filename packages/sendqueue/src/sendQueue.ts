export type Send = () => any;

export default class SendQueue {
  private throttleMs = 1000;
  private timeout: any = null;
  private lastShift: number | null = null;

  private readonly sends: Send[] = [];

  push(send: Send) {
    this.sends.push(send);
    if (this.timeout === null) {
      const wait = Math.max(0, (this.throttleMs - (Date.now() - (this.lastShift || 0))));
      this.timeout = setTimeout(this.fire.bind(this), wait);
    }
  }

  purge() {
    this.sends.splice(0);
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  throttle(ms: number) {
    this.throttleMs = ms;
  }

  private async fire() {
    const send = this.sends.shift();
    this.lastShift = Date.now();
    try {
      send && await send();
    }
    catch (e) {
      console.log(e);
    }
    finally {
      this.timeout = this.sends.length === 0 ? null
        : setTimeout(this.fire.bind(this), this.throttleMs);
    }
  }
}

export class MultiSendQueue {
  private readonly queues: { [key: string]: SendQueue } = {};

  push(key: string, send: Send) {
    this.getQueue(key).push(send);
  }

  purge(key: string) {
    this.getQueue(key).purge();
  }

  throttle(key: string, ms: number) {
    this.getQueue(key).throttle(ms);
  }

  private getQueue(key: string) {
    if (!this.queues[key]) {
      this.queues[key] = new SendQueue();
    }
    return this.queues[key];
  }
}