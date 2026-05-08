import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import VRArena from '../components/3d/VRArena'
import { ChevronDown, ChevronUp, Clock, Users, Trophy, Sparkles, Calendar, Award, BookOpen, HelpCircle, Mail, ExternalLink, Star, Zap, Target, Shield, Eye, Presentation } from 'lucide-react'

const stats = [
  { value: '36', label: 'Hours Non-Stop', icon: '⏱️' },
  { value: '500+', label: 'Participants', icon: '👥' },
  { value: '50K+', label: 'Prize Pool (INR)', icon: '💰' },
  { value: '15+', label: 'Expert Mentors', icon: '🧠' },
]

const organizers = [
  { name: 'DeepLoop Technologies', role: 'Organizer', desc: 'XR Infrastructure — Provides VR hardware, dev kits, and technical mentorship.', color: '#00f5ff', logo: '/logos/deeploop.png' },
  { name: 'Optern', role: 'Co-Organizer', desc: 'Talent Development & Innovation Ecosystem — Manages registrations, internship pipelines, and participant experience.', color: '#ff00ff', logo: '/logos/optern.png' },
  { name: 'JTBI', role: 'Co-Organizer', desc: 'Research & Technology Business Incubation — Provides incubation support, judging panel, and post-hackathon opportunities.', color: '#7b2ffa', logo: '/logos/jtbi.png' },
]

const schedule = [
  { day: 'Day 1', time: '08:00 AM', title: 'Check-in & Registration', desc: 'Participants arrive, collect event kits, and set up their workstations. VR hardware stations go live across the venue.' },
  { day: 'Day 1', time: '10:00 AM', title: 'Opening Ceremony & Keynote', desc: 'Welcome addresses from DeepLoop Technologies, Optern & JTBI leadership. Keynote by an XR industry visionary on the future of VR gaming.' },
  { day: 'Day 1', time: '11:00 AM', title: 'HACK BEGINS — Loops Activated', desc: 'The 36-hour countdown starts. Teams converge on their chosen tracks. Mentors are available from this moment onward.', highlight: true },
  { day: 'Day 1', time: '01:00 PM', title: 'Workshop: VR Development Fundamentals', desc: 'Hands-on session covering Unity XR Toolkit, OpenXR standards, spatial audio, and performance optimization basics.' },
  { day: 'Day 1', time: '03:00 PM', title: 'Mentor Office Hours — Round 1', desc: '1-on-1 mentoring sessions with XR engineers, game designers, and UX specialists from DeepLoop and partner organizations.' },
  { day: 'Day 1', time: '07:00 PM', title: 'Workshop: AI Integration in VR', desc: 'Live demo and workshop on embedding generative AI models, LLMs, and computer vision into virtual reality environments.' },
  { day: 'Day 1', time: '09:00 PM', title: 'Mid-Hack Check-in & Networking Dinner', desc: 'Progress sharing, sponsor demos, and peer networking over dinner. Teams present early concepts for informal feedback.' },
  { day: 'Day 2', time: '12:00 AM', title: 'Late Night Fuel & Focus Session', desc: 'Midnight refreshments, ambient music, and optional meditation break to keep energy and momentum through the night.' },
  { day: 'Day 2', time: '06:00 AM', title: 'Mentor Office Hours — Round 2', desc: 'Final mentoring sprint. Judges share the evaluation rubric in detail and offer submission tips for polish and presentation.' },
  { day: 'Day 2', time: '09:00 AM', title: 'Submission Deadline', desc: 'All project builds, demos, and documentation must be submitted to the portal. Zero extensions granted.', highlight: true },
  { day: 'Day 2', time: '10:00 AM', title: 'Demo Day & Judging', desc: 'Teams present 5-minute live VR demos to a jury of industry veterans, investors, and technology leaders.' },
  { day: 'Day 2', time: '01:00 PM', title: 'Judges Deliberation & Finalist Q&A', desc: 'Jury evaluates all projects. Top finalists are invited for a brief Q&A round with the panel.' },
  { day: 'Day 2', time: '03:00 PM', title: 'AWARDS CEREMONY & CLOSING', desc: 'Winners announced, prizes awarded, certificates distributed, and closing remarks from organizers. The MetaLoop legacy continues.', highlight: true },
]

