import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Tag, 
  Space, 
  Tabs, 
  Table,
  Modal,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ReloadOutlined, 
  EditOutlined,
  PictureOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ImageGallery from '@/Components/ImageGallery';
import ImageUploader from '@/Components/ImageUploader';
import dayjs from 'dayjs';
import axios from 'axios';

const { TabPane } = Tabs;

const ProductDetail = ({ auth, product, refills, images }) => {
  const { t } = useTranslation();
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [productImages, setProductImages] = useState(images || []);
  
  const getStatusTag = (status) => {
    if (!status) return null;
    
    const colorMap = {
      completed: 'green',
      pending: 'orange',
      expired: 'red',
      expiring_soon: 'gold',
    };
    
    const textMap = {
      completed: t('Completed'),
      pending: t('Pending'),
      expired: t('Expired'),
      expiring_soon: t('Expiring Soon'),
    };
    
    return <Tag color={colorMap[status.toLowerCase()]}>{textMap[status.toLowerCase()]}</Tag>;
  };
  
  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(route('products.delete-image', [product.id, imageId]));
      
      setProductImages(prevImages => prevImages.filter(img => img.id !== imageId));
      message.success(t('Image deleted successfully'));
    } catch (error) {
      console.error('Delete failed:', error);
      message.error(t('Failed to delete image'));
    }
  };
  
  const handleSetPrimaryImage = async (imageId) => {
    try {
      await axios.post(route('products.set-primary-image', [product.id, imageId]));
      
      // Update local state to reflect the change
      setProductImages(prevImages => 
        prevImages.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }))
      );
      
      message.success(t('Primary image updated'));
    } catch (error) {
      console.error('Set primary failed:', error);
      message.error(t('Failed to update primary image'));
    }
  };
  
  const handleReorderImages = async (updatedImages) => {
    try {
      await axios.post(route('products.update-image-order', product.id), {
        images: updatedImages
      });
      
      setProductImages(updatedImages);
    } catch (error) {
      console.error('Reorder failed:', error);
      message.error(t('Failed to update image order'));
    }
  };
  
  const refillColumns = [
    {
      title: t('Date'),
      dataIndex: 'created_at',
      key: 'date',
      render: date => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('Batch'),
      dataIndex: 'batch_number',
      key: 'batch',
      render: batch => batch || t('N/A'),
    },
    {
      title: t('Expiry'),
      dataIndex: 'expiry_date',
      key: 'expiry',
      render: date => date ? dayjs(date).format('YYYY-MM-DD') : t('N/A'),
    },
    {
      title: t('Supplier'),
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      render: (text, record) => record.supplier ? record.supplier.name : t('N/A'),
    },
    {
      title: t('Notes'),
      dataIndex: 'notes',
      key: 'notes',
      render: notes => notes || t('N/A'),
    },
  ];
  
  // Calculate expiry status
  const expiryStatus = product.expiry_date ? (
    dayjs(product.expiry_date).isBefore(dayjs()) ? 'expired' :
    dayjs(product.expiry_date).isBefore(dayjs().add(30, 'day')) ? 'expiring_soon' : null
  ) : null;
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Product Details')}</h2>}
    >
      <Head title={t('Product Details')} />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="mb-6 flex justify-between items-center">
              <Link href={route('products.index')}>
                <Button icon={<ArrowLeftOutlined />}>{t('Back to Products')}</Button>
              </Link>
              
              <Space>
                <Link href={route('products.refill', product.id)}>
                  <Button type="primary" icon={<ReloadOutlined />}>
                    {t('Refill Stock')}
                  </Button>
                </Link>
                <Button 
                  type="primary" 
                  icon={<PictureOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                >
                  {t('Manage Images')}
                </Button>
                <Link href={route('products.edit', product.id)}>
                  <Button type="default" icon={<EditOutlined />}>
                    {t('Edit')}
                  </Button>
                </Link>
              </Space>
            </div>
            
            <Card title={product.name} className="mb-6">
              <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label={t('ID')}>{product.id}</Descriptions.Item>
                <Descriptions.Item label={t('SKU')}>{product.sku || t('N/A')}</Descriptions.Item>
                <Descriptions.Item label={t('Barcode')}>{product.barcode || t('N/A')}</Descriptions.Item>
                <Descriptions.Item label={t('Quantity')}>{product.quantity}</Descriptions.Item>
                <Descriptions.Item label={t('Unit Price')}>
                  {parseFloat(product.unit_price).toFixed(2)}
                </Descriptions.Item>
                
                <Descriptions.Item label={t('Category')}>
                  {product.category ? product.category.name : t('Uncategorized')}
                </Descriptions.Item>
                <Descriptions.Item label={t('Warehouse')}>
                  {product.store ? product.store.name : t('N/A')}
                </Descriptions.Item>
                <Descriptions.Item label={t('Supplier')}>
                  {product.supplier ? product.supplier.name : t('N/A')}
                </Descriptions.Item>
                <Descriptions.Item label={t('Batch Number')}>
                  {product.batch_number || t('N/A')}
                </Descriptions.Item>
                <Descriptions.Item label={t('Manufacture Date')}>
                  {product.manufacture_date ? dayjs(product.manufacture_date).format('YYYY-MM-DD') : t('N/A')}
                </Descriptions.Item>
                <Descriptions.Item label={t('Expiry Date')}>
                  <Space>
                    {product.expiry_date ? dayjs(product.expiry_date).format('YYYY-MM-DD') : t('N/A')}
                    {expiryStatus && getStatusTag(expiryStatus)}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label={t('Refill Count')} span={2}>
                  {product.refill_count}
                </Descriptions.Item>
                <Descriptions.Item label={t('Last Refill')}>
                  {product.last_refill_date ? dayjs(product.last_refill_date).format('YYYY-MM-DD') : t('Never')}
                </Descriptions.Item>
                <Descriptions.Item label={t('Description')} span={3}>
                  {product.description || t('No description provided')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            
            <Tabs defaultActiveKey="1">
              <TabPane tab={t('Images')} key="1">
                <ImageGallery 
                  images={productImages}
                  onDelete={handleDeleteImage}
                  onSetPrimary={handleSetPrimaryImage}
                  onReorder={handleReorderImages}
                />
              </TabPane>
              <TabPane tab={t('Refill History')} key="2">
                <Table 
                  columns={refillColumns} 
                  dataSource={refills} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              <TabPane tab={t('Inventory Movement')} key="3">
                <p>{t('Coming soon')}</p>
              </TabPane>
            </Tabs>
            
            <Modal
              title={t('Upload Product Images')}
              open={uploadModalVisible}
              onCancel={() => setUploadModalVisible(false)}
              footer={null}
              width={800}
            >
              <ImageUploader 
                itemId={product.id}
                onSuccess={(newImages) => {
                  setProductImages(prevImages => [...prevImages, ...newImages]);
                }}
              />
            </Modal>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ProductDetail; 