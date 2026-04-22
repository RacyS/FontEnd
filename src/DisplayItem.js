import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap'; // เพิ่ม Form, InputGroup
import './DisplayItem.css';

const DisplayItem = () => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // 1. เพิ่ม State สำหรับการค้นหา
    const [searchTerm, setSearchTerm] = useState('');

    // 2. ปรับ useEffect ให้ดึงข้อมูลใหม่เมื่อ searchTerm เปลี่ยน (หรือจะดึงทั้งหมดแล้วกรองก็ได้)
    // ในที่นี้จะใช้แบบดึงใหม่จาก API เพื่อความเป๊ะของข้อมูลจาก MySQL
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetch(`http://localhost:8080/api/items?keyword=${searchTerm}`)
                .then(res => res.json())
                .then(data => setItems(data))
                .catch(err => console.error("Fetch error:", err));
        }, 300); // ใส่ debounce 300ms เพื่อไม่ให้ยิง API รัวเกินไปขณะพิมพ์

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleShow = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const renderPrettyDetail = (jsonString) => {
        if (!jsonString) return <p>-</p>;
        try {
            // ล้างอักขระพิเศษและจัดการ JSON
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
                <h2 className="gallery-title text-center mb-4">รายการของหาย/พบทั้งหมด</h2>

                {/* --- 3. เพิ่ม Search Bar UI --- */}
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
                            <small className="text-muted">พบไอเทม {items.length} รายการ</small>
                        </div>
                    </div>
                </div>

                {/* รายการ Card (เหมือนเดิม) */}
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {items.length > 0 ? (
                        items.map(item => (
                            <div className="col" key={item.itemId}>
                                <div className="card item-card h-100 shadow-sm border-0" onClick={() => handleShow(item)}>
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
                                        <div className="item-name fw-bold mb-2">{item.itemName}</div>
                                        <span className={`badge rounded-pill ${item.itemStatus === 'FOUND' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                                            {item.itemStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <p className="text-muted">ไม่พบข้อมูลที่ค้นหา</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal (เหมือนเดิม) */}
            <Modal show={showModal} onHide={handleClose} size="lg" centered>
                {selectedItem && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>รายละเอียดไอเทม</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
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
                                    <h3 className="fw-bold text-dark">{selectedItem.itemName}</h3>
                                    <div className="mb-3">
                                        <span className={`badge rounded-pill ${selectedItem.itemStatus === 'FOUND' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                                            {selectedItem.itemStatus}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-light rounded-3">
                                        <h6 className="fw-bold text-dark mb-2">ข้อมูลรายละเอียด:</h6>
                                        <div>{renderPrettyDetail(selectedItem.itemDetail)}</div>
                                    </div>
                                    <div className="mt-4 d-grid gap-2">
                                        <Button variant="primary" size="lg" onClick={() => alert('กำลังเชื่อมต่อระบบแชท...')}>
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