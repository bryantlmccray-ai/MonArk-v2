import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MonArkLogo } from "@/components/MonArkLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <MonArkLogo size="md" className="mb-12" />
      <h1 className="text-5xl font-editorial-headline text-foreground mb-4">404</h1>
      <p className="text-lg text-muted-foreground font-body mb-8">
        This page doesn't exist.
      </p>
      <a
        href="/"
        className="editorial-button editorial-button-primary px-8 py-3 text-sm tracking-wide font-body rounded-xl"
      >
        Return Home
      </a>
    </div>
  );
};

export default NotFound;
