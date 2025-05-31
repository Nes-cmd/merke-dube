import { 
  HomeOutlined, 
  ShoppingOutlined, 
  SettingOutlined, 
  DollarOutlined, 
  DatabaseOutlined,
  ShopOutlined,
  AppstoreOutlined,
  UserOutlined
} from '@ant-design/icons';

const navItems = [
  {
    key: 'dashboard',
    icon: <HomeOutlined />,
    label: t('Dashboard'),
    route: route('dashboard')
  },
  {
    key: 'products',
    icon: <ShoppingOutlined />,
    label: t('Products'),
    route: route('products.index')
  },
  {
    key: 'sales',
    icon: <DollarOutlined />,
    label: t('Sales'),
    route: route('sales.index')
  },
  {
    key: 'warehouses',
    icon: <DatabaseOutlined />,
    label: t('Warehouses'),
    route: route('warehouses.index')
  },
  {
    key: 'shops',
    icon: <ShopOutlined />,
    label: t('Shops'),
    route: route('shops.index')
  },
  {
    key: 'inventory',
    icon: <AppstoreOutlined />,
    label: t('Shop Inventory'),
    route: route('inventory.index')
  },
  {
    key: 'customers',
    icon: <UserOutlined />,
    label: t('Customers'),
    route: route('customers.index')
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: t('Settings'),
    route: route('settings.index')
  }
]; 