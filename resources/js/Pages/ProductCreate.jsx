import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Form, Input, Button, Card, InputNumber, message } from 'antd';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const ProductCreate = ({ auth }) => {
  const { t } = useTranslation();
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    quantity: 1,
    paid: 0,
    credit: 0,
    size: '',
    color: '',
  });

  const handleSubmit = () => {
    post(route('products.store'), {
      onSuccess: () => {
        message.success(t('Product added successfully!'));
        window.location.href = route('products.index');
      }
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Add Product')}</h2>}
    >
      <Head title={t('Add Product')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <Card title={t('Add New Product')} className="mb-6">
              <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item 
                  label={t('Name')} 
                  required 
                  validateStatus={errors.name ? 'error' : ''}
                  help={errors.name}
                >
                  <Input 
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder={t('Enter product name')}
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Quantity')}
                  validateStatus={errors.quantity ? 'error' : ''}
                  help={errors.quantity}
                >
                  <InputNumber
                    min={1}
                    value={data.quantity}
                    onChange={value => setData('quantity', value)}
                    className="w-full"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Paid')}
                  validateStatus={errors.paid ? 'error' : ''}
                  help={errors.paid}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={data.paid}
                    onChange={value => setData('paid', value)}
                    className="w-full"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Credit')}
                  validateStatus={errors.credit ? 'error' : ''}
                  help={errors.credit}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={data.credit}
                    onChange={value => setData('credit', value)}
                    className="w-full"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Size')}
                  validateStatus={errors.size ? 'error' : ''}
                  help={errors.size}
                >
                  <Input 
                    value={data.size}
                    onChange={e => setData('size', e.target.value)}
                    placeholder={t('Enter size (optional)')}
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Color')}
                  validateStatus={errors.color ? 'error' : ''}
                  help={errors.color}
                >
                  <Input 
                    value={data.color}
                    onChange={e => setData('color', e.target.value)}
                    placeholder={t('Enter color (optional)')}
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={processing}
                    className="bg-primary-500"
                  >
                    {t('Add Product')}
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

export default ProductCreate; 