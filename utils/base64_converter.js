const fs = require("fs");
const path = require("path");

const attachmentsFolder = path.join(__dirname, "..", "attachments");
const csvPath = path.join(
  __dirname,
  "..",
  "db",
  "data",
  "at.clouddna-Attachment.csv"
);

// Create CSV content with headers
let csvContent =
  "ID,businessTrip_ID,fileName,description,mediaType,size,content,createdAt,createdBy,modifiedAt,modifiedBy\n";

// Read files from attachments folder
const files = fs.readdirSync(attachmentsFolder);

files.forEach((file) => {
  if (file === ".DS_Store") return;

  const filePath = path.join(attachmentsFolder, file);
  const content = fs.readFileSync(filePath);
  const base64 = content.toString("base64");
  const size = content.length;

  // Generate a UUID for the attachment
  const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );

  // Create CSV row with base64 content
  csvContent += `${id},\
662e8400-e29b-41d4-a716-446655440102,\
${file},\
${file} description,\
${
  file.endsWith(".png")
    ? "image/png"
    : file.endsWith(".jpg")
    ? "image/jpeg"
    : "application/octet-stream"
},\
${size},\
${base64},\
2025-03-01T09:15:00Z,\
admin@example.com,\
2025-03-01T09:15:00Z,\
admin@example.com\n`;

  console.log(`Processed: ${file}`);
});

// Write to CSV file
fs.writeFileSync(csvPath, csvContent);
console.log(`\nCSV file has been created at: ${csvPath}`);
