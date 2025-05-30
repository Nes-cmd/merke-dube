import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Form, Input, Button, Card, InputNumber, Select, DatePicker, message } from 'antd';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const { Option } = Select;

const SaleCreate = ({ auth, products }) => {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { data, setData, post, processing, errors } = useForm({
    item_id: '',
    item_name: '',
    quantity: 1,
    total: 0,
    paid: 0,
    credit: 0,
    customer_name: '',
    customer_phone: '',
    note: '',
  });

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    
    if (product) {
      const total = product.price || 0;
      setData({
        ...data,
        item_id: product.id,
        item_name: product.name,
        total: total,
        paid: 0,
        credit: total,
      });
    }
  };

  const handleQuantityChange = (quantity) => {
    if (selectedProduct && quantity) {
      const total = (selectedProduct.price || 0) * quantity;
      setData({
        ...data,
        quantity,
        total,
        credit: total - data.paid,
      });
    } else {
      setData({
        ...data,
        quantity: quantity || 1,
      });
    }
  };

  const handlePaidChange = (paid) => {
    const newPaid = paid || 0;
    setData({
      ...data,
      paid: newPaid,
      credit: data.total - newPaid,
    });
  };

  const handleSubmit = () => {
    post(route('sales.store'), {
      onSuccess: () => {
        message.success(t('Sale added successfully!'));
        window.location.href = route('sales.index');
      }
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Add Sale')}</h2>}
    >
      <Head title={t('Add Sale')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <Card title={t('Add New Sale')} className="mb-6">
              <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item 
                  label={t('Product')} 
                  required 
                  validateStatus={errors.item_id ? 'error' : ''}
                  help={errors.item_id}
                >
                  <Select
                    showSearch
                    placeholder={t('Select a product')}
                    optionFilterProp="children"
                    value={data.item_id || undefined}
                    onChange={handleProductChange}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    className="w-full"
                  >
                    {products.map(product => (
                      <Option key={product.id} value={product.id}>
                        {product.name} - {product.quantity} {t('available')}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item 
                  label={t('Quantity')}
                  validateStatus={errors.quantity ? 'error' : ''}
                  help={errors.quantity}
                >
                  <InputNumber
                    min={1}
                    max={selectedProduct?.quantity || 1}
                    value={data.quantity}
                    onChange={handleQuantityChange}
                    className="w-full"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Total Amount')}
                  validateStatus={errors.total ? 'error' : ''}
                  help={errors.total}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={data.total}
                    onChange={value => setData('total', value)}
                    className="w-full"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Amount Paid')}
                  validateStatus={errors.paid ? 'error' : ''}
                  help={errors.paid}
                >
                  <InputNumber
                    min={0}
                    max={data.total}
                    step={0.01}
                    value={data.paid}
                    onChange={handlePaidChange}
                    className="w-full"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Credit')}
                >
                  <InputNumber
                    value={data.credit}
                    disabled
                    className="w-full bg-gray-100"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Customer Name')}
                  validateStatus={errors.customer_name ? 'error' : ''}
                  help={errors.customer_name}
                >
                  <Input 
                    value={data.customer_name}
                    onChange={e => setData('customer_name', e.target.value)}
                    placeholder={t('Enter customer name (optional)')}
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Customer Phone')}
                  validateStatus={errors.customer_phone ? 'error' : ''}
                  help={errors.customer_phone}
                >
                  <Input 
                    value={data.customer_phone}
                    onChange={e => setData('customer_phone', e.target.value)}
                    placeholder={t('Enter customer phone (optional)')}
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Note')}
                  validateStatus={errors.note ? 'error' : ''}
                  help={errors.note}
                >
                  <Input.TextArea 
                    value={data.note}
                    onChange={e => setData('note', e.target.value)}
                    rows={4}
                    placeholder={t('Add a note (optional)')}
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={processing}
                    className="bg-primary-500"
                  >
                    {t('Add Sale')}
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

export default SaleCreate; 