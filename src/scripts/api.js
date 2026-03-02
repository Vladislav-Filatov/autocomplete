const baseURL = 'https://api.github.com';
export async function apiSend(q) {
    const url = new URL(`${baseURL}/search/repositories`);
    url.searchParams.set('q', q);

    const res = await fetch(url, {
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
        }
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`${res.status}`);
    }
    
    return data;
}