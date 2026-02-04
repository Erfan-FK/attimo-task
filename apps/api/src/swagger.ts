export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Attimo API',
    version: '1.0.0',
    description: 'REST API for tasks and notes management with AI enhancement',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://attimo-note-ai-production.up.railway.app'
        : 'http://localhost:4000',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your Supabase access token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'archived'] },
          priority: { type: 'integer', minimum: 1, maximum: 5 },
          deadline: { type: 'string', format: 'date-time', nullable: true },
          tags: { type: 'array', items: { type: 'string' } },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Note: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          pinned: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      AIRun: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          note_id: { type: 'string', format: 'uuid' },
          action: {
            type: 'string',
            enum: ['summarize', 'expand', 'improve', 'translate', 'extract_tasks', 'custom'],
          },
          output: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Check if the API is running',
        security: [],
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tasks': {
      get: {
        summary: 'Get all tasks',
        description: 'Retrieve all tasks for the authenticated user with search, filters, sorting, and pagination',
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Search query for title/description (case-insensitive)',
            schema: { type: 'string' },
            example: 'meeting',
          },
          {
            name: 'status',
            in: 'query',
            description: 'Filter by status',
            schema: { type: 'string', enum: ['todo', 'in_progress', 'done', 'archived'] },
          },
          {
            name: 'priority',
            in: 'query',
            description: 'Filter by priority (1-5)',
            schema: { type: 'integer', minimum: 1, maximum: 5 },
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Sort order',
            schema: {
              type: 'string',
              enum: ['created_desc', 'created_asc', 'deadline_asc', 'deadline_desc', 'priority_desc', 'priority_asc'],
              default: 'created_desc',
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of results per page',
            schema: { type: 'integer', default: 20, maximum: 100 },
          },
          {
            name: 'offset',
            in: 'query',
            description: 'Number of results to skip',
            schema: { type: 'integer', default: 0, minimum: 0 },
          },
        ],
        responses: {
          200: {
            description: 'List of tasks with pagination and filters',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        tasks: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Task' },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            limit: { type: 'integer' },
                            offset: { type: 'integer' },
                            total: { type: 'integer' },
                            hasMore: { type: 'boolean' },
                          },
                        },
                        filters: {
                          type: 'object',
                          properties: {
                            q: { type: 'string', nullable: true },
                            status: { type: 'string', nullable: true },
                            priority: { type: 'integer', nullable: true },
                            sort: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a task',
        description: 'Create a new task for the authenticated user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', minLength: 1, maxLength: 255, example: 'Complete project documentation' },
                  description: { type: 'string', example: 'Write comprehensive API docs and README' },
                  status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'archived'], default: 'todo' },
                  priority: { type: 'integer', minimum: 1, maximum: 5, default: 2, example: 3 },
                  deadline: { type: 'string', format: 'date-time', nullable: true, example: '2024-12-31T23:59:59Z' },
                  tags: { type: 'array', items: { type: 'string' }, default: [], example: ['documentation', 'urgent'] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        task: { $ref: '#/components/schemas/Task' },
                      },
                    },
                    message: { type: 'string', example: 'Task created successfully' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Get a task',
        description: 'Retrieve a single task by ID. Task must belong to the authenticated user.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Task ID',
          },
        ],
        responses: {
          200: {
            description: 'Task details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        task: { $ref: '#/components/schemas/Task' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Task not found or does not belong to user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update a task',
        description: 'Partially update an existing task. Only provided fields will be updated.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Task ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', minLength: 1, maxLength: 255 },
                  description: { type: 'string', nullable: true },
                  status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'archived'] },
                  priority: { type: 'integer', minimum: 1, maximum: 5 },
                  deadline: { type: 'string', format: 'date-time', nullable: true },
                  tags: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        task: { $ref: '#/components/schemas/Task' },
                      },
                    },
                    message: { type: 'string', example: 'Task updated successfully' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a task',
        description: 'Delete a task by ID. Task must belong to the authenticated user.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Task ID',
          },
        ],
        responses: {
          200: {
            description: 'Task deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task deleted successfully' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Task not found or does not belong to user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/notes': {
      get: {
        summary: 'Get all notes',
        description: 'Retrieve all notes for the authenticated user',
        responses: {
          200: {
            description: 'List of notes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    notes: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Note' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a note',
        description: 'Create a new note for the authenticated user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string', minLength: 1, maxLength: 255, example: 'Project Ideas' },
                  content: { type: 'string', minLength: 1, example: 'List of ideas for the new project...' },
                  tags: { type: 'array', items: { type: 'string' }, default: [], example: ['work', 'ideas'] },
                  pinned: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Note created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        note: { $ref: '#/components/schemas/Note' },
                      },
                    },
                    message: { type: 'string', example: 'Note created successfully' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/notes/{id}': {
      get: {
        summary: 'Get a note',
        description: 'Retrieve a single note by ID. Note must belong to the authenticated user.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Note ID',
          },
        ],
        responses: {
          200: {
            description: 'Note details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        note: { $ref: '#/components/schemas/Note' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Note not found or does not belong to user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update a note',
        description: 'Partially update an existing note. Only provided fields will be updated.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Note ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', minLength: 1, maxLength: 255 },
                  content: { type: 'string', minLength: 1 },
                  tags: { type: 'array', items: { type: 'string' } },
                  pinned: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Note updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        note: { $ref: '#/components/schemas/Note' },
                      },
                    },
                    message: { type: 'string', example: 'Note updated successfully' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Note not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a note',
        description: 'Delete a note by ID. Note must belong to the authenticated user.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Note ID',
          },
        ],
        responses: {
          200: {
            description: 'Note deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Note deleted successfully' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Note not found or does not belong to user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/notes/{id}/ai': {
      post: {
        summary: 'Run AI action on note',
        description: 'Process a note with AI (summarize, improve, extract_tasks)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Note ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: {
                    type: 'string',
                    enum: ['summarize', 'improve', 'extract_tasks'],
                    example: 'summarize',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'AI action completed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        aiRun: { $ref: '#/components/schemas/AIRun' },
                      },
                    },
                    message: { type: 'string', example: 'AI action completed successfully' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or empty note content',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Note not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/notes/{id}/ai-history': {
      get: {
        summary: 'Get AI history for a note',
        description: 'Retrieve the last 5 AI operations performed on this note',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Note ID',
          },
        ],
        responses: {
          200: {
            description: 'AI history retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        aiRuns: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/AIRun' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Note not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/profile': {
      get: {
        summary: 'Get user profile',
        description: 'Retrieve the authenticated user\'s profile information',
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        profile: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            user_id: { type: 'string', format: 'uuid' },
                            full_name: { type: 'string', nullable: true },
                            theme: { type: 'string', enum: ['light', 'dark', 'system'], nullable: true },
                            created_at: { type: 'string', format: 'date-time' },
                            updated_at: { type: 'string', format: 'date-time' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update user profile',
        description: 'Update the authenticated user\'s profile information',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string', minLength: 1, maxLength: 255, example: 'John Doe' },
                  theme: { type: 'string', enum: ['light', 'dark', 'system'], example: 'dark' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        profile: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            user_id: { type: 'string', format: 'uuid' },
                            full_name: { type: 'string', nullable: true },
                            theme: { type: 'string', enum: ['light', 'dark', 'system'], nullable: true },
                            created_at: { type: 'string', format: 'date-time' },
                            updated_at: { type: 'string', format: 'date-time' },
                          },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Profile updated successfully' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};
