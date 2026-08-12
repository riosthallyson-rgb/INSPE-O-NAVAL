import { applyVesselSeal, authorizeSealRemoval, createVesselCustody, recordVesselRelease, transitionVesselCustody } from '../src/domain/administrative/vesselCustody';

const source = { sourceId: 'normam-301', sourceVersion: '2026', section: '3.8.1', page: 30 };

describe('custódia administrativa da embarcação', () => {
  test('preserva apreensão ao registrar regularização e liberação', () => {
    let custody = createVesselCustody({ inspectionId: 'i-1', apprehensionProcedureId: 'p-1', userId: 'u-1', source, occurredAt: '2026-08-08T14:32:00Z' });
    custody = transitionVesselCustody(custody, { state: 'REGULARIZATION_REVIEW', type: 'REGULARIZATION_PRESENTED', userId: 'u-1', occurredAt: '2026-08-10T09:14:00Z' });
    custody = applyVesselSeal(custody, { sealNumber: '003927', userId: 'u-1', occurredAt: '2026-08-10T09:30:00Z' });
    custody = authorizeSealRemoval(custody, { authorizedBy: 'autoridade-1', reason: 'Regularização conferida', occurredAt: '2026-08-10T11:03:00Z' });
    custody = recordVesselRelease(custody, { userId: 'u-1', occurredAt: '2026-08-10T11:40:00Z' });
    expect(custody.state).toBe('RELEASED');
    expect(custody.history.map((event) => event.type)).toEqual(['APPREHENSION_CONFIRMED', 'REGULARIZATION_PRESENTED', 'SEAL_APPLIED', 'SEAL_REMOVAL_AUTHORIZED', 'VESSEL_RELEASED']);
  });

  test('recusa número de lacre duplicado na base local', () => {
    const first = applyVesselSeal(createVesselCustody({ inspectionId: 'i-1', apprehensionProcedureId: 'p-1', source }), { sealNumber: 'ABC-1' });
    const second = createVesselCustody({ inspectionId: 'i-2', apprehensionProcedureId: 'p-2', source });
    expect(() => applyVesselSeal(second, { sealNumber: 'abc-1', existingCustodies: [first] })).toThrow('já está registrado');
  });
});

