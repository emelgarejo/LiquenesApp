export type StatusKind = 'empty' | 'error' | 'config' | 'data';

export function showStatus(
  container: HTMLElement,
  kind: StatusKind,
  title: string,
  message: string,
): void {
  container.className = `status visible ${kind === 'empty' ? 'empty' : 'error'}`;
  container.innerHTML = `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p>`;
}

export function hideStatus(container: HTMLElement): void {
  container.className = 'status';
  container.innerHTML = '';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
