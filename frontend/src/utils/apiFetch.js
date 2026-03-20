export async function apiFetch(endpoint, { delay = 0, ...options } = {}) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));

    const response = await fetch(endpoint, options);

    if (!response.ok) {
        const error = new Error(`Request failed: ${response.statusText}`);
        error.status = response.status;
        try {
            error.info = await response.json();
        } catch {
            error.info = { message: "Could not parse error response" };
        }
        throw error;
    }

    return response.json();
}