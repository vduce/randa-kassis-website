const fs = require('fs');
const path = require('path');

function createMarkdownFiles() {
  const folderPath = path.join(__dirname, "public", "interviews", "politicians");
  console.log(`Creating files in: ${folderPath}`);
  
  // Ensure the folder exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  for (let i = 1; i <= 2; i++) {
    const fileName = `politicians${i}.md`;
    const filePath = path.join(folderPath, fileName);
    
    // Create the file if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '', 'utf8');
      console.log(`Created: ${fileName}`);
    }
  }
}

createMarkdownFiles();