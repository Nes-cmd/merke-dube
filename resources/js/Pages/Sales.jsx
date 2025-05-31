import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
  Table, Button, message, Modal, Form, Input, DatePicker, 
  Select, InputNumber, Badge, Tag, Space, Card, Tabs, 
  Typography, Divider, Tooltip, Popconfirm, Alert,
  Spin, Empty
} from 'antd';
import { 
  PlusOutlined, 
  ShoppingCartOutlined, 
  CreditCardOutlined, 
  CheckCircleOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
  CloseCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

const Sales = ({ auth, sales, shops, customers, flash }) => {
  const { t, locale } = useTranslation();
  const [creditModalVisible, setCreditModalVisible] = useState(false);
  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [creditApprovalVisible, setCreditApprovalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [shopInventory, setShopInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form for recording credit payment
  const creditForm = useForm({
    credit_payed: '',
    note: '',
  });
  
  // Form for new sale
  const saleForm = useForm({
    shop_id: '',
    customer_id: '',
    amount_paid: 0,
    note: '',
    items: []
  });
  
  // Calculate total amount of items in cart
  const totalAmount = cart.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);
  
  // Calculate balance due
  const balanceDue = Math.max(0, totalAmount - (saleForm.data.amount_paid || 0));
  
  React.useEffect(() => {
    if (flash.message) {
      message.success(flash.message);
    }
    if (flash.error) {
      message.error(flash.error);
    }
  }, [flash]);

  // Load shop inventory when shop is selected
  useEffect(() => {
    if (selectedShop) {
      setLoading(true);
      setCart([]); // Clear cart when changing shops
      axios.get(route('sales.shop-inventory', selectedShop))
        .then(response => {
          setShopInventory(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading shop inventory:', error);
          message.error(t('Failed to load shop inventory'));
          setLoading(false);
        });
    }
  }, [selectedShop]);

  const handleCreditPaid = (e, sale) => {
    e.stopPropagation(); // Prevent the row click event
    setSelectedSale(sale);
    creditForm.reset();
    creditForm.setData('credit_payed', sale.credit);
    setCreditModalVisible(true);
  };

  const handleSubmitCreditPayment = () => {
    creditForm.post(route('sales.credit-payed', selectedSale.id), {
      onSuccess: () => {
        setCreditModalVisible(false);
        // You could refresh the sales data here if needed
      }
    });
  };

  const handleCreateSale = () => {
    setCart([]);
    saleForm.reset();
    saleForm.setData('amount_paid', 0);
    setSelectedShop(null);
    setShopInventory([]);
    setSaleModalVisible(true);
  };

  const handleShopChange = (shopId) => {
    setSelectedShop(shopId);
    saleForm.setData('shop_id', shopId);
  };

  const handleAddToCart = (inventory) => {
    // Check if item is already in cart
    const existingItemIndex = cart.findIndex(item => item.item_id === inventory.item_id);
    
    console.log('Adding to cart:', inventory); // Debug log
    
    if (existingItemIndex >= 0) {
      // Update quantity if already in cart
      const updatedCart = [...cart];
      if (updatedCart[existingItemIndex].quantity < inventory.quantity) {
        updatedCart[existingItemIndex].quantity += 1;
        setCart(updatedCart);
      } else {
        message.warning(t('Cannot add more of this item (stock limit reached)'));
      }
    } else {
      // Add new item to cart
      setCart([...cart, {
        item_id: inventory.item_id,
        inventory_id: inventory.id,
        name: inventory.item.name,
        price: parseFloat(inventory.selling_price || 0),
        quantity: 1,
        max_quantity: inventory.quantity,
        inventory: inventory
      }]);
    }
  };

  const handleQuantityChange = (index, value) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = value;
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const handleCompleteSale = () => {
    // Make sure we have all required data
    if (!saleForm.data.shop_id) {
      message.error(t('Please select a shop'));
      return;
    }
    
    if (cart.length === 0) {
      message.error(t('Your cart is empty'));
      return;
    }
    
    if (balanceDue > 0 && !saleForm.data.customer_id) {
      message.error(t('Customer is required for credit sales'));
      return;
    }
    
    // Prepare items array for backend
    const items = cart.map(item => ({
      item_id: item.item_id,
      inventory_id: item.inventory_id,
      quantity: item.quantity,
      price: parseFloat(item.price)
    }));
    
    // First set the items in form data
    saleForm.setData({
      ...saleForm.data,
      items: items
    });
    
    // Add a small delay to ensure the data is set before submission
    setTimeout(() => {
      console.log('Submitting with data:', saleForm.data); // Debug log
      
      saleForm.post(route('sales.store'), {
        onSuccess: () => {
          message.success(t('Sale completed successfully'));
          setSaleModalVisible(false);
          setCart([]);
        },
        onError: (errors) => {
          console.error('Sale submission errors:', errors);
          message.error(errors.error || t('Failed to complete sale'));
        }
      });
    }, 100);
  };

  const renderInventoryItems = () => {
    if (loading) {
      return <div className="flex justify-center py-8"><Spin size="large" /></div>;
    }
    
    if (!selectedShop) {
      return <Empty description={t('Select a shop to view inventory')} />;
    }
    
    if (!shopInventory || shopInventory.length === 0) {
      return <Empty description={t('No inventory items found')} />;
    }
    
    const filteredItems = shopInventory.filter(item => 
      item.item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredItems.length === 0) {
      return <Empty description={t('No items match your search')} />;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(inventory => {
          // Ensure selling_price is a number for display
          const sellingPrice = parseFloat(inventory.item.selling_price || 0);
          
          return (
            <Card 
              key={inventory.id}
              size="small"
              hoverable
              onClick={() => handleAddToCart(inventory)}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                <div className="mr-3">
                  {inventory.item?.images && inventory.item.images.length > 0 ? (
                    <img 
                      src={inventory.item.images[0].image_path} 
                      alt={inventory.item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <ShoppingCartOutlined className="text-gray-400 text-2xl" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{inventory.item.name}</div>
                  <div className="text-gray-500 text-sm">
                    {inventory.item.category?.name || t('No Category')}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-primary-600 font-bold">
                      ETB {isNaN(sellingPrice) ? '0.00' : sellingPrice.toFixed(2)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {t('Stock')}: {inventory.quantity}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const columns = [
    {
      title: t('ID'),
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span>#{id}</span>,
    },
    {
      title: t('Date'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('Customer'),
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => customer ? customer.name : t('Walk-in Customer'),
    },
    {
      title: t('Shop'),
      dataIndex: 'shop',
      key: 'shop',
      render: (shop) => shop ? shop.name : '-',
    },
    {
      title: t('Total'),
      dataIndex: 'total',
      key: 'total',
      render: (total) => `ETB ${parseFloat(total).toFixed(2)}`,
    },
    {
      title: t('Paid'),
      dataIndex: 'paid',
      key: 'paid',
      render: (paid) => `ETB ${parseFloat(paid).toFixed(2)}`,
    },
    {
      title: t('Credit'),
      dataIndex: 'credit',
      key: 'credit',
      render: (credit, record) => (
        <span>
          {parseFloat(credit) > 0 ? (
            <Text type="danger">ETB {parseFloat(credit).toFixed(2)}</Text>
          ) : (
            `ETB ${parseFloat(credit).toFixed(2)}`
          )}
        </span>
      ),
    },
    {
      title: t('Status'),
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status) => getStatusTag(status),
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Link href={route('sales.show', record.id)}>
            <Button size="small" icon={<SearchOutlined />} />
          </Link>
          
          {parseFloat(record.credit) > 0 && (
            <Button 
              size="small" 
              type="primary"
              icon={<DollarOutlined />}
              onClick={(e) => handleCreditPaid(e, record)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Sales')}</h2>}
    >
      <Head title={t('Sales')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-primary-500">
                {t('Sales Management')}
              </h1>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateSale}
              >
                {t('New Sale')}
              </Button>
            </div>
            
            <Table 
              columns={columns} 
              dataSource={sales} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        </div>
      </div>
      
      {/* Credit Payment Modal */}
      <Modal
        title={t('Record Credit Payment')}
        open={creditModalVisible}
        onCancel={() => setCreditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setCreditModalVisible(false)}>
            {t('Cancel')}
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSubmitCreditPayment}
            loading={creditForm.processing}
          >
            {t('Record Payment')}
          </Button>
        ]}
      >
        {selectedSale && (
          <Form layout="vertical">
            <div className="mb-4">
              <div className="text-sm text-gray-500">{t('Sale Reference')}: #{selectedSale.id}</div>
              <div className="text-sm text-gray-500">
                {t('Original Amount')}: ETB {selectedSale.total.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                {t('Paid Amount')}: ETB {selectedSale.paid.toFixed(2)}
              </div>
              <div className="font-semibold">
                {t('Remaining Credit')}: ETB {selectedSale.credit.toFixed(2)}
              </div>
            </div>
            
            <Form.Item 
              label={t('Amount Paid')}
              validateStatus={creditForm.errors.credit_payed ? 'error' : ''}
              help={creditForm.errors.credit_payed}
              required
            >
              <InputNumber
                style={{ width: '100%' }}
                value={creditForm.data.credit_payed}
                onChange={value => creditForm.setData('credit_payed', value)}
                min={0.01}
                max={selectedSale.credit}
                formatter={value => `ETB ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/ETB\s?|(,*)/g, '')}
                placeholder={t('Enter amount paid')}
              />
            </Form.Item>
            
            <Form.Item 
              label={t('Note')} 
              validateStatus={creditForm.errors.note ? 'error' : ''}
              help={creditForm.errors.note}
            >
              <Input.TextArea 
                value={creditForm.data.note} 
                onChange={e => creditForm.setData('note', e.target.value)} 
                rows={3} 
                placeholder={t('Add optional note')}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
      
      {/* Create Sale Modal */}
      <Modal
        title={t('Create New Sale')}
        open={saleModalVisible}
        onCancel={() => setSaleModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Tabs defaultActiveKey="items">
          <TabPane tab={t('Items')} key="items">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Card title={t('Select Items')}>
                  <>
                    <Form.Item label={t('Shop')} required className="mb-4">
                      <Select
                        placeholder={t('Select a shop')}
                        style={{ width: '100%' }}
                        value={selectedShop}
                        onChange={handleShopChange}
                      >
                        {shops.map(shop => (
                          <Option key={shop.id} value={shop.id}>
                            {shop.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder={t('Search items...')}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="mb-4"
                    />
                    
                    {renderInventoryItems()}
                  </>
                </Card>
              </div>
              
              <div>
                <Card title={t('Shopping Cart')}>
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                      <ShoppingCartOutlined style={{ fontSize: '24px' }} />
                      <p>{t('Your cart is empty')}</p>
                      <p className="text-xs">{t('Select a shop and add items to your cart')}</p>
                    </div>
                  ) : (
                    <>
                      {cart.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-gray-500 text-sm">
                              ETB {parseFloat(item.price).toFixed(2)} × 
                              <InputNumber
                                min={1}
                                max={item.max_quantity}
                                value={item.quantity}
                                onChange={(value) => handleQuantityChange(index, value)}
                                size="small"
                                className="ml-1 w-16"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-right">
                              ETB {(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </div>
                            <Button 
                              type="text" 
                              danger 
                              size="small"
                              onClick={() => handleRemoveFromCart(index)}
                              icon={<CloseCircleOutlined />}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Divider />
                      
                      <div className="font-bold text-lg flex justify-between">
                        <span>{t('Total')}:</span>
                        <span>ETB {totalAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </Card>
                
                <Card title={t('Payment Details')} className="mt-4">
                  <Form layout="vertical">
                    <div className="grid grid-cols-1 gap-4">
                      <Form.Item
                        label={t('Customer')}
                        validateStatus={saleForm.errors.customer_id ? 'error' : ''}
                        help={saleForm.errors.customer_id}
                      >
                        <Select
                          placeholder={t('Select a customer (optional)')}
                          style={{ width: '100%' }}
                          value={saleForm.data.customer_id}
                          onChange={value => saleForm.setData('customer_id', value)}
                          allowClear
                        >
                          {customers.map(customer => (
                            <Option key={customer.id} value={customer.id}>{customer.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>

                    <Form.Item
                      label={t('Amount Paid')}
                      validateStatus={saleForm.errors.amount_paid ? 'error' : ''}
                      help={saleForm.errors.amount_paid}
                      required
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        value={saleForm.data.amount_paid}
                        onChange={value => saleForm.setData('amount_paid', value)}
                        min={0}
                        max={totalAmount}
                        step={0.01}
                        formatter={value => `ETB ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/ETB\s?|(,*)/g, '')}
                      />
                    </Form.Item>

                    {balanceDue > 0 && (
                      <Alert
                        message={t('Credit Sale')}
                        description={
                          <>
                            <p>{t('Customer will owe a balance of')} <strong>ETB {balanceDue.toFixed(2)}</strong></p>
                            {!saleForm.data.customer_id && (
                              <p className="text-red-500">{t('You must select a customer for credit sales')}</p>
                            )}
                          </>
                        }
                        type="warning"
                        showIcon
                        className="mb-4"
                      />
                    )}

                    <Form.Item
                      label={t('Note')}
                      validateStatus={saleForm.errors.note ? 'error' : ''}
                      help={saleForm.errors.note}
                    >
                      <Input.TextArea
                        value={saleForm.data.note}
                        onChange={e => saleForm.setData('note', e.target.value)}
                        rows={3}
                        placeholder={t('Optional note about this sale')}
                      />
                    </Form.Item>

                    <div className="flex justify-between items-center mt-4">
                      <Button onClick={() => setSaleModalVisible(false)}>
                        {t('Cancel')}
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleCompleteSale}
                        loading={saleForm.processing}
                        disabled={(balanceDue > 0 && !saleForm.data.customer_id) || cart.length === 0}
                      >
                        {t('Complete Sale')}
                      </Button>
                    </div>
                  </Form>
                </Card>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    </AuthenticatedLayout>
  );
};

export default Sales;
