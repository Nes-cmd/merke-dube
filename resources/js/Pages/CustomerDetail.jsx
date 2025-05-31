import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, Descriptions, Button, Table, Tabs, Space, Tag, Tooltip, message, Divider, Modal, Form, Input } from 'antd';
import { 
  EditOutlined, 
  ArrowLeftOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  HomeOutlined,
  UserOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/Contexts/I18nContext';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;

const CustomerDetail = ({ auth, customer, flash }) => {
  const { t } = useTranslation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  const form = useForm({
    id: customer.id,
    name: customer.name,
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
    notes: customer.notes || '',
  });
  
  React.useEffect(() => {
    if (flash.message) {
      message.success(flash.message);
    }
    if (flash.error) {
      message.error(flash.error);
    }
  }, [flash]);
  
  const handleEditCustomer = () => {
    form.put(route('customers.update', customer.id), {
      onSuccess: () => {
        setEditModalVisible(false);
        message.success(t('Customer updated successfully'));
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  };
  
  const salesColumns = [
    {
      title: t('Date'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
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
      render: (text) => `$${parseFloat(text).toFixed(2)}`,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'completed' ? 'green' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Link href={route('sales.show', record.id)}>
            <Button size="small">{t('View')}</Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title={t('Customer Details')} />
      
      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href={route('customers.index')}>
            <Button icon={<ArrowLeftOutlined />}>{t('Back to Customers')}</Button>
          </Link>
        </div>
        
        <Card 
          title={t('Customer Details')}
          extra={
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => setEditModalVisible(true)}
              className="bg-primary-500"
            >
              {t('Edit')}
            </Button>
          }
        >
          <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
            <Descriptions.Item label={t('Name')}>{customer.name}</Descriptions.Item>
            <Descriptions.Item label={t('Phone')}>{customer.phone || t('N/A')}</Descriptions.Item>
            <Descriptions.Item label={t('Email')}>{customer.email || t('N/A')}</Descriptions.Item>
            <Descriptions.Item label={t('Total Sales')}>{customer.sales?.length || 0}</Descriptions.Item>
            <Descriptions.Item label={t('Address')} span={2}>{customer.address || t('N/A')}</Descriptions.Item>
            <Descriptions.Item label={t('Notes')} span={4}>{customer.notes || t('N/A')}</Descriptions.Item>
          </Descriptions>
          
          <Divider />
          
          <Tabs defaultActiveKey="1">
            <TabPane tab={t('Sales History')} key="1">
              <Table 
                dataSource={customer.sales || []} 
                columns={salesColumns} 
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                }}
                scroll={{ x: 'max-content' }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
      
      <Modal
        title={t('Edit Customer')}
        open={editModalVisible}
        onOk={handleEditCustomer}
        onCancel={() => {
          setEditModalVisible(false);
          form.reset();
          form.setData({
            id: customer.id,
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || '',
            notes: customer.notes || '',
          });
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

export default CustomerDetail; 