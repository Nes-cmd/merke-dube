import React from 'react';
import { Modal, Form, Input, Button, Tabs } from 'antd';
import { Link } from '@inertiajs/react';

const { TabPane } = Tabs;

export default function RegistrationModal({ isVisible, onClose }) {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    // Here you would handle registration logic
    console.log('Registration values:', values);
    onClose();
  };

  return (
    <Modal
      title="Register"
      open={isVisible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Tabs defaultActiveKey="register">
        <TabPane tab="Register" key="register">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="password_confirmation"
              label="Confirm Password"
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Register
              </Button>
            </Form.Item>
          </Form>
          <div className="text-center mt-4">
            Already have an account? <Link href={route('login')} className="text-blue-500">Log in</Link>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
} 