 import React from 'react';
 import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 
 interface ApiErrorFallbackProps {
   /** Error message to display (will be sanitized) */
   error?: Error | string | null;
   /** Callback to retry the failed operation */
   onRetry?: () => void;
   /** Whether a retry is in progress */
   isRetrying?: boolean;
   /** Custom title for the error */
   title?: string;
   /** Custom description for the error */
   description?: string;
   /** Variant: 'card' (default) or 'inline' */
   variant?: 'card' | 'inline';
   /** Additional CSS classes */
   className?: string;
 }
 
 /**
  * ApiErrorFallback - User-friendly error display for API failures
  * 
  * Features:
  * - Never shows raw error messages to users
  * - Provides helpful suggestions
  * - Includes retry functionality
  * - Detects network vs server errors
  */
 export const ApiErrorFallback: React.FC<ApiErrorFallbackProps> = ({
   error,
   onRetry,
   isRetrying = false,
   title,
   description,
   variant = 'card',
   className = '',
 }) => {
   // Determine error type for user-friendly messaging
   const isNetworkError = error instanceof Error && (
     error.message.includes('network') ||
     error.message.includes('fetch') ||
     error.message.includes('Failed to fetch') ||
     error.message.includes('NetworkError')
   );
 
   const defaultTitle = isNetworkError 
     ? 'Connection Issue' 
     : 'Something Went Wrong';
     
   const defaultDescription = isNetworkError
     ? 'Please check your internet connection and try again.'
     : 'We encountered an issue. Please try again in a moment.';
 
   const Icon = isNetworkError ? WifiOff : AlertCircle;
 
   const content = (
     <div className="flex flex-col items-center text-center py-6 px-4">
       <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
         <Icon className="w-6 h-6 text-destructive" />
       </div>
       
       <h3 className="font-semibold text-foreground mb-2">
         {title || defaultTitle}
       </h3>
       
       <p className="text-sm text-muted-foreground mb-4 max-w-xs">
         {description || defaultDescription}
       </p>
       
       {onRetry && (
         <Button
           variant="outline"
           size="sm"
           onClick={onRetry}
           disabled={isRetrying}
           className="gap-2"
         >
           <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
           {isRetrying ? 'Retrying...' : 'Try Again'}
         </Button>
       )}
     </div>
   );
 
   if (variant === 'inline') {
     return <div className={className}>{content}</div>;
   }
 
   return (
     <Card className={`border-destructive/20 bg-card/50 ${className}`}>
       <CardContent className="p-0">
         {content}
       </CardContent>
     </Card>
   );
 };
 
 export default ApiErrorFallback;