/**
 * Copy JSON files from src/api to server's metadata folder
 * Run this once to set up the metadata folder
 */

const fs = require('fs');
const path = require('path');

const JSON_FILES = [
  'articles.json',
  'encounterAndDialogue.json',
  'politicians.json',
  'essayistandcritics.json'
];

function copyJsonFiles() {
  console.log('📋 Copying JSON files to metadata folder...\n');
  
  // Create metadata folder if it doesn't exist
  const metadataDir = path.join(__dirname, '..', 'metadata');
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
    console.log('✅ Created metadata folder\n');
  }
  
  let successCount = 0;
  let failCount = 0;
  
  JSON_FILES.forEach(filename => {
    try {
      const sourcePath = path.join(__dirname, '..', 'src', 'api', filename);
      const destPath = path.join(metadataDir, filename);
      
      console.log(`📄 Copying ${filename}...`);
      
      if (!fs.existsSync(sourcePath)) {
        console.log(`   ⚠️  Source file not found: ${sourcePath}`);
        failCount++;
        return;
      }
      
      const content = fs.readFileSync(sourcePath, 'utf8');
      fs.writeFileSync(destPath, content, 'utf8');
      
      const stats = fs.statSync(destPath);
      console.log(`   ✅ Copied (${stats.size} bytes)`);
      console.log(`   📍 Location: ${destPath}\n`);
      
      successCount++;
    } catch (error) {
      console.error(`   ❌ Error copying ${filename}:`, error.message, '\n');
      failCount++;
    }
  });
  
  console.log('📊 Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Total: ${JSON_FILES.length}`);
  
  if (successCount > 0) {
    console.log('\n🎉 JSON files are now in the metadata folder!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your server: node server.js');
    console.log('   2. Test: http://localhost:8000/metadata/articles.json');
    console.log('   3. Deploy the metadata folder to your hosting');
  }
}

copyJsonFiles();
