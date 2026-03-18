import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const feedUrl = url.searchParams.get('url');
	if (!feedUrl) {
		return new Response('Missing url parameter', { status: 400 });
	}

	try {
		const res = await fetch(feedUrl, {
			headers: {
				'User-Agent': 'Canvas RSS Reader/1.0'
			}
		});

		if (!res.ok) {
			return new Response(`Failed to fetch feed: ${res.status}`, { status: 502 });
		}

		const text = await res.text();
		return new Response(text, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=300'
			}
		});
	} catch (e) {
		return new Response(`Fetch error: ${(e as Error).message}`, { status: 502 });
	}
};
