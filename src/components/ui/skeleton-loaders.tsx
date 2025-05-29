
import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

/**
 * Pre-built skeleton components for common UI patterns
 */

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-3 p-4 border rounded-lg", className)}>
    <div className="flex items-center space-x-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-20 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export const PractitionerCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("p-6 border rounded-lg space-y-4", className)}>
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
    <Skeleton className="h-16 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-8 w-28" />
    </div>
  </div>
);

export const HealthPlanCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("p-6 border rounded-lg space-y-4", className)}>
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <Skeleton className="h-20 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-9 w-32" />
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ 
  items?: number;
  className?: string;
}> = ({ items = 3, className }) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 border rounded">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn("space-y-3", className)}>
    {/* Header */}
    <div className="flex space-x-4 p-3 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4 p-3">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const FormSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="flex space-x-3">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);
