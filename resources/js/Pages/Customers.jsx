import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Table, Card, Button, Input, Modal, Form, message, Popconfirm, Space, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/Contexts/I18nContext';

const { TextArea } = Input;

const Customers = ({ auth, customers, flash }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const form = useForm({
    id: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  
  const { delete: destroy } = useForm();
  
  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  React.useEffect(() => {
    if (flash.message) {
      message.success(flash.message);
    }
    if (flash.error) {
      message.error(flash.error);
    }
  }, [flash]);
  
  const handleAddCustomer = () => {
    form.post(route('customers.store'), {
      onSuccess: () => {
        setModalVisible(false);
        form.reset();
        message.success(t('Customer added successfully'));
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  };
  
  const handleEditCustomer = () => {
    form.put(route('customers.update', form.data.id), {
      onSuccess: () => {
        setModalVisible(false);
        form.reset();
        setEditMode(false);
        message.success(t('Customer updated successfully'));
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  };
  
  const handleDeleteCustomer = (id) => {
    destroy(route('customers.destroy', id), {
      onSuccess: () => {
        message.success(t('Customer deleted successfully'));
      },
      onError: () => {
        message.error(t('Failed to delete customer'));
      }
    });
  };
  
  const openEditModal = (customer) => {
    form.setData({
      id: customer.id,
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setEditMode(true);
    setModalVisible(true);
  };
  
  const openAddModal = () => {
    form.reset();
    setEditMode(false);
    setModalVisible(true);
  };
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchText)) ||
    (customer.email && customer.email.toLowerCase().includes(searchText.toLowerCase()))
  );
  
  const columns = [
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a href={route('customers.show', record.id)}>{text}</a>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('Phone'),
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['md'],
    },
    {
      title: t('Email'),
      dataIndex: 'email',
      key: 'email',
      responsive: ['lg'],
    },
    {
      title: t('Sales'),
      dataIndex: 'sales_count',
      key: 'sales_count',
      sorter: (a, b) => a.sales_count - b.sales_count,
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('Edit')}>
            <Button 
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title={t('Are you sure you want to delete this customer?')}
            onConfirm={() => handleDeleteCustomer(record.id)}
            okText={t('Yes')}
            cancelText={t('No')}
            okButtonProps={{ danger: true }}
            disabled={record.sales_count > 0}
          >
            <Tooltip title={record.sales_count > 0 ? t('Cannot delete customer with sales') : t('Delete')}>
              <Button 
                danger
                icon={<DeleteOutlined />}
                disabled={record.sales_count > 0}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title={t('Customers')} />
      
      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Card 
          title={t('Customers')}
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={openAddModal}
              className="bg-primary-500"
            >
              {t('Add Customer')}
            </Button>
          }
        >
          <div className="mb-4">
            <Input
              placeholder={t('Search customers...')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </div>
          
          <div className="overflow-x-auto">
            <Table 
              dataSource={filteredCustomers} 
              columns={columns} 
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total, range) => t('{{range0}}-{{range1}} of {{total}} customers', {
                  range0: range[0],
                  range1: range[1],
                  total,
                }),
              }}
              scroll={{ x: 'max-content' }}
            />
          </div>
        </Card>
      </div>
      
      <Modal
        title={editMode ? t('Edit Customer') : t('Add New Customer')}
        open={modalVisible}
        onOk={editMode ? handleEditCustomer : handleAddCustomer}
        onCancel={() => {
          setModalVisible(false);
          setEditMode(false);
          form.reset();
        }}
        confirmLoading={form.processing}
      >
        <Form layout="vertical">
          <Form.Item
            label={t('Name')}
            validateStatus={form.errors.name ? 'error' : ''}
            help={form.errors.name}
            required
          >
            <Input 
              prefix={<UserOutlined />}
              value={form.data.name}
              onChange={e => form.setData('name', e.target.value)}
              placeholder={t('Enter customer name')}
            />
          </Form.Item>
          
          <Form.Item 
            label={t('Phone Number')}
            validateStatus={form.errors.phone ? 'error' : ''}
            help={form.errors.phone}
          >
            <Input 
              prefix={<PhoneOutlined />}
              value={form.data.phone}
              onChange={e => form.setData('phone', e.target.value)}
              placeholder={t('Enter phone number')}
            />
          </Form.Item>
          
          <Form.Item 
            label={t('Email')}
            validateStatus={form.errors.email ? 'error' : ''}
            help={form.errors.email}
          >
            <Input 
              prefix={<MailOutlined />}
              value={form.data.email}
              onChange={e => form.setData('email', e.target.value)}
              placeholder={t('Enter email address')}
            />
          </Form.Item>
          
          <Form.Item 
            label={t('Address')}
            validateStatus={form.errors.address ? 'error' : ''}
            help={form.errors.address}
          >
            <Input 
              prefix={<HomeOutlined />}
              value={form.data.address}
              onChange={e => form.setData('address', e.target.value)}
              placeholder={t('Enter address')}
            />
          </Form.Item>
          
          <Form.Item 
            label={t('Notes')}
            validateStatus={form.errors.notes ? 'error' : ''}
            help={form.errors.notes}
          >
            <TextArea 
              prefix={<InfoCircleOutlined />}
              value={form.data.notes}
              onChange={e => form.setData('notes', e.target.value)}
              placeholder={t('Additional notes')}
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AuthenticatedLayout>
  );
};

export default Customers; 