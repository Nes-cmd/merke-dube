import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Descriptions, Button, Popconfirm, message, Collapse, Table, Spin } from 'antd';

import { useNavigate, useParams } from 'react-router-dom';
import { deleteSale } from '../store/slices/salesSlice'; // Assuming you have a deleteSale action
import useTranslationFallback from '../utils/useTranslationFallback'; // Import the custom hook
import { fetchCreditHistories } from '../store/slices/creditHistoriesSlice'; // Import the fetch action
const { Panel } = Collapse;

const SalesDetail = () => {
  const { t } = useTranslationFallback();
  const navigate = useNavigate();
  const { id } = useParams(); // Get the sale ID from the URL params
  const dispatch = useDispatch();
  const sales = useSelector((state) => state.sales.sales);
  const user = useSelector((state) => state.auth.user);
  const { histories, loading, error } = useSelector((state) => state.creditHistories);

  // Find the specific sale from the state using the ID
  const sale = sales.find((sale) => sale.id === parseInt(id));

  useEffect(() => {
    console.log(histories)
    if (!sale) {
      navigate('/sales'); // Redirect if no sale is found
    }
    else {
      dispatch(fetchCreditHistories(`sale-credit-history/${id}`));
    }
  }, [sale, navigate]);

  // Handle delete sale
  const handleDelete = async () => {
    try {
      await dispatch(deleteSale(id)).unwrap(); // Dispatch the delete action
      message.success(t('sale.Sale deleted successfully!'));
      navigate('/sales'); // Navigate back to the sales page on success
    } catch (error) {
      message.error(t('sale.Failed to delete sale. Please try again.'));
    }
  };

  // Columns for the credit history table
  const columns = [
    { title: t('creditHistory.Date'), dataIndex: 'created_at', key: 'created_at', render: (text) => new Date(text).toLocaleDateString() },
    { title: t('creditHistory.Value'), dataIndex: 'value', key: 'value' },
    { title: t('creditHistory.Approver'), dataIndex: ['approver', 'name'], key: 'approver' },
    { title: t('creditHistory.Note'), dataIndex: 'note', key: 'note' },
  ];

  if (!sale) {
    return null; // Prevent rendering if no sale is found
  }

  return (
    <div className="container mx-auto px-4 py-2 h-min-screen">
      {sale ? (<>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-primary-500 text-3xl font-bold">
            {t('sale.Sale Details')}
          </h1>
          <Popconfirm
            title={t('sale.Are you sure you want to delete this sale?')}
            onConfirm={handleDelete}
            okText={t('sale.Yes')}
            cancelText={t('sale.No')}
          >
            {user.is_owner && <Button type="danger" className="text-danger-500">
              {t('productsPage.Delete')}
            </Button>}
          </Popconfirm>
        </div>
        <Descriptions bordered column={1}>
          <Descriptions.Item label={t('sale.Sale ID')}>{sale.id}</Descriptions.Item>
          <Descriptions.Item label={t('sale.Item Name')}>{sale.item?.name}</Descriptions.Item>
          <Descriptions.Item label={t('sale.Quantity Sold')}>{sale.quantity_sold}</Descriptions.Item>
          <Descriptions.Item label={t('sale.Sale Price')}>{sale.sale_price}</Descriptions.Item>
          <Descriptions.Item label={t('sale.Payment Status')}>{sale.payment_status}</Descriptions.Item>
          <Descriptions.Item label={t('sale.Sold At')}>{sale.sold_at}</Descriptions.Item>
          <Descriptions.Item label={t('sale.Approved By')}>{sale.approved_by?.name}</Descriptions.Item>
          <Descriptions.Item label={t('Note')}>{sale.note}</Descriptions.Item>
        </Descriptions>



        {/* Collapsible Credit History Section */}
        <Collapse className="mt-6">
          <Panel header={t('creditHistory.Credit History')} key="1">
            {loading ? (
              <Spin tip={t('creditHistory.Loading...')} />
            ) : error ? (
              <div>{t('creditHistory.Failed to load credit history')}</div>
            ) : (
              <Table
                columns={columns}
                dataSource={histories.map((history) => ({
                  ...history,
                  key: history.id, // Add key for each row
                }))}
                pagination={false}
              />
            )}
          </Panel>
        </Collapse>

      </>
      ) : (
        <div>{t('Sale not found')}</div>
      )}
    </div>
  );
};

export default SalesDetail;
