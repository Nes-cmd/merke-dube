import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Table, Button, message, Modal, Form, Input, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const Sales = ({ auth, sales, products, flash }) => {
  const { t, locale } = useTranslation();
  const [creditModalVisible, setCreditModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    credit_payed: '',
    note: '',
  });
  
  React.useEffect(() => {
    if (flash.message) {
      message.success(flash.message);
    }
  }, [flash.message]);

  const handleCreditPaid = (e, sale) => {
    e.stopPropagation(); // Prevent the row click event when clicking the button
    setSelectedSale(sale);
    reset();
    setCreditModalVisible(true);
  };

  const handleSubmitCredit = () => {
    post(route('sales.credit-payed', selectedSale.id), {
      onSuccess: () => {
        setCreditModalVisible(false);
      },
      onError: (errors) => {
        console.error(errors);
        message.error(t('Error paying credit'));
      }
    });
  };

  const totalCredit = sales.reduce((sum, sale) => sum + (parseFloat(sale.credit) || 0), 0);
  const totalPaid = sales.reduce((sum, sale) => sum + (parseFloat(sale.paid) || 0), 0);

  const columns = [
    {
      title: t('Date'),
      key: 'date',
      render: (_, record) => (
        <span>{new Date(record.created_at).toLocaleDateString()}</span>
      ),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: t('Customer'),
      key: 'customer',
      render: (_, record) => (
        <span>{record.customer?.name || t('Walk-in customer')}</span>
      ),
    },
    {
      title: t('Item'),
      dataIndex: 'item_name',
      key: 'item_name',
    },
    {
      title: t('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('Total'),
      dataIndex: 'total',
      key: 'total',
      render: (text) => <span>{parseFloat(text).toFixed(2)}</span>,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: t('Paid'),
      dataIndex: 'paid',
      key: 'paid',
      render: (text) => <span>{parseFloat(text).toFixed(2)}</span>,
      sorter: (a, b) => a.paid - b.paid,
    },
    {
      title: t('Credit'),
      dataIndex: 'credit',
      key: 'credit',
      render: (text) => <span>{parseFloat(text).toFixed(2)}</span>,
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
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Sales')}</h2>}
    >
      <Head title={t('Sales')} />

      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-primary-500 text-3xl font-bold">
            {t('Sales')}
          </h1>
         
          <Link href={route('sales.create')}>
            <Button type="primary" className="bg-primary-500">
              <PlusOutlined /> {t('Sale')}
            </Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={sales}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => window.location.href = route('sales.show', record.id),
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
          {selectedSale && (
            <Form layout="vertical">
              <Form.Item 
                label={t('Current Credit')} 
                className="mb-4"
              >
                <Input 
                  value={selectedSale.credit} 
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
                  max={selectedSale.credit}
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

export default Sales;
