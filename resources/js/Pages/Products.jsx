import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
  Table, 
  Button, 
  message, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Space, 
  Tooltip, 
  Tag, 
  Image, 
  Select,
  Popconfirm,
  Dropdown,
  Menu,
  Badge,
  Avatar,
  Tabs,
  Card,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  PlusCircleOutlined,
  MoreOutlined,
  ReloadOutlined,
  FileImageOutlined,
  PictureOutlined,
  HomeOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Text } = Typography;

const Products = ({ auth, products, warehouses }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const [isRefillModalVisible, setIsRefillModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeWarehouse, setActiveWarehouse] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  // Track window size for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Determine if we're on a small screen
  const isSmallScreen = windowWidth < 768;
  
  const [refillForm] = Form.useForm();
  
  // Format products to include image URLs
  const formattedProducts = products.map(product => {
    const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
    return {
      ...product,
      key: product.id,
      primaryImageUrl: primaryImage ? `/storage/${primaryImage.image_path}` : null,
      statusText: getStatusText(product.status),
      statusColor: getStatusColor(product.status),
      warehouseName: product.store?.name || t('No Warehouse')
    };
  });
  
  // Filter products when activeWarehouse changes
  useEffect(() => {
    if (activeWarehouse === 'all') {
      setFilteredProducts(formattedProducts);
    } else {
      setFilteredProducts(formattedProducts.filter(product => 
        product.store_id === parseInt(activeWarehouse)
      ));
    }
  }, [activeWarehouse, formattedProducts]);
  
  // Handle warehouse tab change
  const handleWarehouseChange = (warehouseId) => {
    setActiveWarehouse(warehouseId);
  };
  
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`${t('Search')} ${t(dataIndex)}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            {t('Search')}
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            {t('Reset')}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <span style={{ fontWeight: 'bold' }}>{text}</span>
      ) : (
        text
      ),
  });
  
  function getStatusText(status) {
    switch(status) {
      case 1: return t('Pending');
      case 2: return t('Completed');
      case 3: return t('Cancelled');
      default: return t('Unknown');
    }
  }
  
  function getStatusColor(status) {
    switch(status) {
      case 1: return 'orange';
      case 2: return 'green';
      case 3: return 'red';
      default: return 'default';
    }
  }
  
  const showRefillModal = (product) => {
    setSelectedProduct(product);
    setIsRefillModalVisible(true);
    refillForm.resetFields();
  };
  
  const handleRefillSubmit = () => {
    refillForm.validateFields().then(values => {
      // Submit the form
      axios.post(route('products.store-refill', selectedProduct.id), values)
        .then(response => {
          message.success(t('Product refilled successfully'));
          setIsRefillModalVisible(false);
          // Reload the page to get updated data
          window.location.reload();
        })
        .catch(error => {
          console.error('Refill error:', error);
          message.error(t('Failed to refill product'));
        });
    });
  };
  
  const columns = [
    {
      title: '',
      dataIndex: 'primaryImageUrl',
      key: 'image',
      width: 80,
      render: (imageUrl, record) => (
        imageUrl ? 
          <Avatar 
            shape="square" 
            size={64} 
            src={<Image src={imageUrl} alt={record.name} preview={false} />} 
          /> : 
          <Avatar shape="square" size={64} icon={<FileImageOutlined />} />
      ),
    },
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (text, record) => (
        <Link href={route('products.show', record.id)}>
          <Text strong className="text-primary-600 hover:text-primary-800 cursor-pointer">
            {text}
          </Text>
        </Link>
      ),
    },
    {
      title: t('SKU'),
      dataIndex: 'sku',
      key: 'sku',
      ...getColumnSearchProps('sku'),
    },
    {
      title: t('Warehouse'),
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      filters: warehouses?.map(warehouse => ({ text: warehouse.name, value: warehouse.name })) || [],
      onFilter: (value, record) => record.warehouseName === value,
    },
    {
      title: t('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (qty) => (
        <Badge 
          count={qty} 
          showZero 
          overflowCount={9999}
          style={{ 
            backgroundColor: qty <= 0 ? '#f5222d' : qty <= 5 ? '#faad14' : '#52c41a',
            fontSize: '14px',
            padding: '0 8px'
          }}
        />
      ),
    },
    {
      title: t('Unit Price'),
      dataIndex: 'unit_price',
      key: 'unit_price',
      sorter: (a, b) => {
        const priceA = parseFloat(a.unit_price) || 0;
        const priceB = parseFloat(b.unit_price) || 0;
        return priceA - priceB;
      },
      render: (price) => {
        // Ensure price is a number and handle null/undefined values
        const numericPrice = parseFloat(price) || 0;
        return `ETB ${numericPrice.toFixed(2)}`;
      },
    },
    {
      title: t('Status'),
      dataIndex: 'statusText',
      key: 'status',
      filters: [
        { text: t('Pending'), value: t('Pending') },
        { text: t('Completed'), value: t('Completed') },
        { text: t('Cancelled'), value: t('Cancelled') },
      ],
      onFilter: (value, record) => record.statusText === value,
      render: (text, record) => (
        <Tag color={record.statusColor}>{text}</Tag>
      ),
    },
    {
      title: t('Actions'),
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        // If on small screen, show reduced actions
        if (isSmallScreen) {
          return (
            <Space size="small">
              <Tooltip title={t('Refill')}>
                <Button 
                  type="default" 
                  icon={<ReloadOutlined />} 
                  size="small" 
                  onClick={() => showRefillModal(record)} 
                />
              </Tooltip>
              
              <Dropdown 
                menu={{
                  items: [
                    {
                      key: '1',
                      label: (
                        <Link href={route('products.refill', record.id)}>
                          {t('Advanced Refill')}
                        </Link>
                      ),
                      icon: <PlusCircleOutlined />
                    },
                    {
                      key: '2',
                      label: (
                        <Link href={route('products.edit', record.id)}>
                          {t('Edit Details')}
                        </Link>
                      ),
                      icon: <EditOutlined />
                    }
                  ]
                }}
                trigger={['click']}
              >
                <Button icon={<MoreOutlined />} size="small" />
              </Dropdown>
            </Space>
          );
        } else {
          // On larger screens, show all actions
          return (
            <Space size="small">
              <Tooltip title={t('View Details')}>
                <Link href={route('products.show', record.id)}>
                  <Button type="primary" ghost icon={<EyeOutlined />} size="small" />
                </Link>
              </Tooltip>
              
              <Tooltip title={t('Edit')}>
                <Link href={route('products.edit', record.id)}>
                  <Button icon={<EditOutlined />} size="small" />
                </Link>
              </Tooltip>
              
              <Tooltip title={t('Refill')}>
                <Button 
                  type="default" 
                  icon={<ReloadOutlined />} 
                  size="small" 
                  onClick={() => showRefillModal(record)} 
                />
              </Tooltip>
              
              <Dropdown 
                menu={{
                  items: [
                    {
                      key: '1',
                      label: (
                        <Link href={route('products.refill', record.id)}>
                          {t('Advanced Refill')}
                        </Link>
                      ),
                      icon: <PlusCircleOutlined />
                    },
                    {
                      key: '2',
                      label: (
                        <Link href={route('products.edit', record.id)}>
                          {t('Edit Details')}
                        </Link>
                      ),
                      icon: <EditOutlined />
                    }
                  ]
                }}
                trigger={['click']}
              >
                <Button icon={<MoreOutlined />} size="small" />
              </Dropdown>
            </Space>
          );
        }
      },
    },
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Products')}</h2>}
    >
      <Head title={t('Products')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold">{t('Products')}</h1>
              <Link href={route('products.create')}>
                <Button type="primary" icon={<PlusOutlined />}>{t('Product')}</Button>
              </Link>
            </div>
            
            {/* Warehouse Tabs */}
            <div className="mb-6 overflow-auto">
              <Tabs 
                activeKey={activeWarehouse} 
                onChange={handleWarehouseChange}
                type="card"
                tabPosition="top"
                className="warehouse-tabs"
                tabBarGutter={8}
              >
                <TabPane 
                  tab={
                    <span>
                      <AppstoreOutlined />
                      {t('All Warehouses')}
                    </span>
                  } 
                  key="all"
                />
                
                {warehouses?.map(warehouse => (
                  <TabPane 
                    tab={
                      <span>
                        <HomeOutlined />
                        {warehouse.name}
                      </span>
                    } 
                    key={warehouse.id} 
                  />
                ))}
              </Tabs>
            </div>

            <Table 
              dataSource={filteredProducts} 
              columns={columns} 
              rowKey="id" 
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50']
              }}
              scroll={{ x: 1200 }} // Enable horizontal scrolling
              onRow={(record) => ({
                onClick: () => {
                  if (isSmallScreen) {
                    window.location.href = route('products.show', record.id);
                  }
                },
                style: { cursor: isSmallScreen ? 'pointer' : 'default' }
              })}
            />
          </div>
        </div>
      </div>
      
      {/* Quick Refill Modal */}
      <Modal
        title={t('Refill Product')}
        open={isRefillModalVisible}
        onCancel={() => setIsRefillModalVisible(false)}
        onOk={handleRefillSubmit}
        okText={t('Refill')}
        cancelText={t('Cancel')}
      >
        <Form form={refillForm} layout="vertical">
          <Form.Item
            name="quantity"
            label={t('Quantity to Add')}
            rules={[{ required: true, message: t('Please enter quantity') }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }} 
              placeholder={t('Enter quantity')} 
            />
          </Form.Item>
          
          <Form.Item
            name="unit_price"
            label={t('Unit Price')}
            rules={[{ required: true, message: t('Please enter unit price') }]}
            initialValue={selectedProduct?.unit_price}
          >
            <InputNumber 
              min={0}
              step={0.01}
              style={{ width: '100%' }} 
              placeholder={t('Enter unit price')}
              formatter={value => `ETB ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/ETB\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item
            name="note"
            label={t('Note')}
          >
            <Input.TextArea 
              rows={3}
              placeholder={t('Enter any notes about this refill')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AuthenticatedLayout>
  );
};

export default Products;
