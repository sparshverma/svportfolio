import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [, key, name] = selector.match(/\[(.+?)="(.+?)"\]/) || [];
    if (key && name) el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    const prevTitle = document.title;
    document.title = "Page Not Found | Sparsh Verma";
    setMeta('meta[name="description"]', "content", "The page you're looking for doesn't exist. Return to Sparsh Verma's portfolio home.");
    setMeta('meta[property="og:title"]', "content", "Page Not Found | Sparsh Verma");
    setMeta('meta[property="og:description"]', "content", "The page you're looking for doesn't exist on Sparsh Verma's portfolio.");
    setCanonical(`https://svportfolio.lovable.app${location.pathname}`);

    return () => {
      document.title = prevTitle;
    };
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404 — Page Not Found</h1>
        <p className="mb-4 text-xl text-muted-foreground">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </main>
  );
};

export default NotFound;
