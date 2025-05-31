import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    Form,
    Input,
    Button,
    Card,
    InputNumber,
    Select,
    DatePicker,
    Upload,
    Divider,
    message,
    Tabs,
    Alert
} from 'antd';
import {
    ArrowLeftOutlined,
    InboxOutlined,
    BarcodeOutlined,
    ShoppingOutlined,
    SaveOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ProductCreate = ({ auth, categories, warehouses, suppliers }) => {
    const { t } = useTranslation();
    const [manufactureDateValue, setManufactureDateValue] = useState(null);
    const [imageFileList, setImageFileList] = useState([]);
    const [activeTab, setActiveTab] = useState('basic');
    const [formErrors, setFormErrors] = useState({});

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        remark: '',
        quantity: 1,
        unit_price: 0,
        category_id: '',
        store_id: '',
        supplier_id: '',
        sku: '',
        batch_number: '',
        code: '',
        manufacture_date: null,
        expiry_date: null,
    });

    const handleSubmit = () => {
        // Validate form
        const validationErrors = {};
        if (!data.name) validationErrors.name = t('Product name is required');
        if (!data.store_id) validationErrors.store_id = t('Warehouse is required');
        
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }
        
        // Create FormData object
        const formData = new FormData();
        
        // Add all form fields to FormData
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        
        // Add image files with proper naming
        if (imageFileList && imageFileList.length > 0) {
            imageFileList.forEach((file, index) => {
                if (file.originFileObj) {
                    // Use images[] to ensure Laravel correctly processes the array of files
                    formData.append(`images[]`, file.originFileObj);
                }
            });
        }
        
        // Use post with the FormData and proper options
        post(route('products.store'), formData, {
            forceFormData: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onSuccess: () => {
                message.success(t('Product created successfully!'));
                // Redirect to products list
                window.location.href = route('products.index');
            },
            onError: (errors) => {
                setFormErrors(errors);
                message.error(t('Please correct the errors in the form'));
                // Switch to basic tab if there are errors there
                if (errors.name || errors.remark || errors.category_id || 
                    errors.store_id || errors.quantity || errors.unit_price || 
                    errors.supplier_id) {
                    setActiveTab('basic');
                }
            }
        });
    };

    const handleManufactureDateChange = (date, dateString) => {
        setManufactureDateValue(date);
        setData('manufacture_date', dateString);
    };

    const handleImageChange = ({ fileList }) => {
        // Filter out files larger than 2MB
        const filteredFileList = fileList.filter(file => {
            if (file.size && file.size > 2 * 1024 * 1024) {
                message.error(`${file.name} ${t('is too large, maximum size is 2MB')}`);
                return false;
            }
            return true;
        });

        setImageFileList(filteredFileList);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Create New Product')}</h2>}
        >
            <Head title={t('Create Product')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6">
                            <Link href={route('products.index')}>
                                <Button icon={<ArrowLeftOutlined />}>{t('Back to Products')}</Button>
                            </Link>
                        </div>

                        {Object.keys(formErrors).length > 0 && (
                            <Alert
                                message={t('Please fix the following errors')}
                                type="error"
                                showIcon
                                className="mb-4"
                                description={
                                    <ul>
                                        {Object.entries(formErrors).map(([field, error]) => (
                                            <li key={field}>{error}</li>
                                        ))}
                                    </ul>
                                }
                            />
                        )}

                        <Card>
                            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                                <TabPane tab={t('Basic Information')} key="basic">
                                    <Form
                                        layout="vertical"
                                        initialValues={data}
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Form.Item
                                                    label={t('Product Name')}
                                                    validateStatus={(errors.name || formErrors.name) ? 'error' : ''}
                                                    help={errors.name || formErrors.name}
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
                                                    validateStatus={(errors.store_id || formErrors.store_id) ? 'error' : ''}
                                                    help={errors.store_id || formErrors.store_id}
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
                                    </Form>
                                </TabPane>

                                <TabPane tab={t('Additional Details')} key="details">
                                    <Form layout="vertical" initialValues={data}>
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
                                                        value={data.expiry_date ? dayjs(data.expiry_date) : null}
                                                        onChange={(date, dateString) => setData('expiry_date', dateString)}
                                                        placeholder={t('Select expiry date')}
                                                        disabledDate={current => {
                                                            // Can't select days before manufacture date
                                                            return manufactureDateValue && current && current < manufactureDateValue;
                                                        }}
                                                    />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    </Form>
                                </TabPane>

                                <TabPane tab={t('Images')} key="images">
                                    <Form layout="vertical">
                                        <Form.Item
                                            label={t('Product Images')}
                                            validateStatus={errors.images ? 'error' : ''}
                                            help={errors.images}
                                        >
                                            <Upload.Dragger
                                                name="images[]"
                                                fileList={imageFileList}
                                                onChange={handleImageChange}
                                                beforeUpload={() => false}
                                                multiple
                                                accept="image/*"
                                                listType="picture"
                                                maxCount={8}
                                            >
                                                <p className="ant-upload-drag-icon">
                                                    <InboxOutlined />
                                                </p>
                                                <p className="ant-upload-text">{t('Click or drag files to upload')}</p>
                                                <p className="ant-upload-hint">
                                                    {t('Support for a single or bulk upload. Maximum 8 images, 2MB each.')}
                                                </p>
                                            </Upload.Dragger>
                                        </Form.Item>
                                    </Form>
                                </TabPane>
                            </Tabs>

                            <Divider />

                            <div className="flex justify-end">
                                <Button
                                    type="primary"
                                    onClick={handleSubmit}
                                    loading={processing}
                                    icon={<SaveOutlined />}
                                    className="bg-primary-500"
                                >
                                    {t('Create Product')}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ProductCreate; 