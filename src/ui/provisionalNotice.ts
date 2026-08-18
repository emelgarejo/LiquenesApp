export function renderProvisionalNotice(
  container: HTMLElement,
  status = 'provisional',
): void {
  container.innerHTML = `<span class="provisional-badge">${escapeHtml(status)} dataset</span>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
