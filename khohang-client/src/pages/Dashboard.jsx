import React, { useState } from 'react';
import './Dashboard.css';
import { FiGrid, FiDownload, FiUpload, FiClock } from 'react-icons/fi';

// Import các Tab con
import TabTongQuan from './TabTongQuan';
import TabXuatKho from './TabXuatKho';
import TabNhapKho from './TabNhapKho';

const Dashboard = () => {
    // State quản lý Tab đang hiển thị
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="dashboard-wrapper">
            {/* --- HEADER CHUNG --- */}
            <header className="db-header">
                <div className="db-title-section">
                    <h2 className="db-main-title">
                        <FiGrid style={{ marginBottom: '-3px', marginRight: '10px' }} />
                        Bảng Điều Khiển Trung Tâm
                    </h2>
                    <p className="db-subtitle">
                        <FiClock /> Cập nhật hệ thống: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </header>

            {/* --- THANH ĐIỀU HƯỚNG TAB --- */}
            <div className="db-tabs-container">
                <button
                    className={`db-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <FiGrid /> 1. Tổng Quan Tồn Kho
                </button>
                <button
                    className={`db-tab-btn ${activeTab === 'inbound' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inbound')}
                >
                    <FiDownload /> 2. Tình Hình Nhập Kho
                </button>
                <button
                    className={`db-tab-btn ${activeTab === 'outbound' ? 'active' : ''}`}
                    onClick={() => setActiveTab('outbound')}
                >
                    <FiUpload /> 3. Tình Hình Xuất Kho
                </button>
            </div>

            {/* --- KHU VỰC HIỂN THỊ NỘI DUNG THEO TAB --- */}
            <div className="db-tab-content">
                {/* Chỉ hiển thị Component tương ứng với Tab đang chọn */}
                {activeTab === 'overview' && <TabTongQuan />}
                {activeTab === 'inbound' && <TabNhapKho />}
                {activeTab === 'outbound' && <TabXuatKho />}
            </div>
        </div>
    );
};

export default Dashboard;