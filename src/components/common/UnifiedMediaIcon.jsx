import React from 'react';

const UnifiedMediaIcon = ({ size = 24, className = "", ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            {/* Infinity Loop */}
            <path d="M12 12c-2.5-3-5.5-4-8-3.5S0 11 0 14s3 4 6 4 5-1.5 6-6 1-6 6-6 6 1 6 4-2.5 5.5-5 5-8-1-8-3.5" />

            {/* Music Note Head (Left side) */}
            <circle cx="4" cy="14" r="1.5" fill="currentColor" opacity="0.4" />

            {/* Film Strip Perforations (Right side) */}
            <rect x="16" y="10" width="2" height="1.5" rx="0.5" fill="currentColor" opacity="0.4" />
            <rect x="19" y="10" width="2" height="1.5" rx="0.5" fill="currentColor" opacity="0.4" />
            <rect x="16" y="13.5" width="2" height="1.5" rx="0.5" fill="currentColor" opacity="0.4" />
            <rect x="19" y="13.5" width="2" height="1.5" rx="0.5" fill="currentColor" opacity="0.4" />
        </svg>
    );
};

export default UnifiedMediaIcon;
