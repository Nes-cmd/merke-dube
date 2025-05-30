import React, { useEffect } from 'react';
import { Card, Statistic, Row, Col, Progress, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getDashboardData } from '../store/slices/dashboardSlice'; // Import the action
import useTranslationFallback from '../utils/useTranslationFallback';
import { Link } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const { t } = useTranslationFallback();
  const language = useSelector((state) => state.language.language);
  const { data, loading } = useSelector((state) => state.dashboard); // Select dashboard data

  useEffect(() => {
    if (data.length == 0) {
      dispatch(getDashboardData()); // Fetch the dashboard data on component mount
    }
  }, [dispatch, data.length]);

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-primary-500 text-3xl font-bold">
          {t('home.Dashboard')}
        </h1>
      </div>

      {loading ? ( // Show a loading indicator while fetching data
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {/* Total Products */}
          <Col span={12}>
            <Link to="/products" className="no-underline">
              <Card className="shadow-md relative flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                <Statistic
                  title={<span className="text-lg font-semibold text-primary-900">{data.products?.label[language]}</span>}
                  value={data.products?.value}
                  valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                  className="text-center"
                />
                <p className="text-sm text-gray-500 mb-2 text-center">{data.products?.description[language]}</p>
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
            </Link>
          </Col>

          {/* Total Sales */}
          <Col span={12}>
            <Link to="/sales" className="no-underline">
              <Card className="shadow-md relative flex flex-col h-full">
                <Statistic
                  title={<span className="text-lg font-semibold text-primary-900">{data.sales?.label[language]}</span>}
                  value={(data.sales?.value)}
                  

                  valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                  className="text-center"
                />
                <p className="text-sm text-gray-500 mb-2 text-center">{data.sales?.description[language]}</p>
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
            </Link>
          </Col>

          {/* Total payable credits */}
          <Col span={12}>
            <Link to="" className="no-underline">
              <Card className="shadow-md relative flex flex-col h-full">
                <Statistic
                  title={<span className="text-lg font-semibold text-primary-900">{data.collectable_credit?.label[language]}</span>}
                  value={data.collectable_credit?.value}
                  precision={2}

                  valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                  className="text-center"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">{data.collectable_credit?.description[language]}</p>
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
            </Link>
          </Col>

          {/* Tsales_of_last_30*/}
          <Col span={12}>
            <Link to="" className="no-underline">
              <Card className="shadow-md relative flex flex-col h-full">
                <Statistic
                  title={<span className="text-lg font-semibold text-primary-900">{data.sales_of_last_30?.label[language]}</span>}
                  value={data.sales_of_last_30?.value}
                  

                  valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                  className="text-center"
                />
                <p className="text-sm text-gray-500 mb-6 text-center">{data.sales_of_last_30?.description[language]}</p>
                {/* Static Graph */}
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
            </Link>
          </Col>
        </Row>

      )}
      <div className="mt-8 text-center">
        <p className="text-primary-800 text-sm">{t('home.Manage your inventory with ease')}</p>
      </div>
    </div>
  );
};

export default Home;
