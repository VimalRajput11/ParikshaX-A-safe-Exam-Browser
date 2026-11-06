import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * ParikshaX logo lockup used across candidate and admin surfaces.
 * `tone="light"` is for dark backgrounds (e.g. the admin sidebar).
 */
function BrandMark({ tone = 'dark', subtitle, size = 'md' }) {
    const box = size === 'lg' ? 'w-11 h-11 rounded-xl' : 'w-9 h-9 rounded-lg';
    const icon = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    const title = size === 'lg' ? 'text-xl' : 'text-base';

    return (
        <div className="flex items-center gap-3 min-w-0">
            <div className={`${box} bg-brand-600 flex items-center justify-center shrink-0 shadow-sm`}>
                <ShieldCheck className={`${icon} text-white`} strokeWidth={2.25} />
            </div>
            <div className="min-w-0 leading-tight">
                <div className={`${title} font-bold tracking-tight ${tone === 'light' ? 'text-white' : 'text-slate-900'}`}>
                    Pariksha<span className={tone === 'light' ? 'text-brand-300' : 'text-brand-600'}>X</span>
                </div>
                {subtitle && (
                    <div className={`text-xs truncate ${tone === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</div>
                )}
            </div>
        </div>
    );
}

export default BrandMark;
