import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import './DisplayItem.css';

const DisplayItem = () => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetch(`http://localhost:8080/api/items?keyword=${searchTerm}`)
                .then(res => res.json())
                .then(data => setItems(data))
                .catch(err => console.error("Fetch error:", err));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // 1. กำหนดสีตามลำดับที่ตกลงกัน
    const getStatusColor = (status) => {
        switch (status) {
            case 'FOUND': return 'bg-success text-white';        // เขียว
            case 'UNDER_VERIFICATION': return 'bg-danger text-white'; // แดง
            case 'READY_TO_PICKUP': return 'bg-warning text-dark';   // เหลือง
            case 'CLAIM': return 'bg-info text-white';           // ฟ้า
            default: return 'bg-secondary text-white';
        }
    };

// 2. ตัวแปรสำหรับนำไป map แสดงผล (ต้องใช้ตัวนี้แทน items เดิม)
    const filteredItems = items.filter(item => {
        if (filterStatus === 'ALL') return true;
        return item.itemStatus === filterStatus;
    });

    // กำหนด "ค่าลำดับ" (Priority) ให้กับแต่ละสถานะ เพื่อใช้ในการจัดเรียง
    const statusPriority = {
        'FOUND': 1,              // ต่ำที่สุด (ขึ้นก่อน)
        'UNDER_VERIFICATION': 2, // ถัดมา
        'READY_TO_PICKUP': 3,    // ถัดมา
        'CLAIM': 4,              // สูงที่สุด (อยู่หลังสุด)
    };

// นำข้อมูลที่กรองแล้ว (filteredItems) มาจัดเรียงตามสถานะ
    const sortedItems = [...filteredItems].sort((a, b) => {
        // ดึงค่าลำดับจากสถานะของไอเทม
        const priorityA = statusPriority[a.itemStatus] || 99; // 99 คือค่าเริ่มต้นถ้าไม่เจอสถานะ
        const priorityB = statusPriority[b.itemStatus] || 99;

        // เปรียบเทียบค่าลำดับ
        if (priorityA < priorityB) {
            return -1; // a มาก่อน b
        }
        if (priorityA > priorityB) {
            return 1; // a มาหลัง b
        }
        return 0; // ลำดับเหมือนกัน
    });

    const handleShow = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

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
        <div className="gallery-container">
            <div className="container py-4">
                <h2 className="gallery-title text-center mb-4 fw-bold">รายการของหาย/พบทั้งหมด</h2>

                {/* --- Search Bar --- */}
                <div className="row justify-content-center mb-5">
                    <div className="col-md-7">
                        <InputGroup className="shadow-sm rounded-pill overflow-hidden">
                            <InputGroup.Text className="bg-white border-end-0 ps-4">
                                <span role="img" aria-label="search">🔍</span>
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="ค้นหาของหาย (ยี่ห้อ, สี, ชื่อรุ่น...)"
                                className="border-start-0 py-3 ps-0 no-focus-outline"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ boxShadow: 'none', border: '1px solid #ced4da' }}
                            />
                        </InputGroup>
                        <div className="text-center mt-2">
                            <small className="text-muted">พบไอเทมทั้งหมด {items.length} รายการ</small>
                        </div>
                    </div>
                </div>

                {/* --- ปุ่ม Filter สถานะ --- */}
                <div className="d-flex justify-content-center gap-2 mb-5 flex-wrap">
                    {[
                        { label: 'ทั้งหมด', value: 'ALL', variant: 'outline-secondary' },
                        { label: 'Found', value: 'FOUND', variant: 'outline-success' },
                        { label: 'Under Verify', value: 'UNDER_VERIFICATION', variant: 'outline-danger' },
                        { label: 'Ready to Pickup', value: 'READY_TO_PICKUP', variant: 'outline-warning' },
                        { label: 'Claimed', value: 'CLAIM', variant: 'outline-info' }
                    ].map((btn) => (
                        <Button
                            key={btn.value}
                            variant={filterStatus === btn.value ? btn.variant.replace('outline-', '') : btn.variant}
                            onClick={() => setFilterStatus(btn.value)}
                            className="rounded-pill px-4 shadow-sm"
                            size="sm"
                        >
                            {btn.label}
                        </Button>
                    ))}
                </div>

                {/* --- รายการ Card (ใช้ filteredItems) --- */}
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {sortedItems.length > 0 ? (
                        sortedItems.map(item => (
                            <div className="col" key={item.itemId}>
                                <div className="card item-card h-100 shadow-sm border-0" onClick={() => handleShow(item)} style={{ cursor: 'pointer' }}>
                                    <div style={{
                                        height: '200px', width: '100%', display: 'flex',
                                        justifyContent: 'center', alignItems: 'center',
                                        backgroundColor: '#f8f9fa', overflow: 'hidden'
                                    }}>
                                        <img
                                            src={item.itemPicture || 'https://via.placeholder.com/150'}
                                            alt={item.itemName}
                                            style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }}
                                        />
                                    </div>
                                    <div className="item-card-body text-center p-3">
                                        <div className="item-name fw-bold mb-2 text-truncate">{item.itemName}</div>
                                        {/* แก้ไขสีตรงนี้ให้เรียกใช้ getStatusColor */}
                                        <span className={`badge rounded-pill ${getStatusColor(item.itemStatus)}`}>
                                            {item.itemStatus.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <p className="text-muted fs-5">ไม่พบข้อมูลในหมวดหมู่นี้</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Modal รายละเอียด --- */}
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
                                        {/* แก้ไขสีตรงนี้ให้เรียกใช้ getStatusColor */}
                                        <span className={`badge rounded-pill fs-6 ${getStatusColor(selectedItem.itemStatus)}`}>
                                            {selectedItem.itemStatus.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-light rounded-3 shadow-sm border">
                                        <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">ข้อมูลรายละเอียด:</h6>
                                        <div>{renderPrettyDetail(selectedItem.itemDetail)}</div>
                                    </div>
                                    <div className="mt-4 d-grid gap-2">
                                        <Button variant="primary" size="lg" className="rounded-pill" onClick={() => alert('กำลังเชื่อมต่อระบบแชท...')}>
                                            ติดต่อเจ้าของ/ผู้พบเห็น
                                        </Button>
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

export default DisplayItem;