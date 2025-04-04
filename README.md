# Epic MCP

An [Epic Stack](https://github.com/epicweb-dev/epic-stack) example adding
support for the Model Context Protocol (MCP).

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how
applications provide context to Large Language Models (LLMs). Think of MCP like
a USB-C port for AI applications - it provides a standardized way to connect AI
models to different data sources and tools.

Learn more from the
[MCP Documentation](https://modelcontextprotocol.io/introduction)

## Example Implementation

This repository demonstrates how to integrate MCP into an Epic Stack
application. The implementation includes:

1. Server-side MCP setup for handling client connections
2. SSE (Server-Sent Events) transport layer for real-time communication
3. Example tool implementations showing how to expose functionality to LLMs

### Key Components

#### 1. MCP Server Setup (`app/routes/mcp+/mcp.server.ts`)

```ts
export const server = new McpServer(
	{
		name: 'epic-mcp-a25d',
		version: '1.0.0',
	},
	{
		capabilities: {
			tools: {},
		},
	},
)
```

The MCP server is the core component that handles tool registration and
execution. It's configured with a unique name and version, and defines the
capabilities it provides.

#### 2. Tool Implementation

```ts
server.tool(
	'Find User',
	'Search for users in the Epic Notes database by their name or username',
	{ query: z.string().describe('The query to search for') },
	async ({ query }) => {
		// Implementation...
	},
)
```

Tools are the primary way to expose functionality to LLMs. Each tool:

- Has a descriptive name and purpose
- Uses Zod for type-safe parameter validation
- Can return multiple content types (text, images, etc.)
- Integrates with your existing application logic

#### 3. Transport Layer (`app/routes/mcp+/fetch-transport.server.ts`)

The transport layer handles the bi-directional communication between the MCP
client and server:

- Uses Server-Sent Events (SSE) for real-time server-to-client communication
- Handles POST requests for client-to-server messages
- Maintains session state for multiple concurrent connections

#### 4. Route Integration (`app/routes/mcp+/index.ts`)

```ts
export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	const sessionId = url.searchParams.get('sessionId')
	const transport = await connect(sessionId)
	return transport.handleSSERequest(request)
}
```

The Remix route:

- Establishes SSE connections for real-time communication
- Handles incoming tool requests via POST endpoints
- Manages session state for multiple clients

### Learning Points

1. **Tool Design**: When designing tools for LLMs:

   - Provide clear, descriptive names and purposes
   - Use strong type validation for parameters
   - Return structured responses that LLMs can understand
   - Consider supporting multiple content types (text, images, etc.)

2. **State Management**: The implementation demonstrates:

   - Session-based connection tracking
   - Clean connection cleanup on client disconnect
   - Safe concurrent client handling

3. **Integration Patterns**: Learn how to:

   - Connect MCP with existing application logic
   - Handle real-time communication in Remix
   - Structure your MCP implementation for maintainability

4. **Security Considerations**:
   - Session-based access control
   - Safe handling of client connections
   - Proper cleanup of resources
