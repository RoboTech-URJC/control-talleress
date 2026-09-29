// Keep links relative to the deployed app (including GitHub Pages subpaths).
export function normalizeResourceUrl(value) {
  const input = String(value || '').trim();
  if (!input) throw new Error('Introduce la ruta del archivo o un enlace.');
  if (/^https?:\/\//i.test(input)) {
    const parsed = new URL(input);
    if (!parsed.hostname) throw new Error('Enlace inválido.');
    return parsed.href;
  }
  let path = input.replace(/^\.\//, '');
  if (!path.startsWith('archivos/')) throw new Error('Usa una ruta como archivos/documento.pdf o un enlace https://.');
  const parts = path.split('/');
  if (parts.length < 2) throw new Error('Indica el nombre del archivo.');
  return parts.map(part => {
    let decoded;
    try { decoded = decodeURIComponent(part); } catch { throw new Error('La ruta contiene un porcentaje inválido.'); }
    if (!decoded || decoded === '.' || decoded === '..' || /[\\/\u0000-\u001f]/.test(decoded)) throw new Error('Ruta de archivo inválida.');
    return encodeURIComponent(decoded);
  }).join('/');
}
export function safeResourceUrl(value) {
  try { return normalizeResourceUrl(value); } catch { return ''; }
}
export function fileNameFromUrl(value) {
  const url = normalizeResourceUrl(value);
  const pathname = /^https?:/i.test(url) ? new URL(url).pathname : url;
  try { return decodeURIComponent(pathname.split('/').at(-1)); } catch { return pathname.split('/').at(-1); }
}
