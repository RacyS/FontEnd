import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Row, Col, Form, Modal, Spinner, InputGroup } from 'react-bootstrap';
import './EditItem.css';

const EditItem = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const [editingItem, setEditingItem] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [editDetails, setEditDetails] = useState([]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const headerOptions = [
        { label: '-- เลือกประเภทข้อมูล --', value: '' },
        { label: 'หมวดหมู่ (Category)', value: 'category', custom: false },
        { label: 'สี (Color)', value: 'color', custom: false },
        { label: 'แบรนด์ (Brand)', value: 'brand', custom: true },
        { label: 'รุ่น (Model)', value: 'model', custom: true },
        { label: 'วัสดุ (Material)', value: 'material', custom: true },
        { label: 'สถานที่พบ (Location)', value: 'location', custom: true },
        { label: 'คำอธิบายเพิ่มเติม (Description)', value: 'description', custom: true }
    ];

    const valueOptions = {
        category: ['Electronics', 'Cards / Documents', 'Fashion', 'Accessories', 'Others'],
        color: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Silver', 'Gold', 'Orange-Yellow']
    };

    const statusPriority = {
        'FOUND': 1,
        'UNDER_VERIFICATION': 2,
        'READY_TO_PICKUP': 3,
        'CLAIM': 4,
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'FOUND': return 'bg-success text-white';
            case 'UNDER_VERIFICATION': return 'bg-danger text-white';
            case 'READY_TO_PICKUP': return 'bg-warning text-dark';
            case 'CLAIM': return 'bg-info text-white';
            default: return 'bg-secondary text-white';
        }
    };

    const fetchItems = useCallback(async (keyword = '') => {
        try {
            const response = await fetch(`http://localhost:8080/api/items?keyword=${keyword}`);
            const data = await response.json();
            setItems(data);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        if (searchTerm === '') { fetchItems(''); }
        else {
            const delayDebounceFn = setTimeout(() => { fetchItems(searchTerm); }, 300);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchTerm, fetchItems]);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const response = await fetch(`http://localhost:8080/api/items/${itemToDelete.itemId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert("ลบข้อมูลสำเร็จ");
                fetchItems(searchTerm);
            }
        } catch (err) { console.error(err); }
        finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setPreviewUrl(item.itemPicture);
        try {
            const parsed = JSON.parse(item.itemDetail);
            const arrayDetails = Object.entries(parsed).map(([key, value]) => {
                const header = headerOptions.find(opt => opt.value === key);
                return { key, value, isCustom: header?.custom || false };
            });
            setEditDetails(arrayDetails.length > 0 ? arrayDetails : [{ key: '', value: '', isCustom: false }]);
        } catch (e) {
            setEditDetails([{ key: '', value: item.itemDetail, isCustom: true }]);
        }
        window.scrollTo(0, 0);
    };

    const handleKeyChange = (index, keyVal) => {
        const newDetails = [...editDetails];
        const selectedHeader = headerOptions.find(opt => opt.value === keyVal);
        newDetails[index].key = keyVal;
        newDetails[index].isCustom = selectedHeader?.custom || false;
        newDetails[index].value = '';
        setEditDetails(newDetails);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const detailObject = {};
        editDetails.forEach(row => {
            if (row.key && row.value) detailObject[row.key] = row.value;
        });

        const formData = new FormData();
        formData.append('itemName', editingItem.itemName);
        formData.append('itemDetail', JSON.stringify(detailObject));
        formData.append('itemStatus', editingItem.itemStatus);
        if (selectedFile) formData.append('file', selectedFile);

        try {
            const response = await fetch(`http://localhost:8080/api/items/${editingItem.itemId}`, {
                method: 'PUT',
                body: formData,
            });
            if (response.ok) {
                alert("แก้ไขข้อมูลสำเร็จ");
                setEditingItem(null);
                fetchItems(searchTerm);
            }
        } catch (err) { alert("แก้ไขไม่สำเร็จ"); }
    };

    // --- ส่วนประมวลผลการค้นหาและเรียงลำดับ (Update 2 จุดตามที่ขอ) ---
    const processedItems = items
        .filter(item => {
            // 1. เช็คสถานะ
            const matchesStatus = filterStatus === 'ALL' || item.itemStatus === filterStatus;

            // 2. เช็คการค้นหา (รองรับทั้งชื่อ และ ID แบบ String/Number)
            const searchLow = searchTerm.toLowerCase().trim();
            const matchesSearch =
                (item.itemName && item.itemName.toLowerCase().includes(searchLow)) ||
                (item.itemId && item.itemId.toString() === searchLow) || // เช็คแบบตรงตัว
                (item.itemId && item.itemId.toString().includes(searchLow)); // เช็คแบบบางส่วน

            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            const priorityA = statusPriority[a.itemStatus] || 99;
            const priorityB = statusPriority[b.itemStatus] || 99;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return a.itemId - b.itemId;
        });

    if (isLoading && items.length === 0) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

    // หน้าแก้ไข (Edit Form)
    if (editingItem) {
        return (
            <Container className="py-5">
                <Card className="shadow border-0">
                    <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center py-3">
                        <h4 className="mb-0">แก้ไขข้อมูลไอเทม ID: {editingItem.itemId}</h4>
                        <span className={`badge rounded-pill ${getStatusColor(editingItem.itemStatus)}`}>
                            {editingItem.itemStatus}
                        </span>
                    </Card.Header>
                    <Card.Body className="p-4 p-md-5">
                        <Form onSubmit={handleUpdate}>
                            <Row className="g-4">
                                <Col lg={5} className="text-center">
                                    <div className="p-3 border rounded bg-light mb-3 shadow-sm">
                                        <img src={previewUrl || editingItem.itemPicture} alt="preview" className="img-fluid rounded" style={{maxHeight: '350px'}} />
                                    </div>
                                    <Form.Control type="file" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if(file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                                    }} />
                                </Col>
                                <Col lg={7}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">ชื่อสิ่งของ</Form.Label>
                                        <Form.Control value={editingItem.itemName} onChange={e => setEditingItem({...editingItem, itemName: e.target.value})} />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">สถานะ</Form.Label>
                                        <Form.Select value={editingItem.itemStatus} onChange={e => setEditingItem({...editingItem, itemStatus: e.target.value})}>
                                            <option value="FOUND">FOUND</option>
                                            <option value="UNDER_VERIFICATION">UNDER_VERIFICATION</option>
                                            <option value="READY_TO_PICKUP">READY_TO_PICKUP</option>
                                            <option value="CLAIM">CLAIMED</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <div className="detail-section p-3 rounded bg-white border shadow-sm">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="fw-bold mb-0 text-primary">ข้อมูลรายละเอียดเพิ่มเติม</h6>
                                            <Button variant="outline-primary" size="sm" onClick={() => setEditDetails([...editDetails, { key: '', value: '', isCustom: false }])}>+ เพิ่ม</Button>
                                        </div>
                                        {editDetails.map((row, index) => (
                                            <Row key={index} className="mb-2 g-2 align-items-center">
                                                <Col xs={5}>
                                                    <Form.Select value={row.key} onChange={(e) => handleKeyChange(index, e.target.value)}>
                                                        {headerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                    </Form.Select>
                                                </Col>
                                                <Col xs={5}>
                                                    {row.isCustom ? (
                                                        <Form.Control placeholder="ระบุ..." value={row.value} onChange={(e) => {
                                                            const d = [...editDetails]; d[index].value = e.target.value; setEditDetails(d);
                                                        }} />
                                                    ) : (
                                                        <Form.Select disabled={!row.key} value={row.value} onChange={(e) => {
                                                            const d = [...editDetails]; d[index].value = e.target.value; setEditDetails(d);
                                                        }}>
                                                            <option value="">-- เลือก --</option>
                                                            {valueOptions[row.key]?.map(v => <option key={v} value={v}>{v}</option>)}
                                                        </Form.Select>
                                                    )}
                                                </Col>
                                                <Col xs={2} className="text-end">
                                                    <Button variant="link" className="text-danger p-0" onClick={() => setEditDetails(editDetails.filter((_, i) => i !== index))}>🗑</Button>
                                                </Col>
                                            </Row>
                                        ))}
                                    </div>
                                    <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                        <Button variant="secondary" className="px-4" onClick={() => setEditingItem(null)}>ยกเลิก</Button>
                                        <Button variant="success" type="submit" className="px-5 shadow-sm">บันทึกการแก้ไข</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // หน้า List (Main Display)
    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold">จัดการรายการสิ่งของ</h2>
            <div className="row mb-4 g-3">
                <div className="col-md-8">
                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                        <InputGroup.Text className="bg-white border-0 ps-4">🔍</InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="ค้นหาด้วยชื่อสิ่งของ หรือ ID..."
                            className="border-0 py-2 no-focus-outline"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
                <div className="col-md-4">
                    <Form.Select className="rounded-pill shadow-sm py-2" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="ALL">ทุกสถานะ (เรียงตาม ID)</option>
                        <option value="FOUND">Found</option>
                        <option value="UNDER_VERIFICATION">Under Verify</option>
                        <option value="READY_TO_PICKUP">Ready to Pickup</option>
                        <option value="CLAIM">Claimed</option>
                    </Form.Select>
                </div>
            </div>

            <div className="item-list-container">
                {processedItems.map(item => (
                    <Card key={item.itemId} className="mb-3 item-list-card shadow-sm border-0">
                        <Card.Body className="py-3">
                            <Row className="align-items-center">
                                <Col md={1} className="fw-bold border-end d-none d-md-block text-center">
                                    <div className="text-muted small">ID</div>
                                    {item.itemId}
                                </Col>
                                <Col md={2} className="text-center"><img src={item.itemPicture} alt="img" className="rounded shadow-sm" style={{ width: '70px', height: '70px', objectFit: 'cover' }} /></Col>
                                <Col md={5}>
                                    <h5 className="mb-1 fw-bold text-dark">{item.itemName}</h5>
                                    <span className={`badge rounded-pill ${getStatusColor(item.itemStatus)}`}>
                                        {item.itemStatus.replace(/_/g, ' ')}
                                    </span>
                                </Col>
                                <Col md={4} className="text-md-end mt-2 mt-md-0">
                                    <Button variant="outline-primary" className="me-2 rounded-pill px-4 btn-sm" onClick={() => handleEditClick(item)}>Edit</Button>
                                    <Button variant="outline-danger" className="rounded-pill px-4 btn-sm" onClick={() => { setItemToDelete(item); setShowDeleteModal(true); }}>Delete</Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">ยืนยันการลบ</Modal.Title></Modal.Header>
                <Modal.Body className="text-center py-4">
                    ต้องการลบ <strong>"{itemToDelete?.itemName}"</strong> (ID: {itemToDelete?.itemId}) หรือไม่?
                </Modal.Body>
                <Modal.Footer className="border-0 justify-content-center">
                    <Button variant="light" className="rounded-pill px-4" onClick={() => setShowDeleteModal(false)}>ยกเลิก</Button>
                    <Button variant="danger" className="rounded-pill px-4" onClick={confirmDelete}>ยืนยันการลบ</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default EditItem;