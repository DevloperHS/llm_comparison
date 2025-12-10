#!/bin/bash

# Simple test script that exports environment variables and runs the test
# This ensures the SERVICE_ROLE_KEY is used

export SUPABASE_URL="https://lqkikfqhxhshikrvqeww.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxa2lrZnFoeGhzaGlrcnZxZXd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDIxMjgxNCwiZXhwIjoyMDc5Nzg4ODE0fQ.JrsY9E3VBRVOOHxy3s6X9HyPXmHRwqlaWi6EKCbr2-w"

echo "Testing with SERVICE_ROLE_KEY..."
node test-backend-api.js
