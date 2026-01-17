import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { FaXTwitter, FaGithub } from "react-icons/fa6";

const navigation = {
  main: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/tos" },
  ],
  social: [
    {
      name: "GitHub",
      href: "https://github.com/backpine/saas-kit",
      icon: FaGithub,
    },
    {
      name: "X",
      href: "https://x.com/backpinelabs",
      icon: FaXTwitter,
    },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-6 md:space-y-0">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              TanStack Ecosystem
            </h3>
            <ul role="list" className="mt-2 space-y-1">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center group"
                  >
                    {item.name}
                    <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-0 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* <div className="flex space-x-6">
            {navigation.social.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <IconComponent className="h-5 w-5" />
                </a>
              );
            })}
          </div> */}

          <div className="text-center md:text-right">
            <p className="text-xs text-muted-foreground">
              This is an fan site. Assets & trademarks belong to their owners.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              &copy; {2026} czn-showcase.online
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
