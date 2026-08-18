export function renderLayerToggle(
  container: HTMLElement,
  onToggle: (enabled: boolean) => void | Promise<void>,
): void {
  container.hidden = false;
  container.innerHTML = `
    <label>
      <input type="checkbox" id="heat-toggle" />
      Mostrar mapa de calor
    </label>
  `;
  const input = container.querySelector<HTMLInputElement>('#heat-toggle');
  input?.addEventListener('change', () => {
    void onToggle(Boolean(input.checked));
  });
}
