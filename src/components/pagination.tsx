"use client";

import type { TPaginationResponse } from "@/types/api";

import { useQueryParams } from "@/hooks/custom/use-query-params";
import { cn } from "@/lib/utils";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as ShadcnPagination,
} from "@/components/ui/pagination";

type PaginationProps = {
  pageParamKey?: string;
  isLoading?: boolean;
  pagination: TPaginationResponse | undefined;
  className?: string;
  onChange?: (page: number) => void;
};

export const Pagination = ({
  pageParamKey = "page",
  isLoading = false,
  pagination,
  className,
  onChange,
}: PaginationProps) => {
  const { updateParam } = useQueryParams();

  const handlePaginationChange = (page: number) => {
    if (onChange) {
      onChange(page);
    } else {
      updateParam(pageParamKey, page.toString());
    }
  };

  if (isLoading || !pagination) {
    return null;
  }

  const { page, total_pages } = pagination;

  if (total_pages <= 1) {
    return null;
  }

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (total_pages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= total_pages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              className="cursor-pointer"
              isActive={i === page}
              onClick={() => handlePaginationChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            className="cursor-pointer"
            isActive={1 === page}
            onClick={() => handlePaginationChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (page > 3) {
        pages.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(total_pages - 1, page + 1);
        i++
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              className="cursor-pointer"
              isActive={i === page}
              onClick={() => handlePaginationChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < total_pages - 2) {
        pages.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      pages.push(
        <PaginationItem key={total_pages}>
          <PaginationLink
            className="cursor-pointer"
            isActive={total_pages === page}
            onClick={() => handlePaginationChange(total_pages)}
          >
            {total_pages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <ShadcnPagination className={cn("mt-4", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={
              page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
            onClick={() => handlePaginationChange(page - 1)}
          />
        </PaginationItem>

        {renderPageNumbers()}

        <PaginationItem>
          <PaginationNext
            className={
              page >= total_pages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            onClick={() => handlePaginationChange(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
};
