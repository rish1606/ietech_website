import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileText,
  Filter,
  Home,
  Landmark,
  LayoutDashboard,
  Link2,
  MoreHorizontal,
  MapPin,
  MousePointer2,
  Package,
  Percent,
  Receipt,
  Save,
  Search,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { showcaseTabs } from '../config/whatWeDoShowcase';
import { GoogleGeminiEffect } from './ui/google-gemini-effect';

const NAV_HEIGHT_PX = 76;
const DESKTOP_BREAKPOINT_PX = 1200;
const DESKTOP_SCROLL_VH_PER_SLIDE = 64;
const DESKTOP_SCROLL_COMPLETION = 0.94;
const ERP_AUTOPLAY_MS = 6200;


type ErpSceneId = 'accounts' | 'onboarding' | 'crm_form' | 'crm_dashboard' | 'app_switcher';

interface ErpScene {
  id: ErpSceneId;
  label: string;
  hint: string;
}

const ERP_SCENES: ErpScene[] = [
  { id: 'accounts', label: 'Accounts Dashboard', hint: '/ Dashboard / Accounts' },
  { id: 'onboarding', label: 'Onboarding Wizard', hint: 'Welcome Setup' },
  { id: 'crm_form', label: 'CRM Opportunity', hint: '/ CRM / Opportunity / New Opportunity' },
  { id: 'crm_dashboard', label: 'CRM Dashboard', hint: '/ Dashboard / CRM' },
  { id: 'app_switcher', label: 'Accounting Apps', hint: 'Accounting App Switcher' },
];

const ERP_RAIL_ICONS: LucideIcon[] = [Search, Bell, Home, LayoutDashboard, BarChart3, Users, FileText, Settings];
const ERP_DASHBOARD_MENU: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Home', icon: Home },
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Chart of Accounts', icon: BarChart3 },
  { label: 'Receivables', icon: Users },
  { label: 'Payables', icon: Wallet },
  { label: 'Payments', icon: CreditCard },
  { label: 'Reports', icon: FileText },
  { label: 'General Ledger', icon: Landmark },
];

const ERP_CURSOR_PATHS: Record<ErpSceneId, Array<{ x: number; y: number; click?: boolean }>> = {
  accounts: [
    { x: 5, y: 29, click: true },
    { x: 51, y: 30, click: true },
    { x: 57, y: 46, click: true },
    { x: 43, y: 76, click: true },
  ],
  onboarding: [
    { x: 50, y: 20, click: true },
    { x: 47, y: 42, click: true },
    { x: 47, y: 56, click: true },
    { x: 62, y: 65, click: true },
  ],
  crm_form: [
    { x: 12, y: 31, click: true },
    { x: 24, y: 41, click: true },
    { x: 74, y: 50, click: true },
    { x: 89, y: 23, click: true },
  ],
  crm_dashboard: [
    { x: 20, y: 32, click: true },
    { x: 81, y: 43, click: true },
    { x: 57, y: 52, click: true },
    { x: 20, y: 63, click: true },
  ],
  app_switcher: [
    { x: 37, y: 46, click: true },
    { x: 60, y: 46, click: true },
    { x: 37, y: 60, click: true },
    { x: 60, y: 60, click: true },
  ],
};

const ACCOUNTING_APPS: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Invoicing', icon: Receipt },
  { label: 'Payments', icon: Wallet },
  { label: 'Financial Re...', icon: Link2 },
  { label: 'Accounts S...', icon: CircleDollarSign },
  { label: 'Taxes', icon: Percent },
  { label: 'Banking', icon: Landmark },
  { label: 'Budget', icon: CreditCard },
  { label: 'Share Mana...', icon: Users },
  { label: 'Subscription', icon: Package },
];

const getShowcaseHeaderIcon = (label: string): LucideIcon =>
  label.toLowerCase() === 'product' ? Package : Settings;



function useDesktopMode(minWidth = DESKTOP_BREAKPOINT_PX) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= minWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);

    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [minWidth]);

  return isDesktop;
}

function useElementWidth<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const element = ref.current;
    if (!element) return;

    const update = () => setWidth(element.clientWidth);
    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);
    window.addEventListener('resize', update);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref]);

  return width;
}

function linePoints(values: number[]) {
  const safe = values.length ? values : [10, 20, 25, 35, 45, 53, 63];
  const max = Math.max(...safe, 1);
  const denominator = Math.max(safe.length - 1, 1);

  return safe
    .map((value, index) => {
      const x = (index / denominator) * 100;
      const y = 92 - (value / max) * 72;
      return `${x},${Math.max(y, 8)}`;
    })
    .join(' ');
}

interface MiniFieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options?: string[];
  placeholder?: string;
  inputType?: 'text' | 'date';
}

