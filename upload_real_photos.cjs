const fs = require('fs');
const path = require('path');
const https = require('https');

const cloudName = 'dtbgjhtm';
const uploadPreset = 'traveltales_upload';

const photosToUpload = [
  { id: 'prem-mandir', file: 'prem mandir.jpg', name: 'Prem Mandir' },
  { id: 'banke-bihari', file: 'banke bihari.jpg', name: 'Shri Banke Bihari' },
  { id: 'krishna-janmabhoomi', file: 'janam bhumi.jpg', name: 'Shri Krishna Janmabhoomi' },
  { id: 'iskcon-vrindavan', file: 'isckon.webp', name: 'ISKCON Vrindavan' },
  { id: 'nidhivan', file: 'nidhivan.jpg', name: 'Nidhivan' },
  { id: 'dwarkadhish-temple', file: 'dwarkadhish.jpg', name: 'Dwarkadhish Temple' },
  { id: 'vishram-ghat', file: 'vishram ghat.jpg', name: 'Vishram Ghat' },
  { id: 'agra-fort', file: 'red fort.jpg', name: 'Agra Fort' },
  { id: 'fatehpur-sikri', file: 'fatehpur sikri.jpg', name: 'Fatehpur Sikri' },
  { id: 'mehtab-bagh', file: 'mehtab bagh.jpg', name: 'Mehtab Bagh' }
];

function uploadSingle(item) {
  return new Promise((resolve, reject) => {
    const filePath = path.resolve(item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${item.file}`);
      return resolve({ ...item, url: null });
    }

    const fileData = fs.readFileSync(filePath);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const ext = path.extname(item.file).toLowerCase();
    const contentType = ext === '.webp' ? 'image/webp' : (ext === '.png' ? 'image/png' : 'image/jpeg');

    const header = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="upload_preset"',
      '',
      uploadPreset,
      `--${boundary}`,
      'Content-Disposition: form-data; name="folder"',
      '',
      'traveltales_attractions',
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="${path.basename(item.file)}"`,
      `Content-Type: ${contentType}`,
      '',
      ''
    ].join('\r\n');

    const payloadHeader = Buffer.from(header, 'utf-8');
    const payloadFooter = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const payload = Buffer.concat([payloadHeader, fileData, payloadFooter]);

    const req = https.request({
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloudName}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      }
    }, (res) => {
      let respData = '';
      res.on('data', chunk => respData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(respData);
          if (json.secure_url) {
            console.log(`✅ Uploaded ${item.name} -> ${json.secure_url}`);
            resolve({ ...item, url: json.secure_url, publicId: json.public_id });
          } else {
            console.error(`❌ Upload failed for ${item.name}:`, json.error);
            resolve({ ...item, url: null, error: json.error });
          }
        } catch (e) {
          console.error(`Parse error for ${item.name}:`, e);
          resolve({ ...item, url: null });
        }
      });
    });

    req.on('error', (err) => {
      console.error(`Request error for ${item.name}:`, err.message);
      resolve({ ...item, url: null, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('🚀 Starting Cloudinary upload for real attraction photos...');
  const results = [];
  for (const item of photosToUpload) {
    const res = await uploadSingle(item);
    results.push(res);
  }
  fs.writeFileSync('./uploaded_attractions.json', JSON.stringify(results, null, 2));
  console.log('🎉 Done! Results saved to uploaded_attractions.json');
}

main();
