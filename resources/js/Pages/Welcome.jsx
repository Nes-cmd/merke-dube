import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button, Layout, Typography, Card, Row, Col, Carousel, Drawer } from 'antd';
import { useTranslation } from '@/Contexts/I18nContext';
import { MenuOutlined, LoginOutlined, HomeOutlined, GlobalOutlined } from '@ant-design/icons';

// Import components/modals
import RegistrationModal from '@/Components/RegistrationModal';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function Welcome({ auth, laravelVersion, phpVersion, canLogin, canRegister }) {
  const { t, locale, setLocale } = useTranslation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginClick = () => {
    window.location.href = route('login');
  };

  const handleHomeClick = () => {
    window.location.href = route('dashboard');
  };

  const handleLanguageChange = () => {
    setLocale(locale === 'en' ? 'am' : 'en');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleStartNowClick = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Head title="Welcome" />
      <Layout className="min-h-screen">
        {/* Desktop Header */}
        <Header className="bg-primary-500 hidden md:flex justify-between items-center h-16 px-8">
          <Link href="/">
            <Title level={3} className="text-white m-0 cursor-pointer">
              {t('guest.Suqee')}
            </Title>
          </Link>
          <div className="flex items-center space-x-4">
            <Button 
              icon={<GlobalOutlined />}
              onClick={handleLanguageChange} 
              className="btn-secondary text-sm"
              size="middle"
            >
              {locale === 'en' ? 'አማርኛ' : 'English'}
            </Button>
            
            {auth.user ? (
              <Link href={route('dashboard')}>
                <Button 
                  type="default" 
                  icon={<HomeOutlined />}
                  className="btn-secondary"
                >
                  {t('guest.Home')}
                </Button>
              </Link>
            ) : (
              <Link href={route('login')}>
                <Button 
                  type="default" 
                  icon={<LoginOutlined />}
                  className="btn-secondary"
                >
                  {t('guest.Login')}
                </Button>
              </Link>
            )}
          </div>
        </Header>

        {/* Mobile Header */}
        <Header className="bg-primary-500 md:hidden flex justify-between items-center h-16 px-4">
          <Link href="/">
            <Title level={4} className="text-white m-0">
              {t('guest.Suqee')}
            </Title>
          </Link>
          <Button 
            type="text" 
            icon={<MenuOutlined className="text-white text-xl" />} 
            onClick={toggleMobileMenu}
            className="border-none shadow-none"
          />

          {/* Mobile Menu Drawer */}
          <Drawer
            title={t('guest.Suqee')}
            placement="right"
            closable={true}
            onClose={toggleMobileMenu}
            open={mobileMenuOpen}
            width={250}
          >
            <div className="flex flex-col space-y-4">
              <Button 
                icon={<GlobalOutlined />}
                onClick={handleLanguageChange} 
                className="text-left flex items-center"
                type="text"
                block
              >
                {locale === 'en' ? 'አማርኛ' : 'English'}
              </Button>
              
              {auth.user ? (
                <Link href={route('dashboard')}>
                  <Button 
                    type="text" 
                    icon={<HomeOutlined />}
                    block
                    className="text-left flex items-center"
                  >
                    {t('guest.Home')}
                  </Button>
                </Link>
              ) : (
                <Link href={route('login')}>
                  <Button 
                    type="text" 
                    icon={<LoginOutlined />}
                    block
                    className="text-left flex items-center"
                  >
                    {t('guest.Login')}
                  </Button>
                </Link>
              )}
            </div>
          </Drawer>
        </Header>

        {/* Main Content */}
        <Content>
          {/* Hero Section */}
          <div className="bg-gradient-to-b from-primary-700 to-primary-500 text-white py-10 md:py-16 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="md:flex items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    {t('guest.Suqee')}
                  </h1>
                  <Paragraph className="text-white text-lg md:text-xl opacity-90 mb-6">
                    {t('guest.Feature 1 Description')}
                  </Paragraph>
                  <div className="flex flex-wrap gap-4">
                    {auth.user ? (
                      <Link href={route('dashboard')}>
                        <Button type="primary" size="large" className="bg-white text-primary-500 hover:bg-gray-100">
                          {t('guest.Home')}
                        </Button>
                      </Link>
                    ) : (
                      <Link href={route('login')}>
                        <Button type="primary" size="large" className="bg-white text-primary-500 hover:bg-gray-100">
                          {t('guest.Start Now')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="video-container rounded-lg overflow-hidden shadow-xl">
                    <iframe 
                      src="https://www.youtube-nocookie.com/embed/EQz--gbYZIE?si=4GKrz97VmfI7okBt" 
                      title={t('guest.YouTube video player')} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      referrerPolicy="strict-origin-when-cross-origin" 
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-12 md:py-16 px-4 md:px-8 bg-secondary-100">
            <div className="max-w-6xl mx-auto">
              <Title level={2} className="text-center mb-10 text-primary-700">
                {t('guest.Features')}
              </Title>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={24} md={8}>
                  <Card className="h-full card-hover border-0 rounded-lg">
                    <Title level={4} className="text-primary-600">
                      {t('guest.Feature 1 Title')}
                    </Title>
                    <Text className="text-secondary-600 block mb-4">
                      {t('guest.Feature 1 Description')}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <Card className="h-full card-hover border-0 rounded-lg">
                    <Title level={4} className="text-primary-600">
                      {t('guest.Feature 2 Title')}
                    </Title>
                    <Text className="text-secondary-600 block mb-4">
                      {t('guest.Feature 2 Description')}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <Card className="h-full card-hover border-0 rounded-lg">
                    <Title level={4} className="text-primary-600">
                      {t('guest.Feature 3 Title')}
                    </Title>
                    <Text className="text-secondary-600 block mb-4">
                      {t('guest.Feature 3 Description')}
                    </Text>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="py-12 md:py-16 px-4 md:px-8 bg-white">
            <div className="max-w-6xl mx-auto">
              <Title level={2} className="text-center mb-10 text-primary-700">
                {t('guest.Testimonials')}
              </Title>
              <Carousel autoplay className="px-8 md:px-12">
                <div>
                  <Card className="mx-4 md:mx-8 border-0 shadow-md py-8 px-6 text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary-500 text-xl font-bold">JD</span>
                      </div>
                      <Title level={4} className="text-primary-600">John Doe</Title>
                      <Text className="text-secondary-500 block mb-4">{t('guest.Business Owner')}</Text>
                    </div>
                    <Text className="text-secondary-700 italic text-lg">
                      "{t('guest.Testimonial 1')}"
                    </Text>
                  </Card>
                </div>
                <div>
                  <Card className="mx-4 md:mx-8 border-0 shadow-md py-8 px-6 text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary-500 text-xl font-bold">SL</span>
                      </div>
                      <Title level={4} className="text-primary-600">Sarah Lee</Title>
                      <Text className="text-secondary-500 block mb-4">{t('guest.Retail Manager')}</Text>
                    </div>
                    <Text className="text-secondary-700 italic text-lg">
                      "{t('guest.Testimonial 2')}"
                    </Text>
                  </Card>
                </div>
                <div>
                  <Card className="mx-4 md:mx-8 border-0 shadow-md py-8 px-6 text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary-500 text-xl font-bold">AA</span>
                      </div>
                      <Title level={4} className="text-primary-600">Ahmed Ali</Title>
                      <Text className="text-secondary-500 block mb-4">{t('guest.Store Owner')}</Text>
                    </div>
                    <Text className="text-secondary-700 italic text-lg">
                      "{t('guest.Testimonial 3')}"
                    </Text>
                  </Card>
                </div>
              </Carousel>
            </div>
          </div>
        </Content>

        {/* Footer */}
        <Footer className="bg-primary-800 text-white p-8">
          <div className="max-w-6xl mx-auto">
            <div className="md:flex md:justify-between mb-8">
              <div className="mb-6 md:mb-0">
                <Title level={4} className="text-white mb-4">{t('guest.Suqee')}</Title>
                <Text className="text-white opacity-80 block max-w-md">
                  {t('guest.Footer Description')}
                </Text>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white">{t('guest.Links')}</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                        {t('guest.Home')}
                      </Link>
                    </li>
                    <li>
                      <Link href={route('login')} className="text-gray-300 hover:text-white transition-colors">
                        {t('guest.Login')}
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white">{t('guest.Languages')}</h3>
                  <ul className="space-y-2">
                    <li>
                      <button 
                        onClick={() => setLocale('en')} 
                        className={`text-gray-300 hover:text-white transition-colors ${locale === 'en' ? 'font-bold text-white' : ''}`}
                      >
                        English
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setLocale('am')} 
                        className={`text-gray-300 hover:text-white transition-colors ${locale === 'am' ? 'font-bold text-white' : ''}`}
                      >
                        አማርኛ
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-600 pt-4 mt-4 text-center md:text-left md:flex md:justify-between md:items-center">
              <Text className="text-gray-300">
                {t('guest.Suqee system')} ©{new Date().getFullYear()}. {t('guest.All rights reserved.')}
              </Text>
              <div className="mt-4 md:mt-0">
                <Text className="text-gray-300">
                  Version: {laravelVersion} | PHP: {phpVersion}
                </Text>
              </div>
            </div>
          </div>
        </Footer>
      </Layout>

      {/* Registration Modal */}
      {isModalVisible && (
        <RegistrationModal isVisible={isModalVisible} onClose={handleModalClose} />
      )}
    </>
  );
}