const prizes = [
  {
    rank: '1ST RUNNER UP', amount: 'INR 15,000', color: 'var(--silver)', emoji: '🥈',
    perks: ['Cash Prize', 'Internship via Optern', 'JTBI Innovation Certificate', 'Exclusive Swag Kit', 'Certificate of Excellence'],
  },
  {
    rank: 'GRAND WINNER', amount: 'INR 25,000', color: 'var(--gold)', emoji: '🥇', featured: true,
    perks: ['Cash Prize', 'DeepLoop Incubation Fast-Track', 'VR Hardware Bundle', 'Investor Pitch Opportunity', 'Featured in MetaVerse Media', 'Mentorship Program Access'],
  },
  {
    rank: '2ND RUNNER UP', amount: 'INR 10,000', color: 'var(--bronze)', emoji: '🥉',
    perks: ['Cash Prize', 'Mentorship Sessions', 'Digital Excellence Badge', 'Exclusive Swag Kit', 'Certificate of Excellence'],
  },
]

const judgingCriteria = [
  { pct: '30%', title: 'Innovation & Creativity', desc: 'How original and bold is the concept? Does it push the boundaries of what VR can do?', icon: <Sparkles size={20} />, color: '#00f5ff' },
  { pct: '25%', title: 'Technical Execution', desc: 'Code quality, VR performance optimization, stability, and overall technical depth of the build.', icon: <Zap size={20} />, color: '#ff00ff' },
  { pct: '20%', title: 'UX & Immersive Design', desc: 'Visual quality, spatial UX design, comfort for the user, and overall immersive experience quality.', icon: <Eye size={20} />, color: '#7b2ffa' },
  { pct: '15%', title: 'Impact & Feasibility', desc: 'Real-world applicability, market relevance, scalability, and commercial or social potential.', icon: <Target size={20} />, color: '#39ff14' },
  { pct: '10%', title: 'Presentation Quality', desc: 'Clarity of demo delivery, storytelling quality, and ability to communicate vision to a non-technical audience.', icon: <Presentation size={20} />, color: '#ffd700' },
]

