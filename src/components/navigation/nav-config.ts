import { BookOpen, LayoutDashboard, Target, User } from "lucide-react";

export const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    requiresAuth: true,
  },
  {
    icon: Target,
    label: "Diagnostic",
    href: "/diagnostic",
    requiresAuth: false,
  },
  {
    icon: BookOpen,
    label: "Practice",
    href: "/practice",
    requiresAuth: false,
  },
];

export const signedInOnlyNavItems = [
  {
    icon: User,
    label: "Profile",
    href: "/profile",
    requiresAuth: true,
  },
];
