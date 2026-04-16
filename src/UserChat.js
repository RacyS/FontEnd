import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './Css/Dashboard.css';

function UserChat() {
    const [name, setname] = useState('');
    const [greetings, setGreetings] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const stompClient = useRef(null);
    const scrollRef = useRef(null);

    const savedId = localStorage.getItem("student_id");
    const myUserId = savedId || "Unknown_User";

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [greetings]);

    const connect = () => {
        if (stompClient.current?.active) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/dashboard/found-item'),
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);
                // Subscribe เฉพาะช่องของตัวเอง
                client.subscribe('/user/queue/reply', (message) => {
                    const parsedData = JSON.parse(message.body);
                    console.log("ได้รับข้อความ:", message.body)
                    setGreetings((prev) => [...prev, {

                        role: parsedData.role || 'ai', // รองรับ 'ai' หรือ 'admin'
                        text: parsedData.content
                    }]);
                }, {
                    studentId: myUserId, userId:localStorage.getItem("userId")});
            },
            onDisconnect: () => setIsConnected(false),
            onStompError: (frame) => console.error('STOMP Error:', frame),
        });

        client.activate();
        stompClient.current = client;
    };

    const disconnect = () => {
        if (stompClient.current) stompClient.current.deactivate();
    };

    useEffect(() => {
        connect();
        return () => disconnect();
        // eslint-disable-next-line
    }, []);

    const sendName = (e) => {
        e.preventDefault();
        if (isConnected && name.trim()) {
            const chatPayload = {
                senderId: localStorage.getItem("student_id"),
                userId: localStorage.getItem("userId"),
                content: name,
                role: "user",
                itemId:"1242112421"
            };
            setGreetings(prev => [...prev, { role: 'user', text: name }]);
            stompClient.current.publish({
                destination: "/app/chat.toUser",
                body: JSON.stringify(chatPayload)
            });
            setname('');
        }
    };

    return (
        <div className="chat-app-wrapper">
            <div className="chat-container">
                <header className="chat-header">
                    <div className="status-info">
                        <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
                        <h2>ระบบแจ้งของหาย (ID: {myUserId})</h2>
                    </div>
                    {!isConnected && <button className="reconnect-btn" onClick={connect}>เชื่อมต่อใหม่</button>}
                </header>

                <section className="chat-window">
                    {greetings.length === 0 && (
                        <div className="empty-chat">เริ่มการสนทนาโดยการพิมพ์ข้อความด้านล่าง</div>
                    )}
                    {greetings.map((msg, idx) => (
                        <div key={idx} className={`message-row ${msg.role === 'user' ? 'me' : 'others'}`}>
                            <div className="message-wrapper">
                                <span className="sender-label">
                                    {msg.role === 'user' ? 'คุณ' : msg.role === 'admin' ? 'เจ้าหน้าที่' : '🤖 AI'}
                                </span>
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </section>

                <form className="input-area" onSubmit={sendName}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setname(e.target.value)}
                        placeholder={isConnected ? "พิมพ์ข้อความ..." : "ขาดการเชื่อมต่อ..."}
                        disabled={!isConnected}
                    />
                    <button type="submit" disabled={!isConnected || !name.trim()}>
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UserChat;