// Quick script to get your current public IP address
// Run with: node get-my-ip.js

const https = require('https');

https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const result = JSON.parse(data);
    console.log('\n========================================');
    console.log('Your current public IP address is:');
    console.log(result.ip);
    console.log('========================================');
    console.log('\nAdd this IP to MongoDB Atlas Network Access:');
    console.log('https://cloud.mongodb.com/ → Your Cluster → Network Access → Add IP Address\n');
  });
}).on('error', (err) => {
  console.error('Error fetching IP:', err.message);
  console.log('\nYou can also visit: https://whatismyipaddress.com/');
});







