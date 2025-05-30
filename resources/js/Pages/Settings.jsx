import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, Button, Tabs, Form, Input, Table, Popconfirm, message, Radio, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, GlobalOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const { TabPane } = Tabs;

const Settings = ({ auth, workers, isOwner, flash }) => {
  const { t, locale, setLocale } = useTranslation();
  const [activeTab, setActiveTab] = useState('1');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    phone: '',
    email: '',
  });
  
  const { delete: destroy } = useForm();
  
  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  React.useEffect(() => {
    if (flash.message) {
      message.success(flash.message);
    }
    if (flash.error) {
      message.error(flash.error);
    }
  }, [flash]);

  const handleAddWorker = () => {
    post(route('settings.add-worker'), {
      onSuccess: () => {
        reset();
        message.success(t('Worker added successfully'));
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  };

  const handleRemoveWorker = (id) => {
    destroy(route('settings.remove-worker', id), {
      onSuccess: () => {
        message.success(t('Worker removed successfully'));
      },
      onError: () => {
        message.error(t('Failed to remove worker'));
      }
    });
  };

  const handleLanguageChange = (e) => {
    const newLocale = e.target.value;
    setLocale(newLocale);
  };

  const columns = [
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('Email'),
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
    },
    {
      title: t('Phone'),
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title={t('Are you sure you want to remove this worker?')}
          onConfirm={() => handleRemoveWorker(record.id)}
          okText={t('Yes')}
          cancelText={t('No')}
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  // Determine tab position based on screen width
  const tabPosition = windowWidth < 768 ? 'top' : 'left';

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Settings')}</h2>}
    >
      <Head title={t('Settings')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              tabPosition={tabPosition}
              className="settings-tabs"
            >
              <TabPane 
                tab={
                  <span className="flex items-center">
                    <GlobalOutlined className={tabPosition === 'top' ? 'mr-1' : 'mr-2'} />
                    <span className={tabPosition === 'top' ? 'hidden sm:inline' : ''}>{t('Language')}</span>
                  </span>
                } 
                key="1"
              >
                <Card title={t('Language Settings')} className="mb-6">
                  <div className="py-4">
                    <h3 className="text-lg font-medium mb-4">{t('Select Interface Language')}</h3>
                    <Radio.Group value={locale} onChange={handleLanguageChange}>
                      <Radio.Button value="en">English</Radio.Button>
                      <Radio.Button value="am">አማርኛ</Radio.Button>
                    </Radio.Group>
                  </div>
                </Card>
              </TabPane>
              
              <TabPane 
                tab={
                  <span className="flex items-center">
                    <UserOutlined className={tabPosition === 'top' ? 'mr-1' : 'mr-2'} />
                    <span className={tabPosition === 'top' ? 'hidden sm:inline' : ''}>{t('Profile')}</span>
                  </span>
                } 
                key="2"
              >
                <Card title={t('User Profile')} className="mb-6">
                  <div className="py-4">
                    <div className="flex flex-col md:flex-row items-start">
                      <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                        <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center text-gray-500">
                          <UserOutlined style={{ fontSize: '40px' }} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{auth.user.name}</h3>
                        <p className="text-gray-500">{auth.user.email}</p>
                        <p className="text-gray-500">{auth.user.phone_number}</p>
                        <p className="mt-2">
                          <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm">
                            {auth.user.is_owner ? t('Owner') : t('Employee')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabPane>
              
              {isOwner && (
                <TabPane 
                  tab={
                    <span className="flex items-center">
                      <TeamOutlined className={tabPosition === 'top' ? 'mr-1' : 'mr-2'} />
                      <span className={tabPosition === 'top' ? 'hidden sm:inline' : ''}>{t('Workers')}</span>
                    </span>
                  } 
                  key="3"
                >
                  <Card title={t('Manage Workers')} className="mb-6">
                    <div className="mb-6">
                      <Divider>{t('Add New Worker')}</Divider>
                      <Form layout="vertical" className="max-w-md">
                        <Form.Item 
                          label={t('Name')} 
                          validateStatus={errors.name ? 'error' : ''}
                          help={errors.name}
                          required
                        >
                          <Input 
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder={t('Enter worker name')}
                          />
                        </Form.Item>
                        
                        <Form.Item 
                          label={t('Phone')} 
                          validateStatus={errors.phone ? 'error' : ''}
                          help={errors.phone}
                          required
                        >
                          <Input 
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            placeholder={t('Enter worker phone number')}
                          />
                        </Form.Item>
                        
                        <Form.Item 
                          label={t('Email')} 
                          validateStatus={errors.email ? 'error' : ''}
                          help={errors.email}
                          required
                        >
                          <Input 
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder={t('Enter worker email')}
                          />
                        </Form.Item>
                        
                        <Form.Item>
                          <Button 
                            type="primary" 
                            onClick={handleAddWorker} 
                            loading={processing}
                            icon={<PlusOutlined />}
                            className="bg-primary-500"
                          >
                            {t('Add Worker')}
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>
                    
                    <Divider>{t('Current Workers')}</Divider>
                    <div className="overflow-x-auto">
                      <Table 
                        dataSource={workers} 
                        columns={columns} 
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                      />
                    </div>
                  </Card>
                </TabPane>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Settings; 