const faqs = [
  { q: 'Is there a registration fee?', a: 'Yes, you can participate in MetaLoop 2.0 for ₹599 only. Registration covers night meals, refreshments, swag, and full access to all VR hardware for the entire 36 hours.' },
  { q: 'Do I need to bring my own VR hardware?', a: 'No. DeepLoop Technologies will provide VR headsets and development kits throughout the event. You may bring personal devices if preferred. SDK documentation and starter assets will be available on the official event portal from one week before the hackathon.' },
  { q: 'What technology stack can we use?', a: 'There are no restrictions on tech stack. Commonly used tools include Unity, Unreal Engine, WebXR, and OpenXR standards. Starter kits will be provided for Meta Quest, SteamVR, and mixed-reality development environments.' },
  { q: 'Can we start working on our idea before the hackathon?', a: 'You may brainstorm ideas and form your team in advance, but all actual development — code, assets, and design — must begin at the official kick-off at 11:00 AM on Day 1. Pre-built codebases or existing products are strictly not permitted.' },
  { q: 'Will mentors be available throughout the event?', a: 'Yes. Two dedicated mentoring rounds are scheduled — Round 1 at 3:00 PM on Day 1 and Round 2 at 6:00 AM on Day 2. Mentors include XR engineers, game designers, UX specialists, and product managers from DeepLoop Technologies, Optern, and JTBI partner networks.' },
  { q: 'How are winners decided and announced?', a: 'All submitted projects are evaluated by a panel of industry judges using the published rubric (Innovation 30%, Technical Execution 25%, UX & Design 20%, Impact 15%, Presentation 10%). Winners are announced at the Awards Ceremony at 3:00 PM on Day 2.' },
  { q: 'Is accommodation provided for outstation participants?', a: 'The event will run across 36 continuous hours with dedicated rest areas within the venue. Registered outstation participants will receive a list of partner hotels nearby. Accommodation costs are not covered but discounted rates will be arranged.' },
  { q: 'Will there be food and refreshments throughout?', a: 'Yes. Meals, snacks, beverages, and midnight refreshments are fully covered for all registered participants for the entire duration of the hackathon.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)

  const handleEnter = () => {
    if (user && profile) {
      const routes = { candidate: '/candidate', jury: '/jury', admin: '/admin-portal' }
      navigate(routes[profile.role] || '/candidate')
    } else {
      navigate('/auth')
    }
  }

  return (
    <div className="landing-page">
      <VRArena />

      {/* ═══ HERO ═══ */}
      <div className="landing-overlay" style={{ paddingBottom: 0 }}>
        <h1 className="landing-title">METALOOP 2.0</h1>
        <p className="landing-subtitle" style={{ maxWidth: 700 }}>
          Step into the Loop. Break the Boundaries.<br />
          <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
            Where the next generation of immersive VR experiences is built — in 36 uninterrupted hours of innovation,
            creativity, and code.
          </span>
        </p>
        <div className="landing-cta">
          <button className="btn btn-primary btn-lg" onClick={handleEnter}>🎮 Enter the Arena</button>
          {!user && <button className="btn btn-secondary btn-lg" onClick={() => navigate('/auth')}>Sign In</button>}
        </div>

        {/* Stats */}
        <div className="landing-stats">
          {stats.map((s, i) => (
            <div key={i} className="landing-stat-item">
              <span className="landing-stat-emoji">{s.icon}</span>
              <span className="landing-stat-value">{s.value}</span>
              <span className="landing-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CONTENT SECTIONS (scrollable, over 3D bg) ═══ */}
      <div className="landing-content">

        {/* ORGANIZERS */}
        <section className="landing-section">
          <div className="section-tag">ORGANIZED IN COLLABORATION WITH</div>
          <div className="grid-3">
            {organizers.map((org, i) => (
              <div key={i} className="glass-card org-card" style={{ borderTopColor: org.color }}>
                <div className="org-logo" style={{ background: org.logo ? '#ffffff' : `${org.color}22`, color: org.color }}>
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} />
                  ) : (
                    org.name.charAt(0)
                  )}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>{org.name}</h3>
                <span className="badge" style={{ background: `${org.color}22`, color: org.color, marginBottom: 12 }}>{org.role}</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{org.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section className="landing-section">
          <h2 className="section-heading">What is MetaLoop 2.0?</h2>
          <div className="glass-card" style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: 16 }}>
              MetaLoop 2.0 is the premier VR gaming hackathon pushing the frontier of immersive technology. Whether
              you are a developer, designer, storyteller, or world-builder — this is your arena.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: 16 }}>
              <strong style={{ color: 'var(--cyan)' }}>36 hours. Zero sleep. Infinite possibility.</strong> Teams will ideate, prototype, and demo groundbreaking VR gaming
              experiences, evaluated by industry pioneers and XR visionaries.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.85rem', fontStyle: 'italic' }}>
              Powered by DeepLoop Technologies, Optern, and JTBI — accelerating the
              next wave of spatial computing and digital entertainment innovation.
            </p>
          </div>

          <h3 style={{ fontFamily: 'Orbitron', fontSize: '1rem', marginTop: 32, marginBottom: 16, color: 'var(--magenta)' }}>Who Should Attend?</h3>
          <div className="glass-card attend-list" style={{ maxWidth: 800, margin: '0 auto' }}>
            {[
              'Game Developers & XR Engineers passionate about VR platforms',
              'UI/UX Designers & 3D Artists focused on immersive experience design',
              'AI/ML Engineers integrating intelligence into virtual environments',
              'Students & Early-Career Professionals exploring VR innovation',
              'Entrepreneurs & Product Builders with a metaverse vision',
            ].map((item, i) => (
              <div key={i} className="attend-item">
                <span style={{ color: 'var(--cyan)' }}>›</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SCHEDULE */}
        <section className="landing-section">
          <h2 className="section-heading">36 Hours. Every Minute Counts.</h2>
          <div className="schedule-timeline">
            {schedule.map((item, i) => (
              <div key={i} className={`schedule-item ${item.highlight ? 'highlight' : ''}`}>
                <div className="schedule-time">
                  <span className="schedule-day">{item.day}</span>
                  <span className="schedule-clock">{item.time}</span>
                </div>
                <div className="schedule-dot" />
                <div className="schedule-body">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TRACKS */}
        <section className="landing-section">
          <h2 className="section-heading">Choose Your Reality</h2>
          <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎮</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Tracks will be revealed on the day of the event.<br />
              <span style={{ color: 'var(--cyan)', fontSize: '0.85rem' }}>Stay tuned for the big reveal!</span>
            </p>
          </div>
        </section>

        {/* PRIZES */}
        <section className="landing-section">
          <h2 className="section-heading">Win More Than Glory</h2>
          <div className="prizes-grid">
            {prizes.map((prize, i) => (
              <div key={i} className={`glass-card prize-card ${prize.featured ? 'featured' : ''}`}
                style={{ borderColor: prize.color, '--prize-color': prize.color }}>
                <div className="prize-emoji">{prize.emoji}</div>
                <h3 className="prize-rank" style={{ color: prize.color }}>{prize.rank}</h3>
                <div className="prize-amount">{prize.amount}</div>
                <ul className="prize-perks">
                  {prize.perks.map((perk, j) => (
                    <li key={j}><span style={{ color: prize.color }}>✦</span> {perk}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ELIGIBILITY & RULES */}
        <section className="landing-section">
          <h2 className="section-heading">Who Can Participate</h2>
          <div className="grid-2" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1rem', color: 'var(--cyan)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={18} /> Eligibility</h3>
              {['Open to students, graduates, and early-career professionals',
                'All backgrounds welcome: engineering, design, arts, business, or research',
                'International participants are warmly welcome to register',
                'Pre-registration is mandatory — on-spot registrations subject to availability',
              ].map((r, i) => <p key={i} className="rule-item"><span style={{ color: 'var(--cyan)' }}>›</span> {r}</p>)}
            </div>
            <div className="glass-card">
              <h3 style={{ fontSize: '1rem', color: 'var(--magenta)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Team Rules</h3>
              {['Team size: minimum 3 members, maximum 4 members',
                'Solo participation is not permitted — all participants must be in a team',
                'Team formation sessions will be held on Day 1 morning for solo registrants',
                'Cross-college and cross-organization teams are encouraged',
                'Each individual may only be a member of one team during the hackathon',
              ].map((r, i) => <p key={i} className="rule-item"><span style={{ color: 'var(--magenta)' }}>›</span> {r}</p>)}
            </div>
          </div>
          <div className="glass-card" style={{ maxWidth: 900, margin: '20px auto 0' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--purple-light)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={18} /> Project Rules</h3>
            {['All development must begin at the official kick-off at 11:00 AM on Day 1',
              'Pre-built codebases, existing products, or forks of published projects are not permitted',
              'Open-source libraries, game engines (Unity), and APIs are allowed',
              'All submitted projects must be original work created during the 36-hour window',
              'Teams must submit a working demo, source code link, and project write-up',
            ].map((r, i) => <p key={i} className="rule-item"><span style={{ color: 'var(--purple-light)' }}>›</span> {r}</p>)}
          </div>
        </section>

        {/* JUDGING */}
        <section className="landing-section">
          <h2 className="section-heading">How Projects Are Evaluated</h2>
          <div className="judging-grid">
            {judgingCriteria.map((c, i) => (
              <div key={i} className="glass-card judging-card">
                <div className="judging-pct" style={{ color: c.color }}>{c.pct}</div>
                <div className="judging-icon" style={{ color: c.color }}>{c.icon}</div>
                <h4 style={{ marginBottom: 8 }}>{c.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{c.desc}</p>
                <div className="judging-bar">
                  <div className="judging-fill" style={{ width: c.pct, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="landing-section">
          <h2 className="section-heading">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`glass-card faq-item ${openFaq === i ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-question">
                  <span>Q. {faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openFaq === i && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="landing-footer">
          <div className="footer-brand">
            <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }} className="text-gradient">METALOOP 2.0</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>A VR Gaming Hackathon · 36 Hours · Infinite Worlds</p>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>
            Organized by <span style={{ color: 'var(--cyan)' }}>DeepLoop Technologies</span>, <span style={{ color: 'var(--magenta)' }}>Optern</span> & <span style={{ color: 'var(--purple-light)' }}>JTBI</span>
          </p>
          <div className="footer-links">
            <a href="mailto:hello@metaloop.io"><Mail size={14} /> hello@metaloop.io</a>
            <a href="#">@metaloop2</a>
            <a href="#">discord.gg/metaloop</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
