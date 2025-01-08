import { createBaseTemplate, interpolateTemplate } from '../base-template';
import { TemplateVariables } from '../../types';

const notificationEmailContent = `
<h2>{{title}}</h2>
<p>{{message}}</p>
{{#if actionUrl}}
<p style="text-align: center;">
  <a href="{{actionUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
    {{actionText}}
  </a>
</p>
{{/if}}
`;

interface NotificationVariables {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

const toTemplateVariables = (vars: NotificationVariables): TemplateVariables => {
  const result: TemplateVariables = {
    title: vars.title,
    message: vars.message
  };
  
  if (vars.actionUrl) result.actionUrl = vars.actionUrl;
  if (vars.actionText) result.actionText = vars.actionText;
  
  return result;
};

export const createNotificationEmail = (variables: NotificationVariables) => {
  const templateVars = toTemplateVariables(variables);
  const content = interpolateTemplate(notificationEmailContent, templateVars);
  return {
    subject: variables.title,
    html: createBaseTemplate(content),
    text: `${variables.title}

${variables.message}

${variables.actionUrl ? `\n${variables.actionText}: ${variables.actionUrl}` : ''}`,
  };
};
