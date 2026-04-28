import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import '../Css/AddItem.css'; // นำเข้า CSS ที่ปรับปรุงใหม่

const AddItem = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [itemName, setItemName] = useState('');
    const [itemStatus] = useState('FOUND');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [details, setDetails] = useState([{ key: '', value: '', isCustom: false }]);
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

    const headerOptions = [
        { label: 'Select Label', value: '' },
        { label: 'หมวดหมู่ (Category)', value: 'category', custom: false },
        { label: 'สี (Color)',           value: 'color',    custom: false },
        { label: 'แบรนด์ (Brand)',       value: 'brand',    custom: true  },
        { label: 'รุ่น (Model)',          value: 'model',    custom: true  },
        { label: 'วัสดุ (Material)',      value: 'material', custom: true  },
        { label: 'สถานที่พบ (Location)', value: 'location', custom: true  },
        { label: 'คำอธิบาย (Description)', value: 'description', custom: true },
    ];

    const valueOptions = {
        category: ['Electronics', 'Cards / Documents', 'Fashion', 'Accessories', 'Others'],
        color:    ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Silver', 'Gold', 'Orange-Yellow'],
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
        const selected = headerOptions.find(opt => opt.value === keyVal);
        newDetails[index].key      = keyVal;
        newDetails[index].isCustom = selected?.custom || false;
        newDetails[index].value    = '';
        setDetails(newDetails);
    };

    const handleValueChange = (index, val) => {
        const d = [...details];
        d[index].value = val;
        setDetails(d);
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
                navigate('/AdminDashboard');
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
        /* ── Page: ไหลจากบนลงล่าง ── */
        <div className="add-item-page">

            {/* ── Header Block (บน) ── */}
            <div className="page-header">
                <div>
                    <nav className="breadcrumb-nav">
                        <h2 className="page-title">ของหาย ได้คืน</h2>
                    </nav>
                </div>
                <div className="page-header-actions">
                    <button className="btn-cancel" onClick={() => navigate('/AdminDashboard')}>Cancel</button>
                </div>
            </div>

            {/* ── Form Card (ล่าง): ซ้าย↔ขวา ── */}
            <form onSubmit={handleSubmit}>
                <div className="form-card">

                    {/* ── LEFT: รูปภาพ ── */}
                    <div className="image-side">

                        <span className="col-section-label">Item Photo</span>

                        {/* Upload Zone */}
                        <div className="upload-area" onClick={() => document.getElementById('fileUpload').click()}>
                            <input id="fileUpload" type="file" accept="image/*" onChange={handleFileChange} hidden />
                            <div className="upload-icon-wrap">
                                <span className="material-symbols-outlined" style={{ fontSize: 26 }}>add_a_photo</span>
                            </div>
                            <div className="upload-title">Upload Image</div>
                            <div className="upload-sub">Drag & drop or click to browse</div>
                            <div className="upload-hint">JPG, PNG up to 5 MB</div>
                        </div>

                        {/* Preview */}
                        <div>
                            <span className="col-section-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Preview</span>
                            <div className="preview-box">
                                {previewUrl
                                    ? <img src={previewUrl} alt="Preview" />
                                    : <span className="material-symbols-outlined preview-empty-icon">image_not_supported</span>
                                }
                            </div>
                        </div>

                    </div>

                    {/* ── RIGHT: ฟอร์ม ── */}
                    <div className="form-side">

                        {/* Item Name + Status */}
                        <div className="form-top-row">
                            <div>
                                <label className="form-field-label">Item Name</label>
                                <input
                                    className="form-control-styled"
                                    placeholder="e.g., MacBook Pro 14-inch Space Gray"
                                    type="text"
                                    required
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="form-field-label" >System Status</label>
                                <div className="status-badge">
                                    <span className="material-symbols-outlined"
                                          style={{ fontVariationSettings: "'FILL' 1", fontSize: 16 }}>
                                        check_circle
                                    </span>
                                    {itemStatus}
                                </div>
                            </div>
                        </div>

                        <hr className="form-divider" />

                        {/* Additional Info */}
                        <div className="additional-header">
                            <p className="additional-title">Additional Information</p>
                            <button
                                type="button"
                                className="btn-add-row"
                                onClick={() => setDetails([...details, { key: '', value: '', isCustom: false }])}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_circle</span>
                                Add Field
                            </button>
                        </div>

                        {/* Dynamic Rows */}
                        <div className="additional-fields">
                            {details.map((row, index) => (
                                <div className="dynamic-row" key={index}>

                                    {/* Key Selector */}
                                    <select
                                        className={row.key ? '' : 'border-dashed'}
                                        value={row.key}
                                        onChange={(e) => handleKeyChange(index, e.target.value)}
                                    >
                                        {headerOptions.map(opt => (
                                            <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Value Input / Select */}
                                    {row.isCustom ? (
                                        <input
                                            type="text"
                                            className={row.key ? '' : 'border-dashed'}
                                            placeholder="Enter value..."
                                            value={row.value}
                                            onChange={(e) => handleValueChange(index, e.target.value)}
                                        />
                                    ) : (
                                        <select
                                            className={row.key ? '' : 'border-dashed'}
                                            disabled={!row.key}
                                            value={row.value}
                                            onChange={(e) => handleValueChange(index, e.target.value)}
                                        >
                                            <option value="">-- เลือกข้อมูล --</option>
                                            {valueOptions[row.key]?.map(v => (
                                                <option key={v} value={v}>{v}</option>
                                            ))}
                                        </select>
                                    )}

                                    {/* Delete Row */}
                                    <button
                                        type="button"
                                        className="btn-delete-row"
                                        onClick={() => setDetails(details.filter((_, i) => i !== index))}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                                    </button>

                                </div>
                            ))}
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={isLoading} className="btn-save-main">
                            {isLoading
                                ? <><Spinner size="sm" /> Processing...</>
                                : <><span className="material-symbols-outlined" style={{ fontSize: 20 }}></span> บันทึกข้อมูล</>
                            }
                        </button>
                        <p className="btn-save-hint">
                            System will automatically assign a unique Tracking ID upon submission.
                        </p>

                    </div>
                    {/* END Right */}

                </div>
                {/* END form-card */}
            </form>

        </div>
    );
};

export default AddItem;