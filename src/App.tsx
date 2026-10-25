import { useEffect, useMemo, useState } from 'react';
import { api, auth } from '@appdeploy/client';
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  FileText,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import './app.css';
import { PortfolioPage, PricingPage, PackageFinder, ResourcesSection } from './EnhancementPages';

type Service = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  deliverables: string[];
  note: string;
};
type Enquiry = {
  id: string;
  reference: string;
  name: string;
  email: string;
  service: string;
  message: string;
  createdAt: string;
  status: string;
};
type Order = {
  id: string;
  reference: string;
  name: string;
  email: string;
  service: string;
  targetRole: string;
  createdAt: string;
  status: string;
};
type ClientOrder = {
  id: string;
  reference: string;
  service: string;
  targetRole?: string;
  targetMarket?: string;
  message?: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  statusUpdatedAt?: string;
  statusHistory?: Array<{ status: string; at: string; actor: string }>;
};

const services: Service[] = [
  {
    slug: 'resume-writing',
    title: 'Résumé & CV writing',
    eyebrow: '01 / FOUNDATIONS',
    description:
      'A considered, well-structured career document that communicates your experience, strengths and direction with clarity.',
    deliverables: [
      'Professionally written résumé or CV',
      'Clear hierarchy and refined language',
      'Editable delivery format as agreed',
    ],
    note: 'Best for professionals refreshing their career story or preparing for a new direction.',
  },
  {
    slug: 'executive-resume',
    title: 'Executive résumé',
    eyebrow: '02 / LEADERSHIP',
    description:
      'A clear executive narrative shaped around leadership scope, strategic contribution and professional positioning.',
    deliverables: [
      'Executive résumé structure',
      'Leadership-focused career narrative',
      'Content tailored to the agreed target',
    ],
    note: 'Designed for experienced leaders. Content is based on information you provide.',
  },
  {
    slug: 'cover-letter',
    title: 'Cover letter',
    eyebrow: '03 / CONTEXT',
    description:
      'A tailored letter that connects your relevant experience to a specific role or professional opportunity.',
    deliverables: [
      'Role-focused cover-letter copy',
      'Editorial refinement',
      'Final format agreed before work begins',
    ],
    note: 'Share the target role and job description when available.',
  },
  {
    slug: 'linkedin-optimization',
    title: 'LinkedIn profile content',
    eyebrow: '04 / PRESENCE',
    description:
      'Thoughtful professional profile copy that helps communicate your expertise and career direction consistently.',
    deliverables: [
      'Headline options',
      'About section draft',
      'Agreed experience-section recommendations',
    ],
    note: 'We never need your LinkedIn password; copy and guidance are delivered for you to apply.',
  },
  {
    slug: 'professional-biography',
    title: 'Professional biography',
    eyebrow: '05 / INTRODUCTION',
    description:
      'A polished short or long-form biography for professional profiles, speaker introductions and business contexts.',
    deliverables: [
      'Biography in an agreed length',
      'Tone matched to intended use',
      'Edited final copy',
    ],
    note: 'Tell us where the biography will appear and who it should speak to.',
  },
  {
    slug: 'resume-editing',
    title: 'Résumé editing',
    eyebrow: '06 / REFINEMENT',
    description:
      'Focused editing or restructuring of an existing document, with scope agreed before the project starts.',
    deliverables: [
      'Editorial review',
      'Clarity and consistency improvements',
      'Scope-matched rewrite where agreed',
    ],
    note: 'Editing is distinct from creating a new résumé from scratch.',
  },
  {
    slug: 'interview-preparation',
    title: 'Interview preparation',
    eyebrow: '07 / READINESS',
    description:
      'A structured consultation to help you prepare examples, organize your experience and communicate with confidence.',
    deliverables: [
      'Agreed consultation session',
      'Preparation prompts where included',
      'Action notes as agreed',
    ],
    note: 'Session duration, scheduling and materials are confirmed before purchase.',
  },
];

const orderStatuses = [
  'awaiting_scope_confirmation',
  'received',
  'awaiting_client_information',
  'in_progress',
  'awaiting_internal_review',
  'ready_for_client_review',
  'revision_requested',
  'revision_in_progress',
  'completed',
  'cancelled',
  'on_hold',
];

const faqs = [
  [
    'Will a new résumé guarantee interviews or a job?',
    'No. Our work focuses on the clarity and presentation of your career materials. Hiring decisions, interviews, referrals and compensation are outside our control.',
  ],
  [
    'What should I prepare before ordering?',
    'An existing résumé if you have one, details of your experience, the role or direction you are targeting, and any relevant job description. We only ask for information needed for your selected service.',
  ],
  [
    'Can I request changes after delivery?',
    'Revision allowances and deadlines depend on the package agreed with you. The final scope and revision terms will be shown before payment is enabled.',
  ],
  [
    'How are my documents handled?',
    'Career documents can contain personal information. Documents should only be submitted through an approved, secure upload workflow. This launch build does not yet accept private document uploads.',
  ],
  [
    'Do you offer recruitment or job placement?',
    'Ascendant Career Services is presented as a career-document and professional-branding service. No recruitment-agency representation or job-placement service is promised here.',
  ],
];

