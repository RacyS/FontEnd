import React, { useState, useEffect } from 'react';
import './Css/HomePageStyle.css';
import { ItemData } from '../src/controller/ItemController';
import Navbar from './components/NavBar';

const STATUS_LABEL = {
    FOUND: {
        label: 'ยังไม่เจอเจ้าของ',
        cls: 'badge--found'          // น้ำเงิน
    },
    UNDER_VERIFICATION: {
        label: 'กำลังตรวจสอบ',
        cls: 'badge--verification'   // เหลือง
    },
    CLAIM: {
        label: 'รับคืนไปแล้ว',
        cls: 'badge--claim'          // ส้ม / เน้น
    },
    READY_TO_PICKUP: {
        label: 'พร้อมรับคืน',
        cls: 'badge--ready'          // เขียว
    },
};

const HomePage = () => {
    const [items, setItems]       = useState([]);
    const [query, setQuery]       = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            const data = await ItemData();
            setItems(data);
            setIsLoading(false);
        };
        fetchItems();
    }, []);

    const filtered = items.filter(item =>
        item.itemName?.toLowerCase().includes(query.toLowerCase())
    );

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

                {/* Stats bar */}
                <div className="hp-stats-bar">
                    <span className="hp-stats-count">
                        {isLoading ? '—' : filtered.length} รายการ
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
                ) : filtered.length === 0 ? (
                    <div className="hp-empty">
                        <span className="material-symbols-outlined hp-empty-icon">search_off</span>
                        <p>ไม่พบสิ่งของที่ค้นหา</p>
                    </div>
                ) : (
                    <div className="hp-grid">
                        {filtered.map((item) => {
                            const status = STATUS_LABEL[item.itemStatus] || { label: item.itemStatus, cls: '' };
                            return (
                                <article className="item-card" key={item.itemId}>
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
        </div>
    );
};

export default HomePage;