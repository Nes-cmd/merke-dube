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
    Alert,
    Steps,
    Row,
    Col,
    Typography,
    Space,
    Modal
} from 'antd';
import {
    ArrowLeftOutlined,
    InboxOutlined,
    BarcodeOutlined,
    ShoppingOutlined,
    SaveOutlined,
    LeftOutlined,
    RightOutlined,
    CheckOutlined,
    PictureOutlined,
    TagOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { Title, Text } = Typography;

const ProductCreate = ({ auth, categories, warehouses, suppliers }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [fileList, setFileList] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const steps = [
        {
            title: t('Basic Info'),
            icon: <TagOutlined />
        },
        {
            title: t('Pricing'),
            icon: <DollarOutlined />
        },
        {
            title: t('Images'),
            icon: <PictureOutlined />
        }
    ];

    const { data, setData, post, processing, errors, progress } = useForm({
        name: '',
        description: '',
        category_id: null,
        store_id: null,
        supplier_id: null,
        unit_price: '',
        quantity: 1,
        cost_price: '',
        barcode: '',
        sku: '',
        images: []
    });

    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

    const handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        // Filter out files larger than 2MB
        const filteredFiles = newFileList.filter(file => {
            if (file.size && file.size > 2 * 1024 * 1024) {
                message.error(`${file.name} ${t('is too large, please use a file smaller than 2MB')}`);
                return false;
            }
            return true;
        });

        setFileList(filteredFiles);
        
        // Update form data with the file objects
        const imageFiles = filteredFiles.map(file => file.originFileObj).filter(Boolean);
        setData('images', imageFiles);
    };

    const handleStepChange = (step) => {
        setCurrentStep(step);
    };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = () => {
        post(route('products.store'), {
            onSuccess: () => {
                message.success(t('Product created successfully!'));
            },
            forceFormData: true
        });
    };

    const uploadButton = (
        <div>
            <PictureOutlined />
            <div style={{ marginTop: 8 }}>{t('Upload')}</div>
        </div>
    );

    const renderBasicInfoStep = () => (
        <Card>
            <Form layout="vertical">
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
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
                                size="large"
                                className="rounded-md"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label={t('Category')}
                            validateStatus={errors.category_id ? 'error' : ''}
                            help={errors.category_id}
                            required
                        >
                            <Select
                                value={data.category_id}
                                onChange={value => setData('category_id', value)}
                                placeholder={t('Select category')}
                                className="w-full rounded-md"
                                size="large"
                            >
                                {categories.map(category => (
                                    <Option key={category.id} value={category.id}>{category.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label={t('Store')}
                            validateStatus={errors.store_id ? 'error' : ''}
                            help={errors.store_id}
                            required
                        >
                            <Select
                                value={data.store_id}
                                onChange={value => setData('store_id', value)}
                                placeholder={t('Select store')}
                                className="w-full rounded-md"
                                size="large"
                            >
                                {warehouses.map(store => (
                                    <Option key={store.id} value={store.id}>{store.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label={t('Supplier')}
                            validateStatus={errors.supplier_id ? 'error' : ''}
                            help={errors.supplier_id}
                        >
                            <Select
                                value={data.supplier_id}
                                onChange={value => setData('supplier_id', value)}
                                placeholder={t('Select supplier (optional)')}
                                className="w-full rounded-md"
                                size="large"
                                allowClear
                            >
                                {suppliers.map(supplier => (
                                    <Option key={supplier.id} value={supplier.id}>{supplier.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24}>
                        <Form.Item 
                            label={t('Description')}
                            validateStatus={errors.description ? 'error' : ''}
                            help={errors.description}
                        >
                            <TextArea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder={t('Enter product description (optional)')}
                                rows={4}
                                className="rounded-md"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );

    const renderPricingStep = () => (
        <Card>
            <Form layout="vertical">
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label={t('Unit Price')}
                            validateStatus={errors.unit_price ? 'error' : ''}
                            help={errors.unit_price}
                            required
                        >
                            <InputNumber
                                value={data.unit_price}
                                onChange={value => setData('unit_price', value)}
                                placeholder={t('Enter unit price')}
                                min={0}
                                className="w-full rounded-md"
                                size="large"
                                formatter={value => `ETB ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/ETB\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label={t('Cost Price')}
                            validateStatus={errors.cost_price ? 'error' : ''}
                            help={errors.cost_price}
                        >
                            <InputNumber
                                value={data.cost_price}
                                onChange={value => setData('cost_price', value)}
                                placeholder={t('Enter cost price (optional)')}
                                min={0}
                                className="w-full rounded-md"
                                size="large"
                                formatter={value => `ETB ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/ETB\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label={t('Barcode')}
                            validateStatus={errors.barcode ? 'error' : ''}
                            help={errors.barcode}
                        >
                            <Input
                                value={data.barcode}
                                onChange={e => setData('barcode', e.target.value)}
                                placeholder={t('Enter barcode (optional)')}
                                prefix={<BarcodeOutlined />}
                                className="rounded-md"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label={t('SKU')}
                            validateStatus={errors.sku ? 'error' : ''}
                            help={errors.sku}
                        >
                            <Input
                                value={data.sku}
                                onChange={e => setData('sku', e.target.value)}
                                placeholder={t('Enter SKU (optional)')}
                                className="rounded-md"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item 
                            label={t('Initial Quantity')}
                            validateStatus={errors.quantity ? 'error' : ''}
                            help={errors.quantity}
                            required
                        >
                            <InputNumber
                                value={data.quantity}
                                onChange={value => setData('quantity', value)}
                                placeholder={t('Enter initial quantity')}
                                min={0}
                                className="w-full rounded-md"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );

    const renderImagesStep = () => (
        <Card>
            <Form layout="vertical">
                <Form.Item
                    label={t('Product Images')}
                    validateStatus={errors.images ? 'error' : ''}
                    help={errors.images}
                >
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleFileChange}
                        beforeUpload={() => false}
                        accept="image/*"
                        multiple
                    >
                        {fileList.length >= 8 ? null : uploadButton}
                    </Upload>
                    <Text type="secondary">
                        {t('You can upload up to 8 images. Each image should be less than 2MB.')}
                    </Text>
                </Form.Item>
            </Form>
            
            {progress && typeof progress === 'object' && progress.percentage ? (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-primary-600 h-2.5 rounded-full" 
                            style={{ width: `${progress.percentage}%` }}
                        ></div>
                    </div>
                    <Text className="text-xs mt-1">{t('Uploading')}: {progress.percentage.toFixed(0)}%</Text>
                </div>
            ) : null}
        </Card>
    );

    const stepContent = [
        renderBasicInfoStep(),
        renderPricingStep(),
        renderImagesStep()
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Create Product')}</h2>}
        >
            <Head title={t('Create Product')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6 flex justify-between items-center">
                            <div className="flex items-center">
                                <Link href={route('products.index')} className="mr-4">
                                    <Button icon={<ArrowLeftOutlined />}>{t('Back to Products')}</Button>
                                </Link>
                                <Title level={4} className="m-0">{t('Add New Product')}</Title>
                            </div>
                        </div>

                        <Steps
                            current={currentStep}
                            onChange={handleStepChange}
                            className="mb-8"
                            responsive
                        >
                            {steps.map(item => (
                                <Step key={item.title} title={item.title} icon={item.icon} />
                            ))}
                        </Steps>

                        {stepContent[currentStep]}

                        <div className="mt-6 flex justify-between">
                            <Button 
                                onClick={prevStep} 
                                disabled={currentStep === 0}
                                icon={<LeftOutlined />}
                            >
                                {t('Previous')}
                            </Button>
                            
                            <Space>
                                {currentStep < steps.length - 1 ? (
                                    <Button 
                                        type="primary" 
                                        onClick={nextStep}
                                        icon={<RightOutlined />}
                                    >
                                        {t('Next')}
                                    </Button>
                                ) : (
                                    <Button 
                                        type="primary" 
                                        onClick={handleSubmit}
                                        loading={processing}
                                        icon={<CheckOutlined />}
                                    >
                                        {t('Create Product')}
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
            
            <Modal
                open={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </AuthenticatedLayout>
    );
};

export default ProductCreate; 