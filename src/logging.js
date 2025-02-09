export function logAPIRequest(url, method, body = {}) {
    console.log(`API Call: ${method} ${url}`, body);
}
