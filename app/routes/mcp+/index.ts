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
	if (!sessionId) {
		return new Response('No session ID', { status: 400 })
	}
	const transport = await getTransport(sessionId)
	if (!transport) {
		return new Response('Not found', { status: 404 })
	}
	return transport.handlePostMessage(request)
}
