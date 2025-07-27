#!/usr/bin/env node

/**
 * Test script for login API
 * 
 * This script tests the login API endpoint to help debug issues
 * 
 * Usage:
 *   node scripts/test-login-api.js [url] [username] [password]
 *   
 * Examples:
 *   node scripts/test-login-api.js http://localhost:3000 admin admin123
 *   node scripts/test-login-api.js https://your-app.vercel.app admin admin123
 */

const https = require('https');
const http = require('http');

// Parse command line arguments
const args = process.argv.slice(2);
const baseUrl = args[0] || 'http://localhost:3000';
const username = args[1] || 'admin';
const password = args[2] || 'admin123';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBold(message, color = 'white') {
  console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
}

async function testLoginAPI() {
  logBold('\n🧪 LOGIN API TEST', 'cyan');
  log('==================', 'cyan');
  
  log(`\n📋 Test Configuration:`, 'blue');
  log(`  URL: ${baseUrl}/api/auth/login`, 'white');
  log(`  Username: ${username}`, 'white');
  log(`  Password: ${'*'.repeat(password.length)}`, 'white');

  const loginUrl = `${baseUrl}/api/auth/login`;
  const requestData = JSON.stringify({
    username: username,
    password: password
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData),
      'User-Agent': 'LoginAPITest/1.0'
    }
  };

  // Parse URL
  const url = new URL(loginUrl);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  options.hostname = url.hostname;
  options.port = url.port || (isHttps ? 443 : 80);
  options.path = url.pathname;

  log(`\n🚀 Making request...`, 'blue');
  log(`  Protocol: ${url.protocol}`, 'white');
  log(`  Host: ${url.hostname}:${options.port}`, 'white');
  log(`  Path: ${url.pathname}`, 'white');

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = client.request(options, (res) => {
      const duration = Date.now() - startTime;
      
      log(`\n📡 Response received:`, 'blue');
      log(`  Status: ${res.statusCode} ${res.statusMessage}`, 
        res.statusCode === 200 ? 'green' : 'red');
      log(`  Duration: ${duration}ms`, 'white');
      
      log(`\n📋 Response Headers:`, 'blue');
      Object.entries(res.headers).forEach(([key, value]) => {
        log(`  ${key}: ${value}`, 'white');
      });

      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        log(`\n📄 Response Body:`, 'blue');
        
        try {
          const jsonResponse = JSON.parse(responseData);
          log(JSON.stringify(jsonResponse, null, 2), 'white');
          
          if (res.statusCode === 200) {
            logBold('\n✅ LOGIN TEST SUCCESSFUL!', 'green');
            if (jsonResponse.token) {
              log(`🎫 Token received (length: ${jsonResponse.token.length})`, 'green');
            }
            if (jsonResponse.user) {
              log(`👤 User data received:`, 'green');
              log(`   ID: ${jsonResponse.user.id}`, 'green');
              log(`   Username: ${jsonResponse.user.username}`, 'green');
              log(`   Role: ${jsonResponse.user.role}`, 'green');
            }
          } else {
            logBold('\n❌ LOGIN TEST FAILED!', 'red');
            log(`Error: ${jsonResponse.error || 'Unknown error'}`, 'red');
          }
        } catch (parseError) {
          log('Raw response (not JSON):', 'yellow');
          log(responseData, 'white');
          logBold('\n❌ RESPONSE PARSING FAILED!', 'red');
          log(`Parse error: ${parseError.message}`, 'red');
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData,
          duration
        });
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      logBold('\n💥 REQUEST FAILED!', 'red');
      log(`Error: ${error.message}`, 'red');
      log(`Duration: ${duration}ms`, 'white');
      
      if (error.code === 'ECONNREFUSED') {
        log('\n💡 Possible solutions:', 'yellow');
        log('  • Make sure the server is running', 'yellow');
        log('  • Check if the URL is correct', 'yellow');
        log('  • Verify the port number', 'yellow');
      } else if (error.code === 'ENOTFOUND') {
        log('\n💡 Possible solutions:', 'yellow');
        log('  • Check if the hostname is correct', 'yellow');
        log('  • Verify internet connection', 'yellow');
        log('  • Check DNS resolution', 'yellow');
      }
      
      reject(error);
    });

    req.on('timeout', () => {
      logBold('\n⏰ REQUEST TIMEOUT!', 'red');
      log('The request took too long to complete', 'red');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    // Set timeout
    req.setTimeout(30000); // 30 seconds

    log(`\n📤 Sending request data:`, 'blue');
    log(requestData, 'white');

    req.write(requestData);
    req.end();
  });
}

async function main() {
  try {
    await testLoginAPI();
  } catch (error) {
    logBold('\n💥 Test failed:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  logBold('\n🧪 LOGIN API TEST SCRIPT', 'cyan');
  log('==========================', 'cyan');
  log('\nUsage:', 'white');
  log('  node scripts/test-login-api.js [url] [username] [password]', 'white');
  log('\nExamples:', 'white');
  log('  node scripts/test-login-api.js', 'cyan');
  log('  node scripts/test-login-api.js http://localhost:3000 admin admin123', 'cyan');
  log('  node scripts/test-login-api.js https://your-app.vercel.app admin admin123', 'cyan');
  log('\nDefault values:', 'white');
  log('  URL: http://localhost:3000', 'white');
  log('  Username: admin', 'white');
  log('  Password: admin123', 'white');
  process.exit(0);
}

// Run the test
main();
