import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, Descriptions, Button } from 'antd';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const ProductDetail = ({ auth, product }) => {
  const { t } = useTranslation();

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Product Details')}</h2>}
    >
      <Head title={t('Product Details')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-primary-500">{product.name}</h1>
              <Button 
                type="primary" 
                onClick={() => window.history.back()}
                className="bg-primary-500"
              >
                {t('Back')}
              </Button>
            </div>
            
            <Card className="mb-6">
              <Descriptions title={t('Product Information')} bordered>
                <Descriptions.Item label={t('Name')} span={3}>{product.name}</Descriptions.Item>
                <Descriptions.Item label={t('Quantity')}>{product.quantity}</Descriptions.Item>
                <Descriptions.Item label={t('Paid')}>{product.paid}</Descriptions.Item>
                <Descriptions.Item label={t('Credit')}>{product.credit}</Descriptions.Item>
                {product.size && (
                  <Descriptions.Item label={t('Size')}>{product.size}</Descriptions.Item>
                )}
                {product.color && (
                  <Descriptions.Item label={t('Color')}>{product.color}</Descriptions.Item>
                )}
                {product.created_at && (
                  <Descriptions.Item label={t('Created At')} span={3}>
                    {new Date(product.created_at).toLocaleString()}
                  </Descriptions.Item>
                )}
                {product.updated_at && (
                  <Descriptions.Item label={t('Updated At')} span={3}>
                    {new Date(product.updated_at).toLocaleString()}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ProductDetail; 