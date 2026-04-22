import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './DisplayItem.css'; // นำเข้าไฟล์ CSS ที่แยกออกมา

const DisplayItem = () => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8080/api/items')
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => console.error("Fetch error:", err));
    }, []);

    const handleShow = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleClose = () => setShowModal(false);

    const renderPrettyDetail = (jsonString) => {
        try {
            const details = JSON.parse(jsonString.replace(/\\r\\n/g, ''));
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
            <div className="container">
                <h2 className="gallery-title">รายการของหาย/พบทั้งหมด</h2>

                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {items.map(item => (
                        <div className="col" key={item.itemId}>
                            <div className="card item-card h-100" onClick={() => handleShow(item)}>
                                {/* กรอบรูปหน้าหลัก: โชว์รูปเต็มใบ */}
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
                                <div className="item-card-body text-center">
                                    <div className="item-name mb-2">{item.itemName}</div>
                                    <span className={`status-badge ${item.itemStatus === 'FOUND' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                                        {item.itemStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pop-up รายละเอียด (Modal) */}
            <Modal show={showModal} onHide={handleClose} size="lg" centered contentClassName="modal-content">
                {selectedItem && (
                    <>
                        <Modal.Header closeButton className="modal-header">
                            <Modal.Title className="modal-title">รายละเอียดไอเทม</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                            <div className="row">
                                <div className="col-md-6 mb-3 mb-md-0 d-flex justify-content-center align-items-center">
                                    {/* กรอบรูปใน Modal: โชว์รูปเต็มใบ */}
                                    <div style={{
                                        width: '100%', height: '350px', display: 'flex',
                                        justifyContent: 'center', alignItems: 'center',
                                        backgroundColor: '#f8f9fa', borderRadius: '12px',
                                        border: '1px solid #eee', overflow: 'hidden'
                                    }}>
                                        <img
                                            src={selectedItem.itemPicture}
                                            alt={selectedItem.itemName}
                                            style={{ maxHeight: '95%', maxWidth: '95%', objectFit: 'contain' }}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h3 className="fw-bold mb-1 text-dark">{selectedItem.itemName}</h3>
                                    <div className="mb-3">
                                        <span className={`status-badge ${selectedItem.itemStatus === 'FOUND' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                                            {selectedItem.itemStatus}
                                        </span>
                                    </div>

                                    <div className="detail-box">
                                        <h6 className="fw-bold text-dark mb-3">ข้อมูลรายละเอียด:</h6>
                                        <div className="detail-text">
                                            {renderPrettyDetail(selectedItem.itemDetail)}
                                        </div>
                                    </div>

                                    <div className="mt-4 d-grid gap-2">
                                        <Button className="btn-contact" onClick={() => alert('กำลังเชื่อมต่อระบบแชท...')}>
                                            ติดต่อเจ้าของ/ผู้พบเห็น
                                        </Button>
                                        <Button variant="outline-secondary" className="border-0" onClick={handleClose}>
                                            ปิดหน้าต่าง
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