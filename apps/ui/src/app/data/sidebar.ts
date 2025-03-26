export interface SidebarItem {
  title: string;
  path: string;
  icon: string;
  badge?: {
    text: string;
    bgClass: string;
    textClass: string;
  };
}

export const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'home',
  },
  {
    title: 'Companies',
    path: '/companies',
    icon: 'dashboard',
  },
  {
    title: 'Users',
    path: '/users',
    icon: 'people',
  },
];
