const fs = require('fs');
const path = require('path');

const marketingItems = [
  'app/docs',
  'app/integrations',
  'app/language',
  'app/framework',
  'app/projects'
];

marketingItems.forEach(item => {
  const src = path.join(__dirname, item);
  const dest = path.join(__dirname, 'app/(marketing)', path.basename(item));
  if (fs.existsSync(src)) {
    try {
      fs.cpSync(src, dest, { recursive: true });
      fs.rmSync(src, { recursive: true, force: true });
      console.log(`Moved ${item} to app/(marketing)/`);
    } catch(e) {
      console.error(`Failed to move ${item}:`, e.message);
    }
  }
});

const authItems = [
  'app/auth',
  'app/onboarding'
];

authItems.forEach(item => {
  const src = path.join(__dirname, item);
  const dest = path.join(__dirname, 'app/(auth)', path.basename(item));
  if (fs.existsSync(src)) {
    try {
      fs.cpSync(src, dest, { recursive: true });
      fs.rmSync(src, { recursive: true, force: true });
      console.log(`Moved ${item} to app/(auth)/`);
    } catch(e) {
      console.error(`Failed to move ${item}:`, e.message);
    }
  }
});

console.log('Move complete');
