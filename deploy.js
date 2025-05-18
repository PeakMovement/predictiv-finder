
#!/usr/bin/env node

/**
 * Simple deployment script for health planning application
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
    log("Step 1: Building the application...", colors.blue);
    execSync("npm run build", { stdio: 'inherit' });
    log("✓ Build successful!", colors.green);
    
    // Step 2: Check if dist folder exists
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      throw new Error("Build directory 'dist' not found");
    }
    
    // Step 3: Offer deployment options
    log("\nStep 2: Choose a deployment option:", colors.blue);
    log("1) Vercel (Recommended for personal projects)");
    log("2) Netlify (Good for team collaboration)");
    log("3) Firebase (Includes hosting and backend services)");
    log("4) Custom deployment (Copy files to your server)");
    
    // Since we can't actually get user input here, this is just a template
    // for the user to follow manually
    log("\nTo deploy with Vercel:", colors.yellow);
    log("1. Install Vercel CLI: npm install -g vercel");
    log("2. Run: vercel login");
    log("3. Run: vercel --prod");
    
    log("\nTo deploy with Netlify:", colors.yellow);
    log("1. Install Netlify CLI: npm install -g netlify-cli");
    log("2. Run: netlify login");
    log("3. Run: netlify deploy --prod");
    
    log("\nTo deploy with Firebase:", colors.yellow);
    log("1. Install Firebase tools: npm install -g firebase-tools");
    log("2. Run: firebase login");
    log("3. Run: firebase init hosting");
    log("4. Run: firebase deploy --only hosting");
    
    log("\nFor custom deployment:", colors.yellow);
    log("1. Copy all files from the 'dist' folder to your web server");
    log("2. Configure your server to handle single page application routing");
    
    log("\nStep 3: After deployment, setup your custom domain:", colors.blue);
    log("1. Go to your hosting provider's dashboard");
    log("2. Add your domain name to your project");
    log("3. Configure DNS settings with your domain registrar");
    log("4. Set up SSL/TLS for secure HTTPS connections");
    
    log("\nFor more detailed instructions, refer to your hosting provider's documentation.", colors.bright);
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
