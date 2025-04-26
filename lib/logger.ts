type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMessage {
  message: string;
  data?: any;
  timestamp: string;
  level: LogLevel;
}

class Logger {
  private formatMessage(
    level: LogLevel,
    message: string,
    data?: any
  ): LogMessage {
    return {
      message,
      data,
      timestamp: new Date().toISOString(),
      level,
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const logMessage = this.formatMessage(level, message, data);

    switch (level) {
      case "error":
        console.error(logMessage);
        break;
      case "warn":
        console.warn(logMessage);
        break;
      case "info":
        console.info(logMessage);
        break;
      case "debug":
        console.debug(logMessage);
        break;
    }
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, data?: any) {
    this.log("error", message, data);
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data);
  }
}

export const logger = new Logger();
