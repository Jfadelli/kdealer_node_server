const fs = require('fs');

function updateBearerToken(newBearerToken) {
  const envFilePath = '.env';

  // Read the contents of the .env file
  const envFileContent = fs.readFileSync(envFilePath, 'utf8');

  // Split the content into lines
  const lines = envFileContent.split('\n');

  // Find the line that starts with "BEARER_TOKEN="
  const tokenLineIndex = lines.findIndex(line => line.startsWith('BEARER_TOKEN='));

  if (tokenLineIndex !== -1) {
    // Replace the existing bearerToken value with the new one
    lines[tokenLineIndex] = `BEARER_TOKEN=${newBearerToken}`;

    // Join the lines back into a single string
    const updatedEnvContent = lines.join('\n');

    // Write the updated content back to the .env file
    fs.writeFileSync(envFilePath, updatedEnvContent);

    console.log('Bearer token updated successfully.');
  } else {
    console.log('Bearer token not found in the .env file.');
  }
}

module.exports = {
  updateBearerToken
};
