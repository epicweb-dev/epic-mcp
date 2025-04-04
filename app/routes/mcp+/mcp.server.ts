import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { searchUsers } from '@prisma/client/sql'
import { z } from 'zod'
import { prisma } from '#app/utils/db.server.ts'
import { getSignedGetRequestInfo } from '#app/utils/storage.server.ts'
import { FetchSSEServerTransport } from './fetch-transport.server.ts'

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

server.tool(
	'Find User',
	'Search for users in the Epic Notes database by their name or username',
	{ query: z.string().describe('The query to search for') },
	async ({ query }) => {
		const like = `%${query ?? ''}%`
		const users = await prisma.$queryRawTyped(searchUsers(like))

		const content: CallToolResult['content'] = []
		for (const user of users) {
			content.push({
				type: 'text',
				text: `${user.name} (${user.username})`,
			})

			if (user.imageObjectKey) {
				content.push({
					type: 'image',
					data: await getUserBase64Image(user.imageObjectKey),
					mimeType: 'image/png',
				})
			}
		}
		if (!content.length) {
			return {
				content: [{ type: 'text', text: 'No users found' }],
			}
		}

		return { content }
	},
)

async function getUserBase64Image(imageObjectKey: string) {
	const { url: signedUrl, headers: signedHeaders } =
		getSignedGetRequestInfo(imageObjectKey)
	const response = await fetch(signedUrl, { headers: signedHeaders })
	const blob = await response.blob()
	const buffer = await blob.arrayBuffer()
	return Buffer.from(buffer).toString('base64')
}

const transports = new Map<string, FetchSSEServerTransport>()

export async function connect(sessionId?: string | null) {
	const transport = new FetchSSEServerTransport('/mcp', sessionId)
	transport.onclose = () => {
		transports.delete(transport.sessionId)
	}
	await server.connect(transport)
	transports.set(transport.sessionId, transport)
	return transport
}

export async function getTransport(sessionId: string) {
	return transports.get(sessionId)
}
