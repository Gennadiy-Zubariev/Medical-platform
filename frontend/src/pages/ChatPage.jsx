import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axiosClient from "../api/axiosClient.js";
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

    const roomId = useMemo(() => room?.id, [room]);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const [wsStatus, setWsStatus] = useState("disconnected");

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

    const buildWsUrl = () => {
        const token = localStorage.getItem("access");
        if (!token || !roomId) return null;
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        return `${protocol}://${window.location.host}/ws/chat/${roomId}/?token=${token}`;
    };

    const connectWebSocket = () => {
        const wsUrl = buildWsUrl();
        if (!wsUrl) return;

        setWsStatus("connecting");
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
            setWsStatus("connected");
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (!data?.id) return;
                setMessages((prev) => {
                    if (prev.some((message) => message.id === data.id)) {
                        return prev;
                    }
                    return [...prev, data];
                });
            } catch (parseError) {
                console.error("WS message parse error", parseError);
            }
        };

        socket.onclose = () => {
            setWsStatus("disconnected");
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
                connectWebSocket();
            }, 3000);
        };

        socket.onerror = () => {
            setWsStatus("disconnected");
            socket.close();
        };
    };


    useEffect(() => {
        connectWebSocket();
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            wsRef.current?.close();
        };
    }, [roomId, error]);

    useEffect(() => {
        if (!messages.length) return;
        scrollToBottom();
    }, [messages.length]);


    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        setSending(true);
        try {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ message: trimmed }));
            } else {
                await sendChatMessage(appointmentId, trimmed);
                await loadRoom();
            }
            setText("");
            scrollToBottom();
        } catch (e) {
            alert(
                e?.response?.data?.detail ||
                "Не вдалося надіслати повідомлення"
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

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Завантаження чату...</Typography>
      </Container>
    );
  }
  if (error)
    return (
      <Container maxWidth="md">
        <Alert severity="error">{error}</Alert>
      </Container>
    );

  return (
    <Container maxWidth="md">
      <Stack spacing={2}>
        <Typography variant="h4">Чат (прийом #{appointmentId})</Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            height: 420,
            overflowY: "auto",
            backgroundImage: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          }}
        >
          {messages.length === 0 && (
            <Typography color="text.secondary">
              Повідомлень ще немає. Напишіть першим 🙂
            </Typography>
          )}

          <Stack spacing={1.5}>
            {messages.map((m) => {
              const isMine = me?.id && m.sender?.id === me.id;
              return (
                <Stack
                  key={m.id}
                  spacing={0.5}
                  alignItems={isMine ? "flex-end" : "flex-start"}
                >
                  <Box
                    sx={{
                      maxWidth: "80%",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      p: 1.5,
                      backgroundColor: isMine ? "rgba(37, 99, 235, 0.08)" : "grey.50",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block">
                      {m.sender?.first_name || m.sender?.username || "User"}{" "}
                      {m.sender?.last_name || ""}
                    </Typography>
                    <Typography>{m.text}</Typography>
                    {m.sender?.id === me?.id && (
                      <Typography variant="caption" color="text.secondary">
                        {m.is_read ? "✔✔" : "✔"}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(m.created_at)}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
          <div ref={bottomRef} />
        </Paper>

        <Divider />

        <Stack spacing={2}>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            multiline
            rows={3}
            placeholder="Напишіть повідомлення… (Enter — відправити, Shift+Enter — новий рядок)"
            fullWidth
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
            <Button onClick={() => setText("")} disabled={sending || !text.trim()} variant="outlined">
              Очистити
            </Button>
            <Button onClick={handleSend} disabled={sending || !text.trim()} variant="contained">
              {sending ? "Надсилання…" : "Надіслати"}
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Статус з'єднання: {wsStatus}
            {roomId ? ` • room_id: ${roomId}` : ""}
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
