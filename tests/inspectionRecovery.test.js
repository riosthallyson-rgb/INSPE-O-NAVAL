import { createInspectionDraft } from '../src/domain/inspection/inspectionModel';
import { migratePersistedState } from '../src/domain/persistedState';

describe('recuperação da inspeção assistida', () => {
  test('recupera cenário e embarcação após reinício', () => {
    const draft = createInspectionDraft({ inspector: { name: 'Ana' }, now: new Date('2026-08-08T12:00:00.000Z') });
    draft.currentStep = 3;
    draft.context.vesselOperationalState = 'Navegando';
    draft.context.operationOrigin = 'Fiscalização de rotina';
    draft.vessel.name = 'NANA';
    draft.vessel.tie = '123456';
    const restored = migratePersistedState({ profile: { name: 'Ana' }, currentInspection: JSON.parse(JSON.stringify(draft)), history: [], vessels: [] });
    expect(restored.currentInspection.currentStep).toBe(3);
    expect(restored.currentInspection.context.vesselOperationalState).toBe('Navegando');
    expect(restored.currentInspection.vessel).toMatchObject({ name: 'NANA', tie: '123456' });
  });
});
