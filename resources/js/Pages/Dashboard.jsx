import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, Statistic, Row, Col, Spin } from 'antd';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const Dashboard = ({ auth, dashboardData }) => {
  const { t, locale } = useTranslation();
  const language = locale; // Using locale from i18n context
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('home.Dashboard')}</h2>}
    >
      <Head title={t('home.Dashboard')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-primary-500 text-3xl font-bold">
                {t('home.Dashboard')}
              </h1>
            </div>

            {!dashboardData ? (
              <div className="flex justify-center items-center">
                <Spin size="large" />
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {/* Total Products */}
                <Col xs={12} sm={12}>
                  <a href="/products" className="no-underline">
                    <Card className="shadow-md relative flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                      <Statistic
                        title={<span className="text-lg font-semibold text-primary-900">{dashboardData.products?.label[language]}</span>}
                        value={dashboardData.products?.value}
                        valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                        className="text-center"
                      />
                      <p className="text-sm text-gray-500 mb-2 text-center">{dashboardData.products?.description[language]}</p>
                      {/* Static Graph */}
                      <div className="absolute bottom-0 left-0 w-full">
                        <svg viewBox="0 0 100 30" className="w-full h-12">
                          <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{ stopColor: 'rgba(63,134,0,0.3)', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: 'rgba(63,134,0,0)', stopOpacity: 0 }} />
                            </linearGradient>
                          </defs>
                          <path d="M0,25 Q30,15 60,20 T100,10" fill="none" stroke="#3f8600" strokeWidth="2" />
                          <path d="M0,30 Q30,20 60,25 T100,15" fill="url(#grad1)" stroke="none" />
                        </svg>
                      </div>
                    </Card>
                  </a>
                </Col>

                {/* Total Sales */}
                <Col xs={12} sm={12}>
                  <a href="/sales" className="no-underline">
                    <Card className="shadow-md relative flex flex-col h-full">
                      <Statistic
                        title={<span className="text-lg font-semibold text-primary-900">{dashboardData.sales?.label[language]}</span>}
                        value={(dashboardData.sales?.value)}
                        valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                        className="text-center"
                      />
                      <p className="text-sm text-gray-500 mb-2 text-center">{dashboardData.sales?.description[language]}</p>
                      {/* Static Graph */}
                      <div className="absolute bottom-0 left-0 w-full">
                        <svg viewBox="0 0 100 30" className="w-full h-12">
                          <defs>
                            <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{ stopColor: 'rgba(63,134,0,0.3)', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: 'rgba(63,134,0,0)', stopOpacity: 0 }} />
                            </linearGradient>
                          </defs>
                          <path d="M0,25 Q25,10 50,12 T100,8" fill="none" stroke="#3f8600" strokeWidth="2" />
                          <path d="M0,30 Q25,15 50,17 T100,10" fill="url(#grad2)" stroke="none" />
                        </svg>
                      </div>
                    </Card>
                  </a>
                </Col>

                {/* Total payable credits */}
                <Col xs={12} sm={12}>
                  <a href="#" className="no-underline">
                    <Card className="shadow-md relative flex flex-col h-full">
                      <Statistic
                        title={<span className="text-lg font-semibold text-primary-900">{dashboardData.collectable_credit?.label[language]}</span>}
                        value={dashboardData.collectable_credit?.value}
                        precision={2}
                        valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                        className="text-center"
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center">{dashboardData.collectable_credit?.description[language]}</p>
                      {/* Static Graph */}
                      <div className="absolute bottom-0 left-0 w-full">
                        <svg viewBox="0 0 100 30" className="w-full h-12">
                          <defs>
                            <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{ stopColor: 'rgba(63,134,0,0.3)', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: 'rgba(63,134,0,0)', stopOpacity: 0 }} />
                            </linearGradient>
                          </defs>
                          <path d="M0,25 Q25,10 50,12 T100,8" fill="none" stroke="#3f8600" strokeWidth="2" />
                          <path d="M0,30 Q25,15 50,17 T100,10" fill="url(#grad2)" stroke="none" />
                        </svg>
                      </div>
                    </Card>
                  </a>
                </Col>

                {/* Sales of last 30 days */}
                <Col xs={12} sm={12}>
                  <a href="#" className="no-underline">
                    <Card className="shadow-md relative flex flex-col h-full">
                      <Statistic
                        title={<span className="text-lg font-semibold text-primary-900">{dashboardData.sales_of_last_30?.label[language]}</span>}
                        value={dashboardData.sales_of_last_30?.value}
                        valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                        className="text-center"
                      />
                      <p className="text-sm text-gray-500 mb-6 text-center">{dashboardData.sales_of_last_30?.description[language]}</p>
                      {/* Bar Chart */}
                      <div className="absolute bottom-4 left-0 w-full">
                        <svg viewBox="0 0 100 30" className="w-full h-12">
                          <rect x="10" y="10" width="10" height="20" fill="#ec7f14" />
                          <rect x="30" y="5" width="10" height="25" fill="#ec7f14" />
                          <rect x="50" y="15" width="10" height="15" fill="#ec7f14" />
                          <rect x="70" y="8" width="10" height="22" fill="#ec7f14" />
                          <rect x="90" y="12" width="10" height="18" fill="#ec7f14" />
                        </svg>
                      </div>
                    </Card>
                  </a>
                </Col>
              </Row>
            )}
            
            <div className="mt-8 text-center">
              <p className="text-primary-800 text-sm">{t('home.Manage your inventory with ease')}</p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
