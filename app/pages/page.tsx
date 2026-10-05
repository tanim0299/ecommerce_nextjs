'use client';

import React, { Suspense } from 'react';
import CustomPolicyClient from './[slug]/CustomPolicyClient';

export default function GenericPolicyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <CustomPolicyClient />
    </Suspense>
  );
}
