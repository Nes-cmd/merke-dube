import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, Descriptions, Button, Divider } from 'antd';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const SaleDetail = ({ auth, sale }) => {
  const { t } = useTranslation();

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Sale Details')}</h2>}
    >
      <Head title={t('Sale Details')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-primary-500">
                {t('Sale')} #{sale.id}
              </h1>
              <Button 
                type="primary" 
                onClick={() => window.history.back()}
                className="bg-primary-500"
              >
                {t('Back')}
              </Button>
            </div>
            
            <Card className="mb-6">
              <Descriptions title={t('Sale Information')} bordered>
                <Descriptions.Item label={t('Date')} span={3}>
                  {new Date(sale.created_at).toLocaleString()}
                </Descriptions.Item>
                
                <Descriptions.Item label={t('Customer')} span={3}>
                  {sale.customer?.name || t('Walk-in customer')}
                </Descriptions.Item>
                
                <Descriptions.Item label={t('Item')}>{sale.item_name}</Descriptions.Item>
                <Descriptions.Item label={t('Quantity')}>{sale.quantity}</Descriptions.Item>
                <Descriptions.Item label={t('Unit Price')}>
                  {parseFloat(sale.total / sale.quantity).toFixed(2)}
                </Descriptions.Item>
                
                <Descriptions.Item label={t('Total')}>{parseFloat(sale.total).toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label={t('Paid')}>{parseFloat(sale.paid).toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label={t('Credit')}>{parseFloat(sale.credit).toFixed(2)}</Descriptions.Item>
                
                {sale.status && (
                  <Descriptions.Item label={t('Status')} span={3}>
                    {sale.status}
                  </Descriptions.Item>
                )}
                
                {sale.note && (
                  <Descriptions.Item label={t('Note')} span={3}>
                    {sale.note}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
            
            {sale.item && (
              <>
                <Divider orientation="left">{t('Product Information')}</Divider>
                <Card>
                  <Descriptions bordered>
                    <Descriptions.Item label={t('Product Name')} span={3}>
                      {sale.item.name}
                    </Descriptions.Item>
                    
                    {sale.item.size && (
                      <Descriptions.Item label={t('Size')}>
                        {sale.item.size}
                      </Descriptions.Item>
                    )}
                    
                    {sale.item.color && (
                      <Descriptions.Item label={t('Color')}>
                        {sale.item.color}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default SaleDetail; 