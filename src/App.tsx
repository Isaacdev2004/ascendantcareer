import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import './app.css';

const PHONE_DISPLAY = '+1 (618) 328-1534';
const PHONE_TEL = '+16183281534';
const TEXT_LINK = 'sms:+16183281534';
const WA_DISPLAY = '+1 (618) 440-6067';
const WA_LINK = 'https://wa.me/16184406067';
const EMAIL = 'contact@ascendantcareer.com';
const MAILTO = 'mailto:contact@ascendantcareer.com';

const team = [
  {
    name: 'Victor I.',
    initials: 'VI',
    role: 'Ascendant Career Writer',
    bio: 'Victor works with senior professionals who need a resume that shows leadership scope, business contribution, and career progression instead of a long list of duties. Since joining Ascendant, he has helped managers and executives prepare for a new opportunity, a wider role, or a move that has to be explained clearly. He starts from what the client actually did, then shapes that record into a document a hiring manager can read quickly. Victor’s priority is personal service: each resume is built around that person, not a template.',
  },
  {
    name: 'Esther O.',
    initials: 'EO',
    role: 'Ascendant Career Writer',
    bio: 'Esther focuses on people who are changing direction. She looks for skills that carry from one field to another and puts those forward so the new path is easy to understand. Since joining Ascendant, she has worked with professionals preparing for a career change, people returning to work, and clients moving from hands-on roles into leadership. She writes in plain language and does not stretch a story past what the client can discuss in an interview. Esther’s aim is a document the client can stand behind.',
  },
  {
    name: 'Azeez K.',
    initials: 'AK',
    role: 'Ascendant Career Writer',
    bio: 'Azeez writes for technical and professional roles, where the details matter and the page still has to be readable. He helps clients show projects, tools, and results in language that fits the jobs they are targeting. Since joining Ascendant, he has worked with people in technology, operations, and professional services, including clients updating a resume after years in the same field. He will not add a skill or a result the client did not provide, and he revises until the draft matches the agreed brief.',
  },
  {
    name: 'Joseph P.',
    initials: 'JP',
    role: 'Ascendant Career Writer',
    bio: 'Joseph works with students, recent graduates, and people early in their careers. A first resume cannot lean on a long work history, so he draws out education, projects, part-time work, and strengths that are real. Since joining Ascendant, he has helped entry-level candidates prepare a resume and a short cover letter for a first professional role. He keeps the process straightforward and explains each choice, so the client understands the document and can update it later.',
  },
  {
    name: 'Margaret A.',
    initials: 'MA',
    role: 'Ascendant Career Writer',
    bio: 'Margaret writes the pieces that sit beside the resume: LinkedIn profiles, cover letters, professional bios, and thank-you notes. She looks for one consistent story, so the headline, the About section, and the letter all describe the same person. Since joining Ascendant, she has helped clients who needed a clearer public profile or a letter aimed at one specific role. She takes time with the details the client confirms, then uses those details to make the background distinct without overstating it.',
  },
];

type Service = {
  slug: string;
  title: string;
  summary: string;
  lead: string;
  points: string[];
};

