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
   
    return url.startsWith(path);
  };

  const navItems = [
    { name: t('Dashboard'), path: route('dashboard'), icon: <DashboardOutlined /> },
    { name: t('Products'), path: '/products', icon: <BarcodeOutlined /> },
    { name: t('Sales'), path: '/sales', icon: <FileDoneOutlined /> },
    { name: t('Warehouses'), path: route('warehouses.index'), icon: <HomeOutlined /> },
    { name: t('Customers'), path: '/customers', icon: <TeamOutlined /> },
    { name: t('Inventory'), path: '/inventory', icon: <ShopOutlined /> },
    { name: t('Settings'), path: route('settings.index'), icon: <SettingOutlined /> },
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link href={route('profile.edit')} method="get">
          {t('Profile')}
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        <Link href={route('logout')} method="post" as="button" className="w-full text-left">
          {t('Logout')}
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="min-h-screen">
      {/* Top Header for Desktop */}
      <Header className="hidden lg:flex z-10 justify-between items-center bg-white shadow-md px-6 h-16 fixed w-full top-0">
        <div className="flex items-center">
          <Link href={route('dashboard')} className="text-xl font-bold text-primary-500 no-underline mr-8">
            Suqee
          </Link>
          
          <nav>
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-md ${
                      isActive(item.path)
                        ? 'bg-primary-600 text-white'
                        : 'text-primary-600 hover:bg-primary-200'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            icon={<GlobalOutlined />}
            onClick={handleLanguageChange} 
            className="border border-primary-500 text-primary-500 hover:bg-primary-50"
            size="middle"
          >
            {locale === 'en' ? 'አማርኛ' : 'English'}
          </Button>
          
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <div className="flex items-center space-x-2 cursor-pointer">
              <span className="text-gray-700">{user?.name}</span>
              <UserOutlined className="text-lg text-primary-500" />
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* Mobile Header */}
      <Header className="lg:hidden flex justify-between items-center bg-white shadow-md px-4 h-16 fixed w-full top-0 z-10">
        <Link href={route('dashboard')} className="text-xl font-bold text-primary-500 no-underline">
          Suqee
        </Link>
        
        <div className="flex items-center space-x-2">
          <Button 
            icon={<GlobalOutlined />}
            onClick={handleLanguageChange} 
            type="text"
            size="middle"
            className="text-primary-500"
          />
          
          <Button 
            icon={<MenuOutlined />} 
            onClick={() => setMobileMenuOpen(true)} 
            type="text" 
            size="large"
            className="text-primary-500"
          />
        </div>
        
        <Drawer
          title={user?.name}
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
        >
          <Menu mode="vertical" className="border-r-0">
            {navItems.map((item) => (
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
        </Drawer>
      </Header>

      {/* Main Content */}
      <Content className="pt-16 lg:pb-0 bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </Content>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 z-10 w-full bg-primary-100 shadow-lg">
        <ul className="flex justify-around">
          {navItems.map((item) => (
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
