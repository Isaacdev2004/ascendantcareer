import { ExternalLink, ArrowRight, FileText, Mail } from 'lucide-react';

type ActionProps = { onEnquire: () => void; onOrder: () => void };

const resources = [
  { name: 'O*NET Online', kind: 'Occupational information', url: 'https://www.onetonline.org/', desc: 'Explore occupational profiles, skills and work activities.' },
  { name: 'CareerOneStop', kind: 'Career resource', url: 'https://www.careeronestop.org/', desc: 'Explore career options, training and job-search resources.' },
  { name: 'Occupational Outlook Handbook', kind: 'Labour-market information', url: 'https://www.bls.gov/ooh/', desc: 'Review occupational outlook, work environments and education information.' },
  { name: 'LinkedIn Help', kind: 'Platform support', url: 'https://www.linkedin.com/help/linkedin', desc: 'Find official guidance for LinkedIn profile features.' }
];

function ResumeSample() {
  return (
    <article className="sample-document-card">
      <div className="sample-document-topline"><span>ILLUSTRATIVE LAYOUT</span><FileText size={17}/></div>
      <div className="sample-resume-sheet">
        <header className="sample-resume-header">
          <span className="sample-name-placeholder">YOUR NAME</span>
          <span className="sample-contact-placeholder">City, Country · email@example.com · LinkedIn URL</span>
          <h3>PROFESSIONAL SUMMARY</h3>
          <p>Briefly introduce your professional focus, strongest capabilities and the value you bring to your target role.</p>
        </header>
        <section className="sample-resume-section">
          <h3>CORE SKILLS</h3>
          <p className="sample-skill-row">Skill or strength · Skill or strength · Skill or strength</p>
        </section>
        <section className="sample-resume-section">
          <h3>PROFESSIONAL EXPERIENCE</h3>
          <div className="sample-role-line"><strong>Role title</strong><span>Dates</span></div>
          <p className="sample-org-line">Organization · Location</p>
          <p>Describe a relevant responsibility, contribution or measurable result using your own experience.</p>
          <div className="sample-role-line"><strong>Previous role</strong><span>Dates</span></div>
          <p className="sample-org-line">Organization · Location</p>
          <p>Highlight an achievement or responsibility that supports your next career step.</p>
        </section>
        <section className="sample-resume-section">
          <h3>EDUCATION & DEVELOPMENT</h3>
          <p>Qualification or course · Institution · Year</p>
        </section>
      </div>
      <div className="sample-document-caption"><h3>Résumé / CV layout</h3><p>A clean structure for summarizing skills, experience, achievements and education.</p></div>
    </article>
  );
}

function CoverLetterSample() {
  return (
    <article className="sample-document-card">
      <div className="sample-document-topline"><span>ILLUSTRATIVE LAYOUT</span><Mail size={17}/></div>
      <div className="sample-letter-sheet">
        <div className="sample-letter-mark">CAREER DOCUMENTS</div>
        <p className="sample-letter-date">[Date]</p>
        <p>[Hiring Manager Name]<br/>[Organization]<br/>[Location]</p>
        <p className="sample-letter-subject">Re: [Target Role]</p>
        <p>Dear [Hiring Manager Name],</p>
        <p>I am writing to express my interest in the [Target Role] opportunity. My experience in [relevant area] has helped me develop strengths in [relevant skills or capabilities].</p>
        <p>In my previous work, I have [brief example of a relevant contribution or achievement]. I would welcome the opportunity to bring this experience to your team and support [organization or role-specific priority].</p>
        <p>Thank you for considering my application. I would appreciate the opportunity to discuss how my background aligns with the role.</p>
        <p className="sample-letter-signoff">Kind regards,<br/><strong>[Your Name]</strong></p>
      </div>
      <div className="sample-document-caption"><h3>Cover-letter layout</h3><p>A role-specific introduction connecting your real experience with an opportunity.</p></div>
    </article>
  );
}

export function PricingPage({ onEnquire }: ActionProps) {
  return (
    <div className="enhanced-page page-width enquiry-pricing-page">
      <p className="overline">SERVICE ENQUIRIES</p>
      <h1>Find the right support<br/><em>for your next step.</em></h1>
      <p className="page-intro">Tell us about your career goals and the service you need. Our team will review your requirements and respond with information about the suitable service and its pricing.</p>
      <section className="package-finder enquiry-first-panel">
        <div>
          <p className="overline">PERSONALIZED GUIDANCE</p>
          <h2>Interested in our services?</h2>
          <p>We will discuss your needs, confirm the scope of work and explain the available options before you decide how to proceed.</p>
          <button className="button button-dark" onClick={onEnquire}>Request a Service Enquiry <ArrowRight size={16}/></button>
        </div>
        <div className="enquiry-service-list">
          <h3>Services you can ask about</h3>
          <ul>
            <li>Professional résumé writing</li>
            <li>Executive résumé development</li>
            <li>Cover letters</li>
            <li>LinkedIn profile optimization</li>
            <li>Professional biographies</li>
            <li>Résumé review and editing</li>
            <li>Career-document consultation</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export function PackageFinder({ onEnquire }: { onEnquire: () => void }) {
  return <PricingPage onEnquire={onEnquire} onOrder={onEnquire}/>;
}

export function PortfolioPage({ onEnquire }: { onEnquire: () => void }) {
  return (
    <div className="enhanced-page page-width portfolio-page">
      <p className="overline">SAMPLE DOCUMENTS</p>
      <h1>See how your story<br/><em>can take shape.</em></h1>
      <p className="page-intro">Explore these illustrative layouts to see how career information can be organized with clarity and purpose. The examples use placeholders, not client records or employment histories. Your document will be built around the details you provide.</p>
      <div className="sample-document-grid">
        <ResumeSample />
        <CoverLetterSample />
      </div>
      <p className="sample-disclaimer">These are illustrative design samples, not a representation of a real client or a promise of interview, hiring or employment outcomes.</p>
      <div className="portfolio-cta">
        <h2>Discuss the document you need.</h2>
        <p>Tell us about your goals and we will respond with information about the most suitable service and its pricing.</p>
        <button className="button button-dark" onClick={onEnquire}>Request a Service Enquiry <ArrowRight size={16}/></button>
      </div>
    </div>
  );
}

export function ResourcesSection() {
  return (
    <>
      <div className="section-heading"><div><p className="overline">INDEPENDENT CAREER TOOLS</p><h2>Resources for your<br/><em>career research.</em></h2></div></div>
      <p className="page-intro">These independent resources may help with career exploration and occupational research. They are not presented as partners or endorsers.</p>
      <div className="resource-grid">{resources.map(resource => <a href={resource.url} target="_blank" rel="noreferrer" key={resource.name}><span>{resource.kind}</span><h3>{resource.name} <ExternalLink size={14}/></h3><p>{resource.desc}</p></a>)}</div>
    </>
  );
}
