import axios from './axios';

// ===============================
// 🔧 Helpers
// ===============================

// Construye URLs absolutas limpias
function buildUrl(path: string) {
  const baseRaw = (axios.defaults?.baseURL as string) || '';
  const base = baseRaw.replace(/\/+$/, '');
  const baseNoApi = base.replace(/\/api(\/?$)/i, '');
  const cleanPath = path.replace(/^\/+/, '');
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseNoApi}/${cleanPath}`;
}

// Realiza fetch autenticado (usa Token si existe)
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = (options.headers as Record<string, string>) || {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Token ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

// Probar varias rutas candidatas
async function tryPaths(paths: string[], method = 'GET', body?: any, extraHeaders: Record<string, string> = {}) {
  const prefixes = ['', 'api/', 'backups/', 'api/backups/', 'condominio/backups/', 'condominio/api/backups/'];
  const errors: any[] = [];

  for (const prefix of prefixes) {
    for (const p of paths) {
      const candidate = `${prefix}${p}`.replace(/\/+/g, '/');
      const url = buildUrl(candidate);
      try {
        console.log('🔍 Probando candidate URL:', url);
        const opts: RequestInit = { method };
        if (body !== undefined) {
          if (body instanceof FormData) opts.body = body;
          else {
            opts.body = JSON.stringify(body);
            opts.headers = { 'Content-Type': 'application/json', ...extraHeaders };
          }
        } else {
          opts.headers = { ...extraHeaders };
        }
        const data = await fetchWithAuth(url, opts);
        return { data, url };
      } catch (err: any) {
        console.warn(`Fallback: ${url} -> ${err?.status || 'err'}`);
        errors.push({ url, err });
      }
    }
  }

  const aggregate: any = new Error('No se encontró una ruta válida entre las candidatas');
  aggregate.details = errors;
  throw aggregate;
}

// ===============================
// 📦 BACKUPS & RESTORE API
// ===============================

// 🧾 Listar backups
export const listarBackups = async () => {
  try {
    console.log('🔁 API: Solicitando lista de backups...');
    const result = await tryPaths(['backups/listar/', 'backups/listar']);
    console.log('✅ API: Backups obtenidos desde:', result.url);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al obtener backups:', error);
    throw error;
  }
};

// 🧩 Crear backup
export const crearBackup = async (data?: any) => {
  try {
    console.log('🛠️ API: Creando backup...', data || '(sin payload)');
    const result = await tryPaths(['backups/crear/', 'backups/crear'], 'POST', data || {});
    console.log('✅ API: Backup creado desde:', result.url);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al crear backup:', error);
    throw error;
  }
};

// 🔁 Restaurar backup (total o parcial)
export const restaurarBackup = async (
  backup_file: string,
  options: { restore_code?: boolean; restore_db?: boolean } = {}
) => {
  try {
    console.log('♻️ API: Restaurando backup file:', backup_file, options);
    const body = {
      backup_file,
      restore_code: options.restore_code ?? true,
      restore_db: options.restore_db ?? true,
    };
    const result = await tryPaths(['backups/restaurar/', 'backups/restaurar'], 'POST', body);
    console.log('✅ API: Restauración ejecutada desde:', result.url);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al restaurar backup:', error);
    throw error;
  }
};

// 📥 Descargar backup
export const descargarBackup = async (filename: string) => {
  // Nota: el método anterior intentaba construir un Blob desde result.data
  // pero fetchWithAuth devuelve JSON o text por defecto, corrompiendo binarios.
  // Aquí hacemos una petición GET directa y usamos response.blob().
  const prefixes = ['', 'api/', 'backups/', 'api/backups/', 'condominio/backups/', 'condominio/api/backups/'];
  const errors: any[] = [];

  for (const prefix of prefixes) {
    const candidate = `${prefix}backups/download/${filename}`.replace(/\/+/g, '/');
    const url = buildUrl(candidate);
    try {
      console.log('🔍 Probando descarga en URL:', url);
      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) headers['Authorization'] = `Token ${token}`;
      }
        // Preferimos recibir binarios
        headers['Accept'] = 'application/octet-stream, application/zip, */*';
        let res = await fetch(url, { method: 'GET', headers, redirect: 'follow' });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err: any = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        err.body = text;
        throw err;
      }
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      // Si el servidor respondió JSON o HTML (por ejemplo página de login), no aceptamos eso como ZIP
      if (contentType.includes('application/json') || contentType.includes('text/html')) {
        const text = await res.text().catch(() => '');
        throw new Error(`Respuesta no binaria: ${contentType} - ${text.slice(0,200)}`);
      }
      // Si todo bien, obtener blob
      let blob = await res.blob();
        // Intentar extraer filename desde header Content-Disposition
        const contentDisposition = res.headers.get('content-disposition') || '';
        let filenameFromHeader = '';
        const m = /filename\*?=([^;]+)/i.exec(contentDisposition);
        if (m) {
          filenameFromHeader = m[1].trim().replace(/^UTF-8''/, '').replace(/"/g, '');
        }
      // Si el content-type no parece binario, intentar reintento con esquema Bearer (algunos backends esperan 'Bearer')
      if (!contentType || contentType.includes('text') || contentType.includes('json')) {
        // intentar con Bearer si existe token
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          if (token) {
            const headersBearer = { Authorization: `Bearer ${token}` } as Record<string,string>;
            const res2 = await fetch(url, { method: 'GET', headers: headersBearer });
            if (res2.ok) {
              const ct2 = (res2.headers.get('content-type') || '').toLowerCase();
              if (!ct2.includes('application/json') && !ct2.includes('text/html')) {
                blob = await res2.blob();
                const downloadUrl2 = (typeof window !== 'undefined') ? window.URL.createObjectURL(blob) : '';
                  return { blob, url: downloadUrl2, filename: filenameFromHeader };
              }
            }
          }
        }
        throw new Error(`Respuesta con content-type inesperado: ${contentType}`);
      }
        const downloadUrl = (typeof window !== 'undefined') ? window.URL.createObjectURL(blob) : '';
        return { blob, url: downloadUrl, filename: filenameFromHeader };
    } catch (err: any) {
      console.warn(`Fallback descarga: ${url} -> ${err?.status || err?.message || 'err'}`);
      errors.push({ url, err });
    }
  }

  const aggregate: any = new Error('No se pudo descargar el backup desde las rutas candidatas');
  aggregate.details = errors;
  throw aggregate;
};

// 🗑️ Eliminar backup
export const eliminarBackup = async (filename: string) => {
  try {
    console.log('🗑️ API: Eliminando backup:', filename);
    const result = await tryPaths([`backups/delete/${filename}`, `backups/delete/${filename}/`], 'DELETE');
    console.log('✅ API: Backup eliminado desde:', result.url);
    return { data: result.data };
  } catch (error: any) {
    console.error('❌ API: Error al eliminar backup:', error);
    throw error;
  }
};
