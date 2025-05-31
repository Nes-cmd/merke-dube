import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Table, Card, Button, Input, Select, Tag, Popconfirm, message, Form, Modal, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/Contexts/I18nContext';

const { Option } = Select;

const Inventory = ({ auth, inventory, shops, flash }) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [filterShop, setFilterShop] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  
  const { data, setData, put, processing, errors, reset } = useForm({
    quantity: 0,
    selling_price: 0,
  });
  
  const { delete: destroy } = useForm();
  
  React.useEffect(() => {
    if (flash.message) {
      message.success(flash.message);
    }
    if (flash.error) {
      message.error(flash.error);
    }
  }, [flash]);
  
  const handleEdit = (record) => {
    setSelectedInventory(record);
    setData({
      quantity: record.quantity,
      selling_price: record.selling_price,
    });
    setEditModalVisible(true);
  };
  
  const handleUpdate = () => {
    put(route('inventory.update', selectedInventory.id), {
      onSuccess: () => {
        setEditModalVisible(false);
        reset();
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  };
  
  const handleDelete = (id) => {
    destroy(route('inventory.destroy', id), {
      onSuccess: () => {
        message.success(t('Inventory removed successfully'));
      },
      onError: () => {
        message.error(t('Failed to remove inventory'));
      }
    });
  };
  
  // Filter inventory based on search and shop filter
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.shop.name.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesShop = filterShop ? item.shop_id === filterShop : true;
    
    return matchesSearch && matchesShop;
  });
  
  const columns = [
    {
      title: t('Shop'),
      dataIndex: ['shop', 'name'],
      key: 'shop',
      sorter: (a, b) => a.shop.name.localeCompare(b.shop.name),
    },
    {
      title: t('Item'),
      dataIndex: ['item', 'name'],
      key: 'item',
      sorter: (a, b) => a.item.name.localeCompare(b.item.name),
    },
    {
      title: t('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: t('Selling Price'),
      dataIndex: 'selling_price',
      key: 'selling_price',
      render: (price) => parseFloat(price).toFixed(2),
      sorter: (a, b) => a.selling_price - b.selling_price,
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)}
            className="bg-primary-500"
          />
          <Popconfirm
            title={t('Are you sure you want to remove this inventory?')}
            description={t('This will return the items to the warehouse.')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('Yes')}
            cancelText={t('No')}
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
            />
          </Popconfirm>
        </div>
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
          <Card 
            title={t('Shop Inventory')}
            extra={
              <Link href={route('inventory.create')}>
                <Button type="primary" icon={<PlusOutlined />} className="bg-primary-500">
                  {t('Add Inventory')}
                </Button>
              </Link>
            }
            className="mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <div className="md:flex-1">
                <Input
                  placeholder={t('Search by item or shop name')}
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  placeholder={t('Filter by shop')}
                  style={{ width: '100%' }}
                  allowClear
                  value={filterShop}
                  onChange={value => setFilterShop(value)}
                >
                  {shops.map(shop => (
                    <Option key={shop.id} value={shop.id}>{shop.name}</Option>
                  ))}
                </Select>
              </div>
            </div>
            
            <Table
              columns={columns}
              dataSource={filteredInventory}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      </div>
      
      <Modal
        title={t('Edit Inventory')}
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => {
          setEditModalVisible(false);
          reset();
        }}
        confirmLoading={processing}
      >
        {selectedInventory && (
          <Form layout="vertical">
            <Form.Item
              label={t('Item')}
            >
              <Input value={selectedInventory.item.name} disabled />
            </Form.Item>
            
            <Form.Item
              label={t('Shop')}
            >
              <Input value={selectedInventory.shop.name} disabled />
            </Form.Item>
            
            <Form.Item
              label={t('Quantity')}
              validateStatus={errors.quantity ? 'error' : ''}
              help={errors.quantity}
            >
              <InputNumber
                min={0}
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
          </Form>
        )}
      </Modal>
    </AuthenticatedLayout>
  );
};

export default Inventory; 