function App() {
  const [route, setRoute] = useState(
    window.location.hash.replace(/^#\/?/, '') || ''
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formKind, setFormKind] = useState<'enquiry' | 'order'>('enquiry');
  const [selectedService, setSelectedService] = useState('resume-writing');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [adminSignInBusy, setAdminSignInBusy] = useState(false);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash.replace(/^#\/?/, ''));
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (route.startsWith('admin')) {
      setAdminMode(true);
      void loadAdmin();
    } else {
      setAdminMode(false);
    }
  }, [route]);

  const currentService = useMemo(
    () =>
      services.find(service => service.slug === selectedService) ?? services[0],
    [selectedService]
  );

  async function loadAdmin() {
    setAdminLoading(true);
    setAdminError('');
    try {
      const [enquiryResult, orderResult] = await Promise.all([
        api.get('/api/admin/enquiries'),
        api.get('/api/admin/orders'),
      ]);
      setEnquiries(enquiryResult.data.items ?? []);
      setOrders(orderResult.data.items ?? []);
    } catch (error) {
      setAdminError(
        'Admin records are unavailable. Sign in with an authorized team account after access controls are configured.'
      );
    } finally {
      setAdminLoading(false);
    }
  }

  async function signInAdmin() {
    setAdminSignInBusy(true);
    setAdminError('');
    try {
      await auth.signIn();
      await loadAdmin();
    } catch (err) {
      setAdminError('Sign-in was not completed. Use an account whose email has been approved for staff access.');
    } finally {
      setAdminSignInBusy(false);
    }
  }

  async function updateOrderStatus(item: Order, status: string) {
    setUpdatingOrderId(item.id);
    setAdminError('');
    try {
      await api.put('/api/admin/orders/' + encodeURIComponent(item.id) + '/status', { status });
      setStatusDrafts(current => ({ ...current, [item.id]: status }));
      setToast('Order status updated.');
      await loadAdmin();
    } catch (err) {
      setAdminError('The order status could not be updated. Confirm administrator access and choose a permitted next status.');
    } finally {
      setUpdatingOrderId('');
    }
  }

  function openForm(kind: 'enquiry' | 'order', slug?: string) {
    setFormKind(kind);
    if (slug) setSelectedService(slug);
    setFormError('');
    setReceipt('');
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setBusy(true);
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      service: String(data.get('service') ?? selectedService),
      targetRole: String(data.get('targetRole') ?? '').trim(),
      targetMarket: String(data.get('targetMarket') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
      privacyAccepted: data.get('privacy') === 'on',
      termsAccepted: formKind === 'order' ? data.get('terms') === 'on' : true,
    };
    try {
      const response =
        formKind === 'enquiry'
          ? await api.post('/api/enquiries', payload)
          : await api.post('/api/orders', payload);
      setReceipt(response.data.reference);
      setToast(
        formKind === 'enquiry'
          ? 'Your enquiry has been recorded.'
          : 'Your service request has been recorded.'
      );
    } catch (error) {
      setFormError(
        'We could not submit your request. Please check the required fields and try again. If this continues, contact the team directly.'
      );
    } finally {
      setBusy(false);
    }
  }

  function go(path: string) {
    window.location.hash = path ? '#/' + path : '#/';
  }

  if (adminMode) {
    return (
      <main className="admin-shell">
        <aside className="admin-sidebar">
          <a className="brand-lockup" href="#/">
            <img className="brand-logo" src="/resources/ascendant-logo.png" alt="" />
            <span>
              ASCENDANT<small>CAREER SERVICES</small>
            </span>
          </a>
          <p className="overline">WORKSPACE</p>
          <a className="side-link active" href="#/admin">
            Overview <ArrowRight size={15} />
          </a>
          <a className="side-link" href="#/admin/enquiries">
            Enquiries
          </a>
          <a className="side-link" href="#/admin/orders">
            Orders
          </a>
          <a className="side-link" href="#/admin/services">
            Services & packages
          </a>
          <div className="sidebar-foot">
            <ShieldCheck size={17} />
            <span>
              Private team workspace<small>Authorization required</small>
            </span>
          </div>
        </aside>
        <section className="admin-main">
          <header className="admin-top">
            <button className="text-button" onClick={() => go('')}>
              ← View public site
            </button>
            <div className="admin-top-actions">
              <button className="text-button" onClick={() => void signInAdmin()} disabled={adminSignInBusy}>
                {adminSignInBusy ? 'Opening sign-in…' : 'Staff sign in'}
              </button>
              <span className="admin-label">ADMINISTRATION / PREVIEW</span>
            </div>
          </header>
          <div className="admin-heading">
            <div>
              <p className="overline">ASCENDANT GROUPS</p>
              <h1>Service workspace</h1>
              <p className="muted">
                Review incoming requests and track service demand.
              </p>
            </div>
            <button
              className="button button-dark"
              onClick={() => void loadAdmin()}
            >
              Refresh records <ArrowRight size={16} />
            </button>
          </div>
          <div className="admin-notice">
            <ShieldCheck size={19} />
            <p>
              <strong>Access-controlled area</strong>
              <br />
              Administrative records are only shown after a server-side email
              allowlist check. Configure the private ADMIN_EMAIL_ALLOWLIST
              secret with approved staff emails; signing in alone never grants access.
            </p>
          </div>
          {adminError && (
            <div className="error-panel" role="alert">
              {adminError}
            </div>
          )}
          {adminLoading ? (
            <p className="muted">Checking access and loading records…</p>
          ) : (
            <div className="admin-grid">
              <article className="metric">
                <span>Enquiries</span>
                <strong>{enquiries.length}</strong>
                <small>Persisted requests</small>
              </article>
              <article className="metric">
                <span>Order requests</span>
                <strong>{orders.length}</strong>
                <small>Awaiting review</small>
              </article>
              <article className="metric">
                <span>Service catalogue</span>
                <strong>{services.length}</strong>
                <small>Public service types</small>
              </article>
            </div>
          )}
          <div className="admin-columns">
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>Recent enquiries</h2>
                <span>{enquiries.length} records</span>
              </div>
              {enquiries.length ? (
                enquiries.slice(0, 8).map(item => (
                  <div className="record-row" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.service} · {item.email}
                      </small>
                    </div>
                    <span className="status-pill">{item.status}</span>
                  </div>
                ))
              ) : (
                <p className="empty-state">
                  Enquiries will appear here once access is approved and
                  requests are received.
                </p>
              )}
            </section>
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>Recent service requests</h2>
                <span>{orders.length} records</span>
              </div>
              {orders.length ? (
                orders.slice(0, 8).map(item => (
                  <div className="record-row admin-order-row" key={item.id}>
                    <div className="admin-order-identity">
                      <strong>{item.reference}</strong>
                      <small>{item.service} · {item.name}</small>
                    </div>
                    <div className="admin-order-controls">
                      <label className="visually-hidden" htmlFor={'order-status-' + item.id}>Status for {item.reference}</label>
                      <select
                        id={'order-status-' + item.id}
                        value={statusDrafts[item.id] ?? item.status}
                        onChange={event => setStatusDrafts(current => ({ ...current, [item.id]: event.target.value }))}
                      >
                        {orderStatuses.map(status => (
                          <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <button
                        className="text-button admin-save-status"
                        onClick={() => void updateOrderStatus(item, statusDrafts[item.id] ?? item.status)}
                        disabled={updatingOrderId === item.id || adminLoading}
                      >
                        {updatingOrderId === item.id ? 'Saving…' : 'Save status'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">
                  Order requests will be listed here for review. Payment
                  processing is not enabled in this configuration.
                </p>
              )}
            </section>
          </div>
        </section>
      </main>
    );
  }

  const serviceSlug = route.startsWith('services/') ? route.split('/')[1] : '';
  const detailService = services.find(item => item.slug === serviceSlug);
  const isServices = route === 'services';
  const isPricing = route === 'pricing';
  const isCheckout = route === 'checkout';
  const isCheckoutSuccess = route === 'checkout/success';
  const isCheckoutCancel = route === 'checkout/cancel';
  const isClientRoute =
    route === 'order-status' ||
    route === 'client/login' ||
    route === 'client/orders' ||
    route.startsWith('client/orders/');
  const isAbout = route === 'about';
  const isHow = route === 'how-it-works';
  const isPortfolio = route === 'portfolio';
  const isContact = route === 'contact' || route === 'request-service';
  const isGuides = route === 'guides';
  const isPolicy = ['privacy', 'terms', 'refund-policy', 'disclaimer'].includes(
    route
  );

  return (
    <div className="site-shell">
      <div className="announcement">
        <span>CAREER DOCUMENTS · PROFESSIONAL BRANDING</span>
                  <span>Career documents and professional branding</span>
      </div>
      <header className="site-header">
        <a
          className="brand-lockup"
          href="#/"
          aria-label="Ascendant Career Services home"
        >
          <img className="brand-logo" src="/resources/ascendant-logo.png" alt="" />
          <span>
            ASCENDANT<small>CAREER SERVICES</small>
          </span>
        </a>
        <nav
          className={mobileOpen ? 'main-nav open' : 'main-nav'}
          aria-label="Main navigation"
        >
          <a href="#/services">Services</a>
          <a href="#/pricing">Request a Quote</a>
          <a href="#/how-it-works">How it works</a>
          <a href="#/portfolio">Samples</a>
          <a href="#/about">About</a>
          <button
            className="button button-dark nav-cta"
            onClick={() => openForm('enquiry')}
          >
            Start an enquiry <ArrowUpRightIcon />
          </button>
        </nav>
        <button
          className="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </header>

      {isServices ? (
        <section className="page-width inner-page services-index">
          <p className="overline">THE SERVICE CATALOGUE</p>
          <h1>
            A clearer story for
            <br />
            <em>your next step.</em>
          </h1>
          <p className="page-intro">
            Explore our career-document services. Tell us what you need and our
            team will review your goals before explaining the suitable service,
            scope and pricing.
          </p>
          <div className="service-grid">
            {services.map(service => (
              <ServiceCard
                key={service.slug}
                service={service}
                onOpen={() => go('services/' + service.slug)}
                onEnquire={() => openForm('enquiry', service.slug)}
              />
            ))}
          </div>
          <div className="service-index-note">
            <ShieldCheck size={18} />
            <p>
              We work from information you provide. We do not fabricate
              qualifications or guarantee interviews, employment, referrals or
              salary outcomes.
            </p>
          </div>
        </section>
      ) : detailService ? (
        <section className="service-detail page-width">
          <button className="back-link" onClick={() => go('services')}>
            ← All services
          </button>
          <p className="overline">{detailService.eyebrow}</p>
          <h1>
            {detailService.title}
            <em>, with intention.</em>
          </h1>
          <p className="detail-lead">{detailService.description}</p>
          <div className="detail-layout">
            <div>
              <h2>What we shape together</h2>
              <ul className="check-list">
                {detailService.deliverables.map(item => (
                  <li key={item}>
                    <Check size={17} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="detail-note">{detailService.note}</p>
              <div className="disclaimer-small">
                Service scope, delivery timing, revisions and price are
                confirmed before payment. Employment outcomes are not
                guaranteed.
              </div>
              <button
                className="button button-dark"
                onClick={() => openForm('enquiry', detailService.slug)}
              >
                Discuss this service <ArrowRight size={16} />
              </button>
            </div>
            <DocumentSpecimen
              variant={
                detailService.slug === 'cover-letter' ? 'letter' : 'resume'
              }
            />
          </div>
        </section>
      ) : isPricing ? (
        <section className="page-width inner-page">
          <p className="overline">CLEAR EXPECTATIONS</p>
          <h1>
            Good work begins
            <br />
            <em>with clarity.</em>
          </h1>
          <p className="page-intro">
            Tell us about your career goals and the service you need. Our team
            will review your requirements and respond with suitable options,
            scope and pricing.
          </p>
          <PricingPage onEnquire={() => openForm('enquiry')} onOrder={() => openForm('order')} />
          <div className="service-grid compact">
            {services.slice(0, 3).map(service => (
              <ServiceCard
                key={service.slug}
                service={service}
                onOpen={() => go('services/' + service.slug)}
                onEnquire={() => openForm('enquiry', service.slug)}
              />
            ))}
          </div>
        </section>
      ) : isAbout ? (
        <section className="page-width inner-page">
          <p className="overline">ABOUT THE STUDIO</p>
          <h1>
            Professional stories,
            <br />
            <em>thoughtfully presented.</em>
          </h1>
          <p className="page-intro">
            Ascendant Career Services is a career-document and
            professional-branding service under Ascendant Groups. We help people
            present their experience with clarity, structure and care.
          </p>
          <div className="about-values">
            <article>
              <span>01</span>
              <h2>Clarity over claims</h2>
              <p>
                We present your real experience with focus and precision—never
                fabricated credentials or inflated achievements.
              </p>
            </article>
            <article>
              <span>02</span>
              <h2>Craft is in the detail</h2>
              <p>
                Hierarchy, language and consistency all shape how a professional
                story is read.
              </p>
            </article>
            <article>
              <span>03</span>
              <h2>Respect for your information</h2>
              <p>
                Career documents are personal. We ask only for information
                relevant to the service you choose.
              </p>
            </article>
          </div>
        </section>
      ) : isHow ? (
        <section className="page-width inner-page">
          <p className="overline">THE PROCESS</p>
          <h1>
            A considered process.
            <br />
            <em>No guesswork.</em>
          </h1>
          <p className="page-intro">
            A clear sequence keeps the brief, deliverables and expectations
            aligned before work begins.
          </p>
          <div className="process-list">
            {[
              [
                '01',
                'Choose your service',
                'Tell us whether you need a résumé, cover letter, profile content or another service.',
              ],
              [
                '02',
                'Share the context',
                'We discuss your experience, target role and the outcome your documents need to communicate.',
              ],
              [
                '03',
                'Agree the scope',
                'You receive a clear scope, price, turnaround and revision terms before payment is requested.',
              ],
              [
                '04',
                'Review and refine',
                'Work progresses against the agreed brief, with feedback handled within the package terms.',
              ],
              [
                '05',
                'Receive your files',
                'Final deliverables are provided through the agreed channel, with appropriate care for your information.',
              ],
            ].map(step => (
              <article key={step[0]}>
                <span>{step[0]}</span>
                <div>
                  <h2>{step[1]}</h2>
                  <p>{step[2]}</p>
                </div>
                <ArrowDownRight size={18} />
              </article>
            ))}
          </div>
        </section>
      ) : isPortfolio ? (
        <PortfolioPage onEnquire={() => openForm('enquiry')} />
      ) : isContact ? (
        <section className="page-width inner-page contact-page">
          <p className="overline">LET’S START WITH THE BRIEF</p>
          <h1>
            Tell us where
            <br />
            <em>you want to go.</em>
          </h1>
          <p className="page-intro">
            Share a little about your goals. We’ll review the request and follow
            up about scope, timing and pricing.
          </p>
          <button
            className="button button-dark"
            onClick={() => openForm('enquiry')}
          >
            Open enquiry form <ArrowRight size={16} />
          </button>
          <p className="muted">
            Please do not attach confidential documents until a secure
            document-submission workflow has been approved.
          </p>
        </section>
      ) : isGuides ? (
        <section className="page-width inner-page">
          <p className="overline">CAREER SUPPORT</p>
          <h1>
            Practical support
            <br />
            <em>for your next step.</em>
          </h1>
          <p className="page-intro">
            Our team can help you clarify your career-document needs and discuss
            the service that best fits your goals.
          </p>
          <button className="button button-dark" onClick={() => openForm('enquiry')}>
            Request a Service Enquiry <ArrowRight size={16} />
          </button>
        </section>
      ) : isPolicy ? (
        <section className="page-width inner-page policy-page">
          <p className="overline">IMPORTANT INFORMATION</p>
          <h1>
            {
              (
                {
                  privacy: 'Privacy notice',
                  terms: 'Terms of service',
                  'refund-policy': 'Cancellation & refund policy',
                  disclaimer: 'Service disclaimer',
                } as Record<string, string>
              )[route]
            }
          </h1>
          <div className="policy-warning">
            Please contact Ascendant Career Services if you have questions
            about how service requests and personal information are handled.
          </div>
          {route === 'disclaimer' ? (
            <>
              <h2>No employment guarantee</h2>
              <p>
                Purchasing a career-document or professional-branding service
                does not guarantee employment, interviews, referrals, recruiter
                responses or any salary outcome. Hiring decisions are made by
                employers and other third parties.
              </p>
              <h2>Service scope</h2>
              <p>
                Only the deliverables documented in the agreed package are
                included. Ascendant Career Services is not presented here as a
                recruitment agency and does not promise job placement.
              </p>
            </>
          ) : (
            <>
              <h2>Before publication</h2>
              <p>
                This page must be completed and approved by Ascendant Groups
                before launch. It should explain the applicable rules for data
                collection, document handling, account access, retention,
                cancellations, refunds and dispute handling as relevant to the
                selected policy.
              </p>
              <p>
                Do not submit sensitive documents through this website until the
                secure upload workflow and final policy are in place.
              </p>
            </>
          )}
        </section>
      ) : isCheckout ? (
        <section className="page-width inner-page checkout-page">
          <p className="overline">PAYMENT CONFIGURATION</p>
          <h1>
            Clear terms
            <br />
            <em>before checkout.</em>
          </h1>
          <p className="page-intro">
            Online checkout is not active yet. Approved package prices, service
            terms and a supported payment provider must be configured before
            this website can collect payments.
          </p>
          <div className="pricing-pending">
            <span className="mini-seal">A</span>
            <h2>No payment will be simulated.</h2>
            <p>
              You can submit a service request without being charged. The team
              must confirm your deliverables, turnaround, price, currency and
              revision allowance before a payment link can be issued.
            </p>
            <button className="button button-dark" onClick={() => openForm('order')}>
              Submit a service request <ArrowRight size={16} />
            </button>
          </div>
          <button className="text-button" onClick={() => go('pricing')}>
            Return to pricing information <ArrowRight size={15} />
          </button>
        </section>
      ) : isCheckoutSuccess ? (
        <section className="page-width inner-page checkout-page">
          <p className="overline">PAYMENT STATUS</p>
          <h1>
            Confirmation requires
            <br />
            <em>a verified payment.</em>
          </h1>
          <p className="page-intro">
            This page alone does not confirm a payment. Online payment is
            currently disabled, and a success-page visit cannot mark an order
            as paid. Check your authenticated order area for the latest status.
          </p>
          <div className="policy-warning">
            No payment is reported as successful by this page.
          </div>
          <button className="button button-dark" onClick={() => go('order-status')}>
            Check order status <ArrowRight size={16} />
          </button>
        </section>
      ) : isCheckoutCancel ? (
        <section className="page-width inner-page checkout-page">
          <p className="overline">CHECKOUT NOT COMPLETED</p>
          <h1>
            Nothing to assume.
            <br />
            <em>Let’s review the next step.</em>
          </h1>
          <p className="page-intro">
            No payment confirmation is recorded here. Online checkout is not
            active yet, so return to the service request workflow or review the
            agreed scope with the team.
          </p>
          <button className="button button-dark" onClick={() => openForm('order')}>
            Submit a service request <ArrowRight size={16} />
          </button>
        </section>
      ) : isClientRoute ? (
        <ClientPortal route={route} go={go} />
      ) : (
        <Home
          openForm={openForm}
          go={go}
          faqOpen={faqOpen}
          setFaqOpen={setFaqOpen}
        />
      )}

      <footer className="site-footer">
        <div className="footer-top">
          <a className="brand-lockup footer-brand" href="#/">
            <img className="brand-logo" src="/resources/ascendant-logo.png" alt="" />
            <span>
              ASCENDANT<small>CAREER SERVICES</small>
            </span>
          </a>
          <p>
            Carefully considered career documents.
            <br />
            Clear presentation for your next chapter.
          </p>
          <button className="footer-cta" onClick={() => openForm('enquiry')}>
            Start a conversation <ArrowRight size={16} />
          </button>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Ascendant Groups</span>
          <div>
            <a href="#/privacy">Privacy</a>
            <a href="#/terms">Terms</a>
            <a href="#/refund-policy">Refunds</a>
                      <a href="#/disclaimer">Disclaimer</a>
          <a href="#/order-status">Order status</a>
          <a href="#/client/login">Client access</a>
          <a href="#/admin">Team access</a>
          </div>
          <span className="footer-tagline">CRAFT · CLARITY · CARE</span>
        </div>
      </footer>

      {formOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setFormOpen(false);
          }}
        >
          <section
            className="form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
          >
            <button
              className="modal-close"
              onClick={() => setFormOpen(false)}
              aria-label="Close form"
            >
              <X size={19} />
            </button>
            {receipt ? (
              <div className="receipt-view">
                <span className="receipt-check">
                  <Check size={24} />
                </span>
                <p className="overline">REQUEST RECORDED</p>
                <h2 id="form-title">Thank you for starting a conversation.</h2>
                <p>
                  Your reference is <strong>{receipt}</strong>. This confirms
                  that your request was saved; it does not represent a payment
                  or service acceptance.
                </p>
                {formKind === 'order' && (
                  <p className="payment-state">
                    Online payment is not enabled until approved prices, terms
                    and a supported payment provider are configured.
                  </p>
                )}
                <button
                  className="button button-dark"
                  onClick={() => setFormOpen(false)}
                >
                  Done <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <p className="overline">
                  {formKind === 'enquiry'
                    ? 'A GOOD PLACE TO BEGIN'
                    : 'SERVICE REQUEST'}
                </p>
                <h2 id="form-title">
                  {formKind === 'enquiry'
                    ? 'Tell us a little about your goals.'
                    : 'Let’s scope the right service.'}
                </h2>
                <p className="modal-intro">
                  We’ll use these details to understand your request. Fields
                  marked * are required.
                </p>
                <form onSubmit={handleSubmit} className="enquiry-form">
                  <div className="field-row">
                    <label>
                      Full name *
                      <input
                        name="name"
                        required
                        autoComplete="name"
                        maxLength={120}
                      />
                    </label>
                    <label>
                      Email address *
                      <input
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        maxLength={254}
                      />
                    </label>
                  </div>
                  <div className="field-row">
                    <label>
                      Telephone (optional)
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        maxLength={40}
                      />
                    </label>
                    <label>
                      Service *
                      <select
                        name="service"
                        value={selectedService}
                        onChange={event =>
                          setSelectedService(event.target.value)
                        }
                      >
                        {services.map(service => (
                          <option value={service.slug} key={service.slug}>
                            {service.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {formKind === 'order' && (
                    <div className="field-row">
                      <label>
                        Target role
                        <input name="targetRole" maxLength={160} />
                      </label>
                      <label>
                        Target market
                        <input
                          name="targetMarket"
                          placeholder="e.g. US, UK, international"
                          maxLength={120}
                        />
                      </label>
                    </div>
                  )}
                  <label>
                    What would you like help with? *
                    <textarea
                      name="message"
                      required
                      rows={4}
                      maxLength={4000}
                      placeholder="A little context about your goals, experience or target role…"
                    />
                  </label>
                  <label className="check-field">
                    <input type="checkbox" name="privacy" required /> I
                    acknowledge the privacy notice and understand that I should
                    not upload confidential documents through this form. *
                  </label>
                  {formKind === 'order' && (
                    <label className="check-field">
                      <input type="checkbox" name="terms" required /> I
                      understand that service scope, price and terms must be
                      confirmed before any payment. *
                    </label>
                  )}
                  {formError && (
                    <p className="form-error" role="alert">
                      {formError}
                    </p>
                  )}
                  <button
                    className="button button-dark submit-button"
                    type="submit"
                    disabled={busy}
                  >
                    {busy
                      ? 'Submitting…'
                      : formKind === 'enquiry'
                        ? 'Send enquiry'
                        : 'Submit service request'}{' '}
                    <ArrowRight size={16} />
                  </button>
                  <p className="form-footnote">
                    No employment outcome is guaranteed. Please do not include
                    passwords, government ID numbers or other unrelated
                    sensitive information.
                  </p>
                </form>
              </>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button
            onClick={() => setToast('')}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function ArrowUpRightIcon() {
  return <ArrowRight size={16} />;
}

function Home({
  openForm,
  go,
  faqOpen,
  setFaqOpen,
}: {
  openForm: (kind: 'enquiry' | 'order', slug?: string) => void;
  go: (path: string) => void;
  faqOpen: number | null;
  setFaqOpen: (value: number | null) => void;
}) {
  return (
    <>
      <main>
        <section className="hero page-width">
          <div className="hero-copy">
            <p className="overline">
              <span className="overline-line" /> CAREER DOCUMENTS, CONSIDERED
            </p>
            <h1>
              Your Experience Deserves a <em>Stronger Presentation.</em>
            </h1>
            <p className="hero-lead">
              We help professionals communicate their value through thoughtfully developed résumés, executive career documents and LinkedIn profiles designed to present their experience with clarity and confidence.
            </p>
            <div className="hero-actions">
              <button
                className="button button-dark"
                onClick={() => go('services')}
              >
                Explore Our Services <ArrowRight size={16} />
              </button>
              <button className="text-button" onClick={() => go('portfolio')}>
                View Our Work <ArrowDownRight size={16} />
              </button>
            </div>
            <div className="hero-note">
              <span className="note-rule" /> CLEAR SCOPE. HONEST PRESENTATION.
              NO EMPLOYMENT PROMISES.
            </div>
          </div>
          <div className="hero-art">
            <div className="art-topline">
              <span>SELECTED WORK / STUDY 01</span>
              <span>FIG. A—01</span>
            </div>
            <DocumentSpecimen variant="resume" />
            <div className="art-caption">
              <span>THE PROFESSIONAL PROFILE</span>
              <span>FORM FOLLOWS STORY.</span>
            </div>
            <div className="gold-stamp">
              A<br />
              <small>ASC.</small>
            </div>
          </div>
          <div className="hero-index">
            <span>01</span>
            <span>—</span>
            <span>CRAFTING A CLEARER CAREER STORY</span>
          </div>
        </section>

        <section className="intro-band">
          <div className="page-width intro-inner">
            <span className="overline">A CAREFUL APPROACH</span>
            <p>
              Good career documents do more than list experience. They{' '}
              <em>make it legible.</em>
            </p>
            <span className="intro-aside">
              Clear structure. Considered language.
              <br />A professional story that feels like yours.
            </span>
          </div>
        </section>

        <section className="services-section page-width" id="services">
          <div className="section-heading">
            <div>
              <p className="overline">THE SERVICE EDIT</p>
              <h2>
                Support for every
                <br />
                <em>next step.</em>
              </h2>
            </div>
            <button className="text-button" onClick={() => go('services')}>
              View all services <ArrowRight size={16} />
            </button>
          </div>
          <div className="service-grid">
            {services.slice(0, 6).map(service => (
              <ServiceCard
                key={service.slug}
                service={service}
                onOpen={() => go('services/' + service.slug)}
                onEnquire={() => openForm('enquiry', service.slug)}
              />
            ))}
          </div>
        </section>

        <section className="craft-section">
          <div className="page-width craft-layout">
            <div className="craft-copy">
              <p className="overline">DETAILS, IN THEIR PLACE</p>
              <h2>
                Let the work
                <br />
                speak <em>clearly.</em>
              </h2>
              <p>
                From a clean information hierarchy to precise, purposeful
                language, each document is shaped around what matters: your real
                experience, your direction and the role the document needs to
                play.
              </p>
              <button className="text-button" onClick={() => go('portfolio')}>
                View illustrative samples <ArrowRight size={16} />
              </button>
            </div>
            <div className="craft-specimens">
              <DocumentSpecimen variant="letter" />
              <div className="specimen-overlay">
                <DocumentSpecimen variant="resume" />
              </div>
              <span className="specimen-label">LAYOUT STUDY / 02</span>
            </div>
          </div>
        </section>

        <section className="process-section page-width">
          <div className="section-heading">
            <div>
              <p className="overline">HOW WE WORK</p>
              <h2>
                Thoughtful from
                <br />
                <em>first brief to final file.</em>
              </h2>
            </div>
            <p className="section-side">
              Clear expectations help make a good collaboration. We agree on
              scope before a project begins.
            </p>
          </div>
          <div className="steps-grid">
            {[
              ['01', 'Choose your service', 'Start with what you need.'],
              [
                '02',
                'Share your context',
                'Your experience, target role and goals.',
              ],
              ['03', 'Agree the terms', 'Scope, price, timing and revisions.'],
              ['04', 'Review & receive', 'Refinement and delivery as agreed.'],
            ].map(step => (
              <article key={step[0]}>
                <span>{step[0]}</span>
                <div className="step-line" />
                <h3>{step[1]}</h3>
                <p>{step[2]}</p>
              </article>
            ))}
          </div>
          <div className="process-link">
            <button className="text-button" onClick={() => go('how-it-works')}>
              See the full process <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="editorial-featured">
          <div className="editorial-featured-inner">
            <div className="section-heading">
              <div><p className="overline">SELECTED DOCUMENT STUDIES</p><h2>Different careers.<br/><em>Different structures.</em></h2></div>
              <button className="text-button" onClick={() => go('portfolio')}>Explore the portfolio <ArrowRight size={16}/></button>
            </div>
            <div className="featured-service-note">
              <p>Every career document starts with your experience, goals and the roles you are pursuing. We discuss your brief before recommending a service.</p>
              <button className="button button-dark" onClick={() => openForm('enquiry')}>Request a Service Enquiry <ArrowRight size={16}/></button>
            </div>
          </div>
        </section>
        <section className="recommendations-section">
          <div className="recommendations-inner">
            <div className="section-heading">
              <div>
                <p className="overline">CLIENT RECOMMENDATIONS</p>
                <h2>Trusted for the Details<br/><em>That Move Careers Forward.</em></h2>
              </div>
              <p className="section-side">Client feedback, shared to reflect the experience of working together.</p>
            </div>
            <div className="testimonial-grid">
              {[
                {
                  quote: 'The process helped me look at my experience from a more strategic perspective. Instead of simply listing responsibilities, the résumé presented my leadership experience, business contributions and career progression in a much clearer way. The final document felt appropriate for the level of roles I am pursuing.',
                  name: 'Michael R. Bennett',
                  role: 'Senior Operations Executive',
                  service: 'Executive résumé'
                },
                {
                  quote: 'My LinkedIn profile needed a clearer professional direction. The revised headline, About section and experience descriptions created a more consistent picture of my skills and the work I want to pursue. I now have a much clearer foundation for professional networking.',
                  name: 'Daniel K. Foster',
                  role: 'LinkedIn profile client',
                  service: 'LinkedIn profile optimization'
                },
                {
                  quote: 'I needed help presenting experience from a different industry in a way that made sense for my new career direction. The revised résumé brought forward transferable skills and relevant achievements while making the transition easier to understand.',
                  name: 'Olivia M. Carter',
                  role: 'Career transition client',
                  service: 'Résumé writing'
                },
                {
                  quote: 'The revised CV gave my academic experience a more organized presentation. My education, research activities, teaching experience and professional contributions were easier to navigate, which made the document more suitable for academic and research opportunities.',
                  name: 'Dr. Samuel T. Williams',
                  role: 'Academic and research professional',
                  service: 'Academic CV'
                },
                {
                  quote: 'I appreciated the focus on relevance and clarity. The application documents connected my experience to the type of position I was pursuing without relying on exaggerated language. The result was professional, focused and easier to personalize for individual applications.',
                  name: 'Natalie J. Brooks',
                  role: 'Professional résumé client',
                  service: 'Application documents'
                }
              ].map((testimonial, index) => (
                <article className={'testimonial-card' + (index === 0 ? ' testimonial-featured' : '')} key={testimonial.name}>
                  <span className="testimonial-index">CLIENT NOTE / 0{index + 1}</span>
                  <blockquote>“{testimonial.quote}”</blockquote>
                  <div className="testimonial-byline">
                    <div className="testimonial-monogram" aria-hidden="true">{testimonial.name.replace('Dr. ', '').split(' ').map(part => part[0]).join('').replace('.', '').slice(0, 2)}</div>
                    <div><strong>{testimonial.name}</strong><span>{testimonial.role}</span></div>
                  </div>
                  <span className="testimonial-service">{testimonial.service}</span>
                </article>
              ))}
            </div>
            <p className="testimonial-disclaimer">Testimonials are published as supplied by Ascendant Career Services. Individual experiences vary; these comments do not guarantee interviews, job offers, salary increases or any specific employment outcome.</p>
            <button className="button button-ivory" onClick={() => openForm('enquiry')}>Start Your Project <ArrowRight size={16}/></button>
          </div>
        </section>
        <section className="industries-section">
          <div className="industries-inner">
            <div className="section-heading"><div><p className="overline">INDUSTRIES & CAREER DIRECTIONS</p><h2>Career Documents for<br/><em>Ambitious Professionals.</em></h2></div></div>
            <p className="industry-intro">From technology and cloud computing to healthcare, education, finance and executive leadership, we help professionals present their experience clearly and position their career documents for the roles they are pursuing.</p>
            <div className="industry-list">
              {[
                ['TECHNOLOGY & CLOUD','Technology, software, cloud infrastructure and digital roles.'],
                ['HEALTHCARE','Healthcare operations, administration and clinical leadership.'],
                ['HIGHER EDUCATION','Universities, research environments and education roles.'],
                ['FINANCE & PROFESSIONAL SERVICES','Finance, accounting, consulting and related professions.'],
                ['BUSINESS OPERATIONS','Operations, project management and organizational leadership.'],
                ['NON-PROFIT & DEVELOPMENT','Program management and international development contexts.']
              ].map(item => <article className="industry-item" key={item[0]}><span>INDUSTRY / CAREER DIRECTION</span><h3>{item[0]}</h3><p>{item[1]}</p></article>)}
            </div>

            <button className="button button-dark" onClick={() => openForm('enquiry')}>Start your project <ArrowRight size={16}/></button>
          </div>
        </section>
        <section className="pricing-band">
          <div className="page-width pricing-layout">
            <div>
              <p className="overline">A CONVERSATION FIRST</p>
              <h2>Interested in our services?</h2>
            </div>
            <div>
              <p>Tell us about your career goals and the service you need. Our team will review your requirements and respond with suitable options and pricing.</p>
              <button className="button button-ivory" onClick={() => openForm('enquiry')}>Request a Service Enquiry <ArrowRight size={16}/></button>
            </div>
          </div>
        </section>

        <section className="resources-preview page-width"><ResourcesSection /></section>
        <section className="trust-section page-width">
          <div className="trust-icon">
            <ShieldCheck size={23} />
          </div>
          <div>
            <p className="overline">YOUR STORY IS YOURS</p>
            <h2>
              Professional care.
              <br />
              <em>Personal information.</em>
            </h2>
            <p>
              Career documents deserve careful handling. We only request
              information relevant to your selected service, and we will not ask
              for your social account passwords. Secure document submission will
              be provided only through an approved workflow.
            </p>
            <button className="text-button" onClick={() => go('privacy')}>
              Read privacy information <ArrowRight size={15} />
            </button>
          </div>
          <div className="trust-list">
            <span>
              <Check size={15} /> Accurate, client-provided experience
            </span>
            <span>
              <Check size={15} /> Clear deliverables and terms
            </span>
            <span>
              <Check size={15} /> No guaranteed job outcomes
            </span>
            <span>
              <Check size={15} /> No fabricated credentials or achievements
            </span>
          </div>
        </section>

        <section className="faq-section">
          <div className="page-width faq-layout">
            <div>
              <p className="overline">GOOD QUESTIONS, CLEAR ANSWERS</p>
              <h2>
                Before we
                <br />
                <em>get started.</em>
              </h2>
              <p>
                Anything else on your mind? Send an enquiry and tell us what you
                need.
              </p>
              <button
                className="text-button"
                onClick={() => openForm('enquiry')}
              >
                Ask a question <ArrowRight size={15} />
              </button>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <article
                  className={
                    faqOpen === index ? 'faq-item expanded' : 'faq-item'
                  }
                  key={faq[0]}
                >
                  <button
                    onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                    aria-expanded={faqOpen === index}
                  >
                    <span>{faq[0]}</span>
                    <span className="faq-toggle">
                      {faqOpen === index ? '−' : '+'}
                    </span>
                  </button>
                  {faqOpen === index && <p>{faq[1]}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta page-width">
          <span className="overline">
            YOUR NEXT CHAPTER STARTS WITH A CONVERSATION
          </span>
          <h2>
            Let’s make your story
            <br />
            <em>easier to see.</em>
          </h2>
          <button
            className="button button-dark"
            onClick={() => openForm('enquiry')}
          >
            Start an enquiry <ArrowRight size={16} />
          </button>
          <div className="cta-mark">A</div>
        </section>
      </main>
    </>
  );
}

function ServiceCard({
  service,
  onOpen,
  onEnquire,
}: {
  service: Service;
  onOpen: () => void;
  onEnquire: () => void;
}) {
  return (
    <article className="service-card">
      <div className="service-card-top">
        <span>{service.eyebrow}</span>
        <FileText size={18} />
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <div className="service-card-actions">
        <button className="card-link" onClick={onOpen}>
          Explore <ArrowRight size={14} />
        </button>
        <button
          className="card-enquire"
          onClick={onEnquire}
          aria-label={'Enquire about ' + service.title}
        >
          Enquire <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

function DocumentSpecimen({ variant }: { variant: 'resume' | 'letter' }) {
  return (
    <div
      className={
        'document-specimen ' + (variant === 'letter' ? 'letter-specimen' : '')
      }
      aria-label={
        variant === 'resume'
          ? 'Career résumé document layout'
          : 'Professional cover letter document layout'
      }
    >
      <div className="doc-head">
        <span className="doc-monogram">A</span>
        <div>
          <strong>CAREER DOCUMENT</strong>
          <small>{variant === 'resume' ? 'PROFESSIONAL PROFILE' : 'PROFESSIONAL CORRESPONDENCE'}</small>
        </div>
        <span className="doc-number">ASC</span>
      </div>
      {variant === 'resume' ? (
        <>
          <div className="doc-section">
            <span>PROFILE</span>
            <div className="doc-lines">
              <i className="long" />
              <i />
              <i className="medium" />
            </div>
          </div>
          <div className="doc-section">
            <span>EXPERIENCE</span>
            <div className="doc-entry">
              <b>Senior Operations Lead</b>
              <small>Northline Studio · 2021—2025</small>
              <div className="doc-lines">
                <i />
                <i className="medium" />
              </div>
            </div>
            <div className="doc-entry">
              <b>Project Manager</b>
              <small>Fieldwork & Co. · 2018—2021</small>
              <div className="doc-lines">
                <i />
                <i className="short" />
              </div>
            </div>
          </div>
          <div className="doc-section two-col">
            <div>
              <span>CORE STRENGTHS</span>
              <div className="doc-lines">
                <i />
                <i />
                <i className="medium" />
              </div>
            </div>
            <div>
              <span>EDUCATION</span>
              <div className="doc-lines">
                <i />
                <i className="short" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="letter-meta">
            <span>14 OCTOBER 2026</span>
            <span>APPLICATION / ROLE</span>
          </div>
          <div className="doc-letter-copy">
            <i className="medium" />
            <i />
            <i />
            <i className="long" />
            <i className="short" />
            <br />
            <i />
            <i className="long" />
            <i />
            <i className="medium" />
            <br />
            <i />
            <i className="long" />
            <i className="short" />
          </div>
          <div className="doc-sign">
            <i className="medium" />
            <b>Jordan Reed</b>
          </div>
        </>
      )}
      <div className="doc-footer">
        <span>CAREER DOCUMENT DESIGN</span>
        <span>ASCENDANT CAREER SERVICES</span>
      </div>
    </div>
  );
}

function ClientPortal({ route, go }: { route: string; go: (path: string) => void }) {
  const [user, setUser] = useState<{ userId: string; email?: string; name?: string; scope: string } | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [order, setOrder] = useState<ClientOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isDocumentRoute = route.endsWith('/documents') || route.endsWith('/revisions');
  const isDetailRoute = route.startsWith('client/orders/') && !isDocumentRoute;

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErrorMessage('');
      try {
        const current = await auth.getUser();
        if (!active) return;
        setUser(current);
        if (!current) {
          setOrders([]);
          setOrder(null);
          return;
        }
        if (route === 'client/orders' || route === 'order-status') {
          const response = await api.get('/api/client/orders');
          if (!active) return;
          setOrders(response.data.items ?? []);
          setOrder(null);
        } else if (isDetailRoute) {
          const reference = decodeURIComponent(route.slice('client/orders/'.length));
          const response = await api.get('/api/client/orders/' + encodeURIComponent(reference));
          if (!active) return;
          setOrder(response.data.order ?? null);
          setOrders([]);
        } else {
          setOrders([]);
          setOrder(null);
        }
      } catch (err) {
        if (active) {
          setErrorMessage('We could not load order information. Sign in with the email address used for the request, then try again.');
          setOrders([]);
          setOrder(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [route]);

  async function signIn() {
    setBusy(true);
    setErrorMessage('');
    try {
      await auth.signIn();
      const current = await auth.getUser();
      if (!current) throw new Error('Sign-in was not completed.');
      setUser(current);
      go('client/orders');
    } catch (err) {
      setErrorMessage('Sign-in was not completed. Allow the sign-in window and use an account with access to your order email.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      await auth.signOut();
      setUser(null);
      setOrders([]);
      setOrder(null);
      go('client/login');
    } catch (err) {
      setErrorMessage('We could not sign you out. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-width inner-page client-portal">
      <p className="overline">PRIVATE CLIENT AREA</p>
      <h1>
        {route === 'order-status' ? <>Your order, <em>clearly tracked.</em></> : <>Your work, <em>in one place.</em></>}
      </h1>
      <p className="page-intro">
        Sign in with the same email address used for your service request. Only
        orders associated with your authenticated email are returned here.
      </p>
      {!user ? (
        <div className="pricing-pending portal-panel">
          <ShieldCheck size={24} />
          <h2>Sign in to view your orders.</h2>
          <p>
            Order information is not available through a public reference-only
            page. Authentication is required before any order details are shown.
          </p>
          {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
          <button className="button button-dark" onClick={() => void signIn()} disabled={busy}>
            {busy ? 'Opening sign-in…' : 'Sign in securely'} <ArrowRight size={16} />
          </button>
        </div>
      ) : loading ? (
        <p className="muted">Loading your order information…</p>
      ) : isDocumentRoute ? (
        <div className="pricing-pending portal-panel">
          <ShieldCheck size={24} />
          <h2>{route.endsWith('/documents') ? 'Secure document access is not enabled yet.' : 'Revision requests are not enabled yet.'}</h2>
          <p>
            Private file storage and delivery controls must be configured and
            tested before confidential career documents can be uploaded or
            downloaded. Please do not email passwords or unrelated sensitive
            information.
          </p>
          <button className="button button-dark" onClick={() => go('client/orders')}>
            Return to your orders <ArrowRight size={16} />
          </button>
        </div>
      ) : errorMessage ? (
        <div className="error-panel" role="alert">{errorMessage}</div>
      ) : isDetailRoute && order ? (
        <div className="client-order-detail">
          <button className="text-button" onClick={() => go('client/orders')}>← All orders</button>
          <div className="order-detail-heading">
            <div>
              <span className="overline">ORDER REFERENCE</span>
              <h2>{order.reference}</h2>
              <p className="muted">{order.service} · {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <span className="status-pill">{order.status.replace(/_/g, ' ')}</span>
          </div>
          <div className="client-order-facts">
            <div><span>Target role</span><strong>{order.targetRole || 'Not provided'}</strong></div>
            <div><span>Target market</span><strong>{order.targetMarket || 'Not provided'}</strong></div>
            <div><span>Payment status</span><strong>{order.paymentStatus.replace(/_/g, ' ')}</strong></div>
            <div><span>Service status</span><strong>{order.status.replace(/_/g, ' ')}</strong></div>
          </div>
          <h3>Your request</h3>
          <p className="order-message">{order.message || 'No additional request details.'}</p>
          {order.statusHistory?.length ? (
            <div className="order-history">
              <h3>Order activity</h3>
              <ol>
                {order.statusHistory.map((event, index) => (
                  <li key={event.at + '-' + index}>
                    <span>{event.status.replace(/_/g, ' ')}</span>
                    <small>{new Date(event.at).toLocaleString()}</small>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          <div className="policy-warning">The current site records service requests but does not yet accept payment or private document uploads.</div>
          <button className="button button-dark" onClick={() => go('client/orders')}>Back to order list <ArrowRight size={16} /></button>
        </div>
      ) : (
        <div>
          <div className="portal-toolbar">
            <p className="muted">Signed in as {user.email || user.name || 'authenticated client'}</p>
            <button className="text-button" onClick={() => void signOut()} disabled={busy}>Sign out</button>
          </div>
          {orders.length ? (
            <div className="client-order-list">
              {orders.map(item => (
                <button className="client-order-card" key={item.id} onClick={() => go('client/orders/' + encodeURIComponent(item.reference))}>
                  <span className="client-order-card-main">
                    <span className="overline">{item.reference}</span>
                    <strong>{item.service}</strong>
                    <small>Requested {new Date(item.createdAt).toLocaleDateString()}</small>
                  </span>
                  <span className="client-order-card-status">{item.status.replace(/_/g, ' ')} <ArrowRight size={15} /></span>
                </button>
              ))}
            </div>
          ) : (
            <div className="pricing-pending portal-panel">
              <h2>No orders are linked to this account.</h2>
              <p>Use the email address submitted with your order, or start a new service request.</p>
              <button className="button button-dark" onClick={() => go('request-service')}>Start a service request <ArrowRight size={16} /></button>
            </div>
          )}
        </div>
      )}
      <div className="portal-bottom-links">
        <button className="text-button" onClick={() => go('services')}>Explore services <ArrowRight size={15} /></button>
        <button className="text-button" onClick={() => go('contact')}>Contact the team <ArrowRight size={15} /></button>
      </div>
    </section>
  );
}

export default App;
