import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, InputGroup, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './ReadytopickupsList.css';

const ReadytopickupsList = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchItems = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/items`);
            const data = await response.json();
            setItems(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const processedItems = items.filter(item => {
        const isReady = item.itemStatus === 'READY_TO_PICKUP';
        const searchLow = searchTerm.toLowerCase().trim();
        const matchesSearch =
            (item.itemName && item.itemName.toLowerCase().includes(searchLow)) ||
            (item.itemId && item.itemId.toString().includes(searchLow));
        return isReady && matchesSearch;
    });

    const handleProceed = (item) => {
        navigate(`/claim/${item.itemId}`, {
            state: { fromReadyPage: true, itemDetail: item }
        });
    };

    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold">📦 รายการที่พร้อมส่งมอบคืน</h2>

            {/* ส่วน Search Bar */}
            <div className="row mb-4">
                <div className="col-md-12">
                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                        <InputGroup.Text className="bg-white border-0 ps-4">🔍</InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="ค้นหาชื่อของ หรือ ID ที่ต้องการคืน..."
                            className="border-0 py-2 no-focus-outline"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
            </div>

            {/* ส่วนแสดงรายการสไตล์ EditItem */}
            <div className="item-list-container">
                {processedItems.length > 0 ? (
                    processedItems.map(item => (
                        <Card key={item.itemId} className="mb-3 item-list-card shadow-sm border-0">
                            <Card.Body className="py-3">
                                <Row className="align-items-center">
                                    {/* ID Section */}
                                    <Col xs={2} md={1} className="fw-bold border-end text-center">
                                        <div className="text-muted small" style={{fontSize: '0.7rem'}}>ID</div>
                                        {item.itemId}
                                    </Col>

                                    {/* Image Section */}
                                    <Col xs={3} md={2} className="text-center">
                                        <img
                                            src={item.itemPicture}
                                            alt="img"
                                            className="rounded shadow-sm"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                    </Col>

                                    {/* Info Section */}
                                    <Col xs={7} md={6}>
                                        <h5 className="mb-1 fw-bold text-dark">{item.itemName}</h5>
                                        <span className="badge rounded-pill bg-warning text-dark">
                                            READY TO PICKUP
                                        </span>
                                    </Col>

                                    {/* Action Section */}
                                    <Col xs={12} md={3} className="text-md-end mt-3 mt-md-0">
                                        <Button
                                            variant="outline-primary"
                                            className="rounded-pill px-4 fw-bold"
                                            onClick={() => handleProceed(item)}
                                        >
                                            ดำเนินการคืนของ →
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-5">
                        <h5 className="text-muted">ไม่พบรายการที่พร้อมส่งมอบคืน</h5>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default ReadytopickupsList;