const volunteerKB = require('../knowledge/volunteer-opportunities.json');
const kb = require('../knowledge/knowledge-base.json');
const sheets = require('../connectors/googleSheets');
const gmail = require('../connectors/gmail');
const env = require('../config/env');
const { requireFields } = require('../utils/validate');

// Volunteer sign-up: capture interest, log, alert coordinator.
async function volunteer(req, res) {
  const b = req.body;
  const err = requireFields(b, ['name']);
  if (err) return res.status(400).json({ ok: false, error: err });

  const role = volunteerKB.roles.find((r) => r.id === b.roleId) || null;
  await sheets.appendCallRow({
    callerType: 'volunteer', fullName: b.name, phone: b.phone, email: b.email,
    summary: `Volunteer interest: ${role ? role.name : b.interest || 'general'}. Availability: ${b.availability || 'n/a'}`,
  });
  await gmail.sendEmail({
    to: env.staff.email,
    subject: `New volunteer sign-up: ${b.name}`,
    text: `Name: ${b.name}\nPhone: ${b.phone || ''}\nEmail: ${b.email || ''}\nRole: ${role ? role.name : b.interest || 'general'}\nAvailability: ${b.availability || ''}\nNotes: ${b.notes || ''}`,
  });

  return res.json({
    ok: true,
    role,
    onboardingSteps: volunteerKB.onboardingSteps,
    response: `Thank you, ${b.name}! I've signed you up${role ? ` for ${role.name}` : ''}. Our volunteer coordinator will reach out to schedule onboarding. Anything else I can help with?`,
  });
}

// Donor / partner flow: share giving info, capture details, alert team.
async function donor(req, res) {
  const b = req.body;
  const type = b.partner ? 'partner' : 'donor';
  if (b.name || b.email || b.phone) {
    await sheets.appendCallRow({
      callerType: type, fullName: b.name, phone: b.phone, email: b.email,
      summary: `${type} inquiry. Interest: ${b.interest || 'general giving'}. Meeting requested: ${b.requestMeeting ? 'yes' : 'no'}`,
    });
    await gmail.sendEmail({
      to: env.staff.email,
      subject: `New ${type} inquiry: ${b.name || 'caller'}`,
      text: `Type: ${type}\nName: ${b.name || ''}\nPhone: ${b.phone || ''}\nEmail: ${b.email || ''}\nInterest: ${b.interest || ''}\nMeeting requested: ${b.requestMeeting ? 'yes' : 'no'}\nNotes: ${b.notes || ''}`,
    });
  }
  return res.json({
    ok: true,
    type,
    giving: kb.giving,
    impactStory: require('../knowledge/success-stories.json').stories[0].summary,
    response: type === 'partner'
      ? "Thank you for your interest in partnering with us. I've noted your details and our team will reach out to set up a conversation. Would you like to schedule a meeting now?"
      : `Thank you for your generosity! You can give securely at ${kb.giving.donateUrl}. I've also noted your interest so our team can follow up. Would you like to hear about the impact of your gift?`,
  });
}

module.exports = { volunteer, donor };
