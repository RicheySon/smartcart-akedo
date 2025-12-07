const logLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLogLevel = process.env.LOG_LEVEL 
  ? logLevels[process.env.LOG_LEVEL.toUpperCase()] ?? logLevels.INFO
  : process.env.NODE_ENV === 'production' ? logLevels.INFO : logLevels.DEBUG;

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, ...args) => {
  const timestamp = getTimestamp();
  const additionalInfo = args.length > 0 ? ' ' + args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ') : '';
  return `[${timestamp}] [${level}] ${message}${additionalInfo}`;
};

const logger = {
  debug: (message, ...args) => {
    if (currentLogLevel <= logLevels.DEBUG) {
      console.log(formatMessage('DEBUG', message, ...args));
    }
  },

  info: (message, ...args) => {
    if (currentLogLevel <= logLevels.INFO) {
      console.log(formatMessage('INFO', message, ...args));
    }
  },

  warn: (message, ...args) => {
    if (currentLogLevel <= logLevels.WARN) {
      console.warn(formatMessage('WARN', message, ...args));
    }
  },

  error: (message, ...args) => {
    if (currentLogLevel <= logLevels.ERROR) {
      console.error(formatMessage('ERROR', message, ...args));
    }
  },
};

module.exports = logger;

