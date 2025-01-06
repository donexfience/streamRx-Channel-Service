export class Logger {
    public error(message: string): void {
      console.error(`[ERROR]:${message}`);
    }
    public info(message: string): void {
      console.log(`[INFRO] ${message}`);
    }
  }