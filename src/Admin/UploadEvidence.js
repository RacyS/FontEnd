import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Form, Button, Badge, Spinner } from 'react-bootstrap';
import '../Css/UploadEvidence.css'; // ตรวจสอบ Path ให้ตรงกับโปรเจกต์คุณ

const UploadEvidence = () => {
    const { itemId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const itemDetail = location.state?.itemDetail;
    const isFromReadyPage = location.state?.fromReadyPage;

    // ข้อมูลเจ้าหน้าที่
    const currentStaffId = 1;

    // State สำหรับข้อมูลที่ดึงอัตโนมัติ
    const [chatId, setChatId] = useState(null);
    const [studentId, setStudentId] = useState(''); // รหัส 13 หลัก (โชว์บนจอ)
    const [studentDbId, setStudentDbId] = useState(null); // ID ฐานข้อมูล (ซ่อนไว้ส่งหลังบ้าน)

    // 🟢 State ใหม่สำหรับรับค่า เวลา และ รายละเอียด
    const [claimDescription, setClaimDescription] = useState('ยืนยันการรับสิ่งของคืน');
    const [claimedAt, setClaimedAt] = useState(() => {
        // ตั้งค่าเริ่มต้นเป็นเวลาปัจจุบันของเครื่อง
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now - offset).toISOString().slice(0, 16);
    });

    // State สำหรับไฟล์และ UI
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [identityFile, setIdentityFile] = useState(null);
    const [previews, setPreviews] = useState({ evidence: null, identity: null });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchChatData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/chats/item/${itemId}`);
                if (response.data) {
                    setChatId(response.data.chatId || response.data.Chat_ID);
                    setStudentId(response.data.studentId || response.data.studentFk || '');
                    setStudentDbId(response.data.studentDbId || response.data.Student_FK);
                }
            } catch (error) {
                console.error("ไม่พบข้อมูลแชท:", error);
            } finally {
                setFetching(false);
            }
        };

        if (itemId) {
            fetchChatData();
        } else {
            setFetching(false);
        }

        if (!isFromReadyPage) {
            navigate('/ready-to-pick');
        }
    }, [itemId, isFromReadyPage, navigate]);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'evidence') {
                setEvidenceFile(file);
                setPreviews(prev => ({ ...prev, evidence: url }));
            } else {
                setIdentityFile(file);
                setPreviews(prev => ({ ...prev, identity: url }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!evidenceFile || !identityFile) {
            alert("กรุณาอัปโหลดรูปภาพให้ครบ");
            return;
        }

        setLoading(true);

        try {
            // 1. นำไฟล์รูปและข้อมูลยัดใส่ FormData
            const formData = new FormData();
            formData.append('evidenceFile', evidenceFile);
            formData.append('identityFile', identityFile);

            const claimData = {
                claimDescription: claimDescription,
                claimedAt: claimedAt,
                studentId: studentDbId,
                staffId: currentStaffId,
                itemId: parseInt(itemId),
                chatId: chatId
            };

            // 2. แปลง JSON เป็น String แล้วแนบไปด้วย
            formData.append('claimData', JSON.stringify(claimData));

            // 3. ยิง API ส่งให้ Spring Boot จัดการทั้งหมด
            await axios.post('http://localhost:8080/api/claims/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } // 🟢 สำคัญ: ต้องบอกว่าเป็นไฟล์
            });

            alert("บันทึกการคืนของสำเร็จ!");
            navigate('/ready-to-pick');
        } catch (error) {
            alert("เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;

    return (
        <Container className="py-5">
            <Button
                variant="link"
                className="text-decoration-none mb-3 p-0"
                onClick={() => navigate(-1)}
            >
                ← ย้อนกลับไปหน้ารายการ
            </Button>

            <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-primary p-3 text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">บันทึกหลักฐานการส่งมอบ</h5>
                    <Badge bg="light" text="dark">Item ID: {itemId}</Badge>
                </div>

                <Form onSubmit={handleSubmit} className="p-4 bg-light">
                    <Row className="mb-4 g-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">ชื่อสิ่งของ</Form.Label>
                                <Form.Control type="text" value={itemDetail?.itemName || 'ไม่ระบุ'} disabled />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">เจ้าหน้าที่ผู้รับผิดชอบ</Form.Label>
                                <Form.Control type="text" value={`Staff ID: ${currentStaffId}`} disabled className="text-primary fw-bold" />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">หมายเลขแชทอ้างอิง (Auto)</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={chatId ? `Chat #${chatId}` : 'ไม่มีข้อมูลแชท'}
                                    disabled
                                    className="fw-bold"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr />

                    <Row className="g-4 mb-4">
                        <Col md={6}>
                            <label className="form-label fw-bold small">1. รูปถ่ายตอนส่งมอบ</label>
                            <div className="upload-box border rounded bg-white text-center p-3"
                                 style={{ cursor: 'pointer', borderStyle: 'dashed', minHeight: '200px' }}
                                 onClick={() => document.getElementById('file-ev').click()}>
                                {previews.evidence ? (
                                    <img src={previews.evidence} className="img-fluid rounded" style={{maxHeight: '180px'}} alt="ev" />
                                ) : (
                                    <div className="py-5 text-muted">คลิกเพื่ออัปโหลดรูป</div>
                                )}
                                <input id="file-ev" type="file" className="d-none" onChange={(e) => handleFileChange(e, 'evidence')} />
                            </div>
                        </Col>
                        <Col md={6}>
                            <label className="form-label fw-bold small">2.รูปยืนยันตัวตน</label>
                            <div className="upload-box border rounded bg-white text-center p-3"
                                 style={{ cursor: 'pointer', borderStyle: 'dashed', minHeight: '200px' }}
                                 onClick={() => document.getElementById('file-id').click()}>
                                {previews.identity ? (
                                    <img src={previews.identity} className="img-fluid rounded" style={{maxHeight: '180px'}} alt="id" />
                                ) : (
                                    <div className="py-5 text-muted">คลิกเพื่ออัปโหลดรูปบัตร</div>
                                )}
                                <input id="file-id" type="file" className="d-none" onChange={(e) => handleFileChange(e, 'identity')} />
                            </div>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">รหัสนักศึกษาผู้มารับ (ดึงข้อมูลอัตโนมัติ)</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={studentId}
                                    readOnly
                                    className="bg-white"
                                />
                            </Form.Group>
                        </Col>
                        {/* 🟢 เพิ่มช่องเลือกวันเวลา */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">วัน/เวลาที่ส่งมอบ</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={claimedAt}
                                    onChange={(e) => setClaimedAt(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        {/* 🟢 เพิ่มช่องกรอกรายละเอียด */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">รายละเอียดเพิ่มเติม</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={1}
                                    value={claimDescription}
                                    onChange={(e) => setClaimDescription(e.target.value)}
                                    placeholder="เช่น มารับด้วยตนเอง"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button variant="primary" type="submit" className="w-100 py-3 fw-bold shadow" disabled={loading}>
                        {loading ? 'กำลังบันทึก...' : '✅ บันทึกและปิดงาน'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default UploadEvidence;