// Profile.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchSubcategories } from '../../store/slices/subCategorySlice';
import { Card, Collapse } from 'antd';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import CategorySection from '../../components/Profile/CategorySection';
import SubcategorySection from '../../components/Profile/SubcategorySection';
import EmployeesSection from '../../components/Profile/EmployeesSection';
import useTranslationFallback from '../../utils/useTranslationFallback';

const Profile = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  const { subcategories } = useSelector((state) => state.subCategories);
  const user = useSelector((state) => state.auth.user);
  const { t } = useTranslationFallback();

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
    if (subcategories.length === 0) {
      dispatch(fetchSubcategories());
    }
  }, [dispatch, categories.length, subcategories.length]);

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-primary-500 text-3xl font-bold">
          {t('Profile')}
        </h1>
      </div>
      <Card className="w-full max-w-lg shadow-lg mb-4">
        <ProfileHeader />
      </Card>

      {user.is_owner && <EmployeesSection />}
      <CategorySection />
      <SubcategorySection />

    </div>
  );
};

export default Profile;
