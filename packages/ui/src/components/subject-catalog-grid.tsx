import type { SubjectCatalogItem } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { SubjectCard } from "./subject-card";

const SUBJECT_ICONS = ["gavel", "query_stats", "account_balance", "trending_up"] as const;

export interface SubjectCatalogGridProps {
  subjects: SubjectCatalogItem[];
  featuredCount?: number;
  userName?: string;
  variant?: "web" | "zalo";
  getSubjectHref?: (subject: SubjectCatalogItem) => string;
  onSubjectClick?: (subject: SubjectCatalogItem) => void;
  freeTierUsedBySubjectId?: Record<string, number>;
  /** Total catalog count across all pages (when paginated). Defaults to subjects.length. */
  totalCount?: number;
  className?: string;
}

export function SubjectCatalogGrid({
  subjects,
  featuredCount = 2,
  userName,
  variant = "web",
  getSubjectHref,
  onSubjectClick,
  freeTierUsedBySubjectId = {},
  totalCount,
  className,
}: SubjectCatalogGridProps) {
  if (subjects.length === 0) {
    return (
      <p className="text-sm text-ink-muted" data-component="subject-catalog-empty">
        Chưa có môn học nào.
      </p>
    );
  }

  const courseGroups = subjects.reduce<Array<{ courseId: string; courseName: string; subjects: SubjectCatalogItem[] }>>(
    (groups, subject) => {
      const group = groups.find((item) => item.courseId === subject.courseId);
      if (group) {
        group.subjects.push(subject);
      } else {
        groups.push({
          courseId: subject.courseId,
          courseName: subject.courseName,
          subjects: [subject],
        });
      }
      return groups;
    },
    [],
  );

  let subjectIndex = 0;
  let featuredUsed = 0;

  return (
    <div className={cn("space-y-8", className)} data-component="subject-catalog-grid">
      {variant === "web" && userName && (
        <section>
          <h1 className="text-display-lg text-primary">Chào mừng, {userName}</h1>
          <p className="mt-2 text-body text-ink-muted">Hôm nay bạn muốn luyện tập phần kiến thức nào?</p>
        </section>
      )}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-heading font-heading text-on-surface">Danh mục môn học</h2>
          <span className="text-caption text-ink-muted">
            {(totalCount ?? subjects.length).toLocaleString("vi-VN")} môn học khả dụng
          </span>
        </div>
        <div className="space-y-8">
          {courseGroups.map((group) => (
            <div key={group.courseId}>
              <h3 className="mb-3 text-title font-heading text-on-surface">{group.courseName}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                {group.subjects.map((subject) => {
                  const index = subjectIndex++;
                  const featured =
                    subject.isHot && (featuredCount <= 0 || featuredUsed < featuredCount);
                  if (featured) featuredUsed += 1;
                  return (
                    <SubjectCard
                      key={subject.id}
                      title={subject.name}
                      description={subject.description}
                      priceVnd={subject.monthlyPriceVnd}
                      freeTierUsed={freeTierUsedBySubjectId[subject.id] ?? 0}
                      freeTierLimit={subject.freeTierLimit}
                      featured={featured}
                      variant={variant}
                      icon={SUBJECT_ICONS[index % SUBJECT_ICONS.length]}
                      href={getSubjectHref?.(subject)}
                      onCardClick={onSubjectClick ? () => onSubjectClick(subject) : undefined}
                      onActionClick={onSubjectClick ? () => onSubjectClick(subject) : undefined}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
