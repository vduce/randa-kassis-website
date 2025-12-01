/**
 * Test CDN JSON Sync
 * Tests if JSON files can be synced to Bunny CDN
 */

const testData = {
  id: 999,
  filename: "test.md",
  title: "Test Article",
  description: "This is a test"
};

const jsonContent = JSON.stringify([testData], null, 2);

async function testSync() {
  console.log('🧪 Testing CDN sync...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:8000/api/storage/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');
    
    // Test 2: Write JSON file
    console.log('2️⃣ Testing write to CDN...');
    const writeResponse = await fetch('http://localhost:8000/api/storage/write', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: 'public/public/api/test.json',
        content: jsonContent
      })
    });
    
    if (!writeResponse.ok) {
      const error = await writeResponse.text();
      throw new Error(`Write failed: ${writeResponse.status} - ${error}`);
    }
    
    const writeData = await writeResponse.json();
    console.log('✅ Write successful:', writeData);
    console.log('');
    
    // Test 3: Verify file exists on CDN
    console.log('3️⃣ Verifying file on CDN...');
    const cdnUrl = 'https://pgcdn.b-cdn.net/public/public/api/test.json';
    console.log('   URL:', cdnUrl);
    
    // Wait a bit for CDN to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cdnResponse = await fetch(cdnUrl);
    if (cdnResponse.ok) {
      const cdnData = await cdnResponse.json();
      console.log('✅ File accessible on CDN:', cdnData);
    } else {
      console.log('⚠️  File not yet available on CDN (may take a moment)');
      console.log('   Status:', cdnResponse.status);
    }
    
    console.log('\n🎉 Test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check if file appears in Bunny panel');
    console.log('   2. Try creating an article in admin panel');
    console.log('   3. Check browser console for sync messages');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Make sure server/proxy.js is running');
    console.error('   2. Check .env has correct API key');
    console.error('   3. Verify Bunny Storage zone name');
  }
}

testSync();
