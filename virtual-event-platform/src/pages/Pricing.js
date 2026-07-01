import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      desc: 'Ideal for hosting small virtual meetups and community gatherings.',
      features: [
        'Up to 50 attendees per event',
        'Standard event description drafting',
        'Built-in ticketing and check-in tools',
        'Local event uploads',
        'Community discussion access'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Professional',
      price: '₹1,499',
      period: 'per month',
      desc: 'Perfect for commercial webinars, conferences, and active organizers.',
      features: [
        'Up to 1,000 attendees per event',
        'AI Co-Creator Canvas (NLP event auto-drafting)',
        'Advanced Analytics Dashboard & Insights',
        'Priority support & Custom branding',
        'API & webhook notification streams',
        'Custom ticketing fees'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'tailored pricing',
      desc: 'Enterprise-grade hosting for global summits, conventions, and organizations.',
      features: [
        'Unlimited attendees',
        'Dedicated AI Operations Agent instance',
        'Custom domain integration',
        'SLA guaranteed support contract',
        'Advanced database analytics exports',
        'Dedicated onboarding manager'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-12">

      <PageHeader
        title="Predictable, Transparent Pricing"
        subtitle="Choose the perfect plan to fuel your virtual event operations. Free options available for community meetups."
        className="text-center max-w-3xl mx-auto"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-[32px] flex flex-col justify-between relative group hover:border-indigo-500/40 hover:bg-slate-900/65 transition-all duration-300 ${
              plan.popular ? 'ring-2 ring-indigo-500/50 scale-[1.03] shadow-[0_0_50px_rgba(79,70,229,0.1)]' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg tracking-wider uppercase">
                <Sparkles className="h-3 w-3" /> Most Popular
              </div>
            )}

            <div>
              <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-400 font-medium mb-6 min-h-[40px]">{plan.desc}</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-sm text-slate-500 font-semibold">/ {plan.period}</span>}
              </div>

              <div className="border-t border-slate-800 my-6" />

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="bg-indigo-500/10 p-0.5 rounded-full border border-indigo-500/20 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <span className="text-sm text-slate-300 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full py-4 rounded-2xl text-sm font-black transition-all duration-200 ${
                plan.popular
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-95'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-800'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pricing;
