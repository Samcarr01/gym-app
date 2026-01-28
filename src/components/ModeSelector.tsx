'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PlusCircle, RefreshCw } from 'lucide-react';

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function ModeCard({ title, description, icon, href }: ModeCardProps) {
  return (
    <Link href={href}>
      <Card className="p-6 hover:border-primary transition-colors cursor-pointer group">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{title}</h2>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function ModeSelector() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ModeCard
        title="Build New Plan"
        description="Start fresh with a complete questionnaire to create your personalised workout plan"
        icon={<PlusCircle className="h-6 w-6" />}
        href="/questionnaire?mode=new"
      />
      <ModeCard
        title="Update Existing Plan"
        description="Modify your current workout plan based on changes in your goals or situation"
        icon={<RefreshCw className="h-6 w-6" />}
        href="/questionnaire?mode=update"
      />
    </div>
  );
}
