import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Form, Input, Button, Card, InputNumber, Select, message } from 'antd';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const { Option } = Select;

const InventoryCreate = ({ auth, shops, items }) => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState(null);
  
  const { data, setData, post, processing, errors } = useForm({
    shop_id: '',
    item_id: '',
    quantity: 1,
    selling_price: 0,
  });
  
  const handleItemChange = (itemId) => {
    const item = items.find(i => i.id === itemId);
    setSelectedItem(item);
    
    if (item) {
      setData({
        ...data,
        item_id: item.id,
        selling_price: item.selling_price || 0,
      });
    }
  };
  
  const handleSubmit = () => {
    post(route('inventory.store'), {
      onSuccess: () => {
        message.success(t('Inventory added successfully!'));
        window.location.href = route('inventory.index');
      }
    });
  };
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Add Inventory')}</h2>}
    >
      <Head title={t('Add Inventory')} />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <Card title={t('Add Inventory to Shop')} className="mb-6">
              <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item 
                  label={t('Shop')} 
                  required 
                  validateStatus={errors.shop_id ? 'error' : ''}
                  help={errors.shop_id}
                >
                  <Select
                    placeholder={t('Select a shop')}
                    value={data.shop_id}
                    onChange={value => setData('shop_id', value)}
                    style={{ width: '100%' }}
                  >
                    {shops.map(shop => (
                      <Option key={shop.id} value={shop.id}>{shop.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item 
                  label={t('Item')} 
                  required 
                  validateStatus={errors.item_id ? 'error' : ''}
                  help={errors.item_id}
                >
                  <Select
                    showSearch
                    placeholder={t('Select an item')}
                    optionFilterProp="children"
                    value={data.item_id}
                    onChange={handleItemChange}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    style={{ width: '100%' }}
                  >
                    {items.map(item => (
                      <Option key={item.id} value={item.id}>
                        {item.name} ({t('Available')}: {item.quantity})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                {selectedItem && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p>{t('Warehouse Quantity')}: {selectedItem.quantity}</p>
                    <p>{t('Purchase Price')}: {parseFloat(selectedItem.purchase_price).toFixed(2)}</p>
                  </div>
                )}
                
                <Form.Item 
                  label={t('Quantity to Transfer')}
                  validateStatus={errors.quantity ? 'error' : ''}
                  help={errors.quantity}
                >
                  <InputNumber
                    min={1}
                    max={selectedItem ? selectedItem.quantity : 1}
                    value={data.quantity}
                    onChange={value => setData('quantity', value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Selling Price')}
                  validateStatus={errors.selling_price ? 'error' : ''}
                  help={errors.selling_price}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={data.selling_price}
                    onChange={value => setData('selling_price', value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={processing}
                    className="bg-primary-500"
                  >
                    {t('Add to Shop Inventory')}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default InventoryCreate; 