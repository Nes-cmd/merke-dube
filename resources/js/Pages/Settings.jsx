import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, Button, Tabs, Form, Input, Table, Popconfirm, message, Radio, Divider, Modal } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  GlobalOutlined, 
  UserOutlined, 
  TeamOutlined,
  AppstoreOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const { TabPane } = Tabs;
const { TextArea } = Input;

const Settings = ({ auth, workers, isOwner, categories, shops, flash }) => {
  const { t, locale, setLocale } = useTranslation();
  const [activeTab, setActiveTab] = useState('1');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [teamMemberModalVisible, setTeamMemberModalVisible] = useState(false);
  const [shopModalVisible, setShopModalVisible] = useState(false);
  
  const teamMemberForm = useForm({
    name: '',
    phone: '',
  });
  
  const categoryForm = useForm({
    name: '',
    description: '',
  });
  
  const shopForm = useForm({
    name: '',
    location: '',
    phone: '',
    description: '',
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

  const handleAddTeamMember = () => {
    teamMemberForm.post(route('settings.add-worker'), {
      onSuccess: () => {
        setTeamMemberModalVisible(false);
        teamMemberForm.reset();
        message.success(t('Team member added successfully'));
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  };

  const handleRemoveTeamMember = (id) => {
    destroy(route('settings.remove-worker', id), {
      onSuccess: () => {
        message.success(t('Team member removed successfully'));
      },
      onError: () => {
        message.error(t('Failed to remove team member'));
      }
    });
  };
  
  const handleAddCategory = () => {
    categoryForm.post(route('settings.add-category'), {
      onSuccess: () => {
        setCategoryModalVisible(false);
        categoryForm.reset();
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  };
  
  const handleDeleteCategory = (id) => {
    destroy(route('settings.delete-category', id), {
      onSuccess: () => {
        message.success(t('Category deleted successfully'));
      },
      onError: () => {
        message.error(t('Failed to delete category'));
      }
    });
  };

  const handleLanguageChange = (e) => {
    const newLocale = e.target.value;
    setLocale(newLocale);
  };

  const handleAddShop = () => {
    shopForm.post(route('shops.store'), {
      onSuccess: () => {
        setShopModalVisible(false);
        shopForm.reset();
        message.success(t('Shop added successfully'));
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  };

  const handleDeleteShop = (id) => {
    destroy(route('settings.delete-shop', id), {
      onSuccess: () => {
        message.success(t('Shop deleted successfully'));
      },
      onError: () => {
        message.error(t('Failed to delete shop'));
      }
    });
  };

  const teamMembersColumns = [
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
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
          title={t('Are you sure you want to remove this team member?')}
          onConfirm={() => handleRemoveTeamMember(record.id)}
          okText={t('Yes')}
          cancelText={t('No')}
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];
  
  const categoriesColumns = [
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      key: 'description',
      responsive: ['md'],
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title={t('Are you sure you want to delete this category?')}
          onConfirm={() => handleDeleteCategory(record.id)}
          okText={t('Yes')}
          cancelText={t('No')}
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  // Define columns for the shops table
  const shopsColumns = [
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a href={route('shops.show', record.id)}>{text}</a>
      ),
    },
    {
      title: t('Location'),
      dataIndex: 'location',
      key: 'location',
      responsive: ['md'],
    },
    {
      title: t('Phone'),
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['lg'],
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title={t('Are you sure you want to delete this shop?')}
          onConfirm={() => handleDeleteShop(record.id)}
          okText={t('Yes')}
          cancelText={t('No')}
          okButtonProps={{ danger: true }}
        >
          <Button 
            danger
            icon={<DeleteOutlined />}
            size="small"
          >
            {t('Delete')}
          </Button>
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
                    <div className="mb-4">
                      <div className="text-lg font-medium mb-2">{t('Select Language')}</div>
                      <Radio.Group value={locale} onChange={handleLanguageChange}>
                        <Radio.Button value="en">English</Radio.Button>
                        <Radio.Button value="am">አማርኛ</Radio.Button>
                      </Radio.Group>
                    </div>
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
                <Card title={t('Profile Information')} className="mb-6">
                  <div className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center mb-4">
                      <div className="font-medium w-32 mb-2 md:mb-0">{t('Name')}:</div>
                      <div>{auth.user.name}</div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center mb-4">
                      <div className="font-medium w-32 mb-2 md:mb-0">{t('Email')}:</div>
                      <div>{auth.user.email}</div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="font-medium w-32 mb-2 md:mb-0">{t('Phone')}:</div>
                      <div>{auth.user.phone_number || t('Not provided')}</div>
                    </div>
                  </div>
                </Card>
              </TabPane>
              
              {isOwner && (
                <TabPane 
                  tab={
                    <span className="flex items-center">
                      <TeamOutlined className={tabPosition === 'top' ? 'mr-1' : 'mr-2'} />
                      <span className={tabPosition === 'top' ? 'hidden sm:inline' : ''}>{t('Team')}</span>
                    </span>
                  } 
                  key="3"
                >
                  <Card 
                    title={t('Team Members')} 
                    className="mb-6"
                    extra={
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setTeamMemberModalVisible(true)}
                        className="bg-primary-500"
                      >
                        {t('Team')}
                      </Button>
                    }
                  >
                    <div className="overflow-x-auto">
                      <Table 
                        dataSource={workers} 
                        columns={teamMembersColumns} 
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                      />
                    </div>
                  </Card>
                </TabPane>
              )}
              
              <TabPane 
                tab={
                  <span className="flex items-center">
                    <AppstoreOutlined className={tabPosition === 'top' ? 'mr-1' : 'mr-2'} />
                    <span className={tabPosition === 'top' ? 'hidden sm:inline' : ''}>{t('Categories')}</span>
                  </span>
                } 
                key="4"
              >
                <Card 
                  title={t('Manage Categories')} 
                  className="mb-6"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setCategoryModalVisible(true)}
                      className="bg-primary-500"
                    >
                      {t('Add Category')}
                    </Button>
                  }
                >
                  <div className="overflow-x-auto">
                    <Table 
                      dataSource={categories} 
                      columns={categoriesColumns} 
                      rowKey="id"
                      pagination={false}
                      scroll={{ x: 'max-content' }}
                    />
                  </div>
                </Card>
              </TabPane>
              
              {/* Shops Tab */}
              <TabPane 
                tab={
                  <span className="tab-label">
                    <ShopOutlined />
                    {windowWidth >= 768 && <span className="ml-2">{t('Shops')}</span>}
                  </span>
                }
                key="5"
              >
                <Card 
                  title={t('Shops')} 
                  className="mb-6"
                  extra={
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={() => setShopModalVisible(true)}
                      className="bg-primary-500"
                    >
                      {t('Shop')}
                    </Button>
                  }
                >
                  <div className="overflow-x-auto">
                    <Table 
                      dataSource={shops} 
                      columns={shopsColumns} 
                      rowKey="id"
                      pagination={false}
                      scroll={{ x: 'max-content' }}
                    />
                  </div>
                </Card>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Add Category Modal */}
      <Modal
        title={t('Add New Category')}
        open={categoryModalVisible}
        onOk={handleAddCategory}
        onCancel={() => {
          setCategoryModalVisible(false);
          categoryForm.reset();
        }}
        confirmLoading={categoryForm.processing}
      >
        <Form layout="vertical">
          <Form.Item
            label={t('Category Name')}
            validateStatus={categoryForm.errors.name ? 'error' : ''}
            help={categoryForm.errors.name}
            required
          >
            <Input 
              value={categoryForm.data.name}
              onChange={e => categoryForm.setData('name', e.target.value)}
              placeholder={t('Enter category name')}
            />
          </Form.Item>
          <Form.Item 
            label={t('Description')}
            validateStatus={categoryForm.errors.description ? 'error' : ''}
            help={categoryForm.errors.description}
          >
            <TextArea 
              value={categoryForm.data.description}
              onChange={e => categoryForm.setData('description', e.target.value)}
              placeholder={t('Enter category description (optional)')}
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Add Team Member Modal */}
      <Modal
        title={t('Add New Team Member')}
        open={teamMemberModalVisible}
        onOk={handleAddTeamMember}
        onCancel={() => {
          setTeamMemberModalVisible(false);
          teamMemberForm.reset();
        }}
        confirmLoading={teamMemberForm.processing}
      >
        <Form layout="vertical">
          <Form.Item
            label={t('Name')}
            validateStatus={teamMemberForm.errors.name ? 'error' : ''}
            help={teamMemberForm.errors.name}
            required
          >
            <Input 
              value={teamMemberForm.data.name}
              onChange={e => teamMemberForm.setData('name', e.target.value)}
              placeholder={t('Enter team member name')}
            />
          </Form.Item>
          <Form.Item 
            label={t('Phone Number')}
            validateStatus={teamMemberForm.errors.phone ? 'error' : ''}
            help={teamMemberForm.errors.phone}
            required
          >
            <Input 
              value={teamMemberForm.data.phone}
              onChange={e => teamMemberForm.setData('phone', e.target.value)}
              placeholder={t('Enter phone number')}
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Add Shop Modal */}
      <Modal
        title={t('Add New Shop')}
        open={shopModalVisible}
        onOk={handleAddShop}
        onCancel={() => {
          setShopModalVisible(false);
          shopForm.reset();
        }}
        confirmLoading={shopForm.processing}
      >
        <Form layout="vertical">
          <Form.Item
            label={t('Shop Name')}
            validateStatus={shopForm.errors.name ? 'error' : ''}
            help={shopForm.errors.name}
            required
          >
            <Input 
              value={shopForm.data.name}
              onChange={e => shopForm.setData('name', e.target.value)}
              placeholder={t('Enter shop name')}
            />
          </Form.Item>
          <Form.Item 
            label={t('Location')}
            validateStatus={shopForm.errors.location ? 'error' : ''}
            help={shopForm.errors.location}
          >
            <Input 
              value={shopForm.data.location}
              onChange={e => shopForm.setData('location', e.target.value)}
              placeholder={t('Enter shop location')}
            />
          </Form.Item>
          <Form.Item 
            label={t('Phone')}
            validateStatus={shopForm.errors.phone ? 'error' : ''}
            help={shopForm.errors.phone}
          >
            <Input 
              value={shopForm.data.phone}
              onChange={e => shopForm.setData('phone', e.target.value)}
              placeholder={t('Enter shop phone')}
            />
          </Form.Item>
          <Form.Item 
            label={t('Description')}
            validateStatus={shopForm.errors.description ? 'error' : ''}
            help={shopForm.errors.description}
          >
            <TextArea 
              value={shopForm.data.description}
              onChange={e => shopForm.setData('description', e.target.value)}
              placeholder={t('Enter shop description (optional)')}
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AuthenticatedLayout>
  );
};

export default Settings; 