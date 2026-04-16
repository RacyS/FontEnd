import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './Css/AdminDashboard.css';

function AdminDashboard() {
    const [isConnected, setIsConnected] = useState(false);
    const [chats, setChats] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [takenOverChats, setTakenOverChats] = useState(new Set());
    const [replyText, setReplyText] = useState('');

    const stompClient = useRef(null);
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
                client.subscribe('/topic/admin-dashboard', (message) => {
                    const parsedMessage = JSON.parse(message.body);
                    const senderId = parsedMessage.senderId;
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
                tarGetUserid: localStorage.getItem("userId"),
                role: "admin",
                itemId:"1242112421",
                content: replyText
            })
        });
        setReplyText('');
    };

    const userList = Object.keys(chats);

    return (
        <div className="admin-layout">
            {/* ฝั่งซ้าย: รายชื่อ User */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>Admin Dashboard</h3>
                    <small>{isConnected ? '🟢 ออนไลน์' : '🔴 ขาดการเชื่อมต่อ'}</small>
                </div>
                <ul className="user-list">
                    {userList.length === 0 && <li style={{padding: '20px', textAlign: 'center', color: '#999'}}>ไม่มีข้อความใหม่</li>}
                    {userList.map(userId => (
                        <li
                            key={userId}
                            className={`user-item ${selectedUser === userId ? 'active' : ''}`}
                            onClick={() => setSelectedUser(userId)}
                        >
                            <div className="user-info-brief">
                                <h4>User: {userId}</h4>
                                <div className="last-msg">
                                    {chats[userId][chats[userId].length - 1].content.substring(0, 30)}...
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* ฝั่งขวา: หน้าต่างแชท */}
            <main className="chat-main">
                {selectedUser ? (
                    <>
                        <header className="chat-header-bar">
                            <div>
                                <strong>สนทนากับ: {selectedUser}</strong>
                            </div>
                            {!takenOverChats.has(selectedUser) ? (
                                <button className="takeover-btn" onClick={adminTakeOVer}>🙋 รับเคส (ปิด AI)</button>
                            ) : (
                                <span style={{color: '#2e7d32', fontWeight: 'bold'}}>✅ กำลังดูแล</span>
                            )}
                        </header>

                        <div className="messages-container">
                            {chats[selectedUser].map((msg, idx) => (
                                <div key={idx} className={`bubble-row ${msg.role === 'admin' ? 'admin' : 'other'}`}>
                                    <div className="bubble-wrapper">
                                        <span className="role-tag">
                                            {msg.role === 'admin' ? 'คุณ' : msg.role === 'ai' ? '🤖 AI' : '👤 User'}
                                        </span>
                                        <div className="bubble">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
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
    );
}

export default AdminDashboard;