import {
  STUDY_PANELS,
  type StudyPanelId,
} from '../content/studyPanels';

export function bindInfoPanels(root: HTMLElement): void {
  const dialog = root.querySelector<HTMLDialogElement>('#info-panel');
  const titleEl = root.querySelector<HTMLElement>('#info-panel-title');
  const bodyEl = root.querySelector<HTMLElement>('#info-panel-body');
  if (!dialog || !titleEl || !bodyEl) {
    throw new Error('Missing info panel elements');
  }

  const openPanel = (id: StudyPanelId) => {
    const panel = STUDY_PANELS[id];
    titleEl.textContent = panel.title;
    bodyEl.innerHTML = panel.html;
    if (!dialog.open) {
      dialog.showModal();
    }
  };

  root.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.panel as StudyPanelId | undefined;
      if (id === 'ficha' || id === 'investigacion') {
        openPanel(id);
      }
    });
  });

  root.querySelectorAll<HTMLElement>('[data-close-panel]').forEach((el) => {
    el.addEventListener('click', () => dialog.close());
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
}
