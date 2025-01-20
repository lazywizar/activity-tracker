const log = (area, message, data = '') => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${area.padEnd(12)} | ${message} ${data}`);
};

module.exports = { log };
