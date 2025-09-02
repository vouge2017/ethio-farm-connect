import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonLoaderProps {
  type: 'listing-card' | 'listing-detail' | 'message-list' | 'search-results';
  count?: number;
}

export const SkeletonLoader = ({ type, count = 6 }: SkeletonLoaderProps) => {
  const renderListingCard = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardHeader className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-7 flex-1" />
          <Skeleton className="h-7 w-8" />
        </div>
      </CardContent>
    </Card>
  );

  const renderListingDetail = () => (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );

  const renderMessageList = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSearchResults = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-8" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(count)].map((_, i) => (
          <div key={i}>
            {renderListingCard()}
          </div>
        ))}
      </div>
    </div>
  );

  switch (type) {
    case 'listing-card':
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(count)].map((_, i) => (
            <div key={i}>
              {renderListingCard()}
            </div>
          ))}
        </div>
      );
    case 'listing-detail':
      return renderListingDetail();
    case 'message-list':
      return renderMessageList();
    case 'search-results':
      return renderSearchResults();
    default:
      return null;
  }
};