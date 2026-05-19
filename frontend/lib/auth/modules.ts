import {
  Activity,
  Award,
  Briefcase,
  Calendar,
  FileCheck,
  FileText,
  FolderKanban,
  GraduationCap,
  Heart,
  HelpCircle,
  LayoutDashboard,
  Mail,
  Newspaper,
  Receipt,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ModuleAccess = "read" | "write" | "admin";

export type DashboardModule = {
  name: string;
  href: string;
  icon: LucideIcon;
  access: ModuleAccess;
  description: string;
};

export type DashboardModuleGroup = {
  category: string;
  items: DashboardModule[];
};

export const DASHBOARD_MODULES: DashboardModuleGroup[] = [
  {
    category: "Main",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        access: "read",
        description: "Overview, quick stats, and operational shortcuts.",
      },
      {
        name: "Member Management",
        href: "/members",
        icon: Users,
        access: "write",
        description: "Create, update, search, and manage member records.",
      },
      {
        name: "Beneficiary Management",
        href: "/beneficiaries",
        icon: Heart,
        access: "write",
        description: "Manage beneficiary profiles, support status, and case notes.",
      },
      {
        name: "Crowdfunding",
        href: "/crowdfunding",
        icon: TrendingUp,
        access: "write",
        description: "Track campaigns, targets, donation progress, and publish state.",
      },
      {
        name: "Internship Management",
        href: "/internships",
        icon: Briefcase,
        access: "write",
        description: "Manage internship openings, applications, and status updates.",
      },
    ],
  },
  {
    category: "Management",
    items: [
      {
        name: "Donation Management",
        href: "/donations",
        icon: Heart,
        access: "write",
        description: "Record donations, receipts, payment status, and donor details.",
      },
      {
        name: "Activity Posts",
        href: "/activities",
        icon: Activity,
        access: "write",
        description: "Publish and maintain activities shown across the platform.",
      },
      {
        name: "Event Management",
        href: "/dashboard/events",
        icon: Calendar,
        access: "write",
        description: "Manage events, registrations, reminders, and attendance.",
      },
      {
        name: "Designation Management",
        href: "/designations",
        icon: UserPlus,
        access: "admin",
        description: "Control designations and staff assignment metadata.",
      },
      {
        name: "Enquiry Management",
        href: "/enquiries",
        icon: Mail,
        access: "write",
        description: "Review, respond to, and resolve enquiries.",
      },
      {
        name: "News Management",
        href: "/news",
        icon: Newspaper,
        access: "write",
        description: "Prepare news content and publish updates.",
      },
      {
        name: "Project Management",
        href: "/projects",
        icon: FolderKanban,
        access: "write",
        description: "Manage project plans, funding, progress, and outcomes.",
      },
      {
        name: "Expense Management",
        href: "/expenses",
        icon: Receipt,
        access: "write",
        description: "Track project and operational expenses.",
      },
    ],
  },
  {
    category: "Documents",
    items: [
      {
        name: "Documents",
        href: "/documents",
        icon: FileText,
        access: "write",
        description: "Generate member IDs, receipts, letters, certificates, and audit files.",
      },
      {
        name: "Certificates",
        href: "/certificates",
        icon: Award,
        access: "write",
        description: "Issue and manage achievement certificates.",
      },
      {
        name: "Reports",
        href: "/reports",
        icon: FileCheck,
        access: "write",
        description: "Create, review, and export reports.",
      },
      {
        name: "Appointments",
        href: "/documents?type=appointment",
        icon: GraduationCap,
        access: "write",
        description: "Prepare appointment letters and related staff documents.",
      },
    ],
  },
  {
    category: "Administration",
    items: [
      {
        name: "CMS",
        href: "/cms",
        icon: ShieldCheck,
        access: "admin",
        description: "Open the Strapi CMS admin and manage content with admin access.",
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        access: "admin",
        description: "Configure users, roles, permissions, and platform settings.",
      },
      {
        name: "Help & Support",
        href: "/help",
        icon: HelpCircle,
        access: "read",
        description: "Find support resources and operational guidance.",
      },
    ],
  },
];

export const ALL_DASHBOARD_MODULES = DASHBOARD_MODULES.flatMap((group) => group.items);

export function findDashboardModule(title: string): DashboardModule | undefined {
  return ALL_DASHBOARD_MODULES.find((moduleItem) => moduleItem.name === title);
}
