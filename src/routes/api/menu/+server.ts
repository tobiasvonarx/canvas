import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const menuUrl = url.searchParams.get('url');
	if (!menuUrl) {
		return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const res = await fetch(menuUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; Canvas Menu Widget/1.0)',
				Accept: 'text/html, application/json, text/plain, */*'
			}
		});

		if (!res.ok) {
			return new Response(
				JSON.stringify({ error: `Failed to fetch: ${res.status}` }),
				{ status: 502, headers: { 'Content-Type': 'application/json' } }
			);
		}

		const contentType = res.headers.get('content-type') || '';
		const text = await res.text();

		// If it's JSON, return as-is
		if (contentType.includes('application/json')) {
			return new Response(JSON.stringify({ type: 'json', data: JSON.parse(text) }), {
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=1800'
				}
			});
		}

		// For HTML, strip tags and extract readable text
		const stripped = stripHtml(text);

		return new Response(JSON.stringify({ type: 'html', text: stripped }), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=1800'
			}
		});
	} catch (e) {
		return new Response(
			JSON.stringify({ error: `Fetch error: ${(e as Error).message}` }),
			{ status: 502, headers: { 'Content-Type': 'application/json' } }
		);
	}
};

function stripHtml(html: string): string {
	// Remove script and style blocks
	let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
	text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
	text = text.replace(/<nav[\s\S]*?<\/nav>/gi, '');
	text = text.replace(/<header[\s\S]*?<\/header>/gi, '');
	text = text.replace(/<footer[\s\S]*?<\/footer>/gi, '');

	// Replace common block elements with newlines
	text = text.replace(/<\/(div|p|li|tr|h[1-6]|section|article)>/gi, '\n');
	text = text.replace(/<(br|hr)\s*\/?>/gi, '\n');
	text = text.replace(/<li[^>]*>/gi, '- ');

	// Strip remaining tags
	text = text.replace(/<[^>]+>/g, ' ');

	// Decode common HTML entities
	text = text.replace(/&amp;/g, '&');
	text = text.replace(/&lt;/g, '<');
	text = text.replace(/&gt;/g, '>');
	text = text.replace(/&quot;/g, '"');
	text = text.replace(/&#39;/g, "'");
	text = text.replace(/&nbsp;/g, ' ');
	text = text.replace(/&ndash;/g, '–');
	text = text.replace(/&mdash;/g, '—');

	// Clean up whitespace
	text = text.replace(/[ \t]+/g, ' ');
	text = text.replace(/\n[ \t]+/g, '\n');
	text = text.replace(/\n{3,}/g, '\n\n');
	text = text.trim();

	// Limit to first ~4000 chars to keep response small
	if (text.length > 4000) {
		text = text.substring(0, 4000) + '...';
	}

	return text;
}
