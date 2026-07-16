export type ShowcaseTabKey = 'erp' | 'iot' | 'cad';

export interface ShowcaseScreenshot {
  id: string;
  label: string;
  hint: string;
  aspectRatio: '16 / 10' | '16 / 9';
  src?: string;
}

export interface ShowcaseTab {
  key: ShowcaseTabKey;
  label: string;
  title: string;
  description: string;
  outcomes: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaIsExternal?: boolean;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  screenshots: ShowcaseScreenshot[];
}

// Screenshots remain optional metadata; landing previews are now rendered as UI mockups.
export const showcaseTabs: ShowcaseTab[] = [
  {
    key: 'erp',
    label: 'Product',
    title: 'i.e ERP - Manufacturing Command Centre',
    description:
      'Centralise finance, HR, CRM, inventory, production planning, and supply chain on one cloud-native platform built for manufacturers and engineering firms scaling beyond spreadsheets and disconnected tools.',
    outcomes: [
      'Unify finance, HR, CRM, inventory, and operations in one live data model',
      'Automate invoicing, approvals, procurement, and reporting to cut manual effort',
      'Track revenue, expenses, production, and pipeline in real time with configurable dashboards',
    ],
    ctaLabel: 'Try Interactive Demo',
    ctaHref: 'https://demoerp.ietech.ai',
    ctaIsExternal: true,
    secondaryCtaLabel: 'Get in Touch',
    secondaryCtaHref: '#contact',
    screenshots: [
      {
        id: 'erp-overview',
        label: 'Accounts Dashboard',
        hint: 'Live financial dashboard with receivables/payables and P&L trends',
        aspectRatio: '16 / 9',
      },
      {
        id: 'erp-onboarding',
        label: 'Onboarding Flow',
        hint: 'Step-by-step setup wizard for language, locale, timezone, and currency',
        aspectRatio: '16 / 9',
      },
    ],
  },

  {
    key: 'cad',
    label: 'Product',
    title: 'AI-Assisted CAD Workspace',
    description:
      'Design at the speed of thought in a cloud-native CAD workspace where AI assists with geometry, constraints, simulations, and optimisation.',
    outcomes: [
      'Cut iteration cycles with AI-assisted part generation, simulation, and constraint handling',
      'Solve complex assemblies faster with engineering-grade constraint intelligence',
      'Collaborate in real time with guided onboarding for distributed design teams',
    ],
    ctaLabel: 'Register for Pilot',
    ctaHref: '#contact',
    ctaIsExternal: false,
    secondaryCtaLabel: 'Read Product Vision',
    secondaryCtaHref: '#cad',
    screenshots: [
      {
        id: 'cad-canvas',
        label: 'Model Canvas',
        hint: 'Primary CAD canvas with tool panels visible',
        aspectRatio: '16 / 9',
      },
      {
        id: 'cad-assistant',
        label: 'AI Assistant',
        hint: 'Assistant prompt panel with task/result context',
        aspectRatio: '16 / 9',
      },
      {
        id: 'cad-iterations',
        label: 'Version Iterations',
        hint: 'Design history/iterations comparison view',
        aspectRatio: '16 / 9',
      },
    ],
  },
];
