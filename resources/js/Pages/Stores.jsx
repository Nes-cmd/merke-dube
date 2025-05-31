import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchStores, createStore, deleteStore } from '../store/slices/storesSlice';
import { Card, Button, List, Spin, Alert, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
// import { useTranslation } from 'react-i18next';

const Stores = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { stores, loading, error } = useSelector((state) => state.stores);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [deleteStoreId, setDeleteStoreId] = useState(null);
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    if (stores.length === 0) {
      dispatch(fetchStores());
    }
  }, [dispatch, stores.length]);

  const handleAddStore = async () => {
    try {
      const values = await form.validateFields();
      const actionResult = await dispatch(createStore(values));

      if (createStore.fulfilled.match(actionResult)) {
        message.success(t('Success message'));
        dispatch(fetchStores());
        setTimeout(() => setIsModalVisible(false), 1000);
      } else {
        message.error(t('Error message'));
      }
    } catch (error) {
      message.error(t('Error message'));
    }
  };

  const handleDeleteStore = async (storeId) => {
    const storeToDelete = stores.find(store => store.id === storeId);
    
    if (storeToDelete.items_count > 0) {
      message.error(t('Delete error'));
    } else {
      const actionResult = await dispatch(deleteStore(storeId));
      if (deleteStore.fulfilled.match(actionResult)) {
        message.success(t('Delete success'));
      } else {
        message.error(t('Error message'));
      }
    }

    setIsConfirmDeleteVisible(false);
  };

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-primary-500 text-3xl font-bold">
          {t('Stores')}
        </h1>
       
        <Button type="primary" className="bg-primary" onClick={() => setIsModalVisible(true)}>
          <PlusOutlined /> {t('Store')}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert message={t('Error loading stores')} type="error" showIcon />
      ) : (
        <div className="w-full">
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
            dataSource={stores}
            renderItem={(store) => (
              <List.Item>
                <Card hoverable className="shadow-md">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{store.name}</h3>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {t('Items count')}: {store.items_count}
                      </span>
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => {
                          setDeleteStoreId(store.id);
                          setIsConfirmDeleteVisible(true);
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p>
                      <strong>{t('Location')}:</strong> {store.location}
                    </p>
                    <p>
                      <strong>{t('Owner')}:</strong> {store.owner.name}
                    </p>
                    <p>
                      <strong>{t('Phone number')}:</strong> {store.owner.phone_number}
                    </p>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      )}

      <Modal
        title={t('Add store modal title')}
        open={isModalVisible}
        onOk={handleAddStore}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t('Store name')}
            rules={[{ required: true, message: t('Please input the store name!') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="location" label={t('Store location')}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('Confirm delete title')}
        open={isConfirmDeleteVisible}
        onOk={() => handleDeleteStore(deleteStoreId)}
        onCancel={() => setIsConfirmDeleteVisible(false)}
      >
        <p>{t('Confirm delete message')}</p>
      </Modal>
    </div>
  );
};

export default Stores;
