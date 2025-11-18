import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-corp' },
    update: {},
    create: {
      name: 'Demo Corporation',
      slug: 'demo-corp',
      plan: 'PRO',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
      },
    },
  });
  console.log('✅ Created organization:', org.name);

  // Create Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo-corp.com' },
    update: {},
    create: {
      email: 'admin@demo-corp.com',
      name: 'Admin User',
      organizationId: org.id,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const memberUser = await prisma.user.upsert({
    where: { email: 'member@demo-corp.com' },
    update: {},
    create: {
      email: 'member@demo-corp.com',
      name: 'Member User',
      organizationId: org.id,
      role: 'MEMBER',
      isActive: true,
    },
  });
  console.log('✅ Created users');

  // Create Agent Profiles
  const ceoAgent = await prisma.agentProfile.create({
    data: {
      name: 'Alex - AI CEO',
      role: 'CEO',
      organizationId: org.id,
      personality: 'Strategic, visionary, and decisive. Focuses on long-term growth and company vision.',
      systemPrompt: `You are Alex, the AI CEO of the organization. Your role is to:
- Set strategic direction and company vision
- Make high-level decisions about resource allocation
- Review and approve major initiatives
- Provide executive summaries and insights
- Think long-term about company growth and market positioning

Always respond with executive-level thinking, focusing on strategy, vision, and business outcomes.`,
      allowedTools: ['vector_search', 'automation_recipe', 'market_analysis'],
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 2000,
      isActive: true,
    },
  });

  const cfoAgent = await prisma.agentProfile.create({
    data: {
      name: 'Morgan - AI CFO',
      role: 'CFO',
      organizationId: org.id,
      personality: 'Analytical, detail-oriented, and fiscally responsible. Expert in financial planning.',
      systemPrompt: `You are Morgan, the AI CFO of the organization. Your role is to:
- Analyze financial data and trends
- Create budget forecasts and financial reports
- Identify cost-saving opportunities
- Assess financial risks and opportunities
- Provide data-driven financial recommendations

Always respond with financial analysis, numbers, and ROI considerations.`,
      allowedTools: ['vector_search', 'financial_analysis', 'budget_calculator'],
      model: 'gpt-4-turbo-preview',
      temperature: 0.5,
      maxTokens: 2000,
      isActive: true,
    },
  });

  const pmAgent = await prisma.agentProfile.create({
    data: {
      name: 'Jordan - AI PM',
      role: 'PM',
      organizationId: org.id,
      personality: 'Organized, communicative, and results-driven. Expert at breaking down complex projects.',
      systemPrompt: `You are Jordan, the AI Project Manager. Your role is to:
- Break down projects into actionable tasks
- Estimate timelines and resource requirements
- Identify project risks and dependencies
- Create project plans and track progress
- Coordinate between different teams and stakeholders

Always respond with structured project plans, clear timelines, and actionable steps.`,
      allowedTools: ['vector_search', 'task_planner', 'timeline_estimator'],
      model: 'gpt-4-turbo-preview',
      temperature: 0.6,
      maxTokens: 2000,
      isActive: true,
    },
  });

  const hrAgent = await prisma.agentProfile.create({
    data: {
      name: 'Riley - AI HR',
      role: 'HR',
      organizationId: org.id,
      personality: 'Empathetic, fair, and people-focused. Expert in team dynamics and culture.',
      systemPrompt: `You are Riley, the AI HR Manager. Your role is to:
- Support employee well-being and development
- Handle team communications and culture
- Provide guidance on organizational structure
- Create onboarding and training plans
- Mediate conflicts and improve team dynamics

Always respond with empathy, fairness, and focus on people and culture.`,
      allowedTools: ['vector_search', 'survey_analyzer', 'org_chart'],
      model: 'gpt-4-turbo-preview',
      temperature: 0.8,
      maxTokens: 2000,
      isActive: true,
    },
  });

  console.log('✅ Created agent profiles (CEO, CFO, PM, HR)');

  // Create Projects
  const strategicProject = await prisma.project.create({
    data: {
      name: 'Q1 2024 Strategic Planning',
      description: 'Comprehensive strategic planning for Q1 2024',
      organizationId: org.id,
      status: 'ACTIVE',
      ownerId: adminUser.id,
      metadata: {
        priority: 'HIGH',
        department: 'Executive',
      },
    },
  });

  const productProject = await prisma.project.create({
    data: {
      name: 'New Product Launch',
      description: 'Launch new AI-powered analytics product',
      organizationId: org.id,
      status: 'PLANNING',
      ownerId: memberUser.id,
      metadata: {
        priority: 'HIGH',
        department: 'Product',
      },
    },
  });

  console.log('✅ Created projects');

  // Create Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Market Analysis Report',
        description: 'Analyze market trends and competitive landscape',
        projectId: strategicProject.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: adminUser.id,
      },
      {
        title: 'Q1 Budget Allocation',
        description: 'Allocate budget across departments for Q1',
        projectId: strategicProject.id,
        status: 'TODO',
        priority: 'URGENT',
      },
      {
        title: 'Product Requirements Document',
        description: 'Define product requirements and specifications',
        projectId: productProject.id,
        status: 'TODO',
        priority: 'HIGH',
        assigneeId: memberUser.id,
      },
      {
        title: 'User Research',
        description: 'Conduct user interviews and surveys',
        projectId: productProject.id,
        status: 'TODO',
        priority: 'MEDIUM',
      },
    ],
  });

  console.log('✅ Created tasks');

  // Create Workflow: Weekly Executive Summary
  const executiveSummaryWorkflow = await prisma.workflow.create({
    data: {
      name: 'Weekly Executive Summary',
      description: 'AI-generated weekly executive summary with insights from all departments',
      organizationId: org.id,
      trigger: 'SCHEDULED',
      schedule: '0 9 * * 1', // Every Monday at 9 AM
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Gather Project Updates',
          description: 'Collect status updates from all active projects',
          action: 'TOOL_CALL',
          config: {
            toolName: 'vector_search',
            params: {
              query: 'project updates last week',
              limit: 20,
            },
          },
          nextStepId: 'step-2',
          onError: 'CONTINUE',
        },
        {
          id: 'step-2',
          name: 'Financial Analysis',
          description: 'CFO analyzes weekly financial metrics',
          agentProfileId: cfoAgent.id,
          action: 'LLM_CALL',
          config: {
            prompt: 'Analyze the following project updates and provide a financial summary with key metrics, budget status, and any financial risks or opportunities: {{step-1_result}}',
          },
          nextStepId: 'step-3',
          onError: 'CONTINUE',
        },
        {
          id: 'step-3',
          name: 'Project Status Review',
          description: 'PM reviews project progress',
          agentProfileId: pmAgent.id,
          action: 'LLM_CALL',
          config: {
            prompt: 'Review the following project updates and provide a summary of progress, blockers, and next steps: {{step-1_result}}',
          },
          nextStepId: 'step-4',
          onError: 'CONTINUE',
        },
        {
          id: 'step-4',
          name: 'Executive Summary',
          description: 'CEO creates executive summary',
          agentProfileId: ceoAgent.id,
          action: 'LLM_CALL',
          config: {
            prompt: `Create a comprehensive weekly executive summary based on:

Financial Analysis: {{step-2_response}}

Project Status: {{step-3_response}}

Include:
1. Key highlights and achievements
2. Critical issues requiring attention
3. Strategic recommendations
4. Next week's priorities`,
          },
          onError: 'STOP',
        },
      ],
    },
  });

  // Create Workflow: New Project Kickoff
  const projectKickoffWorkflow = await prisma.workflow.create({
    data: {
      name: 'New Project Kickoff',
      description: 'Automated workflow for starting new projects with AI agent collaboration',
      organizationId: org.id,
      trigger: 'MANUAL',
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Project Planning',
          description: 'PM creates project plan',
          agentProfileId: pmAgent.id,
          action: 'LLM_CALL',
          config: {
            prompt: 'Create a detailed project plan for: {{project_description}}. Include timeline, milestones, resource requirements, and key deliverables.',
          },
          nextStepId: 'step-2',
          onError: 'STOP',
        },
        {
          id: 'step-2',
          name: 'Budget Analysis',
          description: 'CFO reviews budget requirements',
          agentProfileId: cfoAgent.id,
          action: 'LLM_CALL',
          config: {
            prompt: 'Review the following project plan and provide budget analysis, cost estimates, and ROI projections: {{step-1_response}}',
          },
          nextStepId: 'step-3',
          onError: 'CONTINUE',
        },
        {
          id: 'step-3',
          name: 'Team Staffing',
          description: 'HR recommends team structure',
          agentProfileId: hrAgent.id,
          action: 'LLM_CALL',
          config: {
            prompt: 'Based on this project plan {{step-1_response}}, recommend team structure, required skills, and staffing plan.',
          },
          nextStepId: 'step-4',
          onError: 'CONTINUE',
        },
        {
          id: 'step-4',
          name: 'Executive Approval',
          description: 'CEO reviews and approves',
          agentProfileId: ceoAgent.id,
          action: 'LLM_CALL',
          config: {
            prompt: `Review the following project details and provide executive decision (APPROVE/REJECT/REVISE):

Project Plan: {{step-1_response}}
Budget Analysis: {{step-2_response}}
Team Plan: {{step-3_response}}

Provide decision with strategic rationale.`,
          },
          onError: 'STOP',
        },
      ],
    },
  });

  console.log('✅ Created workflows');

  // Create Built-in Tools
  await prisma.toolDefinition.createMany({
    data: [
      {
        name: 'vector_search',
        description: 'Search knowledge base using vector similarity',
        isBuiltin: true,
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            limit: { type: 'number', default: 10 },
          },
          required: ['query'],
        },
        outputSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: { type: 'string' },
              score: { type: 'number' },
              metadata: { type: 'object' },
            },
          },
        },
      },
      {
        name: 'automation_recipe',
        description: 'Execute automation recipes from recipe library',
        isBuiltin: true,
        inputSchema: {
          type: 'object',
          properties: {
            recipeId: { type: 'string' },
            params: { type: 'object' },
          },
          required: ['recipeId'],
        },
      },
      {
        name: 'web_search',
        description: 'Search the web for current information',
        isBuiltin: true,
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            limit: { type: 'number', default: 5 },
          },
          required: ['query'],
        },
      },
    ],
  });

  console.log('✅ Created built-in tools');

  // Create Audit Log Entry
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: adminUser.id,
      action: 'SEED_DATABASE',
      resource: 'DATABASE',
      metadata: {
        timestamp: new Date(),
        message: 'Database seeded with initial data',
      },
    },
  });

  console.log('✅ Created audit log');

  // Create Project Templates
  await prisma.projectTemplate.createMany({
    data: [
      {
        name: 'Software Development Project',
        description: 'Standard template for software development projects',
        category: 'Engineering',
        organizationId: org.id,
        isPublic: false,
        defaultTasks: [
          { title: 'Requirements Gathering', priority: 'HIGH' },
          { title: 'System Design', priority: 'HIGH' },
          { title: 'Development', priority: 'MEDIUM' },
          { title: 'Testing & QA', priority: 'HIGH' },
          { title: 'Deployment', priority: 'URGENT' },
        ],
        estimatedDays: 60,
        metadata: { targetTeamSize: 5 },
      },
      {
        name: 'Marketing Campaign',
        description: 'Template for running marketing campaigns',
        category: 'Marketing',
        organizationId: org.id,
        isPublic: true,
        defaultTasks: [
          { title: 'Campaign Strategy', priority: 'HIGH' },
          { title: 'Content Creation', priority: 'MEDIUM' },
          { title: 'Channel Setup', priority: 'MEDIUM' },
          { title: 'Launch', priority: 'URGENT' },
          { title: 'Analytics Review', priority: 'MEDIUM' },
        ],
        estimatedDays: 30,
      },
    ],
  });

  console.log('✅ Created project templates');

  // Create Workflow Templates
  await prisma.workflowTemplate.createMany({
    data: [
      {
        name: 'Daily Standup Summary',
        description: 'Generate automated standup summaries from task updates',
        category: 'Team Collaboration',
        organizationId: org.id,
        isPublic: false,
        tags: ['standup', 'daily', 'team'],
        steps: [
          {
            id: 'collect-updates',
            name: 'Collect Task Updates',
            action: 'TOOL_CALL',
            config: { tool: 'task_query' },
          },
          {
            id: 'generate-summary',
            name: 'Generate Summary',
            action: 'LLM_CALL',
            config: { agentRole: 'PM' },
          },
        ],
        variables: { timeframe: 'last_24_hours' },
      },
      {
        name: 'Code Review Workflow',
        description: 'Automated code review process with AI assistance',
        category: 'Engineering',
        isPublic: true,
        tags: ['code-review', 'engineering', 'quality'],
        steps: [
          {
            id: 'fetch-pr',
            name: 'Fetch Pull Request',
            action: 'TOOL_CALL',
          },
          {
            id: 'analyze-code',
            name: 'AI Code Analysis',
            action: 'LLM_CALL',
          },
          {
            id: 'human-review',
            name: 'Human Review',
            action: 'HUMAN_REVIEW',
          },
        ],
      },
    ],
  });

  console.log('✅ Created workflow templates');

  // Create Agent Instance and Conversation
  const agentInstance = await prisma.agentInstance.create({
    data: {
      profileId: ceoAgent.id,
      state: 'COMPLETED',
      context: {
        taskId: 'demo-task-1',
        sessionStart: new Date(),
      },
    },
  });

  await prisma.agentConversation.create({
    data: {
      agentInstanceId: agentInstance.id,
      organizationId: org.id,
      messages: [
        {
          role: 'user',
          content: 'What are our key priorities for Q1 2024?',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: 'Based on current market analysis, our Q1 2024 priorities should be: 1) Launch new AI analytics product, 2) Expand into European market, 3) Strengthen engineering team by 30%',
          timestamp: new Date(),
        },
      ],
      summary: 'Discussion about Q1 2024 strategic priorities',
      tokensUsed: 250,
    },
  });

  console.log('✅ Created agent conversations');

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        organizationId: org.id,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned: Market Analysis Report',
        message: 'You have been assigned to complete the Market Analysis Report for Q1 2024 Strategic Planning.',
        priority: 'HIGH',
        read: false,
        actionUrl: `/tasks/${strategicProject.id}`,
      },
      {
        userId: adminUser.id,
        organizationId: org.id,
        type: 'WORKFLOW_COMPLETED',
        title: 'Weekly Executive Summary Complete',
        message: 'The weekly executive summary workflow has completed successfully.',
        priority: 'NORMAL',
        read: true,
        readAt: new Date(),
      },
      {
        userId: memberUser.id,
        organizationId: org.id,
        type: 'PROJECT_UPDATED',
        title: 'New Product Launch - Status Updated',
        message: 'The project status has been changed to PLANNING. Review the updated timeline.',
        priority: 'NORMAL',
        read: false,
        actionUrl: `/projects/${productProject.id}`,
      },
      {
        userId: memberUser.id,
        organizationId: org.id,
        type: 'TASK_DUE_SOON',
        title: 'Task Due Tomorrow: Product Requirements Document',
        message: 'The Product Requirements Document task is due tomorrow. Please ensure completion.',
        priority: 'URGENT',
        read: false,
      },
    ],
  });

  console.log('✅ Created notifications');

  // Create Metrics
  const now = new Date();
  await prisma.metric.createMany({
    data: [
      // Project completion metrics
      {
        organizationId: org.id,
        name: 'projects.completed',
        value: 5,
        labels: { period: 'week', department: 'engineering' },
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        organizationId: org.id,
        name: 'projects.completed',
        value: 8,
        labels: { period: 'week', department: 'engineering' },
        timestamp: now,
      },
      // Task velocity
      {
        organizationId: org.id,
        name: 'tasks.velocity',
        value: 23,
        labels: { sprint: 'sprint-12', team: 'alpha' },
        timestamp: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        organizationId: org.id,
        name: 'tasks.velocity',
        value: 28,
        labels: { sprint: 'sprint-13', team: 'alpha' },
        timestamp: now,
      },
      // Agent performance
      {
        organizationId: org.id,
        name: 'agent.response_time_ms',
        value: 1200,
        labels: { agent: 'ceo', model: 'gpt-4' },
        timestamp: now,
      },
      {
        organizationId: org.id,
        name: 'agent.tokens_used',
        value: 2500,
        labels: { agent: 'cfo', workflow: 'executive-summary' },
        timestamp: now,
      },
      // Workflow metrics
      {
        organizationId: org.id,
        name: 'workflow.success_rate',
        value: 0.95,
        labels: { workflow: 'project-kickoff' },
        timestamp: now,
      },
      {
        organizationId: org.id,
        name: 'workflow.avg_duration_seconds',
        value: 45,
        labels: { workflow: 'executive-summary' },
        timestamp: now,
      },
    ],
  });

  console.log('✅ Created metrics');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Organization: ${org.name} (${org.slug})`);
  console.log(`   - Users: 2 (1 admin, 1 member)`);
  console.log(`   - Agents: 4 (CEO, CFO, PM, HR)`);
  console.log(`   - Projects: 2`);
  console.log(`   - Tasks: 4`);
  console.log(`   - Workflows: 2`);
  console.log(`   - Tools: 3 built-in`);
  console.log(`   - Project Templates: 2`);
  console.log(`   - Workflow Templates: 2`);
  console.log(`   - Conversations: 1`);
  console.log(`   - Notifications: 4`);
  console.log(`   - Metrics: 8 data points`);
  console.log('\n💡 You can now use these IDs in your .env:');
  console.log(`   NEXT_PUBLIC_DEFAULT_ORG_ID=${org.id}`);
  console.log(`   NEXT_PUBLIC_DEFAULT_USER_ID=${adminUser.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
