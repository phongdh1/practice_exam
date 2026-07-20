import type { SubjectCatalogItem } from "@practice-exam/types";
import { useState } from "react";
import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { MaterialIcon } from "./material-icon";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export interface LandingFeaturedSubjectsProps {
  subjects: SubjectCatalogItem[];
  getSubjectHref: (subject: SubjectCatalogItem) => string;
  catalogHref?: string;
  maxItems?: number;
  className?: string;
}

function pickFeatured(
  subjects: SubjectCatalogItem[],
  maxItems: number,
): SubjectCatalogItem[] {
  const hot = subjects.filter((s) => s.isHot);
  const rest = subjects.filter((s) => !s.isHot);
  return [...hot, ...rest].slice(0, maxItems);
}

export function LandingFeaturedSubjects({
  subjects,
  getSubjectHref,
  catalogHref = "#catalog",
  maxItems = 2,
  className,
}: LandingFeaturedSubjectsProps) {
  const featured = pickFeatured(subjects, maxItems);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "bg-surface-subtle px-gutter-mobile py-14 md:px-gutter-desktop md:py-16",
        className,
      )}
      data-component="landing-featured-subjects"
    >
      <div className="mx-auto max-w-content">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-caption font-medium uppercase tracking-wider text-ink-muted">
              Phase 1
            </p>
            <h2 className="mt-1 text-display-sm font-heading text-on-surface">
              Các môn học tiêu biểu
            </h2>
          </div>
          <a
            href={catalogHref}
            className="text-body-sm font-medium text-primary hover:underline"
          >
            Xem tất cả môn học →
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {featured.map((subject) => (
            <FeaturedSubjectCard
              key={subject.id}
              subject={subject}
              href={getSubjectHref(subject)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSubjectCard({
  subject,
  href,
}: {
  subject: SubjectCatalogItem;
  href: string;
}) {
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = Boolean(subject.coverImageUrl) && !coverFailed;

  return (
    <Card className="overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-elevated shadow-sm">
      <div className="relative aspect-[16/10] bg-secondary">
        {showCover ? (
          <img
            src={subject.coverImageUrl!}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary/40">
            <MaterialIcon name="menu_book" size={48} />
          </div>
        )}
      </div>
      <CardContent className="space-y-4 p-6">
        <span className="inline-flex rounded-md bg-secondary px-2.5 py-1 text-caption font-medium uppercase tracking-wide text-primary">
          {subject.courseName}
        </span>
        <div className="space-y-2">
          <h3 className="text-heading font-heading text-on-surface">{subject.name}</h3>
          {subject.description && (
            <p className="line-clamp-2 text-body-sm text-ink-muted">{subject.description}</p>
          )}
        </div>
        <Button asChild variant="outline" className="w-full rounded-lg border-primary text-primary">
          <InternalLink href={href}>Khám phá ngay</InternalLink>
        </Button>
      </CardContent>
    </Card>
  );
}
