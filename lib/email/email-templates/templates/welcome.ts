import { createBaseTemplate, interpolateTemplate } from '../base-template';

const welcomeEmailContent = `
<h2>Welcome to Veedence, {{name}}!</h2>
<p>We're excited to have you on board. Your journey to better coaching starts here.</p>
<p>Here's what you can do next:</p>
<ul>
  <li>Complete your profile</li>
  <li>Set up your first goal</li>
  <li>Explore our coaching resources</li>
</ul>
<p>If you have any questions, our support team is here to help.</p>
<p>Best regards,<br>The Veedence Team</p>
`;

export const createWelcomeEmail = (variables: { name: string }) => {
  const content = interpolateTemplate(welcomeEmailContent, variables);
  return {
    subject: `Welcome to Veedence, ${variables.name}!`,
    html: createBaseTemplate(content),
    text: `Welcome to Veedence, ${variables.name}!

We're excited to have you on board. Your journey to better coaching starts here.

Here's what you can do next:
- Complete your profile
- Set up your first goal
- Explore our coaching resources

If you have any questions, our support team is here to help.

Best regards,
The Veedence Team`,
  };
};
