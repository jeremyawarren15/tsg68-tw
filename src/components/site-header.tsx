import { siteConfig } from "@config/site"
import { MainNav } from "@components/main-nav"
import { ThemeToggle } from "@components/theme-toggle"

import { SignInButton } from "./signin-button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-red-500">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <SignInButton />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
