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
      url: 'http://localhost:4000',
      description: 'Development server',
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
        description: 'Retrieve all tasks for the authenticated user with pagination',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
          },
        ],
        responses: {
          200: {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tasks: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' },
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
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'archived'] },
                  priority: { type: 'integer', minimum: 1, maximum: 5 },
                  deadline: { type: 'string', format: 'date-time' },
                  tags: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
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
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Get a task',
        description: 'Retrieve a single task by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
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
                    task: { $ref: '#/components/schemas/Task' },
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
      put: {
        summary: 'Update a task',
        description: 'Update an existing task',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'integer' },
                  deadline: { type: 'string', format: 'date-time' },
                  tags: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: {
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
      delete: {
        summary: 'Delete a task',
        description: 'Delete a task by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Task deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
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
        description: 'Create a new note',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  pinned: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Note created',
          },
        },
      },
    },
    '/api/notes/search': {
      post: {
        summary: 'Search notes',
        description: 'Full-text search across notes',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Search results',
          },
        },
      },
    },
    '/api/ai/notes/{id}': {
      post: {
        summary: 'Run AI action on note',
        description: 'Process a note with AI (summarize, expand, improve, etc.)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
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
                    enum: ['summarize', 'expand', 'improve', 'translate', 'extract_tasks', 'custom'],
                  },
                  customPrompt: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'AI action completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    aiRun: { $ref: '#/components/schemas/AIRun' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
