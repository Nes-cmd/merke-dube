// src/components/Navigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeOutlined, AppstoreAddOutlined, FileDoneOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { t } = useTranslation();

  const navItems = [
    { name: t('Home'), path: '/home', icon: <HomeOutlined /> },
    { name: t('Products'), path: '/products', icon: <AppstoreAddOutlined /> },
    { name: t('Sales'), path: '/sales', icon: <FileDoneOutlined /> },
    { name: t('Stores'), path: '/stores', icon: <ShopOutlined /> },
    { name: t('Profile'), path: '/profile', icon: <UserOutlined /> },
  ];

  return (
    <div>
      {/* Navigation for large screens */}
      <div className="hidden lg:flex fixed z-20 top-0 justify-center w-full py-4 bg-primary-100 shadow-lg">
        <nav className="">
          <ul className="flex space-x-10">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-6 py-2 rounded-md ${isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-primary-600 hover:bg-primary-200'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Navigation for mobile screens */}
      <nav className="lg:hidden fixed bottom-0 z-20 w-full bg-primary-100 shadow-lg">
        <ul className="flex justify-around">
          {navItems.map((item) => (
            <li key={item.name} className="flex-1"> {/* Flex-grow to distribute space evenly */}
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center font-bold text-2xl py-4 ${isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-600 hover:bg-primary-200'
                  }`
                }
              >
                {item.icon}
                <span className="text-xs">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  );
};

export default Navigation;
