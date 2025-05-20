
#!/usr/bin/env node

/**
 * Deployment script for Predictiv Health planning application
 * Specifically configured for Firebase hosting at predictiv.co.za
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Color output helpers
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m"
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Main function
async function deploy() {
  try {
    // Step 1: Build the application
    log("Step 1: Building the application for production...", colors.blue);
    execSync("npm run build", { stdio: 'inherit' });
    log("✓ Build successful!", colors.green);
    
    // Step 2: Check if dist folder exists
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      throw new Error("Build directory 'dist' not found");
    }
    
    // Step 3: Firebase deployment (primary recommended option for predictiv.co.za)
    log("\nStep 3: Deploying to Firebase (for predictiv.co.za):", colors.blue);
    
    // Check if Firebase CLI is installed
    try {
      execSync("firebase --version", { stdio: 'ignore' });
      log("✓ Firebase CLI detected", colors.green);
    } catch (error) {
      log("× Firebase CLI not found. Installing Firebase tools...", colors.yellow);
      execSync("npm install -g firebase-tools", { stdio: 'inherit' });
      log("✓ Firebase tools installed", colors.green);
    }
    
    // Check for firebase.json configuration
    const firebaseConfigPath = path.join(process.cwd(), 'firebase.json');
    if (!fs.existsSync(firebaseConfigPath)) {
      log("× Firebase configuration not found. Initializing Firebase...", colors.yellow);
      log("\nFollow these steps in the Firebase init process:", colors.bright);
      log(" 1. Select 'Hosting: Configure files for Firebase Hosting'");
      log(" 2. Select your Firebase project (or create a new one)");
      log(" 3. Specify 'dist' as your public directory");
      log(" 4. Configure as a single-page app: Yes");
      log(" 5. Set up automatic builds and deploys with GitHub: No (unless desired)");
      log("\nRunning firebase init...", colors.blue);
      
      execSync("firebase login", { stdio: 'inherit' });
      execSync("firebase init hosting", { stdio: 'inherit' });
      
      log("✓ Firebase initialized", colors.green);
    } else {
      log("✓ Firebase configuration found", colors.green);
      
      // Verify firebase.json has correct public directory
      const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
      if (firebaseConfig.hosting && firebaseConfig.hosting.public !== 'dist') {
        log("⚠️  Warning: Firebase is not configured to use 'dist' directory", colors.yellow);
        log("   Current setting: " + firebaseConfig.hosting.public, colors.yellow);
        log("   Consider updating firebase.json to use 'dist' as the public directory", colors.yellow);
      }
    }
    
    // Deploy to Firebase
    log("\nDeploying to Firebase (this will make the app live on predictiv.co.za)...", colors.blue);
    execSync("firebase deploy --only hosting", { stdio: 'inherit' });
    
    log("\n✅ Deployment complete! Your app should now be live at predictiv.co.za", colors.green);
    log("\nIf your site is still showing the Firebase welcome page:", colors.yellow);
    log("1. Verify your domain DNS settings point to Firebase hosting");
    log("2. Check that your domain is properly configured in Firebase Hosting settings");
    log("3. It may take a few minutes for DNS changes to propagate");
    log("\nFor custom domain setup help visit: https://firebase.google.com/docs/hosting/custom-domain", colors.bright);
    
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the deployment script
deploy().catch(error => {
  log(`Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});
