const fs = require('fs/promises');
const path = require('path');

const logDirectory = path.join(__dirname, '../../logs');
const logFile = path.join(logDirectory, 'audit.log');

async function writeAuditLog(event) {
  try {
    await fs.mkdir(logDirectory, { recursive: true });

    const record = {
        timestamp: new Date().toISOString(),
        ...event, };

    await fs.appendFile(logFile, `${JSON.stringify(record)}\n`, 'utf8'); }
    catch (error) {
        console.error('Audit log write failed:', error.message); } }

module.exports = { writeAuditLog };