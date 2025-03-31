const fs = require('fs');
const path = require('path');

// Directory to combine files from
const directoryPath = path.join(__dirname, './plugins');

// File to store the combined content
const outputFile = path.join(__dirname, 'gs-plugins.txt');

// Supported file extensions (add more extensions as needed)
const supportedExtensions = ['.ts', '.yaml', '.md', '.prisma', '.graphql'];

// Function to recursively scan directories and combine files
const combineFiles = async () => {
  const writeStream = fs.createWriteStream(outputFile, { flags: 'a' });

  // Helper function to recursively process directories
  const processDirectory = (directory) => {
    try {
      const items = fs.readdirSync(directory);

      for (const item of items) {
        const itemPath = path.join(directory, item);

        // Check if it's a directory or file
        if (fs.statSync(itemPath).isDirectory()) {
          // Recursively process the subdirectory
          processDirectory(itemPath);
        } else {
          const fileExtension = path.extname(itemPath); // Get the file extension

          // Ensure it's a supported file type
          if (supportedExtensions.includes(fileExtension)) {
            const content = fs.readFileSync(itemPath, 'utf8');
            // Write content to the output file with a header for each file
            writeStream.write(`\n\n---- Content from: ${itemPath} ----\n\n`);
            writeStream.write(content);
          }
        }
      }
    } catch (err) {
      console.error('Error processing directory:', err);
    }
  };

  // Start processing from the root directory
  processDirectory(directoryPath);

  // Close the write stream when done
  writeStream.end();
  console.log('All files have been successfully combined into:', outputFile);
};

// Run the combine files function
combineFiles();
