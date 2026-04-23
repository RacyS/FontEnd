import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import '../Css/UserChat.css';
import Navbar from "../components/NavBar";

function UserChat() {
    const [name, setname] = useState('');
    const [greetings, setGreetings] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const stompClient = useRef(null);
    const scrollRef = useRef(null);
    const [currentItemId, setCurrentItemId] = useState(
        localStorage.getItem("itemId") || ""
    )

    const savedId = localStorage.getItem("student_id");
    const myUserId = savedId || "Unknown_User";

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [greetings]);
    localStorage.setItem("itemId", "1")
    const connect = () => {
        if (stompClient.current?.active) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/dashboard/found-item'),
            reconnectDelay: 5000,

            onConnect: () => {
                setIsConnected(true);
                const userId = localStorage.getItem("userId")
                const itemId = localStorage.getItem("itemId")
                fetch(`http://localhost:8080/chat/history/user/${userId}/all`)
                    .then(res => res.json())
                    .then(data => {
                        console.log("ประวัติแชท:", data)
                        const history = data.map(log => ({
                            role: log.role,
                            text: log.message
                        }))
                        setGreetings(history)
                    })
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
            let messageContent = name.trim();
            let itemId = currentItemId; // ใช้ค่าเดิมก่อน

            if (messageContent.startsWith("#")) {
                const match = messageContent.match(/^#(\d+)/)
                if (match) {
                    itemId = match[1]
                    setCurrentItemId(itemId)
                    localStorage.setItem("itemId", itemId)
                }
            }

            const chatPayload = {
                senderId: localStorage.getItem("student_id"),
                userId: localStorage.getItem("userId"),
                content: messageContent, // ← ส่ง content ทั้งหมดไปเลย รวม #
                role: "user",
                itemId: itemId
            };

            setGreetings(prev => [...prev, { role: 'user', text: messageContent }]);
            stompClient.current.publish({
                destination: "/app/chat.toUser",
                body: JSON.stringify(chatPayload)
            });
            if (!itemId) {
                // ยังไม่ได้ระบุ item ให้แจ้ง user
                setGreetings(prev => [...prev, {
                    role: 'system',
                    text: 'กรุณาระบุรหัสของก่อน เช่น พิมพ์ #1 เพื่อแจ้งของหายชิ้นที่ 1'
                }])
                setname('')
                return
            }
            setname('');
        }
    };
    return (
        <div className="container">
            <Navbar />
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

                        {greetings.map((msg, idx) => {
                            const isMe     = msg.role === 'user';
                            const isAdmin  = msg.role === 'admin';
                            const isSystem = msg.role === null;

                            const rowClass = isMe
                                ? 'message-row me'
                                : isSystem
                                    ? 'message-row others system-msg'
                                    : isAdmin
                                        ? 'message-row others admin-msg'
                                        : 'message-row others';
                            return (
                                <div key={idx} className={rowClass}>
                                    <div className="message-wrapper">
                                        <span className="sender-label">
                                            {isMe ? 'คุณ' : isAdmin ? '👨‍💼 เจ้าหน้าที่' : isSystem ? '⚙️ ระบบ' : '🤖 AI'}
                                        </span>
                                        <div className="message-bubble">
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={scrollRef} />
                    </section>

                    <form className="input-area" onSubmit={sendName}>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setname(e.target.value)}
                            placeholder={isConnected ? "เริ่มด้วย #(Idของ) (ตามด้วยรุบะลักษณะสิ่่่งของ)..." : "ขาดการเชื่อมต่อ..."}
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
        </div>
    );
}

export default UserChat;