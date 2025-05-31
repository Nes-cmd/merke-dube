import React, { useState } from 'react';
import { Upload, Button, message, Modal } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import axios from 'axios';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const ImageUploader = ({ itemId, onSuccess }) => {
  const { t } = useTranslation();
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const handleCancel = () => setPreviewOpen(false);
  
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  
  const handleChange = ({ fileList: newFileList }) => {
    // Filter out files larger than 2MB
    const filteredFileList = newFileList.filter(file => {
      if (file.size && file.size > 2 * 1024 * 1024) {
        message.error(`${file.name} ${t('is too large, maximum size is 2MB')}`);
        return false;
      }
      return true;
    });
    
    setFileList(filteredFileList);
  };
  
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning(t('Please select at least one image to upload'));
      return;
    }
    
    const formData = new FormData();
    fileList.forEach((file, index) => {
      formData.append(`images[${index}]`, file.originFileObj);
    });
    
    // Set first image as primary by default
    formData.append('is_primary', 0);
    
    setUploading(true);
    
    try {
      const response = await axios.post(route('products.upload-images', itemId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFileList([]);
      message.success(t('Images uploaded successfully'));
      
      if (onSuccess) {
        onSuccess(response.data.images);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      message.error(t('Failed to upload images'));
    } finally {
      setUploading(false);
    }
  };
  
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{t('Upload')}</div>
    </div>
  );
  
  return (
    <div className="space-y-4">
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={() => false} // Prevent auto upload
        accept="image/*"
        multiple
      >
        {fileList.length >= 8 ? null : uploadButton}
      </Upload>
      
      <Button
        type="primary"
        onClick={handleUpload}
        loading={uploading}
        icon={<UploadOutlined />}
        disabled={fileList.length === 0}
      >
        {uploading ? t('Uploading') : t('Start Upload')}
      </Button>
      
      <Modal open={previewOpen} title={t('Image Preview')} footer={null} onCancel={handleCancel}>
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default ImageUploader; 