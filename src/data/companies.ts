export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  accent: string;
  logoBg: string;
}

export const fontAwesomeLogos = {};

export const ENTERPRISE_COMPANIES: Company[] = [
  { id: 'google', name: 'Google', domain: 'google.com', industry: 'Cloud & AI Search', accent: 'from-blue-500 to-red-500', logoBg: 'bg-blue-50 text-blue-600' },
  { id: 'microsoft', name: 'Microsoft', domain: 'microsoft.com', industry: 'Enterprise Software & Azure', accent: 'from-blue-600 to-cyan-500', logoBg: 'bg-cyan-50 text-cyan-600' },
  { id: 'apple', name: 'Apple', domain: 'apple.com', industry: 'Consumer Hardware & OS', accent: 'from-slate-700 to-slate-900', logoBg: 'bg-slate-100 text-slate-800' },
  { id: 'amazon', name: 'Amazon', domain: 'amazon.com', industry: 'E-Commerce & AWS', accent: 'from-amber-500 to-orange-600', logoBg: 'bg-amber-50 text-amber-600' },
  { id: 'meta', name: 'Meta', domain: 'meta.com', industry: 'Social Systems & Metaverse', accent: 'from-blue-600 to-indigo-600', logoBg: 'bg-indigo-50 text-indigo-600' },
  { id: 'openai', name: 'OpenAI', domain: 'openai.com', industry: 'Generative AI Architecture', accent: 'from-emerald-600 to-teal-600', logoBg: 'bg-emerald-50 text-emerald-600' },
  { id: 'netflix', name: 'Netflix', domain: 'netflix.com', industry: 'Streaming & Infrastructure', accent: 'from-red-600 to-rose-700', logoBg: 'bg-red-50 text-red-600' },
  { id: 'tesla', name: 'Tesla', domain: 'tesla.com', industry: 'Autonomous Systems & Energy', accent: 'from-rose-600 to-red-600', logoBg: 'bg-rose-50 text-rose-600' },
  { id: 'stripe', name: 'Stripe', domain: 'stripe.com', industry: 'Financial Infrastructure', accent: 'from-indigo-500 to-violet-600', logoBg: 'bg-violet-50 text-violet-600' },
  { id: 'nvidia', name: 'NVIDIA', domain: 'nvidia.com', industry: 'GPU Hardware & AI Compute', accent: 'from-lime-600 to-emerald-600', logoBg: 'bg-lime-50 text-lime-700' },
  { id: 'airbnb', name: 'Airbnb', domain: 'airbnb.com', industry: 'Travel & Marketplace', accent: 'from-rose-500 to-pink-600', logoBg: 'bg-pink-50 text-pink-600' },
  { id: 'spotify', name: 'Spotify', domain: 'spotify.com', industry: 'Audio Streaming Media', accent: 'from-emerald-500 to-green-600', logoBg: 'bg-green-50 text-green-600' },
  { id: 'uber', name: 'Uber', domain: 'uber.com', industry: 'Mobility & Logistics', accent: 'from-slate-800 to-black', logoBg: 'bg-slate-900 text-white' },
  { id: 'salesforce', name: 'Salesforce', domain: 'salesforce.com', industry: 'Enterprise CRM Cloud', accent: 'from-sky-500 to-blue-600', logoBg: 'bg-sky-50 text-sky-600' },
  { id: 'adobe', name: 'Adobe', domain: 'adobe.com', industry: 'Creative Software & Cloud', accent: 'from-red-500 to-orange-500', logoBg: 'bg-orange-50 text-orange-600' },
  { id: 'oracle', name: 'Oracle', domain: 'oracle.com', industry: 'Database & Cloud Infra', accent: 'from-red-700 to-rose-800', logoBg: 'bg-red-100 text-red-700' },
  { id: 'ibm', name: 'IBM', domain: 'ibm.com', industry: 'Quantum & Hybrid Cloud', accent: 'from-blue-700 to-indigo-800', logoBg: 'bg-blue-100 text-blue-800' },
  { id: 'intel', name: 'Intel', domain: 'intel.com', industry: 'Semiconductors & Silicon', accent: 'from-cyan-600 to-blue-700', logoBg: 'bg-cyan-100 text-cyan-700' },
  { id: 'cisco', name: 'Cisco', domain: 'cisco.com', industry: 'Networking & Security', accent: 'from-sky-600 to-teal-600', logoBg: 'bg-teal-50 text-teal-600' },
  { id: 'twitter', name: 'X / Twitter', domain: 'x.com', industry: 'Real-time News & Social', accent: 'from-slate-700 to-black', logoBg: 'bg-slate-800 text-white' },
];
