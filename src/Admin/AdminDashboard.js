import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import '../Css/AdminDashboard.css';
import Navbar from '../components/NavBar';

function AdminDashboard() {
    const [isConnected, setIsConnected] = useState(false);
    const [chats, setChats] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [takenOverChats, setTakenOverChats] = useState(new Set());
    const [replyText, setReplyText] = useState('');
    const [userItemIds, setUserItemIds] = useState({});
    const stompClient = useRef(null);
    const [verifiedUsers, setVerifiedUsers] = useState(new Set())

    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats, selectedUser]);

    const connect = () => {
        if (stompClient.current?.active) return;
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/dashboard/found-item'),
            onConnect: () => {
                setIsConnected(true);
                fetch('http://localhost:8080/chat/history/all')
                    .then(res => res.json())
                    .then(data => {
                        const historyChats = {};
                        Object.entries(data).forEach(([userId, logs]) => {
                            historyChats[userId] = logs.map(log => ({
                                senderId: userId,
                                content: log.message,
                                role: log.role,
                                itemId: log.itemId
                            }));
                            const lastLog = logs[logs.length - 1];
                            if (lastLog?.itemId) {
                                setUserItemIds(prev => ({ ...prev, [userId]: String(lastLog.itemId) }));
                            }
                        });
                        setChats(historyChats);
                    });

                fetch('http://localhost:8080/chat/status/all')
                    .then(res => res.json())
                    .then(data => {
                        const takenOver = new Set(
                            Object.entries(data)
                                .filter(([_, status]) => status === 'STAFF_ACTIVE')
                                .map(([studentId]) => studentId)
                        );
                        setTakenOverChats(takenOver);
                    });
                fetch('http://localhost:8080/chat/verified/all')
                    .then(res => res.json())
                    .then(data => {
                        setVerifiedUsers(new Set(data))
                    })

                client.subscribe('/topic/admin-dashboard', (message) => {
                    const parsedMessage = JSON.parse(message.body);
                    const senderId = parsedMessage.senderId;
                    // ถ้าเป็น notify → เปลี่ยน background ไม่เพิ่มแชท
                    if (parsedMessage.role === 'notify') {
                        setVerifiedUsers(prev => new Set([...prev, `${senderId}_${parsedMessage.itemId}`]))
                        return // ← ไม่เพิ่มใน chats
                    }
                    // ข้อความปกติ
                    if (parsedMessage.itemId) {
                        setUserItemIds(prev => ({ ...prev, [senderId]: parsedMessage.itemId }));
                    }
                    setChats(prevChats => {
                        const existing = prevChats[senderId] || [];
                        return { ...prevChats, [senderId]: [...existing, parsedMessage] };
                    });
                });
            },
            onDisconnect: () => setIsConnected(false)
        });
        client.activate();
        stompClient.current = client;
    };

    useEffect(() => {
        connect();
        return () => stompClient.current?.deactivate();
    }, []);

    const adminTakeOVer = () => {
        stompClient.current.publish({
            destination: "/app/admin.takeOver",
            body: JSON.stringify({
                senderId: selectedUser,
                role: "admin",
                userId: localStorage.getItem("userId"),
                itemId: userItemIds[selectedUser],
                content: "--- เจ้าหน้าที่ได้เข้าควบคุมการสนทนาแล้ว ---"
            })
        });
        setTakenOverChats(prev => new Set([...prev, selectedUser]));
    };

    const adminTakeReply = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        stompClient.current.publish({
            destination: "/app/admin.chat.toUser",
            body: JSON.stringify({
                senderId: selectedUser,
                userId: localStorage.getItem("userId"),
                role: "admin",
                itemId: userItemIds[selectedUser] || null,
                content: replyText
            })
        });
        setReplyText('');
    };

    const adminLetOVer = () => {
        stompClient.current.publish({
            destination: "/app/admin.letOver", // หรือ endpoint อื่นที่ใช้ปล่อยเคส
            body: JSON.stringify({
                senderId: selectedUser,
                userId: localStorage.getItem("userId"),
                role: null,
                itemId: userItemIds[selectedUser] || null,
                content: "--- ระบบ AI กลับมาทำงานแล้ว ---"
            })
        });

        setTakenOverChats(prev => {
            const newSet = new Set(prev);
            newSet.delete(selectedUser);
            return newSet;
        });
    };
    const adminVerify = () =>{
        stompClient.current.publish({
            destination: "/app/admin.verify",
            body: JSON.stringify({
                senderId: selectedUser,
                itemId: userItemIds[selectedUser],
                content: "--- แอดมินยืนยันมารับของได้ที่ ตึก 3 ชั้น 3 ---"
            })
        })
    }


    const userList = Object.keys(chats);

    return (
        <div>
            <Navbar />
            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <div className="sidebar-header">
                        <h3>Admin Dashboard</h3>
                        <small>{isConnected ? '🟢 ออนไลน์' : '🔴 ขาดการเชื่อมต่อ'}</small>
                    </div>
                    <ul className="user-list">
                        {userList.length === 0 && <li style={{ padding: '20px', textAlign: 'center', color: '#999' }}>ไม่มีข้อความใหม่</li>}
                        {userList.map(userId => (
                            <li
                                key={userId}
                                className={`user-item ${selectedUser === userId ? 'active' : ''} ${verifiedUsers.has(`${userId}_${userItemIds[userId]}`) ? 'verified-bg' : ''}`}
                                onClick={() => setSelectedUser(userId)}
                            >
                                <div className="user-info-brief">
                                    <h4>
                                        User: {userId}
                                        {verifiedUsers.has(`${userId}_${userItemIds[userId]}`) && ' ✅'}
                                    </h4>
                                    <div className="last-msg">
                                        {chats[userId]?.length > 0
                                            ? chats[userId][chats[userId].length - 1].content.substring(0, 30) + "..."
                                            : "ไม่มีข้อความ"}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="chat-main">
                    {selectedUser ? (
                        <>
                            <header className="chat-header-bar">
                                <strong>สนทนากับ: {selectedUser}</strong>
                                <div className="chat-header-actions">
                                    {!takenOverChats.has(selectedUser) ? (
                                        <button className="takeover-btn" onClick={adminTakeOVer}>
                                            รับเคส (ปิด AI)
                                        </button>
                                    ) : (
                                        <>
                                            <span className="active-label">✅ กำลังดูแล</span>
                                            <button className="letover-btn" onClick={adminLetOVer}>
                                                คืนให้ AI
                                            </button>
                                        </>
                                    )}
                                    <button className="admin-verify" onClick={adminVerify}>
                                        ยืนยันผู้รับ
                                    </button>
                                </div>
                            </header>
                            <div className="messages-container">
                                {chats[selectedUser].map((msg, idx) => {
                                    // 1. ประกาศตัวแปรเช็ค Role ตรงนี้
                                    const isAdmin = msg.role === 'admin';
                                    const isUser  = msg.role === 'user';  // ✅
                                    const isAi    = msg.role === 'ai' || msg.role === null;
                                    // 2. คืนค่า (return) JSX ออกไป
                                    return (
                                        <div key={idx} className={`bubble-row ${isAdmin ? 'admin' : 'other'}`}>
                                            <div className="bubble-wrapper">
                                                <span className="role-tag">
                                                    {isAdmin && 'คุณ'}
                                                    {isAi && '🤖 AI'}
                                                    {isUser && '👤 User'}
                                                </span>
                                                <div className="bubble">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>

                            <form className="admin-input-area" onSubmit={adminTakeReply}>
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={!takenOverChats.has(selectedUser)}
                                    placeholder={takenOverChats.has(selectedUser) ? "พิมพ์ข้อความตอบกลับ..." : "ต้องกด 'รับเคส' ก่อนตอบ"}
                                />
                                <button className="send-btn" type="submit" disabled={!takenOverChats.has(selectedUser) || !replyText.trim()}>
                                    ส่ง
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                            <h3>เลือกรหัสสมาชิกจากฝั่งซ้ายเพื่อดูแชท</h3>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default AdminDashboard;