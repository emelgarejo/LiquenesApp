export function bindHeatToggle(
  input: HTMLInputElement,
  onToggle: (enabled: boolean) => void | Promise<void>,
): void {
  input.addEventListener('change', () => {
    void onToggle(Boolean(input.checked));
  });
}
