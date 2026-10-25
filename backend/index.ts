import { router, json, error, db, requireAuth, withScopes, secrets } from '@appdeploy/sdk';

type EnquiryRecord = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  privacyAccepted: boolean;
  status: string;
  createdAt: string;
};

type OrderRecord = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  targetRole: string;
  targetMarket: string;
  message: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  paymentStatus: string;
  status: string;
  createdAt: string;
  statusUpdatedAt?: string;
  statusHistory?: Array<{ status: string; at: string; actor: string }>;
};

const serviceLabels: Record<string, string> = {
  'resume-writing': 'Résumé & CV writing',
  'executive-resume': 'Executive résumé',
  'cover-letter': 'Cover letter',
  'linkedin-optimization': 'LinkedIn profile content',
  'professional-biography': 'Professional biography',
  'resume-editing': 'Résumé editing',
  'interview-preparation': 'Interview preparation',
};

function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function makeReference(prefix: string): string {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return (
    prefix +
    '-' +
    new Date().toISOString().slice(0, 10).replace(/-/g, '') +
    '-' +
    part
  );
}

function requireValidRequest(body: unknown) {
  if (!body || typeof body !== 'object')
    return { error: 'Please submit a valid form.' };
  const value = body as Record<string, unknown>;
  const name = cleanText(value.name, 120);
  const email = cleanText(value.email, 254).toLowerCase();
  const service = cleanText(value.service, 80);
  const message = cleanText(value.message, 4000);
  if (name.length < 2) return { error: 'Please provide your name.' };
  if (!validEmail(email))
    return { error: 'Please provide a valid email address.' };
  if (!serviceLabels[service])
    return { error: 'Please choose a valid service.' };
  if (message.length < 5)
    return { error: 'Please add a short description of your request.' };
  if (value.privacyAccepted !== true)
    return { error: 'Privacy acknowledgement is required.' };
  return { value, name, email, service, message };
}

async function isAuthorizedAdmin(email?: string): Promise<boolean> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return false;
  try {
    const names = await secrets.listSecretNames();
    if (!names.includes('ADMIN_EMAIL_ALLOWLIST')) return false;
    const configured = await secrets.readSecret('ADMIN_EMAIL_ALLOWLIST');
    const allowlist = configured
      .split(/[,;\s]+/)
      .map(value => value.trim().toLowerCase())
      .filter(Boolean);
    return allowlist.includes(normalizedEmail);
  } catch (err) {
    console.error('Admin allowlist configuration could not be read');
    return false;
  }
}

