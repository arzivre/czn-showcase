import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Link, LinkProps } from "@tanstack/react-router"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  className?: string,
  isActive?: boolean
} & LinkProps & React.RefAttributes<HTMLAnchorElement>

function PaginationLink({
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      preloadDelay={600}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
        }),
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("flex gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("flex gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

function getPageArray(currentPage = 1, totalPages = 10, maxVisible = 5) {
  if (totalPages <= 0) return [];
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  const sidePages = Math.floor((maxVisible - 3) / 2); // Reserve 3 for first/last/ellipsis

  // Always show first page
  pages.push(1);

  // Calculate the window around current page
  let start = Math.max(2, currentPage - sidePages);
  let end = Math.min(totalPages - 1, currentPage + sidePages);

  // Adjust if window is too close to edges
  if (currentPage <= sidePages + 2) {
    end = maxVisible - 1;
  } else if (currentPage >= totalPages - sidePages - 1) {
    start = totalPages - maxVisible + 2;
  }

  // Add left ellipsis if needed
  if (start > 2) pages.push('...');

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add right ellipsis if needed
  if (end < totalPages - 1) pages.push('...');

  // Always show last page
  pages.push(totalPages);

  return pages;
}

export {
  getPageArray,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
}

