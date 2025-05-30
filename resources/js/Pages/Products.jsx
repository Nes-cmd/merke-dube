import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Table, Button, message, Modal, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const Products = ({ auth, products, flash }) => {
  const { t, locale } = useTranslation();
  const [creditModalVisible, setCreditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    credit_payed: '',
    note: '',
  });
  
  React.useEffect(() => {
    if (flash.message) {
      message.success(flash.message);
    }
  }, [flash.message]);

  const handleCreditPaid = (e, product) => {
    e.stopPropagation(); // Prevent the row click event when clicking the button
    setSelectedProduct(product);
    reset();
    setCreditModalVisible(true);
  };

  const handleSubmitCredit = () => {
    post(route('products.credit-payed', selectedProduct.id), {
      onSuccess: () => {
        setCreditModalVisible(false);
      },
      onError: (errors) => {
        console.error(errors);
        message.error(t('Error paying credit'));
      }
    });
  };

  const totalCredit = products.reduce((sum, product) => sum + (parseFloat(product.credit) || 0), 0);
  const totalPaid = products.reduce((sum, product) => sum + (parseFloat(product.paid) || 0), 0);

  const columns = [
    {
      title: t('Product Name'),
      dataIndex: 'name',
      key: 'name',
    },
    
    {
      title: t('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('Paid'),
      dataIndex: 'paid',
      key: 'paid',
      sorter: (a, b) => a.paid - b.paid,
    },
    {
      title: t('Credit'),
      dataIndex: 'credit',
      key: 'credit',
      sorter: (a, b) => a.credit - b.credit,
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        record.credit > 0 &&
        <Button 
          type="primary" 
          className="bg-primary-500" 
          onClick={(e) => handleCreditPaid(e, record)}
        >
          {t('Credit Paid')}
        </Button>
      ),
    },
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Products')}</h2>}
    >
      <Head title={t('Products')} />

      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-primary-500 text-3xl font-bold">
            {t('Products')}
          </h1>
         
          <Link href={route('products.create')}>
            <Button type="primary" className="bg-primary-500">
              <PlusOutlined /> {t('Product')}
            </Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => window.location.href = route('products.show', record.id),
            })}
            pagination={false} // Disable pagination to show all data
            footer={() => (
              <div className="flex justify-end">
                <div className="font-bold mr-4">
                  {t('Total Paid')}: {totalPaid.toFixed(2)}
                </div>
                <div className="font-bold">
                  {t('Total Credit')}: {totalCredit.toFixed(2)}
                </div>
              </div>
            )}
          />
        </div>
        
        <Modal
          title={t('Credit Paid')}
          open={creditModalVisible}
          onCancel={() => setCreditModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setCreditModalVisible(false)}>
              {t('Cancel')}
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={processing} 
              onClick={handleSubmitCredit}
              className="bg-primary-500"
            >
              {t('Submit')}
            </Button>,
          ]}
        >
          {selectedProduct && (
            <Form layout="vertical">
              <Form.Item 
                label={t('Current Credit')} 
                className="mb-4"
              >
                <Input 
                  value={selectedProduct.credit} 
                  readOnly 
                  className="bg-gray-100"
                />
              </Form.Item>
              
              <Form.Item 
                label={t('Enter paid credit amount')} 
                className="mb-4"
                validateStatus={errors.credit_payed ? 'error' : ''}
                help={errors.credit_payed}
              >
                <Input 
                  type="number" 
                  value={data.credit_payed} 
                  onChange={e => setData('credit_payed', e.target.value)} 
                  placeholder="0.00"
                  min="0"
                  max={selectedProduct.credit}
                  step="0.01"
                />
              </Form.Item>
              
              <Form.Item 
                label={t('Note')} 
                className="mb-4"
              >
                <Input.TextArea 
                  value={data.note} 
                  onChange={e => setData('note', e.target.value)} 
                  rows={4} 
                  placeholder={t('Add optional note')}
                />
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
};

export default Products;
