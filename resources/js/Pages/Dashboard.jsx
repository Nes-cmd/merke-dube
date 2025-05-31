import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, Row, Col, Statistic } from 'antd';
import { ShoppingOutlined, DollarOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/Contexts/I18nContext';

const Dashboard = ({ auth, stats }) => {
  const { t, language } = useTranslation();

  const renderStatistic = (data, icon) => {
    if (!data) return null;
    
    return (
      <Statistic
        title={data.label[language] || data.label.en}
        value={data.value}
        prefix={icon}
        suffix={data.suffix}
        precision={data.precision || 0}
      />
    );
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Dashboard')}</h2>}
    >
      <Head title={t('Dashboard')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div>
            <Row gutter={16} className="mb-6">
              <Col xs={12} sm={12} md={6} className="mb-4">
                <Card>
                  {renderStatistic(stats.products, <ShoppingOutlined />)}
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6} className="mb-4">
                <Card>
                  {renderStatistic(stats.sales, <DollarOutlined />)}
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6} className="mb-4">
                <Card>
                  {renderStatistic(stats.payable_credit, <ShopOutlined />)}
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6} className="mb-4">
                <Card>
                  {renderStatistic(stats.collectable_credit, <UserOutlined />)}
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6} className="mb-4">
                <Card>
                  {renderStatistic(stats.sales_of_last_30, <DollarOutlined />)}
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
