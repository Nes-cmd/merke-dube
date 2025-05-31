import React, { useState } from 'react';
import { Button, Modal, Image, Tooltip, Badge } from 'antd';
import { 
  DeleteOutlined, 
  CheckCircleOutlined, 
  StarOutlined, 
  StarFilled,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useTranslation } from '@/Contexts/I18nContext';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Image Item
const SortableItem = ({ image, onDelete, onSetPrimary, canEdit }) => {
  const { t } = useTranslation();
  const [hover, setHover] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: image.id.toString(),
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative rounded-md overflow-hidden border ${image.is_primary ? 'border-2 border-blue-500' : 'border-gray-200'}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="h-48 overflow-hidden">
        <Image 
          src={`/storage/${image.image_path}`}
          alt="Product"
          className="object-cover w-full h-full"
          preview={false}
        />
      </div>
      
      {image.is_primary && (
        <Badge 
          count={<StarFilled style={{ color: '#1890ff' }} />} 
          className="absolute top-2 right-2"
        />
      )}
      
      {canEdit && hover && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 flex justify-between items-center">
          {!image.is_primary && (
            <Tooltip title={t('Set as primary')}>
              <Button 
                type="text" 
                icon={<StarOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  onSetPrimary(image.id);
                }}
                className="text-white hover:text-yellow-400"
              />
            </Tooltip>
          )}
          <Tooltip title={t('Delete image')}>
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image.id);
              }}
              className="text-white hover:text-red-500"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

const ImageGallery = ({ images, onDelete, onSetPrimary, onReorder, canEdit = true }) => {
  const { t } = useTranslation();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handlePreview = (image, index) => {
    setPreviewImage(image.image_path);
    setCurrentIndex(index);
    setPreviewVisible(true);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.id.toString() === active.id);
      const newIndex = images.findIndex(img => img.id.toString() === over.id);
      
      const newOrder = [...images];
      const [movedItem] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, movedItem);
      
      // Update sort_order for all affected images
      const updatedImages = newOrder.map((img, index) => ({
        ...img,
        sort_order: index,
      }));
      
      onReorder(updatedImages);
    }
  };
  
  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    setPreviewImage(images[newIndex].image_path);
  };
  
  const handleNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setPreviewImage(images[newIndex].image_path);
  };
  
  if (!images || images.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-md">
        <p className="text-gray-500">{t('No images available')}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t('Product Images')}</h3>
      
      <DndContext 
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={images.map(img => img.id.toString())}
          strategy={horizontalListSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.id} onClick={() => handlePreview(image, index)}>
                <SortableItem 
                  image={image}
                  onDelete={onDelete}
                  onSetPrimary={onSetPrimary}
                  canEdit={canEdit}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <div className="relative">
          <Image 
            alt={t('Preview')} 
            src={`/storage/${previewImage}`} 
            preview={false}
            className="w-full"
          />
          
          {images.length > 1 && (
            <>
              <Button 
                type="primary" 
                shape="circle" 
                icon={<ArrowLeftOutlined />} 
                onClick={handlePrev} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
              />
              <Button 
                type="primary" 
                shape="circle" 
                icon={<ArrowRightOutlined />} 
                onClick={handleNext} 
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ImageGallery; 