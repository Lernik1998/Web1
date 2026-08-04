import DOMPurify from 'dompurify'

// Si WordPress alguna vez sirve un enlace con target="_blank" (DOMPurify lo
// quita por defecto salvo que se permita explícitamente), forzamos
// rel="noopener noreferrer" para evitar "reverse tabnabbing".
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target')) {
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

/**
 * Sanitiza HTML antes de inyectarlo con `v-html`. Todo el contenido que
 * mostramos así viene de la API de WordPress: si esa web se viera
 * comprometida (plugin vulnerable, cuenta de administrador robada, etc.),
 * un `<script>` o un `onerror=` colado en el contenido se ejecutaría en el
 * navegador de cualquier visitante de esta SPA. Esta es la única barrera
 * entre ese contenido remoto y el DOM real.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
}
