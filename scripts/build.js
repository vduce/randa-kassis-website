// CRA includes every REACT_APP variable in the public bundle. Keep secrets server-side,
// including when building from a developer's legacy .env file.
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: process.env.RANDA_ENV_FILE || path.join(__dirname, '..', '.env'), quiet: true });
// CRA loads these files after this wrapper. Reserve empty secret values first so
// switching profiles cannot reintroduce credentials from a developer's legacy .env.
const environmentKeys = new Set(Object.keys(process.env));
for (const filename of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  const file = path.join(__dirname, '..', filename);
  if (fs.existsSync(file)) Object.keys(require('dotenv').parse(fs.readFileSync(file))).forEach(key => environmentKeys.add(key));
}
for (const key of environmentKeys) {
  if (key.startsWith('REACT_APP_') && /PASSWORD|SECRET|TOKEN|API_KEY|ADMIN_EMAIL/.test(key)) {
    process.env[key] = '';
  }
}
require('react-scripts/scripts/build');