const services: Service[] = [
  {
    slug: 'resume-writing',
    title: 'Resume Writing',
    summary: 'A resume written from your experience and aimed at the roles you want next.',
    lead: 'We organize your work history, skills, and results into a document a hiring manager can read quickly. The content comes from you. We do not invent roles, degrees, or achievements.',
    points: [
      'A consultation to understand your experience and target role',
      'A structured resume written in clear, specific language',
      'Editing passes within the revision window we agree before work starts',
      'Final files delivered in Word and PDF',
    ],
  },
  {
    slug: 'cover-letter',
    title: 'Cover Letter Writing',
    summary: 'A letter that connects your background to one role or one kind of role.',
    lead: 'Bring the job posting when you have it. We write a letter that explains why your experience is relevant, using details you confirm.',
    points: [
      'A letter written for a specific role or career direction',
      'A tone matched to the industry you are approaching',
      'A version you can adapt for later applications',
    ],
  },
  {
    slug: 'linkedin',
    title: 'LinkedIn Profile Writing',
    summary: 'Headline, About, and experience copy you can paste into your own profile.',
    lead: 'We never need your LinkedIn password. You receive the wording, and you publish it yourself.',
    points: [
      'Headline options',
      'An About section draft',
      'Experience descriptions aligned with your resume',
    ],
  },
  {
    slug: 'interview-prep',
    title: 'Interview Preparation',
    summary: 'A working session to organize your examples before you interview.',
    lead: 'We help you choose stories from your real work, practice how to tell them, and prepare questions for the employer. The session length is confirmed before you book.',
    points: [
      'A scheduled preparation session',
      'Prompts based on the role you are pursuing',
      'Notes you can review afterward',
    ],
  },
  {
    slug: 'thank-you-letter',
    title: 'Thank You Letter',
    summary: 'A short follow-up note after an interview or introduction.',
    lead: 'A concise letter that refers to the conversation you actually had and restates your interest without overstating it.',
    points: [
      'A note tailored to the interview or meeting',
      'Language you can send by email',
      'A second pass if the agreed scope includes a revision',
    ],
  },
  {
    slug: 'professional-bio',
    title: 'Professional Bio',
    summary: 'A short or long biography for a profile, speaker introduction, or company page.',
    lead: 'Tell us where the bio will appear and who will read it. We match the length and tone to that use.',
    points: [
      'A biography in the length we agree',
      'A tone suited to the audience',
      'Edited final copy',
    ],
  },
  {
    slug: 'career-coaching',
    title: 'Career Coaching',
    summary: 'A focused conversation about your next step and how to describe it.',
    lead: 'Coaching is a working session, not a job placement service. We help you clarify direction, priorities, and the materials you need. Hiring decisions stay with employers.',
    points: [
      'A consultation about your target and constraints',
      'Practical next steps for your search',
      'Guidance on which documents are worth writing first',
    ],
  },
];

const packages = [
  {
    slug: 'entry-level-resume',
    title: 'Entry Level Resume',
    who: 'For people with about 0–2 years in the workforce.',
    points: [
      'A conversation about school, projects, and early roles',
      'A resume format that is easy for an employer to scan',
      'Wording based only on experience you provide',
      'Draft timing, price, and revisions confirmed before we start',
      'Final resume emailed in Word and PDF',
    ],
  },
  {
    slug: 'professional-resume',
    title: 'Professional Resume',
    who: 'For people with more than two years of work experience.',
    points: [
      'A consultation about your roles and the job you want next',
      'A resume that leads with relevant strengths',
      'Language aligned to the postings you share with us',
      'Draft timing, price, and revisions confirmed before we start',
      'Final resume emailed in Word and PDF',
    ],
  },
  {
    slug: 'executive-resume',
    title: 'Executive Resume',
    who: 'For directors, vice presidents, and other leadership roles.',
    points: [
      'A consultation about scope, leadership, and results you can verify',
      'A narrative built around responsibility and impact',
      'Room for a board, P&L, or transformation story when it is true',
      'Draft timing, price, and revisions confirmed before we start',
      'Final resume emailed in Word and PDF',
    ],
  },
];

const testimonials = [
  {
    quote:
      'The process helped me look at my experience from a more strategic perspective. Instead of simply listing responsibilities, the résumé presented my leadership experience, business contributions and career progression in a much clearer way. The final document felt appropriate for the level of roles I am pursuing.',
    name: 'Michael R. Bennett',
    role: 'Senior Operations Executive',
  },
  {
    quote:
      'My LinkedIn profile needed a clearer professional direction. The revised headline, About section and experience descriptions created a more consistent picture of my skills and the work I want to pursue. I now have a much clearer foundation for professional networking.',
    name: 'Daniel K. Foster',
    role: 'LinkedIn profile client',
  },
  {
    quote:
      'I needed help presenting experience from a different industry in a way that made sense for my new career direction. The revised résumé brought forward transferable skills and relevant achievements while making the transition easier to understand.',
    name: 'Olivia M. Carter',
    role: 'Career transition client',
  },
  {
    quote:
      'The revised CV gave my academic experience a more organized presentation. My education, research activities, teaching experience and professional contributions were easier to navigate, which made the document more suitable for academic and research opportunities.',
    name: 'Dr. Samuel T. Williams',
    role: 'Academic and research professional',
  },
  {
    quote:
      'I appreciated the focus on relevance and clarity. The application documents connected my experience to the type of position I was pursuing without relying on exaggerated language. The result was professional, focused and easier to personalize for individual applications.',
    name: 'Natalie J. Brooks',
    role: 'Professional résumé client',
  },
];

