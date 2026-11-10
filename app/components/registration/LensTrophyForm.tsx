'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MR_LENS_TROPHY } from '@/config/projects';
import { lensOriginOf, lensOrderTotal, lensSlabFor, lensUpsell } from '@/lib/projects/lensTrophy';
import { FloatingInput, SectionHeading, ToggleBtn } from './ui';
import type { RegistrationFormProps } from './types';

const { fees, categories } = MR_LENS_TROPHY;

const formatMoney = (symbol: string, amount: number) => {
  const rounded = Math.round(amount * 100) / 100;
  return `${symbol}${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
};

export default function LensTrophyForm({ initialData, onSubmit }: RegistrationFormProps) {
  const supabase = createClient();
  const fd = initialData ?? {};

  const [name, setName] = useState<string>(fd.name || '');
  const [email, setEmail] = useState<string>(fd.email || '');
  const [whatsapp, setWhatsapp] = useState<string>(fd.whatsapp || '');
  const [instagram, setInstagram] = useState<string>(fd.instagram || '');
  const [countryType, setCountryType] = useState<'India' | 'Other'>(
    !fd.country || fd.country === 'India' ? 'India' : 'Other'
  );
  const [country, setCountry] = useState<string>(fd.country || 'India');
  // How many images per photography category (this first order).
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(categories.map((c, i) => [c.key, fd.categories?.[c.key] ?? (i === 0 ? 1 : 0)]))
  );
  const images = Object.values(counts).reduce((a, b) => a + b, 0);
  const setCount = (key: string, delta: number) =>
    setCounts(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill name + email from the user's profile / login, unless a saved registration already has them.
  useEffect(() => {
    if (fd.name && fd.email) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: info } = await supabase.from('user_info').select('name').eq('id', user.id).maybeSingle();
      setName(prev => prev || info?.name || '');
      setEmail(prev => prev || user.email || '');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const origin = lensOriginOf(country);
  const table = fees[origin];
  const slab = images >= 1 ? lensSlabFor(origin, images) : undefined;
  const orderTotal = images >= 1 ? lensOrderTotal(origin, images) : 0;
  const upsell = lensUpsell(origin, images, fees.maxImages);

  const canSubmit =
    name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && whatsapp.trim() && country.trim() && images >= 1 && images <= fees.maxImages;

  const handleSubmit = async () => {
    if (!canSubmit) { setError('Please complete all required fields'); return; }
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.replace(/^@/, '').trim() || null,
        country: country.trim(),
        categories: counts,
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-5 p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl flex items-start gap-3">
          <span className="text-[#C85D3E] text-lg mt-0.5">⚠</span>
          <p className="text-[#C85D3E] text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-7">
        {/* Contact */}
        <div>
          <SectionHeading>Your Details</SectionHeading>
          <div className="space-y-3">
            <FloatingInput label="Full name" value={name} onChange={e => setName(e.target.value)} disabled={isLoading} />
            <div>
              <FloatingInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
              <p className="text-xs text-[#6B6B6B] mt-1.5 leading-relaxed">
                All communication and notifications about the competition will be sent to this email. It is pre-filled
                from your account, but you can change it.
              </p>
            </div>
            <FloatingInput label="WhatsApp number (with country code)" type="tel" value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)} disabled={isLoading} />
            <FloatingInput label="Instagram id (optional)" value={instagram}
              onChange={e => setInstagram(e.target.value)} disabled={isLoading} />
          </div>
        </div>

        <div className="border-t border-[#E5E3D7]" />

        {/* Country */}
        <div>
          <SectionHeading>Country</SectionHeading>
          <div className="flex gap-2 mb-3">
            <ToggleBtn active={countryType === 'India'} onClick={() => { setCountryType('India'); setCountry('India'); }} disabled={isLoading}>India</ToggleBtn>
            <ToggleBtn active={countryType === 'Other'} onClick={() => { setCountryType('Other'); setCountry(''); }} disabled={isLoading}>Others</ToggleBtn>
          </div>
          {countryType === 'Other' && (
            <FloatingInput label="Enter your country" value={country} onChange={e => setCountry(e.target.value)} disabled={isLoading} />
          )}
          <p className="text-xs text-[#6B6B6B] mt-2">
            Pricing is in {table.currency === 'INR' ? 'Indian Rupees (₹)' : 'US Dollars ($)'} for {table.title.toLowerCase()}.
          </p>
        </div>

        <div className="border-t border-[#E5E3D7]" />

        {/* Images for this order */}
        <div>
          <SectionHeading>Images to Register Now</SectionHeading>
          <p className="text-sm text-[#4B4B4B] leading-relaxed mb-3">
            Choose how many images you want in each category.
          </p>
          <div className="space-y-3">
            {categories.map(c => (
              <div key={c.key} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-[#D0CEC2] bg-white">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{c.label}</p>
                  <p className="text-xs text-[#6B6B6B]">Images in this category</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setCount(c.key, -1)}
                    disabled={isLoading || counts[c.key] <= 0} aria-label={`Remove one ${c.label} image`}
                    className="w-9 h-9 rounded-full border border-[#D0CEC2] text-lg font-bold text-[#2C5F5F] hover:border-[#2C5F5F] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">−</button>
                  <span className="w-6 text-center text-lg font-bold tabular-nums text-[#1A1A1A]">{counts[c.key]}</span>
                  <button type="button" onClick={() => setCount(c.key, 1)}
                    disabled={isLoading || images >= fees.maxImages} aria-label={`Add one ${c.label} image`}
                    className="w-9 h-9 rounded-full bg-[#2C5F5F] text-lg font-bold text-white hover:bg-[#1A4D4D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">+</button>
                </div>
              </div>
            ))}
            <p className="text-xs text-[#6B6B6B] text-right">
              {images} of {fees.maxImages} images selected
            </p>
          </div>

          <div className="mt-4 flex items-end justify-between gap-4 px-5 py-4 rounded-xl border border-[#D0CEC2] bg-white">
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {images} {images === 1 ? 'image' : 'images'} in total
                {slab && slab.total == null && (
                  <span className="font-normal text-[#6B6B6B]"> × {formatMoney(table.symbol, slab.perImage as number)}</span>
                )}
              </p>
              <p className="text-xs uppercase tracking-wide text-[#6B6B6B] mt-1">{slab ? slab.label : 'Add at least one image'}</p>
              {upsell && <p className="text-xs font-semibold text-[#2C5F5F] mt-1">{upsell}</p>}
            </div>
            <p className="text-3xl font-extrabold tabular-nums leading-none text-[#2C5F5F]">
              {formatMoney(table.symbol, orderTotal)}
            </p>
          </div>
          <p className="text-[11px] text-[#8B8B8B] mt-2 text-right italic">*Includes fees and taxes.</p>
        </div>

        <div className="border-t border-[#E5E3D7]" />

        <div>
          <button onClick={handleSubmit} disabled={!canSubmit || isLoading}
            className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
              ${canSubmit && !isLoading
                ? 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
              }`}>
            {isLoading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              : 'Continue to Payment →'
            }
          </button>
          {!canSubmit && !isLoading && (
            <p className="text-xs text-[#8B8B8B] text-center mt-2">Fill in your name, email, WhatsApp number and country to continue</p>
          )}
        </div>
      </div>
    </>
  );
}