const allowedStatusTransitions: Record<string, string[]> = {
  awaiting_scope_confirmation: ['received', 'awaiting_client_information', 'on_hold', 'cancelled'],
  received: ['awaiting_client_information', 'in_progress', 'on_hold', 'cancelled'],
  awaiting_client_information: ['received', 'in_progress', 'on_hold', 'cancelled'],
  in_progress: ['awaiting_internal_review', 'ready_for_client_review', 'on_hold', 'cancelled'],
  awaiting_internal_review: ['in_progress', 'ready_for_client_review', 'on_hold'],
  ready_for_client_review: ['revision_requested', 'completed', 'in_progress'],
  revision_requested: ['revision_in_progress', 'on_hold'],
  revision_in_progress: ['ready_for_client_review', 'in_progress', 'on_hold'],
  on_hold: ['received', 'awaiting_client_information', 'in_progress', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const handler = router({
  'GET /api/_healthcheck': [
    async () => json({ message: 'Success', app: 'Ascendant Career Services' }),
  ],

  'GET /api/services': [
    async () =>
      json({
        items: Object.entries(serviceLabels).map(([slug, title]) => ({
          slug,
          title,
        })),
        pricingStatus: 'approval_required',
        checkoutEnabled: false,
      }),
  ],

  'POST /api/enquiries': [
    async ({ body }) => {
      const parsed = requireValidRequest(body);
      if ('error' in parsed) return error(parsed.error, 400);
      const value = parsed.value as Record<string, unknown>;
      const id = 'enq_' + makeReference('ID').toLowerCase();
      const reference = makeReference('ACS');
      const record: EnquiryRecord = {
        id,
        reference,
        name: parsed.name,
        email: parsed.email,
        phone: cleanText(value.phone, 40),
        service: parsed.service,
        message: parsed.message,
        privacyAccepted: true,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      try {
        const [storedId] = await db.add('career_enquiries', [
          record as unknown as Record<string, unknown>,
        ]);
        if (!storedId)
          return error(
            'We could not save this enquiry. Please try again.',
            503
          );
        return json({ ok: true, reference, status: record.status }, 201);
      } catch (err) {
        console.error('Enquiry persistence failed', err);
        return error(
          'We could not save this enquiry. Please try again later.',
          503
        );
      }
    },
  ],

  'POST /api/orders': [
    async ({ body }) => {
      const parsed = requireValidRequest(body);
      if ('error' in parsed) return error(parsed.error, 400);
      const value = parsed.value as Record<string, unknown>;
      if (value.termsAccepted !== true)
        return error('Service terms acknowledgement is required.', 400);
      const id = 'ord_' + makeReference('ID').toLowerCase();
      const reference = makeReference('ACS-REQ');
      const record: OrderRecord = {
        id,
        reference,
        name: parsed.name,
        email: parsed.email,
        phone: cleanText(value.phone, 40),
        service: parsed.service,
        targetRole: cleanText(value.targetRole, 160),
        targetMarket: cleanText(value.targetMarket, 120),
        message: parsed.message,
        termsAccepted: true,
        privacyAccepted: true,
        paymentStatus: 'not_configured',
        status: 'awaiting_scope_confirmation',
        createdAt: new Date().toISOString(),
        statusHistory: [{ status: 'awaiting_scope_confirmation', at: new Date().toISOString(), actor: 'system' }],
      };
      try {
        const [storedId] = await db.add('career_order_requests', [
          record as unknown as Record<string, unknown>,
        ]);
        if (!storedId)
          return error(
            'We could not save this request. Please try again.',
            503
          );
        return json(
          {
            ok: true,
            reference,
            status: record.status,
            paymentStatus: record.paymentStatus,
            message:
              'Request saved. Price, deliverables and terms must be confirmed before payment.',
          },
          201
        );
      } catch (err) {
        console.error('Order request persistence failed', err);
        return error(
          'We could not save this request. Please try again later.',
          503
        );
      }
    },
  ],

  'GET /api/client/orders': [
    requireAuth(),
    withScopes('email'),
    async ({ user }) => {
      const email = user?.email?.trim().toLowerCase();
      if (!email) return error('An authenticated email address is required.', 403);
      try {
        const result = await db.list<OrderRecord>('career_order_requests', { limit: 100 });
        const items = result.items
          .filter(item => item.email?.trim().toLowerCase() === email)
          .map(item => ({
            id: item.id,
            reference: item.reference,
            service: serviceLabels[item.service] ?? item.service,
            targetRole: item.targetRole,
            targetMarket: item.targetMarket,
            createdAt: item.createdAt,
            status: item.status,
            paymentStatus: item.paymentStatus,
            statusUpdatedAt: item.statusUpdatedAt,
          }));
        return json({ items });
      } catch (err) {
        console.error('Client order list failed', err);
        return error('Unable to load order information.', 503);
      }
    },
  ],

  'GET /api/client/orders/:reference': [
    requireAuth(),
    withScopes('email'),
    async ({ user, params }) => {
      const email = user?.email?.trim().toLowerCase();
      const reference = cleanText(params.reference, 80).toUpperCase();
      if (!email) return error('An authenticated email address is required.', 403);
      if (!reference) return error('An order reference is required.', 400);
      try {
        const result = await db.list<OrderRecord>('career_order_requests', { limit: 100 });
        const item = result.items.find(order =>
          order.email?.trim().toLowerCase() === email &&
          order.reference?.toUpperCase() === reference
        );
        if (!item) return error('No order matching this account was found.', 404);
        return json({
          order: {
            id: item.id,
            reference: item.reference,
            service: serviceLabels[item.service] ?? item.service,
            targetRole: item.targetRole,
            targetMarket: item.targetMarket,
            message: item.message,
            createdAt: item.createdAt,
            status: item.status,
            paymentStatus: item.paymentStatus,
            statusUpdatedAt: item.statusUpdatedAt,
            statusHistory: item.statusHistory ?? [],
          },
        });
      } catch (err) {
        console.error('Client order detail failed', err);
        return error('Unable to load this order.', 503);
      }
    },
  ],

  'GET /api/admin/enquiries': [
    requireAuth(),
    async ({ user }) => {
      if (!(await isAuthorizedAdmin(user?.email)))
        return error(
          'Administrative access is not configured for this account.',
          403
        );
      try {
        const result = await db.list<EnquiryRecord>('career_enquiries', {
          limit: 50,
        });
        return json({ items: result.items });
      } catch (err) {
        console.error('Admin enquiry list failed', err);
        return error('Unable to load enquiries.', 503);
      }
    },
  ],

  'GET /api/admin/orders': [
    requireAuth(),
    async ({ user }) => {
      if (!(await isAuthorizedAdmin(user?.email)))
        return error(
          'Administrative access is not configured for this account.',
          403
        );
      try {
        const result = await db.list<OrderRecord>('career_order_requests', {
          limit: 50,
        });
        return json({ items: result.items });
      } catch (err) {
        console.error('Admin order list failed', err);
        return error('Unable to load service requests.', 503);
      }
    },
  ],

  'PUT /api/admin/orders/:id/status': [
    requireAuth(),
    async ({ body, params, user }) => {
      if (!(await isAuthorizedAdmin(user?.email)))
        return error('Administrative access is not configured for this account.', 403);
      const requestedStatus = body && typeof body === 'object'
        ? cleanText((body as Record<string, unknown>).status, 80)
        : '';
      if (!requestedStatus || !Object.prototype.hasOwnProperty.call(allowedStatusTransitions, requestedStatus))
        return error('Please choose a supported order status.', 400);
      const orderId = cleanText(params.id, 120);
      if (!orderId) return error('An order identifier is required.', 400);
      try {
        const [current] = await db.get<OrderRecord>('career_order_requests', [orderId], { consistent: true });
        if (!current) return error('Order not found.', 404);
        if (current.status === requestedStatus)
          return json({ ok: true, status: current.status, unchanged: true });
        const nextAllowed = allowedStatusTransitions[current.status] ?? [];
        if (!nextAllowed.includes(requestedStatus))
          return error('This order status transition is not allowed.', 409);
        const updatedAt = new Date().toISOString();
        const statusHistory = [
          ...(current.statusHistory ?? [{ status: current.status, at: current.createdAt, actor: 'system' }]),
          { status: requestedStatus, at: updatedAt, actor: user?.email ?? 'authorized staff' },
        ].slice(-100);
        const [updated] = await db.tx.update('career_order_requests', [{
          id: orderId,
          record: { status: requestedStatus, statusUpdatedAt: updatedAt, statusHistory },
          if: { status: current.status },
        }], { patch: true });
        if (!updated) return error('The order changed in another session. Refresh and try again.', 409);
        return json({ ok: true, status: requestedStatus, statusUpdatedAt: updatedAt, statusHistory });
      } catch (err) {
        console.error('Admin order status update failed', err);
        return error('Unable to update order status.', 503);
      }
    },
  ],
});
