-- Insert demo connectors with proper UUIDs
INSERT INTO public.connectors (id, name, platform, status, last_sync, sync_frequency, error_count, total_flows, monthly_executions, avg_response_time, api_usage_used, api_usage_limit, api_usage_reset_date, organization_id) VALUES
(gen_random_uuid(), 'Zapier', 'zapier', 'connected', NOW() - INTERVAL '1 hour', 'realtime', 2, 15, 4500, 1.2, 3500, 10000, '2025-08-01T00:00:00Z', (SELECT id FROM organizations LIMIT 1)),
(gen_random_uuid(), 'Make', 'make', 'connected', NOW() - INTERVAL '2 hours', 'hourly', 0, 8, 2100, 0.8, 1200, 5000, '2025-08-01T00:00:00Z', (SELECT id FROM organizations LIMIT 1)),
(gen_random_uuid(), 'HubSpot', 'hubspot', 'disconnected', NULL, 'daily', 15, 12, 850, 3.5, 0, 2500, '2025-08-01T00:00:00Z', (SELECT id FROM organizations LIMIT 1)),
(gen_random_uuid(), 'Salesforce', 'salesforce', 'error', NOW() - INTERVAL '1 day', 'daily', 8, 20, 3245, 2.1, 12000, 15000, '2025-08-01T00:00:00Z', (SELECT id FROM organizations LIMIT 1));

-- Store connector IDs for flows
DO $$
DECLARE
    zapier_id UUID;
    make_id UUID;
    hubspot_id UUID;
    org_id UUID;
BEGIN
    -- Get the organization ID
    SELECT id INTO org_id FROM organizations LIMIT 1;
    
    -- Get connector IDs
    SELECT id INTO zapier_id FROM connectors WHERE name = 'Zapier' LIMIT 1;
    SELECT id INTO make_id FROM connectors WHERE name = 'Make' LIMIT 1;
    SELECT id INTO hubspot_id FROM connectors WHERE name = 'HubSpot' LIMIT 1;
    
    -- Insert demo flows
    INSERT INTO public.flows (
      id, name, external_id, tool, summary, description, duplicate_of, orphan, status, 
      trigger_type, trigger_config, actions, frequency, last_run, next_run, 
      success_rate, avg_execution_time, total_executions, monthly_executions,
      monthly_cost, cost_per_execution, error_count, warning_count, avg_response_time,
      owner_id, department, business_value, organization_id, connector_id
    ) VALUES
    (
      gen_random_uuid(), 
      'Deal Won → Slack Notification', 
      'zapier-deal-won-001',
      'zapier',
      'Send Slack notification when deal is won in HubSpot',
      'Automatically notify the sales team when a deal reaches won status',
      NULL,
      false,
      'active',
      'webhook',
      '{"source": "hubspot", "event": "deal.updated"}',
      '[{"id": "a1", "type": "slack_message", "config": {"channel": "#sales", "message": "New deal won"}}]',
      'realtime',
      NOW() - INTERVAL '2 hours',
      NULL,
      98.5,
      2.1,
      1250,
      85,
      12.50,
      0.15,
      8,
      3,
      1.8,
      'Sales Manager',
      'sales',
      'high',
      org_id,
      zapier_id
    ),
    (
      gen_random_uuid(), 
      'Deal Won → Slack Alert (Duplicate)', 
      'make-deal-won-002',
      'make',
      'Duplicate of Deal Won notification created in Make platform',
      'Duplicate flow created in Make that does similar functionality',
      NULL,
      false,
      'active',
      'webhook',
      '{"source": "hubspot", "event": "deal.updated"}',
      '[{"id": "a2", "type": "slack_message", "config": {"channel": "#general", "message": "Deal won"}}]',
      'realtime',
      NOW() - INTERVAL '1 hour',
      NULL,
      92.1,
      3.5,
      890,
      78,
      15.60,
      0.20,
      15,
      8,
      2.9,
      'Marketing Specialist',
      'sales',
      'medium',
      org_id,
      make_id
    ),
    (
      gen_random_uuid(), 
      'Midnight Contact Archive', 
      'hubspot-archive-001',
      'hubspot',
      'Archive stale contacts that have not been active in 6+ months',
      'Automatically archive contacts with no recent activity to keep database clean',
      NULL,
      true,
      'disabled',
      'schedule',
      '{"cron": "0 0 * * *"}',
      '[{"id": "a3", "type": "contact_update", "config": {"property": "lifecycle_stage", "value": "archived"}}]',
      'daily',
      '2025-06-15T00:00:00Z',
      NULL,
      45.2,
      120.5,
      35,
      2,
      8.00,
      4.00,
      25,
      12,
      95.2,
      'Data Analyst',
      'marketing',
      'low',
      org_id,
      hubspot_id
    ),
    (
      gen_random_uuid(), 
      'Lead Scoring & Routing', 
      'zapier-lead-score-001',
      'zapier',
      'Score new leads and route to appropriate sales rep',
      'Automatically score incoming leads and assign to sales reps based on criteria',
      NULL,
      false,
      'active',
      'event',
      '{"object": "contact", "event": "created"}',
      '[{"id": "a4", "type": "score_calculation", "config": {"criteria": ["company_size", "industry", "role"]}}]',
      'realtime',
      NOW() - INTERVAL '30 minutes',
      NULL,
      94.8,
      5.2,
      2100,
      180,
      25.00,
      0.14,
      12,
      5,
      4.1,
      'Sales Operations',
      'marketing',
      'high',
      org_id,
      zapier_id
    );
END $$;