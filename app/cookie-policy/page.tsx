// app/cookie-policy/page.tsx
export default function CookiePolicy() {
    return (
        <div className="mx-4 md:mx-16 mt-28">
        <h1 className="text-2xl font-medium mb-4 text-center">Cookies Policy</h1>
        <p className="mb-3">
          At Noir, we use cookies to give you the best possible experience on our site.  
          Cookies help us:
        </p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
          <li>Remember your preferences (theme, language)</li>
          <li>Keep you logged in and secure</li>
          <li>Analyze site traffic for improvements</li>
        </ul>
        <p className="mb-3">
          You can opt out or delete cookies any time via your browser settings.  
          Turning cookies off may affect site functionality.
        </p>
        <p>
          For details, check your browser’s cookie settings or{" "}
          <a
            href="https://www.allaboutcookies.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            learn more
          </a>.
        </p>
      </div>
    );
  }
  