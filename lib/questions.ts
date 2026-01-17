import { Question } from '@/types';

export const questions: Question[] = [
  {
    id: 1,
    title: 'The Foundation',
    subtitle: 'Do you have all three of these?',
    type: 'radio',
    options: [
      {
        value: 'all-three',
        label: 'I have a product/service to sell, people willing to pay, and means to receive payment.',
        isPositive: true,
      },
      {
        value: 'missing-product',
        label: 'I don\'t have a clear product or service',
        isPositive: false,
      },
      {
        value: 'missing-customers',
        label: 'I don\'t have people willing to pay for my product or service',
        isPositive: false,
      },
      {
        value: 'missing-payment',
        label: 'I have not set up bank accounts/payment gateways to receive money',
        isPositive: false,
      },
      {
        value: 'missing-multiple',
        label: 'I am missing multiple elements',
        isPositive: false,
      },
    ],
  },
  {
    id: 2,
    title: 'Value Creation',
    subtitle: 'Complete this sentence: "I help _____ [who] achieve _____ [what result] by _____ [how]"',
    type: 'text',
    placeholder: 'e.g., I help small business owners increase sales by implementing proven digital marketing strategies',
    validation: (answer: string) => answer.length > 20,
  },
  {
    id: 3,
    title: 'Market Validation',
    subtitle: 'Have you talked to at least 10 potential customers who said they\'d pay for this?',
    type: 'radio',
    options: [
      {
        value: 'yes-confirmed',
        label: 'Yes, and they confirmed they\'d buy',
        isPositive: true,
      },
      {
        value: 'talked-no-payment',
        label: 'I talked to people but didn\'t ask about payment',
        isPositive: false,
      },
      {
        value: 'no-validation',
        label: 'No, haven\'t validated yet',
        isPositive: false,
      },
    ],
  },
  {
    id: 4,
    title: 'Startup Investment',
    subtitle: 'How much money do you think you need to start?',
    type: 'radio',
    options: [
      {
        value: 'under-100',
        label: 'Less than $100',
        isPositive: true,
      },
      {
        value: '100-500',
        label: '$100-$500',
        isPositive: true,
      },
      {
        value: '500-1000',
        label: '$500-$1,000',
        isPositive: false,
        followUp: 'List what you think you need (we\'ll help you validate this)',
      },
      {
        value: 'over-1000',
        label: 'More than $1,000',
        isPositive: false,
        followUp: 'List what you think you need (we\'ll help you validate this)',
      },
    ],
    followUpCondition: (answer: string) => ['500-1000', 'over-1000'].includes(answer),
    followUpPrompt: 'What do you think you need to spend money on?',
  },
  {
    id: 5,
    title: 'Skills Check',
    subtitle: 'Can you answer YES to: "People already ask me for help with this"?',
    type: 'radio',
    options: [
      {
        value: 'yes-regularly',
        label: 'Yes, regularly',
        isPositive: true,
      },
      {
        value: 'sometimes',
        label: 'Sometimes',
        isPositive: true,
      },
      {
        value: 'no',
        label: 'No',
        isPositive: false,
        followUp: 'What skill DO people ask you about?',
      },
    ],
    followUpCondition: (answer: string) => answer === 'no',
    followUpPrompt: 'What skill do people actually ask you about?',
  },
  {
    id: 6,
    title: 'The Speed Test',
    subtitle: 'Can you make your first sale within 7 days with what you have right now?',
    type: 'radio',
    options: [
      {
        value: 'yes-ready',
        label: 'Yes, I\'m ready',
        isPositive: true,
      },
      {
        value: 'almost',
        label: 'Almost - just need a few things',
        isPositive: true,
        followUp: 'What do you need?',
      },
      {
        value: 'months',
        label: 'No, I need months to prepare',
        isPositive: false,
        followUp: 'What\'s the simplest version you could launch?',
      },
    ],
    followUpCondition: (answer: string) => ['almost', 'months'].includes(answer),
    followUpPrompt: 'Tell us more',
  },
  {
    id: 7,
    title: 'Passion-Market Fit',
    subtitle: 'Does your idea connect something you love with something people will pay for?',
    type: 'radio',
    options: [
      {
        value: 'both',
        label: 'Yes - It\'s my passion AND people want it',
        isPositive: true,
      },
      {
        value: 'passion-only',
        label: 'It\'s my passion, but not sure about demand',
        isPositive: false,
      },
      {
        value: 'demand-only',
        label: 'People want it, but I\'m not passionate',
        isPositive: false,
      },
      {
        value: 'neither',
        label: 'Neither - just seems like a good idea',
        isPositive: false,
      },
    ],
  },
  {
    id: 8,
    title: 'Freedom vs. Money',
    subtitle: 'What matters more to you?',
    type: 'radio',
    options: [
      {
        value: 'freedom',
        label: 'Freedom (control my time/location) even if income is modest',
        isPositive: true,
      },
      {
        value: 'money',
        label: 'Money (maximize income) even if less freedom',
        isPositive: true,
      },
      {
        value: 'balance',
        label: 'Equal balance',
        isPositive: true,
      },
    ],
  },
  {
    id: 9,
    title: 'Learning Style',
    subtitle: 'How will you learn what you don\'t know?',
    type: 'radio',
    options: [
      {
        value: 'start-imperfect',
        label: 'Start imperfectly and figure it out along the way',
        isPositive: true,
      },
      {
        value: 'hire-complement',
        label: 'Will hire people who will complement my skill',
        isPositive: true,
      },
      {
        value: 'courses-first',
        label: 'Need to take courses and read books first',
        isPositive: false,
      },
      {
        value: 'perfect-first',
        label: 'Must have everything perfect before starting',
        isPositive: false,
      },
    ],
  },
  {
    id: 10,
    title: 'The Commitment Test',
    subtitle: 'Will you take one action in the next 24 hours to move this forward?',
    type: 'radio',
    options: [
      {
        value: 'yes',
        label: 'Yes (I\'ll specify what)',
        isPositive: true,
        followUp: 'What specific action will you take?',
      },
      {
        value: 'maybe',
        label: 'Maybe',
        isPositive: false,
      },
      {
        value: 'no',
        label: 'No',
        isPositive: false,
        followUp: 'What\'s really stopping you?',
      },
    ],
    followUpCondition: (answer: string) => ['yes', 'no'].includes(answer),
    followUpPrompt: 'Tell us more',
  },
];
