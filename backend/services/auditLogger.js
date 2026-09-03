const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'security.log');

const ensureLogDirectory = () => {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};

const logSecurityEvent = (eventName, payload = {}) => {
  ensureLogDirectory();

  const entry = {
    timestamp: new Date().toISOString(),
    event: eventName,
    payload
  };

  fs.appendFileSync(logFile, `${JSON.stringify(entry)}\n`, 'utf8');
};

module.exports = {
  logSecurityEvent,
  auditLog: logSecurityEvent
};
