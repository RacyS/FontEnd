import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap'; // 1. เพิ่ม Modal ตรงนี้
import './Css/HomePageStyle.css';
import { ItemData } from '../src/controller/ItemController';
import Navbar from './components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';

const STATUS_LABEL = {
    FOUND: {
        label: 'FOUND',
        cls: 'badge--found'
    },
    UNDER_VERIFICATION: {
        label: 'Under Verify',
        cls: 'badge--verification'
    },
    CLAIM: {
        label: 'Claimed',
        cls: 'badge--claim'
    },
    READY_TO_PICKUP: {
        label: 'Ready to Pickup',
        cls: 'badge--ready'
    },
};

const HomePage = () => {
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // 2. เพิ่ม State สำหรับจัดการ Modal
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            const data = await ItemData();
            setItems(data);
            setIsLoading(false);
        };
        fetchItems();
    }, []);

    // --- กรองและเรียงข้อมูล ---
    const filteredItems = items.filter(item => {
        const isMatchSearch = item.itemName?.toLowerCase().includes(query.toLowerCase());
        const isMatchStatus = filterStatus === 'ALL' || item.itemStatus === filterStatus;
        return isMatchSearch && isMatchStatus;
    });

    const statusPriority = {
        'FOUND': 1,
        'UNDER_VERIFICATION': 2,
        'READY_TO_PICKUP': 3,
        'CLAIM': 4,
    };

    const sortedItems = [...filteredItems].sort((a, b) => {
        const priorityA = statusPriority[a.itemStatus] || 99;
        const priorityB = statusPriority[b.itemStatus] || 99;

        if (priorityA < priorityB) return -1;
        if (priorityA > priorityB) return 1;
        return 0;
    });

    // 3. นำฟังก์ชันสำหรับ Modal มาจาก DisplayItem
    const handleShow = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'FOUND': return 'bg-success text-white';
            case 'UNDER_VERIFICATION': return 'bg-danger text-white';
            case 'READY_TO_PICKUP': return 'bg-warning text-dark';
            case 'CLAIM': return 'bg-info text-white';
            default: return 'bg-secondary text-white';
        }
    };

    const renderPrettyDetail = (jsonString) => {
        if (!jsonString) return <p>-</p>;
        try {
            const cleanJson = jsonString.replace(/\\r\\n/g, '').replace(/,\s*}/g, '}');
            const details = JSON.parse(cleanJson);
            return Object.entries(details).map(([key, value]) => (
                <div key={key} className="mb-2">
                    <strong style={{ color: '#007bff', textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')} :
                    </strong>
                    <span className="ms-2">{value}</span>
                </div>
            ));
        } catch (e) {
            return <p>{jsonString}</p>;
        }
    };

    return (
        <div className="hp-root">
            <Navbar />

            {/* ── Hero / Search ── */}
            <section className="hp-hero">
                <div className="hp-hero-inner">
                    <p className="hp-hero-eyebrow">Lost &amp; Found System</p>
                    <h1 className="hp-hero-title">ค้นหาของหายของคุณ</h1>
                    <p className="hp-hero-sub">ระบบรวบรวมสิ่งของที่พบและรอการติดต่อกลับ</p>

                    <div className="hp-search-wrap">
                        <span className="material-symbols-outlined hp-search-icon">search</span>
                        <input
                            className="hp-search-input"
                            type="search"
                            placeholder="ค้นหาชื่อสิ่งของ..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button className="hp-search-clear" onClick={() => setQuery('')}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Content ── */}
            <main className="hp-main">

                {/* --- ปุ่ม Filter สถานะ --- */}
                <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap" style={{ padding: '0 20px' }}>
                    {[
                        { label: 'ทั้งหมด', value: 'ALL', inactive: 'outline-secondary', active: 'secondary' },
                        { label: 'Found', value: 'FOUND', inactive: 'outline-success', active: 'success' },
                        { label: 'Under Verify', value: 'UNDER_VERIFICATION', inactive: 'outline-danger', active: 'danger' },
                        { label: 'Ready to Pickup', value: 'READY_TO_PICKUP', inactive: 'outline-warning', active: 'warning' },
                        { label: 'Claimed', value: 'CLAIM', inactive: 'outline-info', active: 'info' }
                    ].map((btn) => {
                        const isSelected = filterStatus === btn.value;
                        return (
                            <Button
                                key={btn.value}
                                variant={isSelected ? btn.active : btn.inactive}
                                onClick={() => setFilterStatus(btn.value)}
                                className="rounded-pill px-4 shadow-sm"
                                size="sm"
                            >
                                {btn.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Stats bar */}
                <div className="hp-stats-bar">
                    <span className="hp-stats-count">
                        {isLoading ? '—' : sortedItems.length} รายการ
                    </span>
                    {query && (
                        <span className="hp-stats-query">
                            ผลการค้นหา: "<strong>{query}</strong>"
                        </span>
                    )}
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="hp-empty">
                        <span className="material-symbols-outlined hp-empty-icon">hourglass_top</span>
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                ) : sortedItems.length === 0 ? (
                    <div className="hp-empty">
                        <span className="material-symbols-outlined hp-empty-icon">search_off</span>
                        <p>ไม่พบสิ่งของที่ค้นหาในหมวดหมู่นี้</p>
                    </div>
                ) : (
                    <div className="hp-grid">
                        {sortedItems.map((item) => {
                            const status = STATUS_LABEL[item.itemStatus] || { label: item.itemStatus, cls: '' };
                            return (
                            <article
                                className="item-card"
                                key={item.itemId}
                                onClick={() => handleShow(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="item-card-img-wrap">
                                    <img
                                        className="item-card-img"
                                        src={item.itemPicture}
                                        alt={item.itemName}
                                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                                    />
                                    <span className={`item-card-badge ${status.cls}`}>
                                            {status.label}
                                        </span>
                                </div>
                                <div className="item-card-body">
                                    <div className="item-card-id-wrap">
                                        <span className="material-symbols-outlined item-card-id-icon">tag</span>
                                        <span className="item-card-id-num">{item.itemId}</span>
                                    </div>
                                    <h3 className="item-card-name">{item.itemName}</h3>
                                </div>
                            </article>
                        );
                        })}
                    </div>
                )}
            </main>

            <Modal show={showModal} onHide={handleClose} size="lg" centered>
                {selectedItem && (
                    <>
                        <Modal.Header closeButton className="border-0">
                            <Modal.Title className="fw-bold">รายละเอียดไอเทม</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4 pt-0">
                            <div className="row">
                                <div className="col-md-6 d-flex justify-content-center align-items-center mb-3">
                                    <div style={{
                                        width: '100%', height: '350px', display: 'flex',
                                        justifyContent: 'center', alignItems: 'center',
                                        backgroundColor: '#f8f9fa', borderRadius: '12px',
                                        border: '1px solid #eee', overflow: 'hidden'
                                    }}>
                                        <img
                                            src={selectedItem.itemPicture || 'https://via.placeholder.com/350?text=No+Image'}
                                            alt={selectedItem.itemName}
                                            style={{ maxHeight: '95%', maxWidth: '95%', objectFit: 'contain' }}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h3 className="fw-bold text-dark mb-1">{selectedItem.itemName}</h3>
                                    <div className="mb-3">
                                        <span className={`badge rounded-pill fs-6 ${getStatusColor(selectedItem.itemStatus)}`}>
                                            {selectedItem.itemStatus.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-light rounded-3 shadow-sm border">
                                        <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">ข้อมูลรายละเอียด:</h6>
                                        <div>{renderPrettyDetail(selectedItem.itemDetail)}</div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default HomePage;