'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MR_LENS_TROPHY } from '@/config/projects';
import { lensOriginOf, lensOrderTotal, lensSlabFor } from '@/lib/projects/lensTrophy';
import { FloatingInput, SectionHeading, ToggleBtn } from './ui';
import type { RegistrationFormProps } from './types';

const { fees } = MR_LENS_TROPHY;
const IMAGE_COUNTS = Array.from({ length: fees.maxImages }, (_, i) => i + 1);

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
  const [images, setImages] = useState<number>(fd.images || 1);

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
  const slab = lensSlabFor(origin, images);
  const orderTotal = lensOrderTotal(origin, images);

  const canSubmit =
    name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && whatsapp.trim() && country.trim() && images >= 1;

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
        images,
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
            You don&apos;t upload any images yet. You are only paying for the number of entries you want. You can buy more
            later (up to {fees.maxImages} in total). Each purchase is priced on its own size, so adding 2 images later is
            charged at the 1–4 images rate, whatever you bought before.
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {IMAGE_COUNTS.map(n => (
              <ToggleBtn key={n} active={images === n} onClick={() => setImages(n)} disabled={isLoading}>{n}</ToggleBtn>
            ))}
          </div>

          <div className="mt-4 flex items-end justify-between gap-4 px-5 py-4 rounded-xl border border-[#D0CEC2] bg-white">
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {images} {images === 1 ? 'image' : 'images'}
                {slab?.total == null && slab && (
                  <span className="font-normal text-[#6B6B6B]"> × {formatMoney(table.symbol, slab.perImage as number)}</span>
                )}
              </p>
              <p className="text-xs uppercase tracking-wide text-[#6B6B6B] mt-1">{slab?.label} · {slab?.note}</p>
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
