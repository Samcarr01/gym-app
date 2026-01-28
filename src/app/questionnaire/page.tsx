'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionnaireForm } from '@/components/QuestionnaireForm';

function QuestionnaireContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') as 'new' | 'update') || 'new';

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <QuestionnaireForm mode={mode} />
      </div>
    </main>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <QuestionnaireContent />
    </Suspense>
  );
}
