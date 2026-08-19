import { describe, expect, it } from 'vitest';
import { STUDY_PANELS } from '../content/studyPanels';
import { bindInfoPanels } from './infoPanel';

describe('Study info panels', () => {
  it('exposes ficha and investigacion content', () => {
    expect(STUDY_PANELS.ficha.title).toMatch(/Ficha técnica/);
    expect(STUDY_PANELS.ficha.html).toMatch(/Incidencia/);
    expect(STUDY_PANELS.investigacion.title).toMatch(/Investigación/);
    expect(STUDY_PANELS.investigacion.html).toMatch(/tráfico/);
  });

  it('opens the dialog with panel content', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <button type="button" data-panel="ficha">Ficha</button>
      <dialog id="info-panel">
        <h2 id="info-panel-title"></h2>
        <div id="info-panel-body"></div>
        <button type="button" data-close-panel>x</button>
      </dialog>
    `;
    const dialog = root.querySelector('dialog') as HTMLDialogElement & {
      showModal: () => void;
      close: () => void;
      open: boolean;
    };
    dialog.showModal = () => {
      dialog.open = true;
    };
    dialog.close = () => {
      dialog.open = false;
    };
    dialog.open = false;

    bindInfoPanels(root);
    root.querySelector<HTMLButtonElement>('[data-panel="ficha"]')?.click();

    expect(dialog.open).toBe(true);
    expect(root.querySelector('#info-panel-title')?.textContent).toBe(
      'Ficha técnica',
    );
    expect(root.querySelector('#info-panel-body')?.innerHTML).toMatch(
      /Semáforo/,
    );
  });
});
