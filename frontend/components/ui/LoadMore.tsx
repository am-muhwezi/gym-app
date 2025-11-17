import React from 'react';
import Button from './Button';

interface LoadMoreProps {
  currentCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onLoadMore: () => void;
  loading?: boolean;
  itemName?: string; // e.g., "clients", "bookings", "payments"
}

const LoadMore: React.FC<LoadMoreProps> = ({
  currentCount,
  totalCount,
  currentPage,
  totalPages,
  onLoadMore,
  loading = false,
  itemName = 'items'
}) => {
  const hasMore = currentPage < totalPages;

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col items-center space-y-4">
      {/* Pagination Info */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Showing <span className="text-white font-semibold">{currentCount}</span> of{' '}
          <span className="text-white font-semibold">{totalCount}</span> {itemName}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <Button
          onClick={onLoadMore}
          disabled={loading}
          variant="secondary"
          className="min-w-[200px]"
        >
          {loading ? 'Loading...' : 'Load More'}
        </Button>
      )}

      {/* All Loaded Message */}
      {!hasMore && totalCount > 0 && (
        <p className="text-gray-500 text-sm">
          All {itemName} loaded
        </p>
      )}
    </div>
  );
};

export default LoadMore;
