
#!/usr/bin/env node

/**
 * Deployment script for Predictiv Health planning application
 * Specifically configured for Firebase hosting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    
    // Verify the index.html exists in dist
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error("index.html not found in dist folder - build may be incomplete");
    }
    log("✓ Verified that dist/index.html exists", colors.green);
    
    // Step 3: Ensure we have a proper firebase.json file
    const firebaseConfigPath = path.join(process.cwd(), 'firebase.json');
    if (!fs.existsSync(firebaseConfigPath)) {
      log("Creating minimal firebase.json configuration for hosting...", colors.yellow);
      const minimalConfig = {
        "hosting": {
          "public": "dist",
          "ignore": [
            "firebase.json",
            "**/.*",
            "**/node_modules/**"
          ],
          "rewrites": [
            {
              "source": "**",
              "destination": "/index.html"
            }
          ]
        }
      };
      
      fs.writeFileSync(firebaseConfigPath, JSON.stringify(minimalConfig, null, 2));
      log("✓ Created firebase.json with proper configuration", colors.green);
    } else {
      // Check and update existing firebase.json if needed
      const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
      if (firebaseConfig.hosting && firebaseConfig.hosting.public !== 'dist') {
        log("Updating firebase.json to use 'dist' as the public directory...", colors.yellow);
        firebaseConfig.hosting.public = 'dist';
        fs.writeFileSync(firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));
        log("✓ Updated firebase.json configuration", colors.green);
      }
      
      // Ensure we have SPA rewrites
      if (!firebaseConfig.hosting.rewrites || !firebaseConfig.hosting.rewrites.length) {
        log("Adding SPA rewrites to firebase.json...", colors.yellow);
        firebaseConfig.hosting.rewrites = [
          {
            "source": "**",
            "destination": "/index.html"
          }
        ];
        fs.writeFileSync(firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));
        log("✓ Added SPA rewrites to firebase.json", colors.green);
      }
    }
    
    // Step 4: Check if Firebase CLI is installed and prompt to run firebase use if needed
    log("\nStep 4: Checking Firebase configuration:", colors.blue);
    
    try {
      execSync("firebase --version", { stdio: 'ignore' });
      log("✓ Firebase CLI detected", colors.green);
      
      // Force project selection to ensure we're deploying to the right project
      log("Please select your Firebase project for deployment:", colors.yellow);
      execSync("firebase use --add", { stdio: 'inherit' });
      
      // List the selected project
      const projectOutput = execSync("firebase projects:list", { encoding: 'utf8' });
      log("\nCurrently selected Firebase project:", colors.green);
      console.log(projectOutput);
      
    } catch (error) {
      log("× Firebase CLI not found. Installing Firebase tools...", colors.yellow);
      execSync("npm install -g firebase-tools", { stdio: 'inherit' });
      log("✓ Firebase tools installed", colors.green);
      log("Please run this script again and then log in with 'firebase login'", colors.bright);
      return;
    }
    
    // Step 5: Firebase deployment with --force flag to ensure clean deployment
    log("\nStep 5: Deploying to Firebase:", colors.blue);
    log("Deploying to Firebase (this will make the app live)...", colors.blue);
    execSync("firebase deploy --only hosting --force", { stdio: 'inherit' });
    
    log("\n✅ Deployment complete! Your app should now be visible at your Firebase hosting URL", colors.green);
    log("\nIf your site is still showing the Firebase welcome page:", colors.yellow);
    log("1. Make sure your Firebase project is correctly set up and linked");
    log("2. Check the contents of your dist folder to ensure it contains your app files");
    log("3. Verify your domain DNS settings point to Firebase hosting");
    log("4. It may take a few minutes for DNS changes and deployment to propagate");
    
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
