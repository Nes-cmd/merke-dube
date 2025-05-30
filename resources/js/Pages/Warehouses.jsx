import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, Button, List, Alert, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const Warehouses = ({ auth, warehouses, flash }) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    location: '',
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

  const handleAddWarehouse = () => {
    post(route('warehouses.store'), {
      onSuccess: () => {
        setIsModalVisible(false);
        reset();
      },
      onError: () => {
        message.error(t('Error adding warehouse'));
      }
    });
  };

  const handleDeleteWarehouse = (id) => {
    const warehouse = warehouses.find(w => w.id === id);
    
    if (warehouse.items_count > 0) {
      message.error(t('Cannot delete warehouse with items'));
      setIsConfirmDeleteVisible(false);
      return;
    }
    
    destroy(route('warehouses.destroy', id), {
      onSuccess: () => {
        setIsConfirmDeleteVisible(false);
      },
      onError: () => {
        message.error(t('Error deleting warehouse'));
      }
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Warehouses')}</h2>}
    >
      <Head title={t('Warehouses')} />

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-primary-500 text-3xl font-bold">
            {t('Warehouses')}
          </h1>
         
          <Button 
            type="primary" 
            className="bg-primary-500" 
            onClick={() => setIsModalVisible(true)}
          >
            <PlusOutlined /> {t('Warehouse')}
          </Button>
        </div>

        <div className="w-full">
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
            dataSource={warehouses}
            renderItem={(warehouse) => (
              <List.Item>
                <Card hoverable className="shadow-md">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{warehouse.name}</h3>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {t('Items count')}: {warehouse.items_count}
                      </span>
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => {
                          setWarehouseToDelete(warehouse);
                          setIsConfirmDeleteVisible(true);
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p>
                      <strong>{t('Location')}:</strong> {warehouse.location || t('Not specified')}
                    </p>
                    <p>
                      <strong>{t('Owner')}:</strong> {warehouse.owner?.name}
                    </p>
                    <p>
                      <strong>{t('Phone number')}:</strong> {warehouse.owner?.phone_number || t('Not provided')}
                    </p>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>

        <Modal
          title={t('Add Warehouse')}
          open={isModalVisible}
          onOk={handleAddWarehouse}
          onCancel={() => {
            setIsModalVisible(false);
            reset();
          }}
          confirmLoading={processing}
        >
          <Form layout="vertical">
            <Form.Item
              label={t('Warehouse Name')}
              validateStatus={errors.name ? 'error' : ''}
              help={errors.name}
              required
            >
              <Input 
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                placeholder={t('Enter warehouse name')}
              />
            </Form.Item>
            <Form.Item 
              label={t('Warehouse Location')}
              validateStatus={errors.location ? 'error' : ''}
              help={errors.location}
            >
              <Input 
                value={data.location}
                onChange={e => setData('location', e.target.value)}
                placeholder={t('Enter warehouse location (optional)')}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={t('Confirm Delete')}
          open={isConfirmDeleteVisible}
          onOk={() => handleDeleteWarehouse(warehouseToDelete?.id)}
          onCancel={() => setIsConfirmDeleteVisible(false)}
          okText={t('Delete')}
          cancelText={t('Cancel')}
          okButtonProps={{ danger: true }}
        >
          <p>{t('Are you sure you want to delete this warehouse?')}</p>
          {warehouseToDelete?.items_count > 0 && (
            <Alert 
              message={t('Warning: This warehouse contains items and cannot be deleted')} 
              type="warning" 
              showIcon
              className="mt-4"
            />
          )}
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
};

export default Warehouses; 