const industries = [
  ['Technology', 'Software, cloud, and digital roles.'],
  ['Healthcare', 'Clinical leadership, operations, and administration.'],
  ['Education', 'Teaching, research, and campus roles.'],
  ['Finance', 'Accounting, analysis, and professional services.'],
  ['Operations', 'Project management and business operations.'],
  ['Non-profit', 'Program and development work.'],
];

const faqs = [
  [
    'Will a new résumé guarantee interviews or a job?',
    'No. Our work focuses on the clarity and presentation of your career materials. Hiring decisions, interviews, referrals and compensation are outside our control.',
  ],
  [
    'What should I prepare before we start?',
    'An existing résumé if you have one, the details of your experience, the role or direction you are targeting, and any job description you want us to use. We only ask for information needed for the service you choose.',
  ],
  [
    'How do I reach you?',
    `Call or text ${PHONE_DISPLAY}. Email ${EMAIL}. For WhatsApp, message ${WA_DISPLAY}. The form on this site opens a WhatsApp message so you can send your request directly.`,
  ],
  [
    'Can I request changes after delivery?',
    'Revision allowances depend on the package we agree with you. Scope, price, and revision terms are confirmed before work begins.',
  ],
  [
    'Do you need my LinkedIn password or other logins?',
    'No. We write the copy and you publish it. Please do not send passwords, government ID numbers, or unrelated sensitive information.',
  ],
  [
    'Do you offer recruitment or job placement?',
    'No. Ascendant Career Services writes career documents and prepares you for conversations. We do not place candidates into jobs.',
  ],
];

const steps = [
  ['01', 'Choose a service', 'Tell us whether you need a resume, a letter, a LinkedIn profile, or a preparation session.'],
  ['02', 'Talk with us', 'Call, text, or WhatsApp. We ask about your experience and the role you want.'],
  ['03', 'Agree the scope', 'You receive the price, turnaround, and revision terms before any work starts.'],
  ['04', 'Review the draft', 'We write from what you shared. You tell us what to adjust.'],
  ['05', 'Receive your files', 'Resume work is delivered in Word and PDF. Other services are delivered in the format we agreed.'],
];

function go(path: string) {
  window.location.hash = path ? '#/' + path : '#/';
}

