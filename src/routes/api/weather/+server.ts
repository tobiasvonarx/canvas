import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const location = url.searchParams.get('location');
	if (!location) {
		return new Response('Missing location parameter', { status: 400 });
	}

	try {
		const res = await fetch(
			`https://wttr.in/${encodeURIComponent(location)}?format=j1`,
			{
				headers: {
					'User-Agent': 'Canvas Weather Widget/1.0'
				}
			}
		);

		if (!res.ok) {
			return new Response(`Failed to fetch weather: ${res.status}`, { status: 502 });
		}

		const data = await res.text();
		return new Response(data, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=600'
			}
		});
	} catch (e) {
		return new Response(`Fetch error: ${(e as Error).message}`, { status: 502 });
	}
};
