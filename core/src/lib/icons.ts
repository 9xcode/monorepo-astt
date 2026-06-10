/**
 * Shared Icon Registry
 * Central source of truth for all Lucide icons used across the project.
 * Import `iconMap` or individual icons from this file instead of duplicating imports.
 */
import {
  Calculator,
  Type,
  Banknote,
  ChartPie,
  TrendingUp,
  FileText,
  Car,
  GraduationCap,
  House,
  Umbrella,
  TrendingDown,
  ChartColumn,
  Table,
  Receipt,
  Armchair,
  Percent,
  CreditCard,
  History,
  Landmark,
  ArrowRight,
  ArrowRightLeft,
  Wrench,
  Code,
  BookOpen,
  QrCode,
  Camera,
  Link,
  Wifi,
  Contact,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Bitcoin,
} from '@lucide/svelte';

/** Map of icon string names (from content frontmatter) to Lucide components */
export const iconMap: Record<string, any> = {
  Calculator,
  Type,
  Banknote,
  ChartPie,
  PieChart: ChartPie,
  TrendingUp,
  FileText,
  Car,
  GraduationCap,
  House,
  Home: House,
  Umbrella,
  TrendingDown,
  ChartColumn,
  BarChart3: ChartColumn,
  Table,
  Receipt,
  Armchair,
  Percent,
  CreditCard,
  History,
  Landmark,
  Wrench,
  QrCode,
  Camera,
  Link,
  Wifi,
  Contact,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  Bitcoin,
};

/** Map of icon string names used in mobile navigation config */
export const navIconMap: Record<string, any> = {
  House,
  Wrench,
  Calculator,
  ArrowRightLeft,
  Percent,
  Type,
  Code,
  BookOpen,
};

// Re-export commonly used icons for direct usage in templates
export {
  Calculator,
  ArrowRight,
  Wrench,
};
