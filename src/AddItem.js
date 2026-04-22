import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Container, Spinner, Badge } from 'react-bootstrap';
import './AddItem.css';

const AddItem = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const [itemName, setItemName] = useState('');
    const [itemStatus] = useState('FOUND');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [details, setDetails] = useState([{ key: '', value: '', isCustom: false }]);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'STAFF') {
            alert('สิทธิ์การเข้าถึงจำกัดเฉพาะเจ้าหน้าที่เท่านั้น');
            navigate('/');
        } else {
            setIsCheckingAuth(false);
        }
    }, [navigate]);

    // รายการหัวข้อสำหรับ Listbox
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

    // ตัวเลือกภายใน Listbox สำหรับหัวข้อที่กำหนดไว้
    const valueOptions = {
        category: ['Electronics', 'Cards / Documents', 'Fashion', 'Accessories', 'Others'],
        color: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Silver', 'Gold', 'Orange-Yellow']
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleKeyChange = (index, keyVal) => {
        const newDetails = [...details];
        const selectedHeader = headerOptions.find(opt => opt.value === keyVal);
        newDetails[index].key = keyVal;
        newDetails[index].isCustom = selectedHeader?.custom || false;
        newDetails[index].value = '';
        setDetails(newDetails);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return alert("กรุณาแนบรูปภาพประกอบสิ่งของ");

        setIsLoading(true);
        const detailObject = {};
        details.forEach(item => {
            if (item.key && item.value) detailObject[item.key] = item.value;
        });

        const formData = new FormData();
        formData.append('itemName', itemName);
        formData.append('itemDetail', JSON.stringify(detailObject));
        formData.append('itemStatus', itemStatus);
        formData.append('userId', localStorage.getItem('userId') || 1);
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:8080/api/items', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert("อัปโหลดสำเร็จเเล้ว");
                navigate('/');
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
            }
        } catch (err) {
            console.error(err);
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ฐานข้อมูลได้");
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingAuth) return <div className="text-center mt-5 p-5">กำลังตรวจสอบสิทธิ์การเข้าถึง...</div>;

    return (
        <div className="admin-page-bg">
            <Container className="py-5">
                <Card className="add-item-card shadow-lg border-0">
                    <Card.Header className="bg-dark text-white text-center py-4">
                        <h3 className="fw-bold mb-0">ระบบบันทึกรายการสิ่งของที่จัดเก็บได้</h3>
                        <small className="text-light-50">Authorized Staff Only</small>
                    </Card.Header>
                    <Card.Body className="p-4 p-md-5">
                        <Form onSubmit={handleSubmit}>
                            <Row className="g-4">
                                {/* ส่วนการจัดการรูปภาพ */}
                                <Col lg={5}>
                                    <Form.Group className="text-center">
                                        <Form.Label className="fw-bold mb-3">รูปภาพประกอบสิ่งของ</Form.Label>
                                        <div className="image-preview-box mb-3 shadow-sm border rounded">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="img-fluid" />
                                            ) : (
                                                <div className="text-muted p-5">
                                                    <i className="bi bi-image" style={{fontSize: '3rem'}}></i>
                                                    <p>กรุณาเลือกไฟล์รูปภาพ</p>
                                                </div>
                                            )}
                                        </div>
                                        <Form.Control type="file" accept="image/*" onChange={handleFileChange} required className="mb-2" />
                                        <Form.Text className="text-muted">รองรับไฟล์ .jpg, .png (ขนาดไม่เกิน 5MB)</Form.Text>
                                    </Form.Group>
                                </Col>

                                {/* ส่วนการกรอกข้อมูล */}
                                <Col lg={7}>
                                    <Row className="mb-4">
                                        <Col md={8}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold">ชื่อสิ่งของ</Form.Label>
                                                <Form.Control
                                                    required
                                                    value={itemName}
                                                    onChange={(e)=>setItemName(e.target.value)}
                                                    placeholder="กรุณากรอกชื่อสิ่งของที่พบ..."
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold">สถานะระบบ</Form.Label>
                                                <div className="d-flex align-items-center h-100 mt-1">
                                                    <Badge bg="success" className="w-100 py-2 px-3 shadow-sm">
                                                        <i className="bi bi-check-circle-fill me-2"></i>FOUND
                                                    </Badge>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* ส่วนรายละเอียดแบบ Dynamic (Listbox) */}
                                    <div className="detail-section p-4 rounded bg-white border shadow-sm">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h6 className="fw-bold mb-0 text-primary">
                                                <i className="bi bi-list-ul me-2"></i>ข้อมูลรายละเอียดเพิ่มเติม
                                            </h6>
                                            <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => setDetails([...details, { key: '', value: '', isCustom: false }])}>
                                                + เพิ่มหัวข้อใหม่
                                            </Button>
                                        </div>

                                        {details.map((row, index) => (
                                            <Row key={index} className="mb-3 g-2 align-items-center">
                                                <Col xs={5}>
                                                    <Form.Select
                                                        className="shadow-sm"
                                                        value={row.key}
                                                        onChange={(e) => handleKeyChange(index, e.target.value)}
                                                    >
                                                        {headerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                    </Form.Select>
                                                </Col>
                                                <Col xs={5}>
                                                    {row.isCustom ? (
                                                        <Form.Control
                                                            className="shadow-sm"
                                                            placeholder="ระบุข้อมูล..."
                                                            value={row.value}
                                                            onChange={(e) => {
                                                                const d = [...details]; d[index].value = e.target.value; setDetails(d);
                                                            }}
                                                        />
                                                    ) : (
                                                        <Form.Select
                                                            className="shadow-sm"
                                                            disabled={!row.key}
                                                            value={row.value}
                                                            onChange={(e) => {
                                                                const d = [...details]; d[index].value = e.target.value; setDetails(d);
                                                            }}
                                                        >
                                                            <option value="">-- เลือกข้อมูล --</option>
                                                            {valueOptions[row.key]?.map(v => <option key={v} value={v}>{v}</option>)}
                                                        </Form.Select>
                                                    )}
                                                </Col>
                                                <Col xs={2} className="text-end">
                                                    <Button variant="link" className="text-danger p-0" onClick={() => setDetails(details.filter((_, i) => i !== index))}>
                                                        <i className="bi bi-trash3-fill fs-5"></i>
                                                    </Button>
                                                </Col>
                                            </Row>
                                        ))}
                                    </div>

                                    <Button variant="primary" type="submit" className="w-100 py-3 mt-4 btn-submit shadow-lg fw-bold" disabled={isLoading}>
                                        {isLoading ? (
                                            <><Spinner size="sm" className="me-2" /> กำลังดำเนินการบันทึกข้อมูล...</>
                                        ) : (
                                            'ยืนยันการบันทึกข้อมูลเข้าสู่ระบบ'
                                        )}
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default AddItem;