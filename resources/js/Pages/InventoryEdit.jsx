import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  InputNumber, 
  Space, 
  Descriptions,
  Divider,
  Avatar
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FileImageOutlined } from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const InventoryEdit = ({ auth, inventory }) => {
  const { t } = useTranslation();
  
  const { data, setData, post, processing, errors } = useForm({
    quantity: inventory.quantity,
  });
  
  const handleSubmit = () => {
    post(route('inventory.update', inventory.id));
  };
  
  // Get primary image if available
  const primaryImage = inventory.item.images?.find(img => img.is_primary) || inventory.item.images?.[0];
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Edit Inventory')}</h2>}
    >
      <Head title={t('Edit Inventory')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="mb-6 flex justify-between items-center">
              <Link href={route('inventory.index')}>
                <Button icon={<ArrowLeftOutlined />}>{t('Back to Inventory')}</Button>
              </Link>
            </div>
            
            <Card title={t('Edit Inventory Quantity')}>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 mb-6">
                  <Card bordered={false} className="text-center">
                    <Avatar 
                      shape="square" 
                      size={180} 
                      src={primaryImage ? `/storage/${primaryImage.image_path}` : null}
                      icon={!primaryImage && <FileImageOutlined />} 
                      className="mb-4"
                    />
                    <h3 className="text-lg font-semibold">{inventory.item.name}</h3>
                    <p className="text-gray-500">{inventory.item.sku || t('No SKU')}</p>
                  </Card>
                </div>
                
                <div className="w-full md:w-2/3">
                  <Descriptions title={t('Product Information')} bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label={t('ID')}>{inventory.item.id}</Descriptions.Item>
                    <Descriptions.Item label={t('Shop')}>{inventory.shop.name}</Descriptions.Item>
                    <Descriptions.Item label={t('Category')}>
                      {inventory.item.category ? inventory.item.category.name : t('Uncategorized')}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('Unit Price')}>
                      ETB {parseFloat(inventory.item.unit_price).toFixed(2)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('Current Quantity')} span={2}>
                      <span className="text-lg font-bold">{inventory.quantity}</span>
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <Divider />
                  
                  <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                      label={t('New Quantity')}
                      validateStatus={errors.quantity ? 'error' : ''}
                      help={errors.quantity}
                      required
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        value={data.quantity}
                        onChange={value => setData('quantity', value)}
                      />
                    </Form.Item>
                    
                    <Form.Item>
                      <Space>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={processing}
                          icon={<SaveOutlined />}
                        >
                          {t('Update Inventory')}
                        </Button>
                        <Link href={route('inventory.index')}>
                          <Button>{t('Cancel')}</Button>
                        </Link>
                      </Space>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default InventoryEdit; 