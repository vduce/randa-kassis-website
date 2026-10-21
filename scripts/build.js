// CRA includes every REACT_APP variable in the public bundle. Keep secrets server-side,
// including when building from a developer's legacy .env file.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
for (const key of Object.keys(process.env)) {
  if (key.startsWith('REACT_APP_') && /PASSWORD|SECRET|TOKEN|API_KEY|ADMIN_EMAIL/.test(key)) {
    process.env[key] = '';
  }
}
require('react-scripts/scripts/build');
