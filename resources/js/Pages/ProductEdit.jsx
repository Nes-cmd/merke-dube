import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  InputNumber, 
  Select, 
  DatePicker, 
  Divider,
  message,
  Space,
  Modal,
  Tabs
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  BarcodeOutlined,
  ShoppingOutlined,
  PictureOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';
import ImageGallery from '@/Components/ImageGallery';
import ImageUploader from '@/Components/ImageUploader';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ProductEdit = ({ auth, product, categories, warehouses, suppliers, images }) => {
  const { t } = useTranslation();
  const [productImages, setProductImages] = useState(images || []);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [manufactureDateValue, setManufactureDateValue] = useState(
    product.manufacture_date ? dayjs(product.manufacture_date) : null
  );
  const [expiryDateValue, setExpiryDateValue] = useState(
    product.expiry_date ? dayjs(product.expiry_date) : null
  );
  
  const { data, setData, put, processing, errors } = useForm({
    name: product.name || '',
    remark: product.remark || '',
    quantity: product.quantity || 0,
    unit_price: product.unit_price || 0,
    category_id: product.category_id || '',
    store_id: product.store_id || '',
    supplier_id: product.supplier_id || '',
    sku: product.sku || '',
    code: product.code || '',
    batch_number: product.batch_number || '',
    manufacture_date: product.manufacture_date || null,
    expiry_date: product.expiry_date || null,
  });
  
  const handleSubmit = () => {
    put(route('products.update', product.id), {
      onSuccess: () => {
        message.success(t('Product updated successfully!'));
      }
    });
  };
  
  const handleManufactureDateChange = (date, dateString) => {
    setManufactureDateValue(date);
    setData('manufacture_date', dateString);
  };
  
  const handleExpiryDateChange = (date, dateString) => {
    setExpiryDateValue(date);
    setData('expiry_date', dateString);
  };
  
  const handleImageDelete = (imageId) => {
    if (window.confirm(t('Are you sure you want to delete this image?'))) {
      axios.delete(route('products.delete-image', [product.id, imageId]))
        .then(response => {
          message.success(t('Image deleted successfully'));
          setProductImages(productImages.filter(img => img.id !== imageId));
        })
        .catch(error => {
          console.error('Error deleting image:', error);
          message.error(t('Failed to delete image'));
        });
    }
  };
  
  const handleSetPrimary = (imageId) => {
    axios.post(route('products.set-primary-image', [product.id, imageId]))
      .then(response => {
        message.success(t('Primary image updated'));
        // Update the local state to reflect the change
        setProductImages(prevImages => prevImages.map(img => ({
          ...img,
          is_primary: img.id === imageId
        })));
      })
      .catch(error => {
        console.error('Error setting primary image:', error);
        message.error(t('Failed to update primary image'));
      });
  };
  
  const handleImageOrderChange = (newOrder) => {
    axios.post(route('products.update-image-order', product.id), {
      order: newOrder
    })
      .then(response => {
        message.success(t('Image order updated'));
      })
      .catch(error => {
        console.error('Error updating image order:', error);
        message.error(t('Failed to update image order'));
      });
  };
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Edit Product')}</h2>}
    >
      <Head title={t('Edit Product')} />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="mb-6 flex justify-between items-center">
              <Link href={route('products.show', product.id)}>
                <Button icon={<ArrowLeftOutlined />}>{t('Back to Product')}</Button>
              </Link>
              
              <Button 
                type="primary" 
                icon={<FileImageOutlined />} 
                onClick={() => setUploadModalVisible(true)}
              >
                {t('Upload Images')}
              </Button>
            </div>
            
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab={t('Basic Information')} key="basic">
                <Card>
                  <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={data}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Form.Item
                          label={t('Product Name')}
                          validateStatus={errors.name ? 'error' : ''}
                          help={errors.name}
                          required
                        >
                          <Input
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder={t('Enter product name')}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          label={t('Remarks')}
                          validateStatus={errors.remark ? 'error' : ''}
                          help={errors.remark}
                        >
                          <TextArea
                            value={data.remark}
                            onChange={e => setData('remark', e.target.value)}
                            rows={3}
                            placeholder={t('Enter product remarks')}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          label={t('Category')}
                          validateStatus={errors.category_id ? 'error' : ''}
                          help={errors.category_id}
                        >
                          <Select
                            value={data.category_id}
                            onChange={value => setData('category_id', value)}
                            placeholder={t('Select category')}
                          >
                            <Option value="">{t('None')}</Option>
                            {categories.map(category => (
                              <Option key={category.id} value={category.id}>
                                {category.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        
                        <Form.Item
                          label={t('Warehouse')}
                          validateStatus={errors.store_id ? 'error' : ''}
                          help={errors.store_id}
                          required
                        >
                          <Select
                            value={data.store_id}
                            onChange={value => setData('store_id', value)}
                            placeholder={t('Select warehouse')}
                          >
                            {warehouses.map(warehouse => (
                              <Option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                      
                      <div>
                        <Form.Item
                          label={t('Quantity')}
                          validateStatus={errors.quantity ? 'error' : ''}
                          help={errors.quantity}
                        >
                          <InputNumber
                            min={0}
                            value={data.quantity}
                            onChange={value => setData('quantity', value)}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          label={t('Unit Price')}
                          validateStatus={errors.unit_price ? 'error' : ''}
                          help={errors.unit_price}
                        >
                          <InputNumber
                            min={0}
                            step={0.01}
                            value={data.unit_price}
                            onChange={value => setData('unit_price', value)}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          label={t('Supplier')}
                          validateStatus={errors.supplier_id ? 'error' : ''}
                          help={errors.supplier_id}
                        >
                          <Select
                            value={data.supplier_id}
                            onChange={value => setData('supplier_id', value)}
                            placeholder={t('Select supplier')}
                          >
                            <Option value="">{t('None')}</Option>
                            {suppliers.map(supplier => (
                              <Option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                    
                    <Divider />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Form.Item
                          label={t('SKU')}
                          validateStatus={errors.sku ? 'error' : ''}
                          help={errors.sku}
                        >
                          <Input
                            value={data.sku}
                            onChange={e => setData('sku', e.target.value)}
                            placeholder={t('Enter SKU')}
                            prefix={<BarcodeOutlined />}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          label={t('Batch Number')}
                          validateStatus={errors.batch_number ? 'error' : ''}
                          help={errors.batch_number}
                        >
                          <Input
                            value={data.batch_number}
                            onChange={e => setData('batch_number', e.target.value)}
                            placeholder={t('Enter batch number')}
                          />
                        </Form.Item>
                      </div>
                      
                      <div>
                        <Form.Item
                          label={t('Code')}
                          validateStatus={errors.code ? 'error' : ''}
                          help={errors.code}
                        >
                          <Input
                            value={data.code}
                            onChange={e => setData('code', e.target.value)}
                            placeholder={t('Enter code')}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          label={t('Manufacture Date')}
                          validateStatus={errors.manufacture_date ? 'error' : ''}
                          help={errors.manufacture_date}
                        >
                          <DatePicker
                            style={{ width: '100%' }}
                            value={manufactureDateValue}
                            onChange={handleManufactureDateChange}
                            placeholder={t('Select manufacture date')}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          label={t('Expiry Date')}
                          validateStatus={errors.expiry_date ? 'error' : ''}
                          help={errors.expiry_date}
                        >
                          <DatePicker
                            style={{ width: '100%' }}
                            value={expiryDateValue}
                            onChange={handleExpiryDateChange}
                            placeholder={t('Select expiry date')}
                            disabledDate={current => {
                              // Can't select days before manufacture date
                              return manufactureDateValue && current && current < manufactureDateValue;
                            }}
                          />
                        </Form.Item>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={processing}
                        className="bg-primary-500"
                      >
                        {t('Save Changes')}
                      </Button>
                    </div>
                  </Form>
                </Card>
              </TabPane>
              
              <TabPane tab={t('Images')} key="images">
                <Card>
                  <div className="mb-4">
                    <Button 
                      type="primary" 
                      icon={<PictureOutlined />} 
                      onClick={() => setUploadModalVisible(true)}
                    >
                      {t('Upload New Images')}
                    </Button>
                  </div>
                  
                  <ImageGallery 
                    images={productImages} 
                    onDelete={handleImageDelete}
                    onSetPrimary={handleSetPrimary}
                    onOrderChange={handleImageOrderChange}
                    canEdit={true}
                  />
                </Card>
              </TabPane>
            </Tabs>
            
            {/* Image Upload Modal */}
            <Modal
              title={t('Upload Images')}
              open={uploadModalVisible}
              onCancel={() => setUploadModalVisible(false)}
              footer={null}
              width={800}
            >
              <ImageUploader 
                itemId={product.id}
                onSuccess={(newImages) => {
                  setProductImages(prevImages => [...prevImages, ...newImages]);
                  setUploadModalVisible(false);
                }}
              />
            </Modal>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ProductEdit; 