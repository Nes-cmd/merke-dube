import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ConfigProvider } from 'antd';
import { I18nProvider } from './Contexts/I18nContext';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        root.render(
            <I18nProvider>
                <ConfigProvider theme={{
                    token: {
                        colorPrimary: '#1890ff', // customize as needed
                    },
                }}>
                    <App {...props} />
                </ConfigProvider>
            </I18nProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
