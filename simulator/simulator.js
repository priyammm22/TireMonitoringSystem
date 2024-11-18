const fs = require('fs');  
const axios = require('axios');  

const API_URL = 'http://localhost:3000/tire/rawdata';  
const DATA_FILE = './sensorData.json';  

fs.readFile(DATA_FILE, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading data file:', err);
    return;
  }

  
  const tireDataArray = JSON.parse(data);

  let index = 0;
  const totalObjects = tireDataArray.length;


  const sendData = () => {
    if (index < totalObjects) {
      const tireData = tireDataArray[index];
      
      axios.put(API_URL, tireData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        console.log(`Sent object #${index + 1}:`, tireData);
        index++;
      })
      .catch(error => {
        console.error('Error sending data:', error);
      });
    } else {
      console.log('All data objects have been sent.');
      clearInterval(interval);  
    }
  };

  
  const interval = setInterval(sendData, 5000);  

 
  setTimeout(() => {
    clearInterval(interval);
    console.log('Simulator stopped after 5 minutes.');
  }, 300000);  
});
