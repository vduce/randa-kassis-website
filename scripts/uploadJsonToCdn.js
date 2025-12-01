/**
 * Upload JSON Files to Bunny CDN
 * Run this script to upload all JSON files to CDN
 * 
 * Usage: node scripts/uploadJsonToCdn.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BUNNY_STORAGE_API = 'https://storage.bunnycdn.com';
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'parallelglobe';
const ACCESS_KEY = "f99e071e-13ac-4361-80be7320e5ef-db67-4a3e"

// JSON files to upload
const JSON_FILES = [
  { local: 'src/api/articles.json', cdn: 'public/public/api/articles.json' },
  { local: 'src/api/encounterAndDialogue.json', cdn: 'public/public/api/encounterAndDialogue.json' },
  { local: 'src/api/politicians.json', cdn: 'public/public/api/politicians.json' },
  { local: 'src/api/essayistandcritics.json', cdn: 'public/public/api/essayistandcritics.json' }
];

async function uploadFile(localPath, cdnPath) {
  try {
    console.log(`📤 Uploading ${localPath} → ${cdnPath}...`);
    
    // Read file content
    const content = fs.readFileSync(localPath, 'utf8');
    
    // Validate JSON
    JSON.parse(content);
    
    // Upload to Bunny CDN
    const url = `${BUNNY_STORAGE_API}/${STORAGE_ZONE}/${cdnPath}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': ACCESS_KEY,
        'Content-Type': 'application/json'
      },
      body: content
    });
    
    if (response.ok) {
      console.log(`✅ Successfully uploaded ${localPath}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to upload ${localPath}: ${response.status} ${error}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error uploading ${localPath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting JSON upload to Bunny CDN...\n');
  
  if (!ACCESS_KEY) {
    console.error('❌ BUNNY_STORAGE_API_KEY not found in .env file');
    process.exit(1);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of JSON_FILES) {
    const success = await uploadFile(file.local, file.cdn);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log(''); // Empty line
  }
  
  console.log('📊 Upload Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Total: ${JSON_FILES.length}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All JSON files uploaded successfully!');
    console.log('\n🔗 Test URLs:');
    JSON_FILES.forEach(file => {
      const filename = path.basename(file.cdn);
      console.log(`   https://pgcdn.b-cdn.net/public/api/${filename}`);
    });
  }
}

main();
