import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Auto-retry for network errors
    if (this.isNetworkError(error) && this.state.retryCount < 3) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private isChunkLoadError = (error: Error): boolean => {
    const msg = error.message || '';
    return msg.includes('Failed to fetch dynamically imported module') ||
           msg.includes('Loading chunk') ||
           msg.includes('Loading CSS chunk') ||
           msg.includes('ChunkLoadError');
  };

  private isNetworkError = (error: Error): boolean => {
    const msg = error.message || '';
    return this.isChunkLoadError(error) ||
           msg.includes('Failed to fetch') ||
           msg.includes('NetworkError') ||
           msg.includes('fetch');
  };

  private scheduleRetry = () => {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
    
    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        retryCount: prevState.retryCount + 1,
        error: undefined,
        errorInfo: undefined
      }));
    }, delay);
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetworkError = this.state.error && this.isNetworkError(this.state.error);

      return (
        <div className="min-h-screen bg-jet-black flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-8 bg-charcoal-gray border-gray-700">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-goldenrod mx-auto mb-4" />
              
              <h1 className="text-2xl font-bold text-white mb-2">
                {isNetworkError ? 'Connection Issue' : 'Something went wrong'}
              </h1>
              
              <p className="text-gray-300 mb-6">
                {isNetworkError 
                  ? 'We\'re having trouble connecting to our servers. This usually resolves itself quickly.'
                  : 'The application encountered an unexpected error. Our team has been notified.'
                }
              </p>

              {isNetworkError && this.state.retryCount < 3 && (
                <div className="mb-4 p-3 bg-goldenrod/10 border border-goldenrod/20 rounded-lg">
                  <p className="text-sm text-goldenrod">
                    Auto-retry in progress... (Attempt {this.state.retryCount + 1}/3)
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full bg-goldenrod text-jet-black hover:bg-goldenrod/90"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-400 cursor-pointer mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-400 bg-gray-900 p-3 rounded overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}