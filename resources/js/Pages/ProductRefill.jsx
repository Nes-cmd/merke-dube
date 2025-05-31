import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Form, Input, Button, Card, InputNumber, Select, DatePicker, message } from 'antd';
import { useTranslation } from '@/Contexts/I18nContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ProductRefill = ({ auth, item, suppliers }) => {
  const { t } = useTranslation();
  const [manufactureDateValue, setManufactureDateValue] = useState(null);
  
  const { data, setData, post, processing, errors } = useForm({
    quantity: 1,
    purchase_price: item.purchase_price || 0,
    supplier_id: item.supplier?.id || null,
    batch_number: '',
    manufacture_date: null,
    expiry_date: null,
    notes: '',
  });
  
  const handleSubmit = () => {
    post(route('products.store-refill', item.id), {
      onSuccess: () => {
        message.success(t('Product refilled successfully!'));
      }
    });
  };
  
  const handleManufactureDateChange = (date, dateString) => {
    setManufactureDateValue(date);
    setData('manufacture_date', dateString);
  };
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('Refill Product')}</h2>}
    >
      <Head title={t('Refill Product')} />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <Card title={t('Refill Product: {name}', { name: item.name })} className="mb-6">
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <p className="font-bold">{t('Current Inventory')}: {item.quantity}</p>
                <p>{t('Current Batch')}: {item.batch_number || t('N/A')}</p>
                <p>{t('Last Refill Date')}: {item.last_refill_date ? dayjs(item.last_refill_date).format('YYYY-MM-DD') : t('Never')}</p>
                <p>{t('Refill Count')}: {item.refill_count}</p>
              </div>
              
              <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item 
                  label={t('Quantity to Add')} 
                  required 
                  validateStatus={errors.quantity ? 'error' : ''}
                  help={errors.quantity}
                >
                  <InputNumber
                    min={1}
                    value={data.quantity}
                    onChange={value => setData('quantity', value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Purchase Price')} 
                  validateStatus={errors.purchase_price ? 'error' : ''}
                  help={errors.purchase_price}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    value={data.purchase_price}
                    onChange={value => setData('purchase_price', value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Supplier')}
                  validateStatus={errors.supplier_id ? 'error' : ''}
                  help={errors.supplier_id}
                >
                  <Select
                    showSearch
                    placeholder={t('Select a supplier')}
                    optionFilterProp="children"
                    value={data.supplier_id}
                    onChange={value => setData('supplier_id', value)}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    allowClear
                    style={{ width: '100%' }}
                  >
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </Option>
                    ))}
                  </Select>
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
                
                <Form.Item 
                  label={t('Manufacture Date')}
                  validateStatus={errors.manufacture_date ? 'error' : ''}
                  help={errors.manufacture_date}
                >
                  <DatePicker 
                    value={manufactureDateValue}
                    onChange={handleManufactureDateChange}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Expiry Date')}
                  validateStatus={errors.expiry_date ? 'error' : ''}
                  help={errors.expiry_date}
                >
                  <DatePicker 
                    value={data.expiry_date ? dayjs(data.expiry_date) : null}
                    onChange={(date, dateString) => setData('expiry_date', dateString)}
                    style={{ width: '100%' }}
                    disabledDate={current => {
                      // Can't select days before manufacture date
                      return manufactureDateValue && current && current < manufactureDateValue;
                    }}
                  />
                </Form.Item>
                
                <Form.Item 
                  label={t('Notes')}
                  validateStatus={errors.notes ? 'error' : ''}
                  help={errors.notes}
                >
                  <TextArea
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                    rows={4}
                    placeholder={t('Enter any additional notes')}
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={processing}
                    className="bg-primary-500"
                  >
                    {t('Refill Product')}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ProductRefill; 