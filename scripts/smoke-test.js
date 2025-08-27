#!/usr/bin/env node

/**
 * BetMe App Smoke Test
 * 
 * This script tests the basic Supabase connection and functionality
 * Run with: node scripts/smoke-test.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test functions
async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function testTableAccess() {
  console.log('\n📋 Testing table access...');
  
  const tables = ['users', 'user_profiles', 'bets', 'invitations', 'credibility_logs', 'token_logs'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        results[table] = { success: false, error: error.message };
      } else {
        results[table] = { success: true, count: data.length };
      }
    } catch (error) {
      results[table] = { success: false, error: error.message };
    }
  }
  
  // Display results
  let allSuccess = true;
  for (const [table, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`✅ ${table}: Accessible (${result.count} rows)`);
    } else {
      console.log(`❌ ${table}: ${result.error}`);
      allSuccess = false;
    }
  }
  
  return allSuccess;
}

async function testRLSPolicies() {
  console.log('\n🔒 Testing RLS policies...');
  
  try {
    // Test that we can read users (public read policy)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('username, email')
      .limit(3);
    
    if (usersError) {
      console.log(`❌ Users read policy: ${usersError.message}`);
      return false;
    }
    
    console.log(`✅ Users read policy: Working (${users.length} users found)`);
    
    // Test that we can read bets (public read policy)
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('title, status')
      .limit(3);
    
    if (betsError) {
      console.log(`❌ Bets read policy: ${betsError.message}`);
      return false;
    }
    
    console.log(`✅ Bets read policy: Working (${bets.length} bets found)`);
    
    return true;
  } catch (error) {
    console.error('❌ RLS policy test failed:', error.message);
    return false;
  }
}

async function testFunctions() {
  console.log('\n⚙️  Testing database functions...');
  
  try {
    // Test the check_expired_voting_bets function
    const { data, error } = await supabase.rpc('check_expired_voting_bets');
    
    if (error) {
      console.log(`❌ Function test: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Function test: Working (processed ${data} expired bets)`);
    return true;
  } catch (error) {
    console.error('❌ Function test failed:', error.message);
    return false;
  }
}

async function testRealTime() {
  console.log('\n📡 Testing real-time subscriptions...');
  
  try {
    const channel = supabase
      .channel('smoke-test')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bets' },
        (payload) => {
          console.log('✅ Real-time subscription working');
        }
      )
      .subscribe();
    
    // Wait a bit for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Unsubscribe
    await supabase.removeChannel(channel);
    
    console.log('✅ Real-time test completed');
    return true;
  } catch (error) {
    console.error('❌ Real-time test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting BetMe App Smoke Tests...\n');
  
  const tests = [
    { name: 'Connection', fn: testConnection },
    { name: 'Table Access', fn: testTableAccess },
    { name: 'RLS Policies', fn: testRLSPolicies },
    { name: 'Database Functions', fn: testFunctions },
    { name: 'Real-time', fn: testRealTime }
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      results[test.name] = await test.fn();
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message);
      results[test.name] = false;
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const [testName, result] of Object.entries(results)) {
    if (result) {
      console.log(`✅ ${testName}: PASSED`);
      passedTests++;
    } else {
      console.log(`❌ ${testName}: FAILED`);
    }
  }
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your Supabase setup is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check your configuration.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Smoke test crashed:', error);
    process.exit(1);
  });
}

module.exports = {
  testConnection,
  testTableAccess,
  testRLSPolicies,
  testFunctions,
  testRealTime,
  runAllTests
};
