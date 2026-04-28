import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';

const ClaimHistory = () => {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [previewPicture, setPreviewPicture] = useState('');
    const [previewSignature, setPreviewSignature] = useState('');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole') || 'STAFF';
        if (userRole !== 'STAFF') {
            alert('สิทธิ์การเข้าถึงจำกัดเฉพาะเจ้าหน้าที่เท่านั้น');
            navigate('/HomePage');
        } else {
            setIsCheckingAuth(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetch('http://localhost:8080/api/claimHistory')
            .then(res => res.json())
            .then(data => setClaims(data))
            .catch(err => console.error("Error fetching claims:", err));
    }, []);

    const handleDeleteClick = (claim) => {
        setSelectedClaim(claim);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        fetch(`http://localhost:8080/api/claimHistory/${selectedClaim.claimId}`, {
            method: 'DELETE'
        }).then(() => {
            const updatedClaims = claims.filter(c => c.claimId !== selectedClaim.claimId);
            setClaims(updatedClaims);
            setShowDeleteModal(false);
            setSelectedClaim(null);
        }).catch(err => console.error("Error deleting:", err));
    };

    const handleEditClick = (claim) => {
        setSelectedClaim(claim);
        setEditForm({ ...claim });
        setPreviewPicture(claim.evidencePicture);
        setPreviewSignature(claim.evidenceSignature);
        setShowEditModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const uploadToCloudinary = async (file) => {
        const CLOUD_NAME = "YOUR_CLOUD_NAME"; // แก้ตรงนี้
        const UPLOAD_PRESET = "YOUR_PRESET";   // แก้ตรงนี้

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        return data.secure_url;
    };

    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewPicture(URL.createObjectURL(file));
            const url = await uploadToCloudinary(file);
            setEditForm(prev => ({ ...prev, evidencePicture: url }));
        }
    };

    const handleSignatureUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewSignature(URL.createObjectURL(file));
            const url = await uploadToCloudinary(file);
            setEditForm(prev => ({ ...prev, evidenceSignature: url }));
        }
    };

    const saveEdit = () => {
        fetch(`http://localhost:8080/api/claimHistory/${selectedClaim.claimId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        })
            .then(res => {
                if(res.ok) {
                    const updatedClaims = claims.map(c =>
                        c.claimId === selectedClaim.claimId ? { ...c, ...editForm } : c
                    );
                    setClaims(updatedClaims);
                    setShowEditModal(false);
                    alert("แก้ไขข้อมูลเรียบร้อยแล้ว");
                }
            })
            .catch(err => console.error("Error updating:", err));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('th-TH', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const formatForDateTimeInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date - offset)).toISOString().slice(0, 16);
        return localISOTime;
    };

    const getImageSrc = (data) => {
        if (!data || data === "" || data === "1") return 'https://via.placeholder.com/150?text=No+Image';
        if (data.startsWith('http')) return data;
        if (data.length > 100) return `data:image/jpeg;base64,${data}`;
        return 'https://via.placeholder.com/150?text=Invalid+Data';
    };

    if (isCheckingAuth) return <div className="text-center mt-5 p-5">กำลังตรวจสอบสิทธิ์การเข้าถึง...</div>;

    return (
        <div>
            <Navbar/>
            <div className="container py-5" style={{ maxWidth: '1000px' }}>
                <h2 className="mb-4 fw-bold text-center">ประวัติการเคลมสิ่งของ (Claim History)</h2>

                <div className="d-flex flex-column gap-3">
                    {claims.length === 0 ? (
                        <div className="text-center text-muted p-5 bg-light rounded">ไม่มีข้อมูลประวัติการเคลม</div>
                    ) : (
                        claims.map(claim => (
                            <div key={claim.claimId} className="p-3 bg-white shadow-sm border rounded">
                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                                    <div className="d-flex align-items-center gap-4 flex-wrap">
                                        <span className="badge bg-primary fs-6 py-2 px-3">Claim #{claim.claimId}</span>
                                        <div>
                                            <div className="fw-bold text-dark">
                                                Item ID: <span className="text-primary">{claim.itemId || '-'}</span> |
                                                Student ID: <span className="text-success">{claim.studentId}</span>
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>schedule</span>
                                                {' '}{formatDate(claim.claimedAt || claim.claimAt || claim.claimCreatedAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 ms-auto">
                                        <Button variant="outline-primary" onClick={() => handleEditClick(claim)} className="px-3 rounded-pill btn-sm">
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>edit</span>
                                            Edit
                                        </Button>
                                        <Button variant="outline-danger" onClick={() => handleDeleteClick(claim)} className="px-3 rounded-pill btn-sm">
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>delete</span>
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                <Row className="bg-light p-2 rounded g-2">
                                    <Col xs={6} md={3}>
                                        <div className="text-center small fw-bold text-muted mb-1">ภาพหลักฐาน</div>
                                        <img
                                            src={getImageSrc(claim.evidencePicture)}
                                            alt="Evidence"
                                            className="img-thumbnail w-100"
                                            style={{ height: '100px', objectFit: 'cover' }}
                                        />
                                    </Col>
                                    <Col xs={6} md={3}>
                                        <div className="text-center small fw-bold text-muted mb-1">ยืนยันตัวตน</div>
                                        <img
                                            src={getImageSrc(claim.evidenceSignature)}
                                            alt="Signature"
                                            className="img-thumbnail w-100"
                                            style={{ height: '100px', objectFit: 'contain', backgroundColor: 'white' }}
                                        />
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <div className="small fw-bold text-muted mb-1">รายละเอียดการเคลม</div>
                                        <div className="p-2 border rounded bg-white small" style={{ minHeight: '100px' }}>
                                            {claim.claimDescription || claim.claimDescripton || '-'}
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal ยืนยันการลบ */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="text-danger fw-bold">ยืนยันการลบข้อมูลเคลม</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="fs-5">
                        คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการเคลม <strong>ID: {selectedClaim?.claimId}</strong> ?
                        <br/><small className="text-muted fs-6">Student ID: {selectedClaim?.studentId}</small>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="rounded-pill px-4">ยกเลิก</Button>
                        <Button variant="danger" onClick={confirmDelete} className="rounded-pill px-4 shadow-sm">ยืนยันการลบ</Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal แก้ไขข้อมูล */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="fw-bold">แก้ไขประวัติการเคลม #{selectedClaim?.claimId}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row>
                                <Col md={5} className="mb-4 mb-md-0 border-end">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold text-primary">ภาพหลักฐาน</Form.Label>
                                        <div className="border rounded bg-light d-flex align-items-center justify-content-center mb-2 overflow-hidden" style={{ height: '180px' }}>
                                            <img src={getImageSrc(previewPicture)} alt="Evidence" style={{ maxHeight: '100%', maxWidth: '100%' }} />
                                        </div>
                                        <Form.Label className="btn btn-outline-primary btn-sm rounded-pill w-100 cursor-pointer">
                                            เปลี่ยนภาพหลักฐาน
                                            <Form.Control type="file" accept="image/*" className="d-none" onChange={handlePictureUpload} />
                                        </Form.Label>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-success">ยืนยันตัวตน</Form.Label>
                                        <div className="border rounded bg-light d-flex align-items-center justify-content-center mb-2 overflow-hidden" style={{ height: '120px' }}>
                                            <img src={getImageSrc(previewSignature)} alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%' }} />
                                        </div>
                                        <Form.Label className="btn btn-outline-success btn-sm rounded-pill w-100 cursor-pointer">
                                            อัปโหลด ยืนยันตัวตนใหม่
                                            <Form.Control type="file" accept="image/*" className="d-none" onChange={handleSignatureUpload} />
                                        </Form.Label>
                                    </Form.Group>
                                </Col>
                                <Col md={7}>
                                    <Row>
                                        <Col sm={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Item ID</Form.Label><Form.Control type="number" name="itemId" value={editForm.itemId || ''} onChange={handleFormChange} /></Form.Group></Col>
                                        <Col sm={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Student ID</Form.Label><Form.Control type="text" name="studentId" value={editForm.studentId || ''} onChange={handleFormChange} /></Form.Group></Col>
                                    </Row>
                                    <Row>
                                        <Col sm={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Staff ID</Form.Label><Form.Control type="text" name="staffId" value={editForm.staffId || ''} onChange={handleFormChange} /></Form.Group></Col>
                                        <Col sm={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Chat ID</Form.Label><Form.Control type="text" name="chatId" value={editForm.chatId || ''} onChange={handleFormChange} /></Form.Group></Col>
                                    </Row>

                                    {/* 🟢 แก้ไข: เปลี่ยนเป็น Input สำหรับเลือกวันเวลา */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">วัน/เวลาที่ส่งมอบ (แก้ไขได้)</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            name="claimedAt"
                                            value={formatForDateTimeInput(editForm.claimedAt || editForm.claimAt)}
                                            onChange={handleFormChange}
                                        />
                                    </Form.Group>

                                    {/* 🟢 แก้ไข: เปลี่ยนชื่อ name เป็น claimDescription ให้ตรงกับ Backend */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">รายละเอียด (Description)</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="claimDescription"
                                            value={editForm.claimDescription || editForm.claimDescripton || ''}
                                            onChange={handleFormChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>ยกเลิก</Button>
                        <Button variant="success" onClick={saveEdit}>บันทึกการแก้ไข</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default ClaimHistory;