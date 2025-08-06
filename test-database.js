const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://absqrdsvpsztuwmsrmpx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFic3FyZHN2cHN6dHV3bXNybXB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk3NjQ2NiwiZXhwIjoyMDY5NTUyNDY2fQ.28vIzoPaLCk0awneAN877N959ngnb1HqN0puUPeEEJQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabase() {
  console.log('🔍 Testing database connection and setup...');
  
  try {
    // Test 1: Check if users table exists and has data
    console.log('\n📋 Test 1: Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log(`✅ Users table: ${users.length} users found`);
      console.log('Sample user:', users[0]);
    }
    
    // Test 2: Check if user_profiles table exists
    console.log('\n📋 Test 2: Checking user_profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ User_profiles table error:', profilesError.message);
    } else {
      console.log(`✅ User_profiles table: ${profiles.length} profiles found`);
      console.log('Sample profile:', profiles[0]);
    }
    
    // Test 3: Check if credibility_logs table exists
    console.log('\n📋 Test 3: Checking credibility_logs table...');
    const { data: logs, error: logsError } = await supabase
      .from('credibility_logs')
      .select('*')
      .limit(3);
    
    if (logsError) {
      console.log('❌ Credibility_logs table error:', logsError.message);
    } else {
      console.log(`✅ Credibility_logs table: ${logs.length} logs found`);
      if (logs.length > 0) {
        console.log('Sample log:', logs[0]);
      }
    }
    
    // Test 4: Test the update_user_tokens function
    console.log('\n📋 Test 4: Testing update_user_tokens function...');
    if (users && users.length > 0) {
      const testUserId = users[0].id;
      const { error: tokenError } = await supabase
        .rpc('update_user_tokens', {
          user_uuid: testUserId,
          new_tokens: users[0].tokens // Keep same value
        });
      
      if (tokenError) {
        console.log('❌ update_user_tokens function error:', tokenError.message);
      } else {
        console.log('✅ update_user_tokens function works');
      }
    }
    
    // Test 5: Test the update_user_credibility function
    console.log('\n📋 Test 5: Testing update_user_credibility function...');
    if (users && users.length > 0) {
      const testUserId = users[0].id;
      const { error: credError } = await supabase
        .rpc('update_user_credibility', {
          user_uuid: testUserId,
          change_amount: 0, // No change
          reason_text: 'Test function',
          bet_uuid: null
        });
      
      if (credError) {
        console.log('❌ update_user_credibility function error:', credError.message);
      } else {
        console.log('✅ update_user_credibility function works');
      }
    }
    
    console.log('\n🎉 Database test completed!');
    console.log('📝 If all tests passed, your database is ready for deployment.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabase(); 