function App() {
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#\/?/, ''));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState('');
  const [faqOpen, setFaqOpen] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash.replace(/^#\/?/, ''));
      setMobileOpen(false);
      setOpenMenu('');
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setReviewIndex(current => (current + 1) % testimonials.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const serviceSlug = route.startsWith('services/') ? route.split('/')[1] : '';
  const detail = services.find(item => item.slug === serviceSlug);
  const preset = route.startsWith('get-started/') ? route.split('/')[1] : '';

  const page = useMemo(() => {
    if (!route) return 'home';
    if (route === 'services' || detail) return 'service';
    if (route === 'how-it-works') return 'how';
    if (route === 'why-us') return 'why';
    if (route === 'pricing') return 'pricing';
    if (route === 'samples') return 'samples';
    if (route === 'faq') return 'faq';
    if (route === 'about') return 'about';
    if (route === 'team') return 'team';
    if (route === 'contact') return 'contact';
    if (route === 'get-started' || route.startsWith('get-started/')) return 'start';
    if (route === 'privacy' || route === 'terms' || route === 'disclaimer') return 'policy';
    return 'missing';
  }, [route, detail]);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get('q') ?? '').trim().toLowerCase();
    const hit = services.find(item =>
      (item.title + ' ' + item.summary).toLowerCase().includes(query)
    );
    go(hit ? 'services/' + hit.slug : 'services');
  }

  const shownReviews = [
    testimonials[reviewIndex],
    testimonials[(reviewIndex + 1) % testimonials.length],
  ];

  return (
    <div className="site">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#/" aria-label="Ascendant home">
            <img src="/logo.png" alt="Ascendant" />
            <small>Professional resumes and career documents.</small>
          </a>
          <button
            className="menu-toggle"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(open => !open)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
          <nav className={mobileOpen ? 'nav open' : 'nav'} aria-label="Main">
            <div className={openMenu === 'services' ? 'menu open' : 'menu'}>
              <button className="trigger" onClick={() => setOpenMenu(openMenu === 'services' ? '' : 'services')}>
                Our Services <ChevronDown size={14} />
              </button>
              <div className="menu-panel">
                {services.map(service => (
                  <a key={service.slug} href={'#/services/' + service.slug}>{service.title}</a>
                ))}
              </div>
            </div>
            <a href="#/how-it-works">How it Works</a>
            <a href="#/why-us">Why Us</a>
            <a href="#/pricing">Pricing</a>
            <div className={openMenu === 'resources' ? 'menu open' : 'menu'}>
              <button className="trigger" onClick={() => setOpenMenu(openMenu === 'resources' ? '' : 'resources')}>
                Resources <ChevronDown size={14} />
              </button>
              <div className="menu-panel">
                <a href="#/samples">Sample Resumes</a>
                <a href="#/faq">FAQs</a>
              </div>
            </div>
            <div className={openMenu === 'about' ? 'menu open' : 'menu'}>
              <button className="trigger" onClick={() => setOpenMenu(openMenu === 'about' ? '' : 'about')}>
                About Us <ChevronDown size={14} />
              </button>
              <div className="menu-panel">
                <a href="#/about">Our Story</a>
                <a href="#/team">Meet the Team</a>
              </div>
            </div>
            <a className="btn header-cta" href="#/get-started">Get Started</a>
            <form className="search" onSubmit={onSearch} role="search">
              <input name="q" aria-label="Search services" placeholder="Search…" />
              <button type="submit" aria-label="Search">⌕</button>
            </form>
          </nav>
        </div>
      </header>

      <a className="callbar" href={'tel:' + PHONE_TEL}>Tap here to call us now!</a>
      <div className="reach">
        <a href={TEXT_LINK}>Text {PHONE_DISPLAY}</a>
        <a href={MAILTO}>{EMAIL}</a>
        <a href={WA_LINK} target="_blank" rel="noreferrer">WhatsApp {WA_DISPLAY}</a>
      </div>

      {page === 'home' && (
        <>
          <section className="hero">
            <img className="hero-mark" src="/mark.png" alt="" />
            <div className="hero-reviews">
              {shownReviews.map(item => (
                <article className="review-card" key={item.name}>
                  <p>“{item.quote}”</p>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </article>
              ))}
            </div>
            <div className="hero-caption">
              <h1>Work with a resume writing service that starts from your real experience.</h1>
              <p>
                Ascendant Career Services writes resumes, cover letters, and LinkedIn profiles
                for the roles you are actually pursuing. Call, text, or WhatsApp to get started.
              </p>
              <a className="btn" href="#/get-started">Get Started</a>
            </div>
          </section>

          <section className="section">
            <div className="wrap">
              <PackageGrid />
              <p className="price-note">
                Price, turnaround, and revisions are confirmed on your call before any work begins.
                We do not publish a rate that might not match your documents.
              </p>
            </div>
          </section>

          <section className="guarantee">
            <img className="mark-badge" src="/mark.png" alt="" />
            <h2>Our writing is revised until the agreed draft is right.</h2>
            <p>Not satisfied with the document we agreed to write? Tell us during the revision window and we will correct it.</p>
            <a className="btn" href="#/why-us">Learn more</a>
          </section>

          <section className="section">
            <div className="wrap help-grid">
              {[
                ['cover-letter', 'Cover Letter Help', 'Need a letter for a specific role? We write it from the experience you share.'],
                ['linkedin', 'LinkedIn Profiles', 'We prepare the copy. You paste it into your profile. No password required.'],
                ['interview-prep', 'Interview Preparation', 'Practice the examples you already have so they are easier to explain.'],
                ['career-coaching', 'Career Coaching', 'A working session on direction, priorities, and which documents to write first.'],
              ].map(item => (
                <a className="help-card" href={'#/services/' + item[0]} key={item[0]}>
                  <img src="/mark.png" alt="" />
                  <h3>{item[1]}</h3>
                  <p>{item[2]}</p>
                </a>
              ))}
            </div>
          </section>

          <section className="section" style={{ background: '#f7f7f7' }}>
            <div className="wrap">
              <div className="center">
                <h2>Career documents for the work you do.</h2>
                <p className="lead">These are fields we write for. They are not client lists, partnerships, or employer endorsements.</p>
              </div>
              <div className="industry-grid">
                {industries.map(item => (
                  <article className="industry-card" key={item[0]}>
                    <span>FIELD</span>
                    <h3>{item[0]}</h3>
                    <p>{item[1]}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="wrap why">
              <div className="why-visual">
                <img src="/logo.png" alt="Ascendant" />
              </div>
              <div>
                <h2>Why choose Ascendant?</h2>
                <ul>
                  <li>Resumes, letters, bios, and LinkedIn copy are written from information you provide.</li>
                  <li>We do not invent employers, job titles, degrees, or results.</li>
                  <li>You approve the price and the revision terms before work starts.</li>
                  <li>You can call, text, or WhatsApp a person, not a ticket queue.</li>
                  <li>A finished resume is delivered in Word and PDF.</li>
                  <li>Nothing on this site is a promise of interviews, offers, or salary.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="section" style={{ background: '#f7f7f7' }}>
            <div className="wrap">
              <h2>What clients have shared</h2>
              <div className="quote-grid">
                {testimonials.map(item => (
                  <blockquote className="quote" key={item.name}>
                    <p>“{item.quote}”</p>
                    <footer>{item.name}<span>{item.role}</span></footer>
                  </blockquote>
                ))}
              </div>
              <p className="disclaimer">
                Testimonials are published as supplied by Ascendant Career Services. Individual experiences vary; these comments do not guarantee interviews, job offers, salary increases or any specific employment outcome.
              </p>
            </div>
          </section>

          <section className="section">
            <div className="wrap home-faq">
              <div>
                <h2>Questions, answered.</h2>
                <p>If you still need a person, call or text {PHONE_DISPLAY}.</p>
                <a className="btn" href="#/get-started">Get Started</a>
              </div>
              <FaqList faqOpen={faqOpen} setFaqOpen={setFaqOpen} />
            </div>
          </section>
        </>
      )}

      {page === 'service' && !detail && (
        <Inner title="Our Services" kicker="What we write">
          <div className="help-grid">
            {services.map(service => (
              <a className="help-card" href={'#/services/' + service.slug} key={service.slug}>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
              </a>
            ))}
          </div>
        </Inner>
      )}

      {page === 'service' && detail && (
        <Inner title={detail.title} kicker="Our Services">
          <div className="contact-layout">
            <article className="info-card">
              <p className="lead">{detail.lead}</p>
              <ul>
                {detail.points.map(point => <li key={point}>{point}</li>)}
              </ul>
              <a className="btn" href={'#/get-started/' + detail.slug}>Get Started</a>
            </article>
            <DocumentPreview kind={detail.slug === 'cover-letter' ? 'letter' : 'resume'} />
          </div>
        </Inner>
      )}

      {page === 'how' && (
        <Inner title="A clear sequence, from first call to final file." kicker="How it Works">
          <div className="steps">
            {steps.map(step => (
              <article className="step" key={step[0]}>
                <b>{step[0]}</b>
                <div>
                  <h3>{step[1]}</h3>
                  <p>{step[2]}</p>
                </div>
              </article>
            ))}
          </div>
          <p style={{ marginTop: 22 }}><a className="btn" href="#/get-started">Get Started</a></p>
        </Inner>
      )}

      {page === 'why' && (
        <Inner title="Why people call Ascendant." kicker="Why Us">
          <div className="info-grid">
            <article className="info-card">
              <h3>Written from your record</h3>
              <p>Every line has to come from experience, education, or results you can stand behind. We reshape the wording. We do not manufacture a career.</p>
            </article>
            <article className="info-card">
              <h3>Terms before work</h3>
              <p>You hear the price, the turnaround, and how revisions work before we begin. There is no checkout on this website.</p>
            </article>
            <article className="info-card">
              <h3>A person answers</h3>
              <p>Call or text {PHONE_DISPLAY}. Email {EMAIL}. WhatsApp {WA_DISPLAY}.</p>
            </article>
            <article className="info-card">
              <h3>No job promise</h3>
              <p>A stronger document can make your experience easier to see. It cannot guarantee an interview, an offer, or a salary.</p>
            </article>
          </div>
        </Inner>
      )}

      {page === 'pricing' && (
        <Inner title="Choose the resume that matches your experience." kicker="Pricing">
          <PackageGrid />
          <p className="price-note">
            Tell us which package fits and we will confirm the price for your documents. Cover letters, LinkedIn profiles, bios, and coaching are quoted the same way.
          </p>
          <p style={{ textAlign: 'center', marginTop: 18 }}>
            <a className="btn" href="#/get-started">Request a service enquiry</a>
          </p>
        </Inner>
      )}

      {page === 'samples' && (
        <Inner title="See the structure. Your document uses your details." kicker="Sample Resumes">
          <div className="sample-grid">
            <article>
              <DocumentPreview kind="resume" />
              <h3 style={{ color: '#222' }}>Resume layout</h3>
              <p>A simple order: summary, skills, experience, education. Placeholders only.</p>
            </article>
            <article>
              <DocumentPreview kind="letter" />
              <h3 style={{ color: '#222' }}>Cover letter layout</h3>
              <p>A short letter that names the role and connects two or three real examples.</p>
            </article>
          </div>
          <p className="disclaimer">
            These are illustrative layouts, not a client’s career and not a promise of interviews, hiring, or employment.
          </p>
          <a className="btn" href="#/get-started">Request a service enquiry</a>
        </Inner>
      )}

      {page === 'faq' && (
        <Inner title="Frequently asked questions" kicker="Resources">
          <FaqList faqOpen={faqOpen} setFaqOpen={setFaqOpen} />
        </Inner>
      )}

      {page === 'about' && (
        <Inner title="Career documents, written with care." kicker="About Us">
          <div className="prose">
            <p>
              Ascendant Career Services helps people present work they have already done. We write resumes, cover letters, LinkedIn profiles, thank-you notes, professional bios, and interview preparation from the information you share.
            </p>
            <p>
              We are not a recruitment agency. We do not submit applications for you, and we do not promise that an employer will call.
            </p>
            <p>
              The fastest way to reach us is a call or text at {PHONE_DISPLAY}, an email to {EMAIL}, or WhatsApp at {WA_DISPLAY}.
            </p>
            <p><a className="btn" href="#/team">Meet the team</a></p>
            <a className="btn" href="#/contact">Contact Us</a>
          </div>
        </Inner>
      )}

      {page === 'team' && (
        <Inner title="The people who write with Ascendant." kicker="Meet the Team">
          <p className="lead">
            Each writer takes a different kind of brief. Every document is still built only from the experience the client provides.
          </p>
          <div className="team-grid">
            {team.map(person => (
              <article className="team-card" key={person.name}>
                <span className="mono" aria-hidden="true">{person.initials}</span>
                <h2>{person.name}</h2>
                <p className="role">{person.role}</p>
                <p className="bio">{person.bio}</p>
              </article>
            ))}
          </div>
          <p className="disclaimer">
            Questions for the team can go to <a href={MAILTO}>{EMAIL}</a>, a call or text at {PHONE_DISPLAY}, or WhatsApp at {WA_DISPLAY}.
          </p>
        </Inner>
      )}

      {page === 'contact' && (
        <Inner title="Call, text, email, or send a note." kicker="Contact Us">
          <div className="contact-layout">
            <div className="contact-card">
              <h3>Call or text</h3>
              <a className="big" href={'tel:' + PHONE_TEL}>{PHONE_DISPLAY}</a>
              <a href={TEXT_LINK}>Send a text message</a>
              <h3 style={{ marginTop: 22 }}>Email</h3>
              <a className="big" href={MAILTO}>{EMAIL}</a>
              <h3 style={{ marginTop: 22 }}>WhatsApp</h3>
              <a className="big" href={WA_LINK} target="_blank" rel="noreferrer">{WA_DISPLAY}</a>
              <p>Use the form if you would rather start with a few details. It opens WhatsApp with your message ready to send. You can also email {EMAIL} directly.</p>
            </div>
            <EnquiryForm preset="" />
          </div>
        </Inner>
      )}

      {page === 'start' && (
        <Inner title="Tell us what you need written." kicker="Get Started">
          <div className="form-layout">
            <div className="contact-card">
              <h3>Prefer to talk now?</h3>
              <a className="big" href={'tel:' + PHONE_TEL}>{PHONE_DISPLAY}</a>
              <p>That number is for calls and texts.</p>
              <h3>Email</h3>
              <a className="big" href={MAILTO}>{EMAIL}</a>
              <h3>WhatsApp</h3>
              <a className="big" href={WA_LINK} target="_blank" rel="noreferrer">{WA_DISPLAY}</a>
              <p>After you submit the form, WhatsApp opens so you can send the enquiry yourself. This page does not store the form on a server.</p>
            </div>
            <EnquiryForm preset={preset} />
          </div>
        </Inner>
      )}

      {page === 'policy' && <Policy route={route} />}

      {page === 'missing' && (
        <Inner title="That page is not on this site." kicker="Ascendant">
          <a className="btn" href="#/">Back to the homepage</a>
        </Inner>
      )}

      <footer className="site-footer">
        <div className="wrap foot-grid">
          <div>
            <a className="foot-brand" href="#/"><img src="/logo.png" alt="Ascendant" /></a>
            <p>Resumes, cover letters, LinkedIn profiles, and interview preparation written from your experience.</p>
            <p><a href={'tel:' + PHONE_TEL}>Call or text {PHONE_DISPLAY}</a></p>
            <p><a href={MAILTO}>{EMAIL}</a></p>
            <p><a href={WA_LINK} target="_blank" rel="noreferrer">WhatsApp {WA_DISPLAY}</a></p>
          </div>
          <div>
            <h3>Our Services</h3>
            <ul>
              {services.map(service => (
                <li key={service.slug}><a href={'#/services/' + service.slug}>{service.title}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Resources</h3>
            <ul>
              <li><a href="#/samples">Sample Resumes</a></li>
              <li><a href="#/faq">FAQs</a></li>
              <li><a href="#/how-it-works">How it Works</a></li>
              <li><a href="#/pricing">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h3>Company</h3>
            <ul>
              <li><a href="#/about">Our Story</a></li>
              <li><a href="#/team">Meet the Team</a></li>
              <li><a href="#/why-us">Why Us</a></li>
              <li><a href="#/contact">Contact Us</a></li>
              <li><a href="#/terms">Terms</a></li>
              <li><a href="#/privacy">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="wrap legal">
          <span>© {new Date().getFullYear()} Ascendant Career Services</span>
          <nav>
            <a href="#/privacy">Privacy</a>
            <a href="#/terms">Terms</a>
            <a href="#/disclaimer">Disclaimer</a>
          </nav>
        </div>
      </footer>

      <a className="wa-float" href={WA_LINK} target="_blank" rel="noreferrer">WhatsApp</a>
    </div>
  );
}

function PackageGrid() {
  return (
    <div className="packages">
      {packages.map(item => (
        <article className="package" key={item.slug}>
          <h2>{item.title}</h2>
          <p className="who">{item.who}</p>
          <ul>
            {item.points.map(point => <li key={point}>{point}</li>)}
          </ul>
          <a className="start" href={'#/get-started/' + item.slug}>Get Started »</a>
        </article>
      ))}
    </div>
  );
}

function FaqList({ faqOpen, setFaqOpen }: { faqOpen: number; setFaqOpen: (value: number) => void }) {
  return (
    <div>
      {faqs.map((faq, index) => (
        <article className="faq-item" key={faq[0]}>
          <button aria-expanded={faqOpen === index} onClick={() => setFaqOpen(faqOpen === index ? -1 : index)}>
            <span>{faq[0]}</span>
            <span>{faqOpen === index ? '−' : '+'}</span>
          </button>
          {faqOpen === index && <p>{faq[1]}</p>}
        </article>
      ))}
    </div>
  );
}

function Inner({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <p>{kicker}</p>
          <h1>{title}</h1>
        </div>
      </div>
      <section className="section">
        <div className="wrap">{children}</div>
      </section>
    </>
  );
}

function DocumentPreview({ kind }: { kind: 'resume' | 'letter' }) {
  if (kind === 'letter') {
    return (
      <div className="doc-sheet" aria-label="Illustrative cover letter layout">
        <div className="doc-name">YOUR NAME</div>
        <div className="doc-meta">City · email@example.com · Phone</div>
        <p>[Date]</p>
        <p>Dear [Hiring Manager],</p>
        <p>I am writing about the [Target Role]. In my current work I [one true example]. Before that I [a second true example].</p>
        <p>I would like to talk about how that experience fits the role.</p>
        <p>Sincerely,<br /><strong>[Your Name]</strong></p>
      </div>
    );
  }
  return (
    <div className="doc-sheet" aria-label="Illustrative resume layout">
      <div className="doc-name">YOUR NAME</div>
      <div className="doc-meta">City · email@example.com · LinkedIn URL</div>
      <h3>SUMMARY</h3>
      <div className="rule" /><div className="rule mid" /><div className="rule short" />
      <h3>EXPERIENCE</h3>
      <p><strong>Role title</strong> · Dates<br />Organization · Location</p>
      <div className="rule" /><div className="rule mid" />
      <h3>EDUCATION</h3>
      <div className="rule short" />
    </div>
  );
}

function EnquiryForm({ preset }: { preset: string }) {
  const options = [
    ...packages.map(item => ({ value: item.slug, label: item.title })),
    ...services.filter(item => item.slug !== 'resume-writing').map(item => ({ value: item.slug, label: item.title })),
  ];
  const initial = options.some(item => item.value === preset) ? preset : 'professional-resume';
  const [sentLink, setSentLink] = useState('');
  const [error, setError] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const data = new FormData(event.currentTarget);
    if (data.get('privacy') !== 'on') {
      setError('Please confirm the privacy note before sending.');
      return;
    }
    const service = options.find(item => item.value === String(data.get('service')))?.label ?? 'Service enquiry';
    const text = [
      'Hello Ascendant Career Services, I would like to enquire about a service.',
      'Name: ' + String(data.get('name') ?? '').trim(),
      'Email: ' + String(data.get('email') ?? '').trim(),
      'Phone: ' + String(data.get('phone') ?? '').trim(),
      'Service: ' + service,
      'Message: ' + String(data.get('message') ?? '').trim(),
    ].join('\n');
    const url = WA_LINK + '?text=' + encodeURIComponent(text);
    setSentLink(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  if (sentLink) {
    return (
      <div className="form-card success">
        <h2>Your message is ready in WhatsApp.</h2>
        <p>Press send in WhatsApp to deliver it to {WA_DISPLAY}. If the window did not open, use the link below.</p>
        <p><a href={sentLink} target="_blank" rel="noreferrer">Open WhatsApp</a></p>
        <p>You can also email <a href={MAILTO}>{EMAIL}</a>, or call or text <a href={'tel:' + PHONE_TEL}>{PHONE_DISPLAY}</a>.</p>
      </div>
    );
  }

  return (
    <form className="form-card enquiry-form" onSubmit={onSubmit}>
      <h2 style={{ color: '#222', marginBottom: 0 }}>Request a service enquiry</h2>
      <div className="field-row">
        <label>Full name *
          <input name="name" required autoComplete="name" maxLength={120} />
        </label>
        <label>Email *
          <input name="email" type="email" required autoComplete="email" maxLength={254} />
        </label>
      </div>
      <div className="field-row">
        <label>Phone
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
        <label>Service *
          <select name="service" defaultValue={initial}>
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label>What should we know? *
        <textarea name="message" required rows={5} maxLength={2000} placeholder="Your target role, years of experience, and what you want written." />
      </label>
      <label className="check">
        <input type="checkbox" name="privacy" required />
        <span>I understand this form opens WhatsApp so I can send my own message, and I will not include passwords or government ID numbers.</span>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn" type="submit">Get Started</button>
    </form>
  );
}

function Policy({ route }: { route: string }) {
  if (route === 'privacy') {
    return (
      <Inner title="Privacy notice" kicker="Company">
        <div className="prose">
          <p>The enquiry form on this website does not save your details on our server. When you submit it, your browser opens WhatsApp with the name, email, phone, service, and message you typed, so you can send that message to {WA_DISPLAY}.</p>
          <p>If you call or text {PHONE_DISPLAY}, your phone provider handles that communication the way it handles any other call or text. Email sent to {EMAIL} is read by the Ascendant team.</p>
          <p>Please do not send passwords, government identification numbers, or other information we do not need in order to write a career document.</p>
        </div>
      </Inner>
    );
  }
  if (route === 'terms') {
    return (
      <Inner title="Terms of service" kicker="Company">
        <div className="prose">
          <p>Work begins only after we confirm the service, the price, the turnaround, and the revision terms with you. Submitting the form or sending a WhatsApp message is an enquiry, not a paid order.</p>
          <p>You agree that the experience, dates, titles, and results you give us are accurate. We will not add credentials or achievements you did not provide.</p>
          <p>There is no online checkout on this site. Any payment is arranged separately after the scope is confirmed.</p>
        </div>
      </Inner>
    );
  }
  return (
    <Inner title="Service disclaimer" kicker="Company">
      <div className="prose">
        <h2>No employment guarantee</h2>
        <p>Buying a resume, letter, profile, bio, or coaching session does not guarantee interviews, job offers, recruiter replies, or any salary. Employers make those decisions.</p>
        <h2>What we are</h2>
        <p>Ascendant Career Services is a writing and preparation service. It is not a recruitment agency and it does not place candidates into jobs.</p>
      </div>
    </Inner>
  );
}

export default App;
