import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initTestSettings } from '../helpers/init-test-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { AuthTestManager } from '../managers';
import { PAYMENT_SERVICE } from '@app/payments';
import request from 'supertest';
import { of } from 'rxjs';
import { RecaptchaService } from '../../src/modules/user-account/application/services/recaptcha.service';
import {
  GetSubscriptionPlansViewDto,
  PaymentHistoryViewDto,
  SubscriptionInfoViewDto,
} from '@app/payments/view-dto';

const PLAN_STUB: GetSubscriptionPlansViewDto = {
  data: [
    {
      id: 'plan-1',
      name: '1 Month',
      durationDays: 30,
      price: '10.00',
      currency: 'USD',
    },
  ],
};

const HISTORY_STUB: PaymentHistoryViewDto = {
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 10,
  pagesCount: 0,
};

const SUBSCRIPTION_INFO_STUB: SubscriptionInfoViewDto = {
  expiresAt: null,
  nextPaymentDate: null,
  subscriptions: [],
};

const CHECKOUT_URL_STUB = { checkoutUrl: 'https://stripe.com/checkout/test-session' };

const paymentClientMock = {
  send: jest.fn(),
};

describe('Billing API (e2e)', () => {
  let app: INestApplication<App>;
  let httpServer: App;
  let authManager: AuthTestManager;

  beforeAll(async () => {
    const result = await initTestSettings((builder) => {
      builder.overrideProvider(PAYMENT_SERVICE).useValue(paymentClientMock);
    });
    app = result.app;
    httpServer = result.httpServer;
    authManager = result.authTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    jest.clearAllMocks();
    const recaptchaService = app.get(RecaptchaService);
    jest.spyOn(recaptchaService, 'validate').mockResolvedValue(true);
    paymentClientMock.send.mockReturnValue(of(null));
  });

  async function getAccessToken(): Promise<string> {
    const { accessToken } = await authManager.setupUser();
    return accessToken;
  }

  describe('GET /api/v1/billing/plans', () => {
    it('200 — returns subscription plans without authentication', async () => {
      paymentClientMock.send.mockReturnValueOnce(of(PLAN_STUB));

      const { body } = await request(httpServer).get('/api/v1/billing/plans').expect(HttpStatus.OK);

      expect(body).toMatchObject({ data: expect.any(Array) });
      expect(body.data).toHaveLength(1);
      expect(body.data[0]).toMatchObject({
        id: 'plan-1',
        name: '1 Month',
        durationDays: 30,
        price: '10.00',
        currency: 'USD',
      });
    });
  });

  describe('POST /api/v1/billing/checkout/stripe', () => {
    it('201 — authenticated user with valid planId receives checkout URL', async () => {
      const token = await getAccessToken();
      paymentClientMock.send.mockReturnValueOnce(of(CHECKOUT_URL_STUB));

      const { body } = await request(httpServer)
        .post('/api/v1/billing/checkout/stripe')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: 'plan-1' })
        .expect(HttpStatus.CREATED);

      expect(body).toMatchObject({ checkoutUrl: expect.any(String) });
    });

    it('401 — unauthenticated request is rejected', async () => {
      await request(httpServer)
        .post('/api/v1/billing/checkout/stripe')
        .send({ planId: 'plan-1' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('400 — missing planId in body', async () => {
      const token = await getAccessToken();

      await request(httpServer)
        .post('/api/v1/billing/checkout/stripe')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('400 — empty string planId is rejected', async () => {
      const token = await getAccessToken();

      await request(httpServer)
        .post('/api/v1/billing/checkout/stripe')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: '' })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/v1/billing/history', () => {
    it('200 — authenticated user gets payment history with default pagination', async () => {
      const token = await getAccessToken();
      paymentClientMock.send.mockReturnValueOnce(of(HISTORY_STUB));

      const { body } = await request(httpServer)
        .get('/api/v1/billing/history')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(body).toMatchObject({
        items: expect.any(Array),
        totalCount: expect.any(Number),
        page: 1,
        pageSize: 10,
        pagesCount: expect.any(Number),
      });
    });

    it('200 — authenticated user gets history with custom page and pageSize', async () => {
      const token = await getAccessToken();
      const customStub: PaymentHistoryViewDto = { ...HISTORY_STUB, page: 2, pageSize: 5 };
      paymentClientMock.send.mockReturnValueOnce(of(customStub));

      const { body } = await request(httpServer)
        .get('/api/v1/billing/history')
        .query({ page: 2, pageSize: 5 })
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(body).toMatchObject({ page: 2, pageSize: 5 });
    });

    it('401 — unauthenticated request is rejected', async () => {
      await request(httpServer).get('/api/v1/billing/history').expect(HttpStatus.UNAUTHORIZED);
    });

    it('400 — non-integer page query param is rejected', async () => {
      const token = await getAccessToken();

      await request(httpServer)
        .get('/api/v1/billing/history')
        .query({ page: 'abc' })
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('400 — non-integer pageSize query param is rejected', async () => {
      const token = await getAccessToken();

      await request(httpServer)
        .get('/api/v1/billing/history')
        .query({ pageSize: 'xyz' })
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/v1/billing/current', () => {
    it('200 — authenticated user gets current subscription info with accountType', async () => {
      const token = await getAccessToken();
      paymentClientMock.send.mockReturnValueOnce(of(SUBSCRIPTION_INFO_STUB));

      const { body } = await request(httpServer)
        .get('/api/v1/billing/current')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(body).toMatchObject({
        accountType: expect.any(String),
        expiresAt: null,
        nextPaymentDate: null,
        subscriptions: expect.any(Array),
      });
    });

    it('401 — unauthenticated request is rejected', async () => {
      await request(httpServer).get('/api/v1/billing/current').expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /api/v1/billing/auto-renewal', () => {
    it('204 — authenticated user enables auto-renewal', async () => {
      const token = await getAccessToken();
      paymentClientMock.send.mockReturnValueOnce(of(null));

      await request(httpServer)
        .patch('/api/v1/billing/auto-renewal')
        .set('Authorization', `Bearer ${token}`)
        .send({ autoRenewal: true })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('204 — authenticated user disables auto-renewal', async () => {
      const token = await getAccessToken();
      paymentClientMock.send.mockReturnValueOnce(of(null));

      await request(httpServer)
        .patch('/api/v1/billing/auto-renewal')
        .set('Authorization', `Bearer ${token}`)
        .send({ autoRenewal: false })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('401 — unauthenticated request is rejected', async () => {
      await request(httpServer)
        .patch('/api/v1/billing/auto-renewal')
        .send({ autoRenewal: true })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('400 — missing autoRenewal field', async () => {
      const token = await getAccessToken();

      await request(httpServer)
        .patch('/api/v1/billing/auto-renewal')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('400 — extra unknown fields are rejected (forbidNonWhitelisted)', async () => {
      const token = await getAccessToken();

      await request(httpServer)
        .patch('/api/v1/billing/auto-renewal')
        .set('Authorization', `Bearer ${token}`)
        .send({ autoRenewal: true, unknownField: 'value' })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
