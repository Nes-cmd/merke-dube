import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
  Table, 
  Button, 
  Space, 
  Tooltip, 
  Tag, 
  Input, 
  Select,
  Badge,
  Avatar,
  Card,
  Tabs,
  Image,
  Typography,
  Modal,
  Form,
  InputNumber,
  message
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined,
  FileImageOutlined,
  ShopOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/Contexts/I18nContext';
import axios from 'axios';

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

const Inventory = ({ auth, inventory, shops }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [activeShop, setActiveShop] = useState('all');
  const searchInput = useRef(null);
  const [isRefillModalVisible, setIsRefillModalVisible] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [refillForm] = Form.useForm();
  const [processing, setProcessing] = useState(false);
  
  // Filter inventory based on active shop
  const filteredInventory = activeShop === 'all' 
    ? inventory 
    : inventory.filter(item => item.shop_id === parseInt(activeShop));
  
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };
  
  // Show refill modal
  const showRefillModal = (inventory) => {
    setSelectedInventory(inventory);
    refillForm.setFieldsValue({
      quantity: 1,
      max_available: inventory.item.quantity
    });
    setIsRefillModalVisible(true);
  };
  
  // Handle refill submit
  const handleRefillSubmit = async () => {
    try {
      setProcessing(true);
      const values = await refillForm.validateFields();
      
      if (values.quantity > selectedInventory.item.quantity) {
        message.error(t('Cannot refill more than available warehouse quantity'));
        setProcessing(false);
        return;
      }
      
      // Submit refill request
      const response = await axios.post(route('inventory.refill', selectedInventory.id), {
        quantity: values.quantity
      });
      
      message.success(t('Inventory refilled successfully'));
      setIsRefillModalVisible(false);
      
      // Reload the page to show updated inventory
      window.location.reload();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || t('Failed to refill inventory'));
      } else if (error.errorFields) {
        // Form validation errors
        message.error(t('Please check the form fields'));
      } else {
        message.error(t('An error occurred'));
      }
    } finally {
      setProcessing(false);
    }
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
  
  const columns = [
    {
      title: t('Image'),
      key: 'image',
      width: 80,
      render: (_, record) => {
        const primaryImage = record.item.images?.find(img => img.is_primary) || record.item.images?.[0];
        return (
          <Avatar 
            shape="square" 
            size={64} 
            src={primaryImage ? `/storage/${primaryImage.image_path}` : null}
            icon={!primaryImage && <FileImageOutlined />} 
          />
        );
      }
    },
    {
      title: t('Product'),
      key: 'product',
      ...getColumnSearchProps('item.name'),
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            {record.item.name}
          </Text>
          {record.item.sku && <Text type="secondary" style={{ fontSize: '12px' }}>SKU: {record.item.sku}</Text>}
        </Space>
      ),
    },
    {
      title: t('Shop'),
      key: 'shop',
      render: (_, record) => record.shop.name,
      filters: shops.map(shop => ({ text: shop.name, value: shop.id })),
      onFilter: (value, record) => record.shop_id === value,
    },
    {
      title: t('Category'),
      key: 'category',
      render: (_, record) => record.item.category ? record.item.category.name : t('Uncategorized'),
    },
    {
      title: t('Shop Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (qty, record) => {
        let color = 'green';
        let text = t('In Stock');
        
        if (qty <= 0) {
          color = 'red';
          text = t('Out of Stock');
        } else if (qty <= 5) {
          color = 'orange';
          text = t('Low Stock');
        }
        
        return (
          <Space direction="vertical" size={0}>
            <Badge 
              count={qty} 
              showZero 
              overflowCount={9999}
              style={{ 
                backgroundColor: color === 'red' ? '#f5222d' : 
                                color === 'orange' ? '#fa8c16' : '#52c41a',
                fontSize: '14px',
                padding: '0 8px'
              }}
            />
            <Tag color={color} style={{ marginTop: '4px' }}>
              {text}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: t('Warehouse Stock'),
      key: 'warehouseQty',
      render: (_, record) => (
        <Badge 
          count={record.item.quantity} 
          showZero 
          overflowCount={9999}
          style={{ 
            backgroundColor: record.item.quantity > 0 ? '#52c41a' : '#f5222d',
            fontSize: '14px',
            padding: '0 8px'
          }}
        />
      ),
    },
    {
      title: t('Unit Price'),
      key: 'price',
      render: (_, record) => {
        const price = parseFloat(record.item.unit_price) || 0;
        return `ETB ${price.toFixed(2)}`;
      },
      sorter: (a, b) => {
        const priceA = parseFloat(a.item.unit_price) || 0;
        const priceB = parseFloat(b.item.unit_price) || 0;
        return priceA - priceB;
      },
    },
    {
      title: t('Actions'),
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('Edit Inventory')}>
            <Link href={route('inventory.edit', record.id)}>
              <Button icon={<EditOutlined />} size="small" />
            </Link>
          </Tooltip>
          
          <Tooltip title={t('Refill from Warehouse')}>
            <Button 
              icon={<ReloadOutlined />} 
              size="small" 
              disabled={record.item.quantity <= 0}
              onClick={() => showRefillModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Shop Inventory')}</h2>}
    >
      <Head title={t('Shop Inventory')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold">{t('Inventory by Shop')}</h1>
              <Link href={route('inventory.create')}>
                <Button type="primary" icon={<PlusOutlined />}>{t('Add Inventory')}</Button>
              </Link>
            </div>
            
            {/* Shop Tabs */}
            <div className="mb-6 overflow-auto">
              <Tabs 
                activeKey={activeShop} 
                onChange={(key) => setActiveShop(key)}
                type="card"
                tabPosition="top"
                className="shop-tabs"
                tabBarGutter={8}
              >
                <TabPane 
                  tab={
                    <span>
                      <ShopOutlined />
                      {t('All Shops')}
                    </span>
                  } 
                  key="all"
                />
                
                {shops.map(shop => (
                  <TabPane 
                    tab={
                      <span>
                        <ShopOutlined />
                        {shop.name}
                      </span>
                    } 
                    key={shop.id} 
                  />
                ))}
              </Tabs>
            </div>

            <Table 
              dataSource={filteredInventory} 
              columns={columns} 
              rowKey="id" 
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50']
              }}
              scroll={{ x: 1200 }} // Enable horizontal scrolling
            />
          </div>
        </div>
      </div>
      
      {/* Refill Modal */}
      <Modal
        title={t('Refill Inventory from Warehouse')}
        open={isRefillModalVisible}
        onCancel={() => setIsRefillModalVisible(false)}
        onOk={handleRefillSubmit}
        okText={t('Refill')}
        okButtonProps={{ loading: processing }}
        cancelText={t('Cancel')}
      >
        {selectedInventory && (
          <Form form={refillForm} layout="vertical">
            <div className="mb-4">
              <strong>{t('Product')}:</strong> {selectedInventory.item.name}
            </div>
            
            <div className="mb-4">
              <strong>{t('Current Shop Quantity')}:</strong> {selectedInventory.quantity}
            </div>
            
            <div className="mb-4">
              <strong>{t('Available in Warehouse')}:</strong> {selectedInventory.item.quantity}
            </div>
            
            <Form.Item
              name="quantity"
              label={t('Quantity to Add')}
              rules={[
                { required: true, message: t('Please enter quantity') },
                { 
                  validator: (_, value) => {
                    if (value > selectedInventory.item.quantity) {
                      return Promise.reject(t('Cannot refill more than available in warehouse'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber 
                min={1} 
                max={selectedInventory.item.quantity}
                style={{ width: '100%' }} 
                placeholder={t('Enter quantity')} 
              />
            </Form.Item>
            
            <Form.Item name="max_available" hidden>
              <InputNumber />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </AuthenticatedLayout>
  );
};

export default Inventory; 