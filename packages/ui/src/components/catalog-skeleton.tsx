import { cn } from "../lib/utils";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export interface CatalogSkeletonProps {
  count?: number;
  className?: string;
}

export function CatalogSkeleton({ count = 2, className }: CatalogSkeletonProps) {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2", className)}
      data-component="catalog-skeleton"
      aria-busy="true"
      aria-label="Đang tải danh mục môn học"
    >
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="border-outline-variant bg-surface-container-lowest shadow-sm">
          <CardContent className="p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-3 h-4 w-1/2" />
            <Skeleton className="mt-4 h-6 w-1/3 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
