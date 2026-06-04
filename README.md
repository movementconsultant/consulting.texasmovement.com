# consulting.texasmovement.com

## Overview
Static site hosted on GitHub Pages for Texas Movement Consulting. Built with vanilla HTML/CSS (no dependencies).

## Interest Form

The site includes a working contact form for project inquiries, located in the "Tell us about your project" section.

### How It Works
- **Form handler**: [Formspree](https://formspree.io) (free tier)
- **Endpoint**: `https://formspree.io/f/mpqewaod`
- **Recipient email**: `movementconsultant@gmail.com` (configured in Formspree dashboard)
- **Email forwarding**: Formspree emails are forwarded to `lexmathai@gmail.com` via Gmail filters (configured outside this repo)

### Form Fields
The form collects:
1. **Your name** (required)
2. **Business or organization** (required)
3. **Current website** (required)
4. **Best email to reach you** (required)
5. **Phone / WhatsApp** (optional)
6. **Approximate monthly budget** (required, dropdown)
7. **What do you want help with?** (required, textarea)
8. **How soon do you want to start?** (required, dropdown)

### Security & Features
- Honeypot field (`_gotcha`) prevents spam submissions
- Custom email subject line set by hidden `_subject` field
- Formspree handles CSRF protection automatically
- No custom JavaScript required—vanilla HTML form submission
- Responsive design works on mobile and desktop

### To Update the Form
1. **Change recipient**: Update the email configured in the Formspree dashboard at [formspree.io/f/mpqewaod](https://formspree.io/f/mpqewaod)
2. **Change fields**: Edit the `.tm-form-row` divs in `index.html`; make sure field `name` attributes match what you want to see in the email
3. **Add a thank-you page**: Uncomment the `_next` hidden field in the form and point it to a local thank-you page URL

### Styling
Form styling uses CSS custom properties and fits the existing design:
- `.tm-form` — form container
- `.tm-form-row` — field grouping
- `.tm-form-btn` — submit button
- `.tm-form-footnote` — disclaimer text below button

All form styles are embedded in `<style>` in `index.html`.

---

**Important**: Never expose or mention `lexmathai@gmail.com` in code or comments. Only `movementconsultant@gmail.com` appears in visible copy.