function MiniField({ label, value, onChange, options, placeholder, inputType = 'text' }: MiniFieldProps) {
  return (
    <div>
      <p className="text-[9px] font-semibold text-[#6a7383] dark:text-[#8b96a8]">{label}</p>
      {options ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 h-5 w-full rounded border border-[#dfe4ec] bg-[#eceef2] px-2 text-[10px] leading-5 text-[#49556b] outline-none focus:border-[#7c90ac] focus:ring-1 focus:ring-[#b8c8dc] dark:border-[#2d3340] dark:bg-[#1a1d24] dark:text-[#c0cade] dark:focus:border-[#4a5670] dark:focus:ring-[#3a4560]"
        >
          {options.map((option) => (
            <option key={`${label}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          type={inputType}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 h-5 w-full rounded border border-[#dfe4ec] bg-[#eceef2] px-2 text-[10px] leading-5 text-[#49556b] outline-none placeholder:text-[#9ca7b7] focus:border-[#7c90ac] focus:ring-1 focus:ring-[#b8c8dc] dark:border-[#2d3340] dark:bg-[#1a1d24] dark:text-[#c0cade] dark:placeholder:text-[#5a6578] dark:focus:border-[#4a5670] dark:focus:ring-[#3a4560]"
        />
      )}
    </div>
  );
}

function ErpAccountsScene() {
  const [activeRail, setActiveRail] = useState(2);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [chartMode, setChartMode] = useState<'monthly' | 'yearly'>('monthly');
  const income = [16, 22, 30, 36, 41, 47, 53, 58, 66, 73, 76, 81];
  const expense = [12, 16, 21, 28, 33, 37, 40, 44, 49, 54, 57, 70];
  const net = [10, 13, 14, 16, 18, 21, 25, 24, 23, 23, 26, 21];
  const incoming = [42, 41, 0, 0, 0, 0];
  const outgoing = [31, 80, 0, 0, 0, 0];

  return (
    <div className="grid h-full grid-cols-[34px_minmax(0,1fr)] bg-[#f7f8fa] dark:bg-[#0d1117]">
      <aside className="flex flex-col border-r border-[#e0e4ea] bg-[#f4f5f8] px-1 py-2 dark:border-[#21262d] dark:bg-[#161b22]">
        <div className="grid place-items-center">
          <div className="grid h-5 w-5 place-items-center rounded bg-[#1284eb] text-white dark:bg-[#58a6ff]">
            <Receipt className="h-3 w-3" />
          </div>
        </div>

        <div className="mt-2 space-y-1">
          {ERP_RAIL_ICONS.map((Icon, index) => (
            <button
              key={`rail-${index}`}
              type="button"
              onClick={() => setActiveRail(index)}
              title={index === 0 ? 'Search' : index === 1 ? 'Notification' : 'Navigation'}
              className={`grid w-full place-items-center rounded p-1 ${activeRail === index
                ? 'bg-[#e6ebf3] text-[#3f4f66] dark:bg-[#1c2333] dark:text-[#c9d1d9]'
                : 'text-[#7a8597] transition-colors hover:bg-[#eceff5] hover:text-[#59687e] dark:text-[#8b949e] dark:hover:bg-[#1c2333] dark:hover:text-[#c9d1d9]'
                }`}
            >
              <Icon className="h-2.5 w-2.5" />
            </button>
          ))}
        </div>

        <div className="mt-2 space-y-1 border-t border-[#e2e6ed] pt-2 dark:border-[#21262d]">
          {ERP_DASHBOARD_MENU.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveMenu(label)}
              title={label}
              className={`grid w-full place-items-center rounded p-1 ${activeMenu === label
                ? 'bg-[#dfe8f6] font-semibold text-[#3f4f66] dark:bg-[#1c2333] dark:text-[#c9d1d9]'
                : 'text-[#606d83] transition-colors hover:bg-[#eceff5] hover:text-[#4f6078] dark:text-[#8b949e] dark:hover:bg-[#1c2333] dark:hover:text-[#c9d1d9]'
                }`}
            >
              <Icon className="h-2.5 w-2.5" />
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-[#e2e6ed] pt-2 dark:border-[#21262d]">
          <button
            type="button"
            title="Administrator"
            className="mx-auto grid h-4.5 w-4.5 place-items-center rounded-full bg-[#dbe3ef] text-[8px] font-semibold text-[#506078] dark:bg-[#1c2333] dark:text-[#c9d1d9]"
          >
            A
          </button>
        </div>
      </aside>

      <div className="p-2.5">
        <div className="flex items-center justify-between text-[10px] text-[#667487] dark:text-[#8b949e]">
          <p className="font-semibold">/ Dashboard / Accounts</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setChartMode('monthly')}
              className={`rounded px-1.5 py-0.5 text-[8px] ${chartMode === 'monthly' ? 'bg-[#e7edf7] text-[#30435e] dark:bg-[#1c2333] dark:text-[#c9d1d9]' : 'text-[#7787a0] hover:bg-[#ecf1f8] dark:text-[#8b949e] dark:hover:bg-[#1c2333]'
                }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setChartMode('yearly')}
              className={`rounded px-1.5 py-0.5 text-[8px] ${chartMode === 'yearly' ? 'bg-[#e7edf7] text-[#30435e] dark:bg-[#1c2333] dark:text-[#c9d1d9]' : 'text-[#7787a0] hover:bg-[#ecf1f8] dark:text-[#8b949e] dark:hover:bg-[#1c2333]'
                }`}
            >
              Yearly
            </button>
            <button type="button" className="rounded p-0.5 text-[#71829a] hover:bg-[#ecf1f8] dark:text-[#8b949e] dark:hover:bg-[#1c2333]">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
          {[
            'Total Outgoing Bills',
            'Total Incoming Bills',
            'Total Incoming Payment',
            'Total Outgoing Payment',
          ].map((label) => (
            <div key={label} className="rounded border border-[#dce2ec] bg-white px-2 py-1.5 dark:border-[#21262d] dark:bg-[#161b22]">
              <p className="text-[8px] text-[#77849a] dark:text-[#8b949e]">{label}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#2e3645] dark:text-[#e6edf3]">₹ 890724.57</p>
            </div>
          ))}
        </div>

        <div className="mt-2 rounded border border-[#dce2ec] bg-white p-2 dark:border-[#21262d] dark:bg-[#161b22]">
          <p className="text-[10px] font-semibold text-[#5e6b80] dark:text-[#c9d1d9]">Profit and Loss</p>
          <div className="mt-1 grid grid-cols-3 text-center text-[8px] text-[#7d889b] dark:text-[#8b949e]">
            <div>
              <p>Total Income</p>
              <p className="text-[12px] font-semibold text-[#2f3747] dark:text-[#e6edf3]">₹ 11,99,55,748.50</p>
            </div>
            <div>
              <p>Total Expense</p>
              <p className="text-[12px] font-semibold text-[#2f3747] dark:text-[#e6edf3]">₹ 9,27,93,271.04</p>
            </div>
            <div>
              <p>Net Profit</p>
              <p className="text-[12px] font-semibold text-[#16a163]">₹ 2,71,62,477.46</p>
            </div>
          </div>

          <div className="mt-2 rounded border border-[#e3e8ef] bg-[#fcfdff] p-1.5 dark:border-[#21262d] dark:bg-[#0d1117]">
            <svg viewBox="0 0 100 100" className="h-20 w-full" aria-hidden>
              {[18, 34, 50, 66, 82].map((line) => (
                <line key={`line-${line}`} x1="0" y1={line} x2="100" y2={line} stroke="currentColor" strokeWidth="0.8" className="text-[#e9edf3] dark:text-[#21262d]" />
              ))}
              <polyline
                points={linePoints(chartMode === 'monthly' ? income : [...income].reverse())}
                fill="none"
                stroke="#f472b6"
                strokeWidth="1.5"
              />
              <polyline
                points={linePoints(chartMode === 'monthly' ? expense : [...expense].reverse())}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.5"
              />
              <polyline
                points={linePoints(chartMode === 'monthly' ? net : [...net].reverse())}
                fill="none"
                stroke="#34d399"
                strokeWidth="1.5"
              />
            </svg>
            <div className="mt-1 flex gap-2 text-[8px] text-[#687790] dark:text-[#8b949e]">
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#f472b6]" />Income</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#60a5fa]" />Expense</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />Net Profit/Loss</span>
            </div>
          </div>
        </div>

        <div className="mt-2 grid gap-2 lg:grid-cols-2">
          <div className="rounded border border-[#dce2ec] bg-white p-2 dark:border-[#21262d] dark:bg-[#161b22]">
            <p className="text-[9px] font-semibold text-[#66768c] dark:text-[#c9d1d9]">Incoming Bills (Purchase Invoice)</p>
            <div className="mt-1 flex h-14 items-end gap-1 rounded border border-[#e4e9f0] bg-[#fcfdff] px-1.5 py-1.5 dark:border-[#21262d] dark:bg-[#0d1117]">
              {incoming.map((value, index) => (
                <span
                  key={`in-${index}`}
                  className="w-full rounded-[2px] bg-[#cc4f4f]"
                  style={{ height: `${Math.max(value, 4)}%` }}
                />
              ))}
            </div>
          </div>

          <div className="rounded border border-[#dce2ec] bg-white p-2 dark:border-[#21262d] dark:bg-[#161b22]">
            <p className="text-[9px] font-semibold text-[#66768c] dark:text-[#c9d1d9]">Outgoing Bills (Sales Invoice)</p>
            <div className="mt-1 flex h-14 items-end gap-1 rounded border border-[#e4e9f0] bg-[#fcfdff] px-1.5 py-1.5 dark:border-[#21262d] dark:bg-[#0d1117]">
              {outgoing.map((value, index) => (
                <span
                  key={`out-${index}`}
                  className="w-full rounded-[2px] bg-[#7f9f36]"
                  style={{ height: `${Math.max(value, 4)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErpOnboardingScene() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    language: 'English',
    country: 'India',
    timeZone: 'Asia/Kolkata',
    currency: 'INR',
  });

  const updateField = useCallback(
    (field: keyof typeof form) => (next: string) => {
      setForm((current) => ({ ...current, [field]: next }));
    },
    [],
  );

  return (
    <div className="grid h-full place-items-center bg-[#f5f5f6] px-4 py-4 dark:bg-[#0d1117]">
      <div className="w-full max-w-[350px]">
        <div className="mb-2 flex justify-center gap-1.5">
          {[0, 1, 2].map((stepIndex) => (
            <button
              key={`step-dot-${stepIndex}`}
              type="button"
              onClick={() => setActiveStep(stepIndex)}
              className={`h-2.5 w-2.5 rounded-full border ${activeStep === stepIndex
                ? 'border-[#9da4b2] bg-[#2b2f38] dark:border-[#58a6ff] dark:bg-[#58a6ff]'
                : 'border-[#b6bcc7] bg-[#f5f5f6] hover:border-[#8d97a7] dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-[#484f58]'
                }`}
              aria-label={`Select onboarding step ${stepIndex + 1}`}
            />
          ))}
        </div>

        <div className="rounded-xl border border-[#e1e4eb] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(25,35,52,0.06)] dark:border-[#21262d] dark:bg-[#161b22] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <h4 className="text-center text-xl font-semibold text-[#1f2430] dark:text-[#e6edf3]">Welcome</h4>

          <div className="mt-4 space-y-2.5">
            <MiniField
              label="Your Language *"
              value={form.language}
              onChange={updateField('language')}
              options={['English', 'Hindi', 'Arabic']}
            />
            <MiniField
              label="Your Country *"
              value={form.country}
              onChange={updateField('country')}
              options={['India', 'UAE', 'USA']}
            />
            <MiniField
              label="Time Zone *"
              value={form.timeZone}
              onChange={updateField('timeZone')}
              options={['Asia/Kolkata', 'Asia/Dubai', 'America/New_York']}
            />
            <MiniField
              label="Currency *"
              value={form.currency}
              onChange={updateField('currency')}
              options={['INR', 'AED', 'USD']}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveStep((current) => (current + 1) % 3)}
              className="rounded bg-[#1e232e] px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-[#2d3442] dark:bg-[#58a6ff] dark:text-black dark:hover:bg-[#79c0ff]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErpOpportunityScene() {
  const [activeRail, setActiveRail] = useState(2);
  const [activeTab, setActiveTab] = useState<'Details' | 'Contacts' | 'Items'>('Details');
  const [formValues, setFormValues] = useState({
    series: 'CRM-OPP-.YYYY.-',
    opportunityType: 'Sales',
    salesStage: 'Prospecting',
    opportunityFrom: '',
    opportunityOwner: '',
    expectedClosingDate: '',
    party: '',
    probability: '100.000',
    status: 'Open',
    noOfEmployees: '1-10',
    industry: '',
    city: '',
    annualRevenue: '',
    marketSegment: '',
    stateProvince: '',
    website: '',
    country: 'India',
    territory: '',
  });

  const updateField = useCallback(
    (field: keyof typeof formValues) => (next: string) => {
      setFormValues((current) => ({ ...current, [field]: next }));
    },
    [],
  );

  return (
    <div className="grid h-full grid-cols-[30px_minmax(0,1fr)] bg-[#f7f8fa] dark:bg-[#0d1117]">
      <aside className="border-r border-[#e1e4eb] bg-[#f2f3f6] py-2 dark:border-[#21262d] dark:bg-[#161b22]">
        <div className="mx-auto grid h-5 w-5 place-items-center rounded bg-[#7c838f] text-[9px] font-semibold text-white dark:bg-[#484f58]">C</div>
        <div className="mt-2 space-y-1.5 px-1">
          {[Search, Bell, BarChart3, Users, MapPin, Settings].map((Icon, index) => (
            <button
              key={`crm-icon-${index}`}
              type="button"
              onClick={() => setActiveRail(index)}
              className={`grid w-full place-items-center rounded p-0.5 ${activeRail === index ? 'bg-[#dce3ee] text-[#4b5b71] dark:bg-[#1c2333] dark:text-[#c9d1d9]' : 'text-[#7f8899] hover:bg-[#e5eaf2] dark:text-[#8b949e] dark:hover:bg-[#1c2333]'
                }`}
            >
              <Icon className="h-2.5 w-2.5" />
            </button>
          ))}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-[#e0e4ea] px-2 py-1.5 text-[9px] text-[#6b7484] dark:border-[#21262d] dark:text-[#8b949e]">
          <p className="font-semibold">/ CRM / Opportunity / New Opportunity</p>
          <button className="rounded bg-[#1d232d] px-2 py-1 text-[8px] font-semibold text-white dark:bg-[#58a6ff] dark:text-black">
            <Save className="mr-1 inline h-2.5 w-2.5" />
            Save
          </button>
        </div>

        <div className="border-b border-[#e0e4ea] px-2 py-1 text-[9px] text-[#6a7484] dark:border-[#21262d] dark:text-[#8b949e]">
          {(['Details', 'Contacts', 'Items'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`mr-3 border-b pb-1 ${activeTab === tab
                ? 'border-[#2f3645] font-semibold text-[#2f3645] dark:border-[#58a6ff] dark:text-[#e6edf3]'
                : 'border-transparent text-[#758195] hover:text-[#596983] dark:text-[#8b949e] dark:hover:text-[#c9d1d9]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Details' ? (
          <div className="space-y-2 p-2">
            <div className="grid grid-cols-3 gap-2">
              <MiniField
                label="Series *"
                value={formValues.series}
                onChange={updateField('series')}
                options={['CRM-OPP-.YYYY.-', 'CRM-OPP-A-.YYYY.-']}
              />
              <MiniField
                label="Opportunity Type"
                value={formValues.opportunityType}
                onChange={updateField('opportunityType')}
                options={['Sales', 'Renewal', 'Consulting']}
              />
              <MiniField
                label="Sales Stage"
                value={formValues.salesStage}
                onChange={updateField('salesStage')}
                options={['Prospecting', 'Qualified', 'Negotiation']}
              />
              <MiniField
                label="Opportunity From *"
                value={formValues.opportunityFrom}
                onChange={updateField('opportunityFrom')}
                placeholder="Source"
              />
              <MiniField
                label="Opportunity Owner"
                value={formValues.opportunityOwner}
                onChange={updateField('opportunityOwner')}
                placeholder="Owner"
              />
              <MiniField
                label="Expected Closing Date"
                value={formValues.expectedClosingDate}
                onChange={updateField('expectedClosingDate')}
                inputType="date"
              />
              <MiniField label="Party *" value={formValues.party} onChange={updateField('party')} placeholder="Account name" />
              <MiniField
                label="Probability (%)"
                value={formValues.probability}
                onChange={updateField('probability')}
                placeholder="100.000"
              />
              <MiniField
                label="Status *"
                value={formValues.status}
                onChange={updateField('status')}
                options={['Open', 'Closed', 'Lost']}
              />
            </div>

            <div className="h-px bg-[#e3e6ed] dark:bg-[#21262d]" />

            <div className="grid grid-cols-3 gap-2">
              <MiniField
                label="No of Employees"
                value={formValues.noOfEmployees}
                onChange={updateField('noOfEmployees')}
                options={['1-10', '11-50', '51-200']}
              />
              <MiniField label="Industry" value={formValues.industry} onChange={updateField('industry')} placeholder="Industry" />
              <MiniField label="City" value={formValues.city} onChange={updateField('city')} placeholder="City" />
              <MiniField
                label="Annual Revenue"
                value={formValues.annualRevenue}
                onChange={updateField('annualRevenue')}
                placeholder="Revenue"
              />
              <MiniField
                label="Market Segment"
                value={formValues.marketSegment}
                onChange={updateField('marketSegment')}
                placeholder="Segment"
              />
              <MiniField
                label="State/Province"
                value={formValues.stateProvince}
                onChange={updateField('stateProvince')}
                placeholder="State"
              />
              <MiniField label="Website" value={formValues.website} onChange={updateField('website')} placeholder="https://..." />
              <MiniField
                label="Country"
                value={formValues.country}
                onChange={updateField('country')}
                options={['India', 'UAE', 'USA']}
              />
              <MiniField label="Territory" value={formValues.territory} onChange={updateField('territory')} placeholder="Territory" />
            </div>
          </div>
        ) : null}

        {activeTab === 'Contacts' ? (
          <div className="grid h-full place-items-center p-4">
            <div className="w-full max-w-md rounded border border-[#dce2ec] bg-white p-3 dark:border-[#21262d] dark:bg-[#161b22]">
              <p className="text-[10px] font-semibold text-[#57657b] dark:text-[#c9d1d9]">Primary Contact</p>
              <div className="mt-2 grid gap-2">
                <MiniField label="Contact Name *" value={formValues.party} onChange={updateField('party')} placeholder="Name" />
                <MiniField label="Contact Email" value={formValues.website} onChange={updateField('website')} placeholder="name@example.com" />
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'Items' ? (
          <div className="grid h-full place-items-center p-4">
            <div className="w-full max-w-md rounded border border-[#dce2ec] bg-white p-3 dark:border-[#21262d] dark:bg-[#161b22]">
              <p className="text-[10px] font-semibold text-[#57657b] dark:text-[#c9d1d9]">Opportunity Items</p>
              <div className="mt-2 grid gap-2">
                <MiniField
                  label="Item Group"
                  value={formValues.marketSegment}
                  onChange={updateField('marketSegment')}
                  options={['Software License', 'Engineering Service', 'Support']}
                />
                <MiniField
                  label="Estimated Value"
                  value={formValues.annualRevenue}
                  onChange={updateField('annualRevenue')}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ErpCrmDashboardScene() {
  const [activeRail, setActiveRail] = useState(2);
  const [activeMetric, setActiveMetric] = useState(0);
  const [selectedPanel, setSelectedPanel] = useState('Incoming Leads');
  const [period, setPeriod] = useState('Last Quarter');
  const [cadence, setCadence] = useState('Weekly');

  const panels = ['Incoming Leads', 'Opportunity Trends', 'Won Opportunities'] as const;
  const panelData: Record<(typeof panels)[number], number[]> = {
    'Incoming Leads': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80, 0],
    'Opportunity Trends': [0, 0, 6, 8, 9, 12, 14, 15, 19, 22, 31, 44],
    'Won Opportunities': [0, 0, 0, 2, 4, 4, 7, 8, 12, 13, 20, 25],
  };

  return (
    <div className="grid h-full grid-cols-[30px_minmax(0,1fr)] bg-[#f7f8fa] dark:bg-[#0d1117]">
      <aside className="border-r border-[#e1e4eb] bg-[#f2f3f6] py-2 dark:border-[#21262d] dark:bg-[#161b22]">
        <div className="mx-auto grid h-5 w-5 place-items-center rounded bg-[#7c838f] text-[9px] font-semibold text-white dark:bg-[#484f58]">C</div>
        <div className="mt-2 space-y-1.5 px-1">
          {[Search, Bell, BarChart3, Users, Calendar, Settings].map((Icon, index) => (
            <button
              key={`crm-dash-icon-${index}`}
              type="button"
              onClick={() => setActiveRail(index)}
              className={`grid w-full place-items-center rounded p-0.5 ${activeRail === index ? 'bg-[#dce3ee] text-[#4b5b71] dark:bg-[#1c2333] dark:text-[#c9d1d9]' : 'text-[#7f8899] hover:bg-[#e5eaf2] dark:text-[#8b949e] dark:hover:bg-[#1c2333]'
                }`}
            >
              <Icon className="h-2.5 w-2.5" />
            </button>
          ))}
        </div>
      </aside>

      <div className="p-2">
        <div className="flex items-center justify-between text-[10px] text-[#667487] dark:text-[#8b949e]">
          <p className="font-semibold">/ Dashboard / CRM</p>
          <MoreHorizontal className="h-3 w-3" />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5 lg:grid-cols-4">
          {['New Lead (Last 1 Month)', 'New Opportunity (Last 1 Month)', 'Won Opportunity (Last 1 Month)', 'Open Opportunity'].map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveMetric(index)}
              className={`rounded border bg-white px-2 py-1.5 text-left dark:bg-[#161b22] ${activeMetric === index ? 'border-[#a9bbd2] dark:border-[#58a6ff]' : 'border-[#dce2ec] hover:border-[#bcc9db] dark:border-[#21262d] dark:hover:border-[#484f58]'
                }`}
            >
              <p className="text-[8px] text-[#77849a] dark:text-[#8b949e]">{label}</p>
              <p className="mt-0.5 text-[12px] font-semibold text-[#2e3645] dark:text-[#e6edf3]">0</p>
            </button>
          ))}
        </div>

        {panels.map((title) => (
          <div key={title} className="mt-2 rounded border border-[#dce2ec] bg-white p-2 dark:border-[#21262d] dark:bg-[#161b22]">
            <div className="flex items-center justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedPanel(title)}
                  className={`text-[9px] font-semibold ${selectedPanel === title ? 'text-[#425674] dark:text-[#e6edf3]' : 'text-[#5f6c81] dark:text-[#8b949e]'}`}
                >
                  {title}
                </button>
                <p className="text-[8px] text-[#8b95a5] dark:text-[#6e7681]">Last synced 5 minutes ago</p>
              </div>
              <div className="flex items-center gap-1 text-[#7f8a9f] dark:text-[#8b949e]">
                <Filter className="h-2.5 w-2.5" />
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="h-4 rounded bg-[#f0f2f6] px-1.5 text-[8px] outline-none dark:bg-[#1c2333] dark:text-[#c9d1d9]"
                >
                  <option>Last Quarter</option>
                  <option>Last Year</option>
                  <option>This Month</option>
                </select>
                <select
                  value={cadence}
                  onChange={(event) => setCadence(event.target.value)}
                  className="h-4 rounded bg-[#f0f2f6] px-1.5 text-[8px] outline-none dark:bg-[#1c2333] dark:text-[#c9d1d9]"
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
                <MoreHorizontal className="h-2.5 w-2.5" />
              </div>
            </div>

            <div className="mt-1 rounded border border-[#e4e8ef] bg-[#fcfdff] p-1 dark:border-[#21262d] dark:bg-[#0d1117]">
              <svg viewBox="0 0 100 100" className="h-12 w-full" aria-hidden>
                {[24, 46, 68, 90].map((line) => (
                  <line key={`${title}-${line}`} x1="0" y1={line} x2="100" y2={line} stroke="currentColor" strokeWidth="0.8" className="text-[#edf0f5] dark:text-[#21262d]" />
                ))}
                <polyline
                  points={linePoints(panelData[title])}
                  fill="none"
                  stroke={selectedPanel === title ? '#f472b6' : '#f9a8d4'}
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErpAppSwitcherScene() {
  const [activeApp, setActiveApp] = useState(ACCOUNTING_APPS[0]?.label ?? '');

  return (
    <div className="relative h-full overflow-hidden bg-[#f1f2f5] dark:bg-[#0d1117]">
      <div className="absolute inset-0 bg-black/55 dark:bg-black/70" />
      <div className="relative grid h-full place-items-center p-3">
        <div className="w-full max-w-[390px] rounded-2xl bg-white p-4 shadow-[0_18px_40px_rgba(13,20,34,0.22)] dark:bg-[#161b22] dark:shadow-[0_18px_40px_rgba(0,0,0,0.5)]">
          <p className="text-center text-base font-semibold text-[#2b3240] dark:text-[#e6edf3]">Accounting</p>
          <div className="mt-3 grid grid-cols-4 gap-2.5">
            {ACCOUNTING_APPS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveApp(label)}
                className="rounded-md px-1 py-0.5 text-center transition-colors hover:bg-[#f1f5fb] dark:hover:bg-[#1c2333]"
              >
                <div
                  className={`mx-auto grid h-8 w-8 place-items-center rounded-lg text-white ${activeApp === label ? 'bg-[#0d76d8] dark:bg-[#1f6feb]' : 'bg-[#1687eb] dark:bg-[#58a6ff]'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-1 text-[9px] font-medium text-[#495466] dark:text-[#c9d1d9]">{label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErpReplicaPreview() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [cursorIndex, setCursorIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSceneIndex((current) => (current + 1) % ERP_SCENES.length);
    }, ERP_AUTOPLAY_MS);

    return () => window.clearInterval(interval);
  }, []);

  const activeScene = ERP_SCENES[activeSceneIndex];
  const cursorPath = ERP_CURSOR_PATHS[activeScene.id];
  const cursorPoint = cursorPath[cursorIndex % cursorPath.length];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCursorIndex((current) => (current + 1) % cursorPath.length);
    }, 1600);

    return () => window.clearInterval(interval);
  }, [activeScene.id, cursorPath.length]);

  return (
    <div
      className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-xl border border-[#d6dde8] bg-[#f6f7f9] shadow-[0_18px_34px_rgba(15,23,42,0.12)] dark:border-[#21262d] dark:bg-[#0d1117] dark:shadow-[0_18px_34px_rgba(0,0,0,0.4)]"
      style={{ fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 z-20">
        <motion.div
          animate={{ left: `${cursorPoint.x}%`, top: `${cursorPoint.y}%` }}
          transition={{ type: 'spring', stiffness: 170, damping: 24, mass: 0.5 }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <MousePointer2 className="h-4 w-4 text-[#161d29] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:text-white" />
            {cursorPoint.click ? (
              <motion.span
                key={`${activeScene.id}-${cursorIndex}`}
                initial={{ opacity: 0.7, scale: 0.35 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{ duration: 0.42, ease: 'easeOut' }}
                className="absolute left-2 top-1.5 h-2.5 w-2.5 rounded-full border border-[#264a76] dark:border-[#58a6ff]"
              />
            ) : null}
          </div>
        </motion.div>
      </div>

      <div className="aspect-[16/10] w-full overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeScene.id}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.15 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeScene.id === 'accounts' ? <ErpAccountsScene /> : null}
            {activeScene.id === 'onboarding' ? <ErpOnboardingScene /> : null}
            {activeScene.id === 'crm_form' ? <ErpOpportunityScene /> : null}
            {activeScene.id === 'crm_dashboard' ? <ErpCrmDashboardScene /> : null}
            {activeScene.id === 'app_switcher' ? <ErpAppSwitcherScene /> : null}
          </motion.div>
        </AnimatePresence>
      </div>


    </div>
  );
}

/* ─── CAD Replica Preview ────────────────────────────────────────────── */

const CAD_SCENES = [
  { id: 'workspace' as const, label: 'CAD Workspace' },
  { id: 'simulation' as const, label: 'Heat Simulation' },
];

const CAD_CURSOR_PATHS: Record<string, { x: number; y: number; click?: boolean }[]> = {
  workspace: [
    { x: 40, y: 35 },
    { x: 45, y: 50, click: true },
    { x: 38, y: 55, click: true },
    { x: 50, y: 40 },
    { x: 35, y: 45, click: true },
    { x: 42, y: 60 },
  ],
  simulation: [
    { x: 35, y: 40 },
    { x: 45, y: 55, click: true },
    { x: 30, y: 50 },
    { x: 50, y: 35 },
    { x: 40, y: 60, click: true },
  ],
};

const CAD_AUTOPLAY_MS = 6000;

/** Onshape-like workspace scene */
export function CadWorkspaceScene() {
  const promptText = 'Generate a mounting bracket with 4 bolt holes, 3mm fillet edges, compatible with ISO 4762 M6 bolts...';
  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypedChars((c) => (c >= promptText.length ? 0 : c + 1));
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full">
      {/* Left toolbar */}
      <div className="flex w-9 shrink-0 flex-col items-center gap-1.5 border-r border-[#dde3ed] bg-[#f0f2f5] px-1 py-2 dark:border-[#21262d] dark:bg-[#161b22]">
        {['□', '○', '△', '⬠', '⊕', '↗', '⊞'].map((icon, i) => (
          <div
            key={i}
            className={`flex h-6 w-6 items-center justify-center rounded text-[10px] transition-colors ${i === 0 ? 'bg-[#2a5e87] text-white dark:bg-[#1f6feb]' : 'text-[#617289] hover:bg-white dark:text-[#8b949e] dark:hover:bg-[#21262d]'}`}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Main viewport */}
      <div className="relative flex-1 bg-[#1a1d23] dark:bg-[#0a0d12]">
        {/* Grid background */}
        <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden>
          <defs>
            <pattern id="cadGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#4a5568" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cadGrid)" />
        </svg>

        {/* Axes indicator */}
        <div className="absolute bottom-3 left-3 z-10 text-[9px] font-mono">
          <span className="text-red-400">X</span>
          <span className="mx-1 text-green-400">Y</span>
          <span className="text-blue-400">Z</span>
        </div>

        {/* Animated 3D wireframe bracket */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 500 350"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {/* L-bracket body */}
          <motion.path
            d="M120 80 L320 80 L320 130 L220 130 L220 270 L120 270 Z"
            stroke="#58a6ff"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
          {/* 3D extrusion lines */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <line x1="120" y1="80" x2="150" y2="55" stroke="#58a6ff" strokeWidth="0.8" />
            <line x1="320" y1="80" x2="350" y2="55" stroke="#58a6ff" strokeWidth="0.8" />
            <line x1="320" y1="130" x2="350" y2="105" stroke="#58a6ff" strokeWidth="0.8" />
            <line x1="120" y1="270" x2="150" y2="245" stroke="#58a6ff" strokeWidth="0.8" />
            <line x1="220" y1="270" x2="250" y2="245" stroke="#58a6ff" strokeWidth="0.8" />
            <path d="M150 55 L350 55 L350 105 L250 105 L250 245 L150 245 Z" stroke="#58a6ff" strokeWidth="0.8" fill="none" />
          </motion.g>
          {/* Bolt holes */}
          {[[155, 95], [290, 95], [155, 230], [185, 230]].map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r="8"
              stroke="#f59e0b"
              strokeWidth="1"
              fill="none"
              strokeDasharray="3 2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 + i * 0.2, duration: 0.4 }}
            />
          ))}
          {/* Dimension lines */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 3, duration: 0.5 }}
          >
            <line x1="120" y1="290" x2="320" y2="290" stroke="#e2e8f0" strokeWidth="0.6" markerEnd="url(#arrow)" />
            <text x="210" y="303" fill="#a0aec0" fontSize="9" textAnchor="middle">200mm</text>
            <line x1="340" y1="80" x2="340" y2="270" stroke="#e2e8f0" strokeWidth="0.6" />
            <text x="355" y="180" fill="#a0aec0" fontSize="9" textAnchor="start">190mm</text>
          </motion.g>
        </svg>

        {/* Collab cursors */}
        <motion.div
          animate={{ left: ['62%', '58%', '65%'], top: ['30%', '45%', '35%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute z-10"
        >
          <div className="relative">
            <MousePointer2 className="h-3.5 w-3.5 text-emerald-400 drop-shadow" />
            <span className="absolute -top-3.5 left-3 whitespace-nowrap rounded bg-emerald-500/90 px-1 py-0.5 text-[7px] font-medium text-white">
              Sarah M.
            </span>
          </div>
        </motion.div>
        <motion.div
          animate={{ left: ['30%', '35%', '28%'], top: ['55%', '48%', '58%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute z-10"
        >
          <div className="relative">
            <MousePointer2 className="h-3.5 w-3.5 text-violet-400 drop-shadow" />
            <span className="absolute -top-3.5 left-3 whitespace-nowrap rounded bg-violet-500/90 px-1 py-0.5 text-[7px] font-medium text-white">
              James K.
            </span>
          </div>
        </motion.div>

        {/* Top breadcrumb */}
        <div className="absolute left-10 top-2 z-10 flex items-center gap-1 text-[9px] text-[#8b949e]">
          <span className="rounded bg-[#21262d]/80 px-1.5 py-0.5">Bracket_v4.step</span>
          <span>·</span>
          <span className="text-emerald-400">● 2 collaborators</span>
        </div>
      </div>

      {/* Right AI prompt panel */}
      <div className="flex w-[36%] min-w-[116px] max-w-[180px] shrink-0 flex-col border-l border-[#dde3ed] bg-[#f6f7f9] dark:border-[#21262d] dark:bg-[#161b22]">
        <div className="border-b border-[#dde3ed] px-2.5 py-2 dark:border-[#21262d]">
          <p className="text-[10px] font-semibold text-[#2a5e87] dark:text-[#58a6ff]">AI Assistant</p>
          <p className="mt-0.5 text-[8px] text-[#8b949e]">CloudAICAD Agent v0.3</p>
        </div>

        {/* Chat history */}
        <div className="flex-1 space-y-2 overflow-hidden px-2 py-2">
          <div className="rounded-lg bg-white/80 px-2 py-1.5 text-[9px] leading-[1.4] text-[#24292f] dark:bg-[#0d1117]/80 dark:text-[#c9d1d9]">
            <span className="font-semibold text-[#2a5e87] dark:text-[#58a6ff]">You:</span>{' '}
            {promptText.slice(0, typedChars)}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="inline-block h-2.5 w-[1px] bg-[#2a5e87] align-middle dark:bg-[#58a6ff]"
            />
          </div>
          {typedChars > promptText.length - 10 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-[#2a5e87]/10 px-2 py-1.5 text-[9px] leading-[1.4] text-[#24292f] dark:bg-[#1f6feb]/10 dark:text-[#c9d1d9]"
            >
              <span className="font-semibold text-[#2a5e87] dark:text-[#58a6ff]">AI:</span>{' '}
              Generating bracket... Applying ISO 4762 M6 constraints. Adding 3mm fillets to all edges.
            </motion.div>
          )}
        </div>

        {/* Input box */}
        <div className="border-t border-[#dde3ed] px-2 py-1.5 dark:border-[#21262d]">
          <div className="flex items-center gap-1 rounded border border-[#ccd4df] bg-white px-2 py-1 text-[9px] text-[#8b949e] dark:border-[#30363d] dark:bg-[#0d1117]">
            Ask AI anything...
          </div>
        </div>
      </div>
    </div>
  );
}

/** Heat simulation scene */
function CadSimulationScene() {
  return (
    <div className="flex h-full">
      {/* Left toolbar */}
      <div className="flex w-9 shrink-0 flex-col items-center gap-1.5 border-r border-[#dde3ed] bg-[#f0f2f5] px-1 py-2 dark:border-[#21262d] dark:bg-[#161b22]">
        {['◎', '◇', '▦', '≋', '⊿', '⊙'].map((icon, i) => (
          <div
            key={i}
            className={`flex h-6 w-6 items-center justify-center rounded text-[10px] ${i === 3 ? 'bg-[#dc2626] text-white dark:bg-[#f85149]' : 'text-[#617289] dark:text-[#8b949e]'}`}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Main simulation viewport */}
      <div className="relative flex-1 bg-[#1a1d23] dark:bg-[#0a0d12]">
        {/* Heat map gradient on the bracket shape */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 500 350"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id="heatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="25%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="75%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="heatGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="40%" stopColor="#22c55e" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Bracket filled with heat gradient */}
          <motion.path
            d="M120 80 L320 80 L320 130 L220 130 L220 270 L120 270 Z"
            fill="url(#heatGrad)"
            stroke="#ffffff30"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0.75, 0.85] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* 3D extrusion */}
          <motion.path
            d="M150 55 L350 55 L350 105 L250 105 L250 245 L150 245 Z"
            fill="url(#heatGrad2)"
            stroke="#ffffff20"
            strokeWidth="0.8"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.5, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          {/* Heat concentration spots */}
          {[[155, 95, '#ef4444'], [290, 95, '#eab308'], [155, 230, '#ef4444'], [185, 230, '#f97316']].map(([cx, cy, color], i) => (
            <motion.circle
              key={i}
              cx={cx as number}
              cy={cy as number}
              r="14"
              fill={color as string}
              opacity="0.4"
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
          ))}
        </svg>

        {/* Heat legend */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-[#8b949e]">20°C</span>
            <div className="h-2 w-20 rounded-sm bg-gradient-to-r from-[#1e40af] via-[#22c55e] to-[#ef4444]" />
            <span className="text-[8px] text-[#8b949e]">450°C</span>
          </div>
          <span className="text-[7px] text-[#8b949e]">Thermal Distribution · Steady State</span>
        </div>

        {/* Max temp readout */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute left-14 top-14 z-10 rounded border border-red-500/40 bg-red-500/20 px-1.5 py-0.5 text-[8px] font-mono text-red-400"
        >
          Max: 423°C
        </motion.div>

        {/* Status bar */}
        <div className="absolute left-10 top-2 z-10 flex items-center gap-2 text-[9px] text-[#8b949e]">
          <span className="rounded bg-[#21262d]/80 px-1.5 py-0.5">Bracket_v4 · Thermal Analysis</span>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-emerald-400"
          >
            ● Converged
          </motion.span>
        </div>
      </div>

      {/* Right AI panel — showing simulation chat */}
      <div className="flex w-[36%] min-w-[116px] max-w-[180px] shrink-0 flex-col border-l border-[#dde3ed] bg-[#f6f7f9] dark:border-[#21262d] dark:bg-[#161b22]">
        <div className="border-b border-[#dde3ed] px-2.5 py-2 dark:border-[#21262d]">
          <p className="text-[10px] font-semibold text-[#2a5e87] dark:text-[#58a6ff]">AI Assistant</p>
          <p className="mt-0.5 text-[8px] text-[#8b949e]">Simulation Mode</p>
        </div>

        <div className="flex-1 space-y-2 overflow-hidden px-2 py-2">
          <div className="rounded-lg bg-white/80 px-2 py-1.5 text-[9px] leading-[1.4] text-[#24292f] dark:bg-[#0d1117]/80 dark:text-[#c9d1d9]">
            <span className="font-semibold text-[#2a5e87] dark:text-[#58a6ff]">You:</span>{' '}
            Run thermal analysis on this bracket, assume aluminium 6061, 200W heat source at bolt holes
          </div>
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-lg bg-[#2a5e87]/10 px-2 py-1.5 text-[9px] leading-[1.4] text-[#24292f] dark:bg-[#1f6feb]/10 dark:text-[#c9d1d9]"
          >
            <span className="font-semibold text-[#2a5e87] dark:text-[#58a6ff]">AI:</span>{' '}
            Thermal simulation complete. Peak temp 423°C at bolt hole interfaces. Recommended: increase fillet radius to 5mm for better heat dissipation.
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-[8px] text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-3 w-3" />
            Mesh quality: Excellent (98.4%)
          </motion.div>
        </div>

        <div className="border-t border-[#dde3ed] px-2 py-1.5 dark:border-[#21262d]">
          <div className="flex items-center gap-1 rounded border border-[#ccd4df] bg-white px-2 py-1 text-[9px] text-[#8b949e] dark:border-[#30363d] dark:bg-[#0d1117]">
            Ask AI anything...
          </div>
        </div>
      </div>
    </div>
  );
}

function CadReplicaPreview() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [cursorIndex, setCursorIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSceneIndex((c) => (c + 1) % CAD_SCENES.length);
    }, CAD_AUTOPLAY_MS);
    return () => window.clearInterval(interval);
  }, []);

  const activeScene = CAD_SCENES[activeSceneIndex];
  const cursorPath = CAD_CURSOR_PATHS[activeScene.id];
  const cursorPoint = cursorPath[cursorIndex % cursorPath.length];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCursorIndex((c) => (c + 1) % cursorPath.length);
    }, 1600);
    return () => window.clearInterval(interval);
  }, [activeScene.id, cursorPath.length]);

  return (
    <div
      className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-xl border border-[#d6dde8] bg-[#f6f7f9] shadow-[0_18px_34px_rgba(15,23,42,0.12)] dark:border-[#21262d] dark:bg-[#0d1117] dark:shadow-[0_18px_34px_rgba(0,0,0,0.4)]"
      style={{ fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
    >
      {/* Animated cursor */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <motion.div
          animate={{ left: `${cursorPoint.x}%`, top: `${cursorPoint.y}%` }}
          transition={{ type: 'spring', stiffness: 170, damping: 24, mass: 0.5 }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <MousePointer2 className="h-4 w-4 text-[#161d29] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:text-white" />
            {cursorPoint.click ? (
              <motion.span
                key={`cad-${activeScene.id}-${cursorIndex}`}
                initial={{ opacity: 0.7, scale: 0.35 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{ duration: 0.42, ease: 'easeOut' }}
                className="absolute left-2 top-1.5 h-2.5 w-2.5 rounded-full border border-[#264a76] dark:border-[#58a6ff]"
              />
            ) : null}
          </div>
        </motion.div>
      </div>

      {/* Scene content */}
      <div className="aspect-[16/10] w-full overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeScene.id}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.15 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeScene.id === 'workspace' ? <CadWorkspaceScene /> : null}
            {activeScene.id === 'simulation' ? <CadSimulationScene /> : null}
          </motion.div>
        </AnimatePresence>
      </div>


    </div>
  );
}


function SlideContent({
  tab,
  index,
  total,
  onContactOpen,
}: {
  tab: (typeof showcaseTabs)[number];
  index: number;
  total: number;
  onContactOpen: () => void;
}) {
  const HeaderIcon = getShowcaseHeaderIcon(tab.label);
  const stepNumber = String(index + 1).padStart(2, '0');

  /* ─── Showcase section (top) ─── */
  const showcase = (() => {
    if (tab.key === 'custom') {
      return (
        <GoogleGeminiEffect
          className="min-h-[320px] sm:min-h-[360px] xl:min-h-[400px]"
          ctaText="Tailored Optimised Intelligently Engineered Solutions"
        />
      );
    }
    if (tab.key === 'erp') return <ErpReplicaPreview />;
    return <CadReplicaPreview />;
  })();

  return (
    <div className="flex h-full flex-col">
      {/* Preview section */}
      <div className="relative w-full overflow-hidden">
        {showcase}
      </div>

      {/* Text content — sits below the preview, never overlaps */}
      <div className="relative z-10 border-t border-black/5 bg-white px-5 py-4 dark:border-white/5 dark:bg-neutral-950 sm:px-7 sm:py-5 xl:px-9 xl:py-6">
        <div className="mb-3 flex items-center gap-3 sm:mb-3.5">
          <span className="select-none font-mono text-2xl font-bold text-black/15 dark:text-white/24">
            {stepNumber}
          </span>
          <div className="h-px flex-1 bg-black/10 dark:bg-white/14" />
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#103651]/10 px-2.5 py-1.5 dark:bg-[#8FC6F2]/10">
            <HeaderIcon className="h-3.5 w-3.5 text-[#103651] dark:text-[#8FC6F2]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#103651] dark:text-[#8FC6F2]">
              {tab.label}
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {index + 1}/{total}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold tracking-tight text-black dark:text-white sm:text-xl xl:text-2xl">
          {tab.title}
        </h3>

        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
          {tab.description}
        </p>

        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 sm:mt-4">
          {tab.outcomes.map((outcome) => (
            <li key={outcome} className="inline-flex items-start gap-1.5 text-[12px] text-neutral-600 dark:text-neutral-300 sm:text-sm">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#103651] dark:text-[#8FC6F2]" />
              {outcome}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-5 sm:gap-4">
          {tab.ctaIsExternal ? (
            <a
              href={tab.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg dark:bg-white dark:text-black dark:hover:bg-neutral-200 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              {tab.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <button
              type="button"
              onClick={onContactOpen}
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg dark:bg-white dark:text-black dark:hover:bg-neutral-200 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              {tab.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onContactOpen}
            className="text-[13px] font-semibold text-neutral-600 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white sm:text-sm"
          >
            {tab.secondaryCtaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DesktopHorizontalTakeover({ onContactOpen }: { onContactOpen: () => void }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackViewportRef = useRef<HTMLDivElement | null>(null);
  const trackViewportWidth = useElementWidth(trackViewportRef);
  const slideCount = showcaseTabs.length;
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(() => (typeof window === 'undefined' ? 1080 : window.innerHeight));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onResize = () => setViewportHeight(window.innerHeight);
    onResize();
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  const sectionHeightPx = useMemo(
    () => viewportHeight * (1 + (slideCount - 1) * (DESKTOP_SCROLL_VH_PER_SLIDE / 100)),
    [viewportHeight, slideCount],
  );
  const sectionScrollablePx = useMemo(
    () => Math.max(sectionHeightPx - viewportHeight, 1),
    [sectionHeightPx, viewportHeight],
  );
  const sectionHeight = useMemo(() => `${sectionHeightPx}px`, [sectionHeightPx]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (slideCount <= 1) {
        setActiveSlideIndex(0);
        return;
      }

      const bounded = Math.max(0, Math.min(latest, DESKTOP_SCROLL_COMPLETION));
      const normalized = bounded / DESKTOP_SCROLL_COMPLETION;
      const snappedIndex = Math.round(normalized * (slideCount - 1));

      setActiveSlideIndex((current) => (current === snappedIndex ? current : snappedIndex));
    });

    return () => unsubscribe();
  }, [scrollYProgress, slideCount]);

  const x = useMemo(() => -activeSlideIndex * trackViewportWidth, [activeSlideIndex, trackViewportWidth]);
  const progressWidth = useTransform(scrollYProgress, [0, DESKTOP_SCROLL_COMPLETION], ['0%', '100%']);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const anchorOffsets = useMemo(() => {
    const divisor = Math.max(slideCount - 1, 1);
    const anchorTopOffsetPx = NAV_HEIGHT_PX + 20;

    return showcaseTabs.map((tab, tabIndex) => ({
      key: tab.key,
      top: `${anchorTopOffsetPx + ((tabIndex / divisor) * DESKTOP_SCROLL_COMPLETION * sectionScrollablePx)}px`,
    }));
  }, [slideCount, sectionScrollablePx]);

  return (
    <section
      id="what-we-do"
      ref={sectionRef}
      className="relative bg-neutral-50 dark:bg-black transition-colors duration-300 scroll-mt-24"
      style={{ height: sectionHeight }}
    >
      {anchorOffsets.map((anchor) => (
        <div
          key={anchor.key}
          id={anchor.key}
          className="absolute left-0 h-px w-px"
          style={{ top: anchor.top, scrollMarginTop: `${NAV_HEIGHT_PX + 20}px` }}
        />
      ))}

      <div
        className="sticky overflow-hidden"
        style={{ top: `${NAV_HEIGHT_PX}px`, height: `calc(100dvh - ${NAV_HEIGHT_PX}px)` }}
      >
        <div className="mx-auto h-full w-full max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#103651] dark:text-[#8FC6F2]">
              What We Do
            </p>
            <motion.p className="text-xs text-neutral-500 dark:text-neutral-400" style={{ opacity: scrollHintOpacity }}>
              Scroll
            </motion.p>
          </div>

          <div className="mt-2 h-px w-full bg-black/10 dark:bg-white/10">
            <motion.div className="h-full bg-[#103651] dark:bg-[#8FC6F2]" style={{ width: progressWidth }} />
          </div>

          <div
            ref={trackViewportRef}
            className="mt-5 h-[calc(100%-56px)] overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-950"
          >
            <motion.div
              className="flex h-full will-change-transform"
              animate={{ x }}
              transition={{ type: 'spring', stiffness: 180, damping: 28, mass: 0.45 }}
              style={{
                width: trackViewportWidth > 0 ? `${trackViewportWidth * slideCount}px` : `${slideCount * 100}%`,
              }}
            >
              {showcaseTabs.map((tab, tabIndex) => (
                <section
                  key={tab.key}
                  className="h-full shrink-0 p-6 xl:p-8"
                  style={{ width: trackViewportWidth > 0 ? `${trackViewportWidth}px` : `${100 / slideCount}%` }}
                >
                  <SlideContent tab={tab} index={tabIndex} total={slideCount} onContactOpen={onContactOpen} />
                </section>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileStacked({ onContactOpen }: { onContactOpen: () => void }) {
  return (
    <section id="what-we-do" className="py-20 bg-neutral-50 dark:bg-black transition-colors duration-300 scroll-mt-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#103651] dark:text-[#8FC6F2]">
            What We Do
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-black dark:text-white">Explore Our Core Offerings</h2>
        </div>

        <div className="space-y-5">
          {showcaseTabs.map((tab, tabIndex) => (
            <article
              key={tab.key}
              id={tab.key}
              className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-950 p-5"
            >
              <SlideContent tab={tab} index={tabIndex} total={showcaseTabs.length} onContactOpen={onContactOpen} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Products({ onContactOpen }: { onContactOpen: () => void }) {
  const isDesktop = useDesktopMode();
  return isDesktop ? <DesktopHorizontalTakeover onContactOpen={onContactOpen} /> : <MobileStacked onContactOpen={onContactOpen} />;
}
