const axios = require('axios');
const cron = require('node-cron');

// Run every minute
cron.schedule('* * * * *', () => {
  axios.get('https://momemtum-server.onrender.com/api/health')
    .then(() => console.log('Pinged successfully'))
    .catch((err) => console.error('Error pinging:', err));
});