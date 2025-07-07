const fs = require('fs');
const path = require('path');

function createMarkdownFiles() {
  const folderPath = path.join(__dirname, "public", "throughMyEyes");
  console.log(`Creating files in: ${folderPath}`);
  
  // Ensure the folder exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  for (let i = 1; i <= 6; i++) {
    const fileName = `tme${i}.md`;
    const filePath = path.join(folderPath, fileName);
    
    // Create the file if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '', 'utf8');
      console.log(`Created: ${fileName}`);
    }
  }
}

createMarkdownFiles();

// const dirPath = path.join(__dirname, "public", "interviews", "politicians");
// const files = fs
//   .readdirSync(dirPath)
//   .filter((f) => f.endsWith(".md"))
//   .sort((a, b) => {
//     // Extract the numeric part of the filename
//     const numA = parseInt(a.match(/\d+/)[0], 10);
//     const numB = parseInt(b.match(/\d+/)[0], 10);
//     return numA - numB;
//   });

// const objects = files.map((filename, idx) => {
//   const filePath = path.join(dirPath, filename);
//   const content = fs.readFileSync(filePath, "utf-8");

//   // Extract title from <h4>...</h4>
//   const titleMatch = content.match(/<h4>(.*?)<\/h4>/);
//   const title = titleMatch ? titleMatch[1].trim() : "";

//   // Split lines after title
//   const afterTitle = content.split("</h4>")[1] || "";
//   const lines = afterTitle
//     .split("\n")
//     .map((l) => l.trim())
//     .filter(Boolean);

//   const publishedIn = lines[0] || "";
//   const publishedAt = lines[1] || "";

//   // Find first non-empty paragraph after publishedAt
//   const restContent = lines.slice(2).join(" ");
//   const paraMatch = restContent.match(/([^\n]+)/);
//   let description = paraMatch ? paraMatch[1].trim() : "";
//   if (description.length > 380) {
//     description = description.slice(0, 380) + "...";
//   }

//   return {
//     id: idx + 1,
//     filename,
//     title,
//     publishedIn,
//     publishedAt,
//     description,
//   };
// });

// fs.writeFileSync(
//   path.join(__dirname, "src", "api", "politicians.json"),
//   JSON.stringify(objects, null, 2)
// );