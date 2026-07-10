"use client";

import * as React from "react";

export type InternalLinkComponentProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export type InternalLinkComponent = React.ComponentType<InternalLinkComponentProps>;

const InternalLinkContext = React.createContext<InternalLinkComponent | null>(null);

export function InternalLinkProvider({
  linkComponent,
  children,
}: {
  linkComponent: InternalLinkComponent;
  children: React.ReactNode;
}) {
  return (
    <InternalLinkContext.Provider value={linkComponent}>{children}</InternalLinkContext.Provider>
  );
}

function isNativeAnchorHref(href: string): boolean {
  return (
    href.startsWith("#") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export interface InternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  linkComponent?: InternalLinkComponent;
}

export function InternalLink({
  href,
  linkComponent: linkComponentProp,
  children,
  ...props
}: InternalLinkProps) {
  const linkComponentFromContext = React.useContext(InternalLinkContext);
  const LinkComponent = linkComponentProp ?? linkComponentFromContext;

  if (isNativeAnchorHref(href) || !LinkComponent) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <LinkComponent href={href} {...props}>
      {children}
    </LinkComponent>
  );
}
