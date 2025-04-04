import { invariantResponse } from '@epic-web/invariant'
import { type Route } from './+types/index.ts'
import { connect, getTransport } from './mcp.server.ts'

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	const sessionId = url.searchParams.get('sessionId')
	const transport = await connect(sessionId)
	return transport.handleSSERequest(request)
}

export async function action({ request }: Route.ActionArgs) {
	const url = new URL(request.url)
	const sessionId = url.searchParams.get('sessionId')
	invariantResponse(sessionId, 'No session ID')

	const transport = await getTransport(sessionId)
	invariantResponse(transport, 'No transport', { status: 404 })

	return transport.handlePostMessage(request)
}
