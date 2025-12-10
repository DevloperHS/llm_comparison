#!/usr/bin/env node

/**
 * Team Feature Voting Board - Backend API Test Script
 *
 * Tests all 4 Supabase RPC functions:
 * - create_feature
 * - list_features
 * - toggle_vote
 * - add_comment
 *
 * Prerequisites:
 * 1. npm install
 * 2. Create .env file with SUPABASE_URL and SUPABASE_ANON_KEY (or copy from .env.example)
 * 3. Run: npm test
 */

// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lqkikfqhxhshikrvqeww.supabase.co';
// Prefer service role key for testing (bypasses RLS and auth requirements)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable required');
  console.error('💡 Tip: Use SUPABASE_SERVICE_ROLE_KEY for testing (bypasses auth.uid() requirements)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test utilities
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${name}`);
  }
  if (details) {
    console.log(`   ${details}`);
  }
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  console.log(title);
  console.log('='.repeat(70));
}

// Test data storage
const testData = {
  featureIds: [],
  commentIds: []
};

async function runTests() {
  console.log('🚀 Starting Backend API Tests for Team Feature Voting Board\n');
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Using ${SUPABASE_KEY.includes('service_role') ? 'Service Role' : 'Anon'} Key\n`);

  try {
    // Test 1: Create Feature (Valid)
    logSection('TEST 1: CREATE_FEATURE - Valid Feature');
    const { data: feature1, error: error1 } = await supabase.rpc('create_feature', {
      p_title: 'Dark Mode Support',
      p_description: 'Add dark mode theme to the application for better user experience',
      p_status: 'proposed'
    });

    logTest(
      'Create feature with valid data',
      !error1 && feature1,
      error1 ? `Error: ${error1.message}` : `Feature ID: ${feature1}`
    );
    if (feature1) testData.featureIds.push(feature1);

    // Test 2: Create Feature (Another)
    logSection('TEST 2: CREATE_FEATURE - Second Feature');
    const { data: feature2, error: error2 } = await supabase.rpc('create_feature', {
      p_title: 'Email Notifications',
      p_description: 'Send email notifications when features are approved or commented on',
      p_status: 'proposed'
    });

    logTest(
      'Create second feature',
      !error2 && feature2,
      error2 ? `Error: ${error2.message}` : `Feature ID: ${feature2}`
    );
    if (feature2) testData.featureIds.push(feature2);

    // Test 3: Create Feature (Third - for filtering test)
    logSection('TEST 3: CREATE_FEATURE - Third Feature (Different Status)');
    const { data: feature3, error: error3 } = await supabase.rpc('create_feature', {
      p_title: 'Mobile App',
      p_description: 'Create a mobile app version',
      p_status: 'under_review'
    });

    logTest(
      'Create third feature with different status',
      !error3 && feature3,
      error3 ? `Error: ${error3.message}` : `Feature ID: ${feature3}`
    );
    if (feature3) testData.featureIds.push(feature3);

    // Test 4: Create Feature (Invalid - Empty Title)
    logSection('TEST 4: CREATE_FEATURE - Error Handling (Empty Title)');
    const { data: feature4, error: error4 } = await supabase.rpc('create_feature', {
      p_title: '   ',
      p_description: 'This should fail',
      p_status: 'proposed'
    });

    logTest(
      'Reject empty title',
      error4 !== null,
      error4 ? `Expected error: ${error4.message}` : 'Should have failed but did not'
    );

    // Test 5: Create Feature (Invalid Status)
    logSection('TEST 5: CREATE_FEATURE - Error Handling (Invalid Status)');
    const { data: feature5, error: error5 } = await supabase.rpc('create_feature', {
      p_title: 'Test Feature',
      p_description: 'This should fail',
      p_status: 'invalid_status'
    });

    logTest(
      'Reject invalid status',
      error5 !== null,
      error5 ? `Expected error: ${error5.message}` : 'Should have failed but did not'
    );

    // Test 6: List Features (No Filter)
    logSection('TEST 6: LIST_FEATURES - No Filter');
    const { data: allFeatures, error: error6 } = await supabase.rpc('list_features', {
      filter_status: null
    });

    logTest(
      'List all features',
      !error6 && allFeatures && allFeatures.length >= 3,
      error6 ? `Error: ${error6.message}` : `Found ${allFeatures?.length} features`
    );

    if (allFeatures && allFeatures.length > 0) {
      console.log('\n   Features found:');
      allFeatures.forEach(f => {
        console.log(`   - ${f.title} (${f.status}) - Votes: ↑${f.upvote_count} ↓${f.downvote_count} = ${f.net_votes}, Comments: ${f.comment_count}`);
      });
    }

    // Test 7: List Features (With Filter)
    logSection('TEST 7: LIST_FEATURES - Filter by Status');
    const { data: filteredFeatures, error: error7 } = await supabase.rpc('list_features', {
      filter_status: 'proposed'
    });

    logTest(
      'List features with status filter',
      !error7 && filteredFeatures && filteredFeatures.every(f => f.status === 'proposed'),
      error7 ? `Error: ${error7.message}` : `Found ${filteredFeatures?.length} 'proposed' features`
    );

    // Test 8: Toggle Vote (Add Upvote)
    logSection('TEST 8: TOGGLE_VOTE - Add Upvote');
    if (testData.featureIds[0]) {
      const { data: vote1, error: error8 } = await supabase.rpc('toggle_vote', {
        p_feature_id: testData.featureIds[0],
        p_vote_type: 'upvote'
      });

      logTest(
        'Add upvote to feature',
        !error8 && vote1 && vote1.action === 'added',
        error8 ? `Error: ${error8.message}` : `Action: ${vote1?.action}, Current vote: ${vote1?.current_vote}`
      );
    }

    // Test 9: Toggle Vote (Remove Upvote - Toggle Off)
    logSection('TEST 9: TOGGLE_VOTE - Remove Upvote (Toggle Off)');
    if (testData.featureIds[0]) {
      const { data: vote2, error: error9 } = await supabase.rpc('toggle_vote', {
        p_feature_id: testData.featureIds[0],
        p_vote_type: 'upvote'
      });

      logTest(
        'Remove upvote (toggle off)',
        !error9 && vote2 && vote2.action === 'removed',
        error9 ? `Error: ${error9.message}` : `Action: ${vote2?.action}, Current vote: ${vote2?.current_vote}`
      );
    }

    // Test 10: Toggle Vote (Change Vote Type)
    logSection('TEST 10: TOGGLE_VOTE - Change Vote Type');
    if (testData.featureIds[0]) {
      // First add upvote
      await supabase.rpc('toggle_vote', {
        p_feature_id: testData.featureIds[0],
        p_vote_type: 'upvote'
      });

      // Then change to downvote
      const { data: vote3, error: error10 } = await supabase.rpc('toggle_vote', {
        p_feature_id: testData.featureIds[0],
        p_vote_type: 'downvote'
      });

      logTest(
        'Change vote from upvote to downvote',
        !error10 && vote3 && vote3.action === 'changed',
        error10 ? `Error: ${error10.message}` : `Action: ${vote3?.action}, Current vote: ${vote3?.current_vote}`
      );
    }

    // Test 11: Toggle Vote (Add Multiple Votes to Different Features)
    logSection('TEST 11: TOGGLE_VOTE - Multiple Features');
    if (testData.featureIds[1]) {
      const { data: vote4, error: error11 } = await supabase.rpc('toggle_vote', {
        p_feature_id: testData.featureIds[1],
        p_vote_type: 'upvote'
      });

      logTest(
        'Vote on second feature',
        !error11 && vote4,
        error11 ? `Error: ${error11.message}` : `Action: ${vote4?.action}`
      );
    }

    // Test 12: Toggle Vote (Invalid Vote Type)
    logSection('TEST 12: TOGGLE_VOTE - Error Handling (Invalid Vote Type)');
    if (testData.featureIds[0]) {
      const { data: vote5, error: error12 } = await supabase.rpc('toggle_vote', {
        p_feature_id: testData.featureIds[0],
        p_vote_type: 'invalid_vote'
      });

      logTest(
        'Reject invalid vote type',
        error12 !== null,
        error12 ? `Expected error: ${error12.message}` : 'Should have failed but did not'
      );
    }

    // Test 13: Add Comment (Valid)
    logSection('TEST 13: ADD_COMMENT - Valid Comment');
    if (testData.featureIds[0]) {
      const { data: comment1, error: error13 } = await supabase.rpc('add_comment', {
        p_feature_id: testData.featureIds[0],
        p_comment_text: 'Great idea! I would love to see this implemented.'
      });

      logTest(
        'Add comment to feature',
        !error13 && comment1,
        error13 ? `Error: ${error13.message}` : `Comment ID: ${comment1}`
      );
      if (comment1) testData.commentIds.push(comment1);
    }

    // Test 14: Add Comment (Another)
    logSection('TEST 14: ADD_COMMENT - Second Comment');
    if (testData.featureIds[0]) {
      const { data: comment2, error: error14 } = await supabase.rpc('add_comment', {
        p_feature_id: testData.featureIds[0],
        p_comment_text: 'We should prioritize this for the next sprint.'
      });

      logTest(
        'Add second comment',
        !error14 && comment2,
        error14 ? `Error: ${error14.message}` : `Comment ID: ${comment2}`
      );
      if (comment2) testData.commentIds.push(comment2);
    }

    // Test 15: Add Comment (Empty Text)
    logSection('TEST 15: ADD_COMMENT - Error Handling (Empty Comment)');
    if (testData.featureIds[0]) {
      const { data: comment3, error: error15 } = await supabase.rpc('add_comment', {
        p_feature_id: testData.featureIds[0],
        p_comment_text: '   '
      });

      logTest(
        'Reject empty comment',
        error15 !== null,
        error15 ? `Expected error: ${error15.message}` : 'Should have failed but did not'
      );
    }

    // Test 16: Add Comment (Invalid Feature ID)
    logSection('TEST 16: ADD_COMMENT - Error Handling (Invalid Feature)');
    const { data: comment4, error: error16 } = await supabase.rpc('add_comment', {
      p_feature_id: '00000000-0000-0000-0000-000000000000',
      p_comment_text: 'This should fail'
    });

    logTest(
      'Reject comment for non-existent feature',
      error16 !== null,
      error16 ? `Expected error: ${error16.message}` : 'Should have failed but did not'
    );

    // Test 17: List Features (Verify Vote and Comment Counts)
    logSection('TEST 17: LIST_FEATURES - Verify Aggregations');
    const { data: verifyFeatures, error: error17 } = await supabase.rpc('list_features', {
      filter_status: null
    });

    if (verifyFeatures && verifyFeatures.length > 0) {
      const feature = verifyFeatures.find(f => f.id === testData.featureIds[0]);
      logTest(
        'Verify vote and comment counts in list_features',
        feature && feature.comment_count >= 2,
        feature ? `Feature: ${feature.title}, Comments: ${feature.comment_count}, Net votes: ${feature.net_votes}` : 'Feature not found'
      );

      console.log('\n   All features with aggregated data:');
      verifyFeatures.forEach(f => {
        console.log(`   - ${f.title} (${f.status})`);
        console.log(`     Votes: ↑${f.upvote_count} ↓${f.downvote_count} = ${f.net_votes}`);
        console.log(`     Comments: ${f.comment_count}`);
        console.log(`     User vote: ${f.user_vote || 'none'}`);
      });
    } else {
      logTest('Verify aggregations', false, error17 ? error17.message : 'No features found');
    }

    // Test 18: Concurrency Safety Test (Rapid Toggle)
    logSection('TEST 18: TOGGLE_VOTE - Concurrency Safety (Rapid Toggles)');
    if (testData.featureIds[2]) {
      console.log('   Performing 5 rapid toggle operations...');
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          supabase.rpc('toggle_vote', {
            p_feature_id: testData.featureIds[2],
            p_vote_type: 'upvote'
          })
        );
      }

      const results = await Promise.all(promises);
      const successCount = results.filter(r => !r.error).length;
      const actions = results.map(r => r.data?.action).filter(Boolean);

      logTest(
        'Handle concurrent vote operations safely',
        successCount === 5,
        `${successCount}/5 operations succeeded. Actions: ${actions.join(', ')}`
      );

      // Verify final state - should be either added or removed (odd number of toggles = added)
      const { data: finalFeatures } = await supabase.rpc('list_features', {
        filter_status: null
      });
      const finalFeature = finalFeatures?.find(f => f.id === testData.featureIds[2]);
      console.log(`   Final vote count: ${finalFeature?.upvote_count || 0} upvotes`);
    }

  } catch (err) {
    console.error('\n❌ Fatal Error:', err.message);
    console.error(err.stack);
  }

  // Print summary
  logSection('TEST SUMMARY');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed!\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
