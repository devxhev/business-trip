/*const cds = require("@sap/cds");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

class BusinessService extends cds.ApplicationService {
  async init() {
    const { Attachment } = this.entities;
    const attachmentsFolder = path.join(__dirname, "..", "attachments");

    console.log("Attachments folder:", attachmentsFolder);
    console.log("Folder exists:", fs.existsSync(attachmentsFolder));
    console.log("Folder contents:", fs.readdirSync(attachmentsFolder));

    // Ensure attachments folder exists
    if (!fs.existsSync(attachmentsFolder)) {
      fs.mkdirSync(attachmentsFolder, { recursive: true });
    }

    this.on("READ", "Attachment", async (req) => {
      const { SELECT } = cds.ql;

      try {
        // Handle $value requests for file downloads
        if (req.query.SELECT.one?.$value) {
          console.log("Handling $value request for ID:", req.data.ID);

          const attachment = await SELECT.one
            .from(Attachment)
            .columns(["ID", "fileName", "mediaType", "size"])
            .where({ ID: req.data.ID });

          console.log("Found attachment:", attachment);

          if (!attachment) {
            console.log("Attachment not found in database");
            req.reject(
              404,
              "ATTACHMENT_NOT_FOUND",
              "Attachment not found in database"
            );
            return;
          }

          const filePath = path.join(
            attachmentsFolder,
            path.basename(attachment.fileName)
          );
          console.log("Looking for file at:", filePath);

          if (!fs.existsSync(filePath)) {
            console.error("Physical file not found at:", filePath);
            req.reject(
              404,
              "FILE_NOT_FOUND",
              `File not found: ${attachment.fileName}`
            );
            return;
          }

          try {
            const fileContent = fs.readFileSync(filePath);
            const actualSize = Buffer.byteLength(fileContent);
            console.log("File read successfully, size:", actualSize);

            req._.res.set({
              "Content-Type":
                attachment.mediaType || "application/octet-stream",
              "Content-Disposition": `attachment; filename="${attachment.fileName}"`,
              "Content-Length": actualSize,
              "Cache-Control": "no-cache",
            });

            return fileContent;
          } catch (readError) {
            console.error("Error reading file:", readError);
            req.reject(500, "FILE_READ_ERROR", "Error reading file from disk");
            return;
          }
        }
      } catch (error) {
        console.error("Error in attachment handler:", error);
        req.reject(500, "INTERNAL_ERROR", error.message);
      }
    });

    this.before("CREATE", "Attachment", async (req) => {
      try {
        const { content, fileName, mediaType } = req.data;

        if (!content) {
          req.reject(400, "MISSING_CONTENT", "File content is required");
          return;
        }

        if (!fileName) {
          req.reject(400, "MISSING_FILENAME", "File name is required");
          return;
        }

        const filePath = path.join(attachmentsFolder, fileName);
        await fs.promises.writeFile(filePath, content);

        req.data.size = Buffer.byteLength(content);
        req.data.mediaType =
          mediaType || mime.lookup(fileName) || "application/octet-stream";
      } catch (error) {
        console.error("Error creating attachment:", error);
        req.reject(500, "UPLOAD_FAILED", error.message);
      }
    });

    return super.init();
  }
}

module.exports = BusinessService;*/
