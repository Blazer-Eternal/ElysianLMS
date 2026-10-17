import type { IconName } from "@/components/ui/icon";
import type { Role } from "@/types/auth";

/**
 * Single source of truth for the authenticated navigation.
 * Sections carry a role gate; NavList filters them per signed-in user.
 * Public-site links live in (public)/navbar.tsx and stay few on purpose.
 */

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

export interface NavSection {
  /** `undefined` = every signed-in user. */
  roles?: Role[];
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Learn",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "chart" },
      { label: "My learning", href: "/my-learning", icon: "cap" },
      { label: "Orders", href: "/orders", icon: "bag" },
    ],
  },
  {
    label: "Teaching",
    roles: ["teacher", "admin"],
    items: [{ label: "Workspace", href: "/teaching", icon: "book" }],
  },
  {
    label: "Admin",
    roles: ["admin"],
    items: [
      { label: "Users", href: "/admin/users", icon: "users" },
      { label: "Orders", href: "/admin/orders", icon: "inbox" },
      { label: "Categories", href: "/admin/categories", icon: "layers" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/profile", icon: "user" },
      { label: "Settings", href: "/settings", icon: "sliders" },
    ],
  },
];
