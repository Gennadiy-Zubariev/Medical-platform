import axiosClient from "../api/axiosClient.js";
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from 'react-router-dom';
import { getChatRoom, sendChatMessage } from "../api/chat";
import { getMyProfile } from "../api/accounts";
import formatDate from "../utils/formatDate";

export default function ChatPage() {
    const {appointmentId} = useParams();

    const [me, setMe] = useState(null);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null)

    const bottomRef = useRef(null);
    const pollIntervalMs = 2500
    const roomId = useMemo(() => room?.id, [room]);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMe = async () => {
        try {
            const data = await getMyProfile();
            setMe(data);
        } catch (e) {
            console.error('Не вдалося завантажити профіль користувача', e);
        }
    };

    const loadRoom = async () => {
        try {
            const data = await getChatRoom(appointmentId);
            setRoom(data);
            setMessages(Array.isArray(data.messages) ? data.messages : []);
            setError(null);
        } catch (e) {
            const msg =
                e?.response?.data?.detail ||
                (e?.response?.status === 403
                  ? 'Немає доступу до цього чату'
                  : 'Не вдалось завантажити чат');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadMe();
        loadRoom();
    }, [appointmentId]);

    useEffect(() => {
        axiosClient.post(`/chat/rooms/${appointmentId}/mark_as_read/`);
    }, [appointmentId]);

    useEffect(() => {
        if (error) return;
        const id = setInterval(() => {
            loadRoom();
        }, pollIntervalMs);

        return () => clearInterval(id);
    }, [appointmentId, error]);

    useEffect(() => {
        if (!messages.length) return;
        scrollToBottom();
    }, [messages.length]);


    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        setSending(true);
        try {
            await sendChatMessage(appointmentId, trimmed);
            setText('');

            await loadRoom();
            scrollToBottom();
        } catch (e) {
            alert(
                e?.response?.data?.detail ||
                'Не вдалося надіслати повідомлення'
            );
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

  if (loading) return <p>Завантаження чату...</p>;
  if (error)
    return (
      <div>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2>Чат (прийом #{appointmentId})</h2>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: 12,
          height: 420,
          overflowY: "auto",
          background: "#fff",
        }}
      >
        {messages.length === 0 && (
          <p style={{ opacity: 0.7 }}>Повідомлень ще немає. Напишіть першим 🙂</p>
        )}


        {messages.map((m) => {
          const isMine = me?.id && m.sender?.id === me.id;
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMine ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: "8px 10px",
                  background: isMine ? "#f3f7ff" : "#f7f7f7",
                  whiteSpace: "pre-wrap",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>
                  {m.sender?.first_name || m.sender?.username || "User"}{" "}
                  {m.sender?.last_name || ""}
                </div>
                <div>{m.text}</div>

                {m.sender?.id === me?.id && (
                    <span className="read-status">
                        {m.is_read ? "✔✔" : "✔"}
                    </span>
                )}
              </div>

              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                {formatDate(m.created_at)}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div style={{ marginTop: 12 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder="Напишіть повідомлення… (Enter — відправити, Shift+Enter — новий рядок)"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <button onClick={() => setText("")} disabled={sending || !text.trim()}>
            Очистити
          </button>
          <button onClick={handleSend} disabled={sending || !text.trim()}>
            {sending ? "Надсилання…" : "Надіслати"}
          </button>
        </div>

        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
          Оновлення: кожні {pollIntervalMs / 1000} сек (polling)
          {roomId ? ` • room_id: ${roomId}` : ""}
        </p>
      </div>
    </div>
  );
}
