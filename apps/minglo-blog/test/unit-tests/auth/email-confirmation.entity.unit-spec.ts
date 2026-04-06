import { EmailConfirmationEntity } from '../../../src/modules/user-account/domains';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('EmailConfirmationEntity — доменная логика', () => {
  describe('create()', () => {
    it('генерирует code в формате UUID', () => {
      const ec = EmailConfirmationEntity.create();
      expect(ec.code).toMatch(UUID_REGEX);
    });

    it('устанавливает expiresAt примерно через 1 час', () => {
      const before = new Date();
      const ec = EmailConfirmationEntity.create();
      const after = new Date();

      const tenMinutes = 10 * 60 * 1000;
      expect(ec.expiresAt.getTime()).toBeGreaterThanOrEqual(before.getTime() + tenMinutes - 100);
      expect(ec.expiresAt.getTime()).toBeLessThanOrEqual(after.getTime() + tenMinutes + 100);
    });

    it('confirmedAt не установлен', () => {
      const ec = EmailConfirmationEntity.create();
      expect(ec.confirmedAt).toBeUndefined();
    });
  });

  describe('validate()', () => {
    it('не бросает ошибку если код не истёк', () => {
      const ec = EmailConfirmationEntity.create(); // expiresAt = now + 1h
      expect(() => ec.validate()).not.toThrow();
    });

    it('бросает ошибку если код истёк', () => {
      const ec = EmailConfirmationEntity.reconstitute({
        id: 1,
        code: 'b489bca8-98f3-453f-95cd-1170a018755b',
        expiresAt: new Date(Date.now() - 1000), // в прошлом
        confirmedAt: null,
      });
      expect(() => ec.validate()).toThrow();
    });
  });

  describe('regenerate()', () => {
    it('генерирует новый code отличный от предыдущего', () => {
      const ec = EmailConfirmationEntity.create();
      const oldCode = ec.code;
      ec.regenerate();
      expect(ec.code).not.toBe(oldCode);
      expect(ec.code).toMatch(UUID_REGEX);
    });

    it('обновляет expiresAt', () => {
      const ec = EmailConfirmationEntity.create();
      const oldExpiresAt = ec.expiresAt;
      ec.regenerate();
      expect(ec.expiresAt.getTime()).toBeGreaterThan(oldExpiresAt.getTime() - 100);
    });

    it('принимает кастомное количество часов', () => {
      const ec = EmailConfirmationEntity.create();
      const before = new Date();
      ec.regenerate(2);
      const twoHoursMs = 2 * 60 * 60 * 1000;
      expect(ec.expiresAt.getTime()).toBeGreaterThanOrEqual(before.getTime() + twoHoursMs - 100);
    });
  });

  describe('confirm()', () => {
    it('устанавливает confirmedAt текущим временем', () => {
      const ec = EmailConfirmationEntity.create();
      const before = new Date();
      ec.confirm();
      const after = new Date();
      expect(ec.confirmedAt).toBeDefined();
      expect(ec.confirmedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(ec.confirmedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
