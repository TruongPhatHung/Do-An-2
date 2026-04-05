import React, { useState } from 'react';
import './Dashboard.css';
import { FiGrid, FiDownload, FiUpload } from 'react-icons/fi';

// Import các Tab con
import TabTongQuan from './TabTongQuan';
import TabXuatKho from './TabXuatKho';
import TabNhapKho from './TabNhapKho';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="dashboard-wrapper">
            <header className="db-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>📊 Bảng Điều Khiển Trung Tâm</h2>
                    <p>Theo dõi luồng luân chuyển hàng hóa toàn diện</p>
                </div>
                {/* Nút xuất báo cáo có thể đem vào từng Tab để xuất đúng nội dung tab đó */}
            </header>

            {/* THANH ĐIỀU HƯỚNG TAB */}
            <div className="db-tabs-container">
                <button
                    className={`db-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <FiGrid /> Tổng Quan Tồn Kho
                </button>
                <button
                    className={`db-tab-btn ${activeTab === 'inbound' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inbound')}
                >
                    <FiDownload /> Tình Hình Nhập Kho
                </button>
                <button
                    className={`db-tab-btn ${activeTab === 'inbound' && <TabNhapKho />} ? 'active' : ''}`}
                    onClick={() => setActiveTab('outbound')}
                >
                    <FiUpload /> Tình Hình Xuất Kho
                </button>
            </div>

            {/* KHU VỰC HIỂN THỊ NỘI DUNG */}
            <div className="db-tab-content">
                {activeTab === 'overview' && <TabTongQuan />}
                {activeTab === 'inbound' && <TabNhapKho />}
                {activeTab === 'outbound' && <TabXuatKho />}
            </div>
        </div>
    );
};

export default Dashboard;