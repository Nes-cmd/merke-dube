import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Layout, Button, Dropdown, Menu, Drawer } from 'antd';
import { useTranslation } from '@/Contexts/I18nContext';
import {
  MenuOutlined,
  HomeOutlined,
  AppstoreAddOutlined, 
  FileDoneOutlined, 
  ShopOutlined, 
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined,
  DashboardOutlined,
  BarcodeOutlined,
  TeamOutlined,
  TransactionOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

export default function AuthenticatedLayout({ user, header, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, locale, setLocale } = useTranslation();
  const { url } = usePage();

  const handleLanguageChange = () => {
    setLocale(locale === 'en' ? 'am' : 'en');
  };

  const isActive = (path) => {
    // For route paths that start with /, check if the URL starts with the path
    if (path.startsWith('/')) {
      return url.startsWith(path);
    }
    
    // For named routes, extract the path part
    const routePath = path.split('://')[1] || path;
    return url === routePath || url.startsWith(routePath);
  };

  // Main navigation items
  const mainNavItems = [
    { name: t('Dashboard'), path: '/dashboard', icon: <DashboardOutlined /> },
    { name: t('Products'), path: '/products', icon: <BarcodeOutlined /> },
    { name: t('Sales'), path: '/sales', icon: <FileDoneOutlined /> },
    { name: t('Settings'), path: '/settings', icon: <SettingOutlined /> },
  ];

  // Mobile navigation items (for bottom bar)
  const mobileNavItems = [
    { name: t('Dashboard'), path: '/dashboard', icon: <DashboardOutlined /> },
    { name: t('Products'), path: '/products', icon: <BarcodeOutlined /> },
    { name: t('Sales'), path: '/sales', icon: <FileDoneOutlined /> },
    { name: t('Settings'), path: '/settings', icon: <SettingOutlined /> },
  ];
  
  // Sidebar-only items
  const sidebarItems = [
    ...mainNavItems,
    { name: t('Warehouses'), path: '/warehouses', icon: <HomeOutlined /> },
    { name: t('Customers'), path: '/customers', icon: <TeamOutlined /> },
    { name: t('Inventory'), path: '/inventory', icon: <ShopOutlined /> },
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link href={route('profile.edit')}>
          {t('Profile')}
        </Link>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        <Link href={route('logout')} method="post" as="button" className="w-full text-left">
          {t('Logout')}
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="min-h-screen">
      {/* Desktop Header */}
      <Header className="fixed w-full z-10 px-0 shadow-md bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Logo and Desktop Menu */}
          <div className="flex items-center">
            <Link href={route('dashboard')} className="text-2xl font-bold text-primary-600 mr-8">
              Suqee
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6">
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <Button
              icon={<GlobalOutlined />}
              onClick={handleLanguageChange}
              className="hidden sm:flex items-center"
              type="text"
            >
              {locale === 'en' ? 'አማርኛ' : 'English'}
            </Button>

            {/* User Menu (Desktop) */}
            <Dropdown overlay={userMenu} placement="bottomRight" arrow>
              <Button
                type="text"
                className="hidden sm:flex items-center text-gray-700"
                icon={<UserOutlined className="mr-1" />}
              >
                {user?.name}
              </Button>
            </Dropdown>

            {/* Mobile Menu Button */}
            <Button
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden"
            />
          </div>
        </div>
        
        {/* Mobile Drawer */}
        <Drawer
          title={
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary-600">Suqee</span>
              <Button icon={<GlobalOutlined />} onClick={handleLanguageChange}>
                {locale === 'en' ? 'አማርኛ' : 'English'}
              </Button>
            </div>
          }
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
        >
          <Menu mode="vertical">
            {sidebarItems.map((item) => (
              <Menu.Item key={item.name} icon={item.icon}>
                <Link
                  href={item.path}
                  className={isActive(item.path) ? 'text-primary-600 font-semibold' : ''}
                >
                  {item.name}
                </Link>
              </Menu.Item>
            ))}
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
              <Link href={route('logout')} method="post" as="button" className="w-full text-left">
                {t('Logout')}
              </Link>
            </Menu.Item>
          </Menu>
        </Drawer>
      </Header>

      {/* Main Content */}
      <Content className="pt-16 lg:pb-0 bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </Content>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 z-10 w-full bg-primary-100 shadow-lg">
        <ul className="flex justify-around">
          {mobileNavItems.map((item) => (
            <li key={item.name} className="flex-1">
              <Link
                href={item.path}
                className={`flex flex-col items-center justify-center font-bold text-2xl py-4 ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-600 hover:bg-primary-200'
                }`}
              >
                {item.icon}
                <span className="text-xs">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Layout>
  );
}
