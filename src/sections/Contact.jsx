import { useState } from 'react';
import Section from '../components/Section.jsx';
import { profile } from '../data/profile.js';

// ============================================================
//  Contact form posts to Formspree (free tier, no backend).
//  Setup: 1) create a form at https://formspree.io
//         2) replace YOUR_FORM_ID below with the ID it gives you
// ============================================================
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

export default function Contact() {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
      setStatus('unconfigured');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(e.target),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('sent');
        e.target.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <Section id="contact" index="05" title="ESTABLISH UPLINK">
      <div className="contact-layout">
        <div className="contact-info">
          <p>
            Open to robotics, autonomy, and software opportunities — or just a
            conversation about surgical robots and space hardware. Transmissions
            answered within 48 hours.
          </p>
          <ul className="contact-channels">
            <li>
              <span className="channel-label">EMAIL</span>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <span className="channel-label">LINKEDIN</span>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                /in/sujit-peramanu
              </a>
            </li>
            <li>
              <span className="channel-label">BASE</span>
              <span>{profile.location}</span>
            </li>
          </ul>
        </div>

        <form className="contact-form hud-frame" onSubmit={handleSubmit}>
          <div className="panel-title">// TRANSMISSION CONSOLE</div>
          <label>
            CALLSIGN <span className="req">*</span>
            <input name="name" type="text" required placeholder="Your name" autoComplete="name" />
          </label>
          <label>
            RETURN FREQUENCY <span className="req">*</span>
            <input name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
          </label>
          <label>
            MESSAGE <span className="req">*</span>
            <textarea name="message" required rows={5} placeholder="Type your transmission..." />
          </label>
          <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'TRANSMITTING...' : 'TRANSMIT ►'}
          </button>

          {status === 'sent' && (
            <div className="form-status ok">▸ TRANSMISSION RECEIVED. I'll get back to you soon.</div>
          )}
          {status === 'error' && (
            <div className="form-status err">▸ UPLINK FAILED. Try again or email me directly.</div>
          )}
          {status === 'unconfigured' && (
            <div className="form-status err">
              ▸ FORM NOT CONFIGURED. Set your Formspree ID in src/sections/Contact.jsx
              — or email me directly at {profile.email}.
            </div>
          )}
        </form>
      </div>
    </Section>
  );
}
