const fs = require('fs-extra');
const https = require('https');
const { exec } = require('child_process');
const path = require('path');

const PROTOC_VERSION = '28.2';
const PROTOC_URL = `https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-linux-x86_64.zip`;
const DOWNLOAD_PATH = path.join(__dirname, 'vendor', 'protoc');

async function downloadProtoc() {
  await fs.ensureDir(DOWNLOAD_PATH);

  console.log('Downloading protoc...');
  const downloadFile = path.join(DOWNLOAD_PATH, 'protoc.zip');
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(downloadFile);
    
    https.get(PROTOC_URL, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        
        // Unzip the file
        exec(`unzip -o ${downloadFile} -d ${DOWNLOAD_PATH}`, (error) => {
          if (error) {
            console.error('Unzip error:', error);
            reject(error);
          } else {
            console.log('Protoc downloaded and extracted');
            resolve();
          }
        });
      });
    }).on('error', (err) => {
      fs.unlink(downloadFile);
      reject(err);
    });
  });
}

downloadProtoc().catch(console.error);