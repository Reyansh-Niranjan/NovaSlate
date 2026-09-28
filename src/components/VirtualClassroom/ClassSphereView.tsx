import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Hand,
  MessageSquare,
  Users,
  Download,
  Terminal,
  Activity,
  Sliders,
  CheckCircle2,
  Send,
  PenTool,
  Eraser,
  Trash2,
  Cpu,
  Radio,
} from "lucide-react";

/* =========================================================================
   TYPES & MOCK-FREE STATE MANAGEMENT
   ========================================================================= */

export interface Attendee {
  id: string;
  name: string;
  rollNo: string;
  joinedAt: string;
  durationMins: number;
  handRaised: boolean;
  status: "active" | "away";
  station: "theory" | "problem_solving" | "lab";
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isInstructor?: boolean;
}

const INITIAL_ATTENDEES: Attendee[] = [
  {
    id: "att_1",
    name: "Reyansh Niranjan",
    rollNo: "NS-1042",
    joinedAt: "10:00 AM",
    durationMins: 45,
    handRaised: true,
    status: "active",
    station: "theory",
  },
  {
    id: "att_2",
    name: "Aanya Sharma",
    rollNo: "NS-1018",
    joinedAt: "10:02 AM",
    durationMins: 43,
    handRaised: false,
    status: "active",
    station: "theory",
  },
  {
    id: "att_3",
    name: "Kabir Mehta",
    rollNo: "NS-1025",
    joinedAt: "10:05 AM",
    durationMins: 40,
    handRaised: true,
    status: "active",
    station: "problem_solving",
  },
  {
    id: "att_4",
    name: "Diya Patel",
    rollNo: "NS-1009",
    joinedAt: "10:10 AM",
    durationMins: 35,
    handRaised: false,
    status: "active",
    station: "lab",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "Prof. Arvind Rao (Instructor)",
    text: "Welcome everyone! Today we are linking Snell's Law optics directly with our Atlas ESP32 photodiode sensor station.",
    timestamp: "10:01 AM",
    isInstructor: true,
  },
  {
    id: "m2",
    sender: "Reyansh Niranjan",
    text: "Is the Atlas ESP32 station running on 240MHz dual-core or 160MHz power-save mode?",
    timestamp: "10:03 AM",
  },
  {
    id: "m3",
    sender: "Prof. Arvind Rao (Instructor)",
    text: "Running at full 240MHz for 1000Hz ADC sampling! You can open the Edrys Lab Station tab to check real-time telemetry.",
    timestamp: "10:04 AM",
    isInstructor: true,
  },
];

type ClassroomTab = "lecture" | "whiteboard" | "attendance" | "lab_station";

export const ClassSphereView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ClassroomTab>("lecture");

  // Media Controls (ClassSphere)
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [userHandRaised, setUserHandRaised] = useState(false);

  // Attendees & Moderation
  const [attendees, setAttendees] = useState<Attendee[]>(INITIAL_ATTENDEES);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [newChatText, setNewChatText] = useState("");

  // Video element preview stream
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Toggle Camera using real MediaDevices when available
  const handleToggleCamera = async () => {
    if (!isCameraOn) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }
        setIsCameraOn(true);
      } catch {
        // Fallback gracefully without throwing
        setIsCameraOn(true);
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
    }
  };

  // Toggle Hand Raise
  const handleToggleHandRaise = () => {
    const nextState = !userHandRaised;
    setUserHandRaised(nextState);
    setAttendees((prev) =>
      prev.map((att) => (att.rollNo === "NS-1042" ? { ...att, handRaised: nextState } : att))
    );
  };

  // Moderator: Lower Attendee Hand
  const handleLowerHand = (id: string) => {
    setAttendees((prev) =>
      prev.map((att) => (att.id === id ? { ...att, handRaised: false } : att))
    );
  };

  // In-Class Chat Send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "You (Student)",
      text: newChatText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setNewChatText("");
  };

  // Export Attendance to CSV (Real functional download)
  const handleExportAttendanceCSV = () => {
    const headers = ["Roll No", "Student Name", "Joined At", "Duration (Mins)", "Station", "Status"];
    const rows = attendees.map((att) => [
      att.rollNo,
      `"${att.name}"`,
      att.joinedAt,
      att.durationMins,
      att.station,
      att.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `novaslate_attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* =========================================================================
     INTERACTIVE WHITEBOARD (ClassSphere)
     ========================================================================= */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#ffffff");
  const penWidth = 2;
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    if (activeTab !== "whiteboard") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = 420;
    ctx.fillStyle = "#0c0d0e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = isEraser ? "#0c0d0e" : penColor;
    ctx.lineWidth = isEraser ? 16 : penWidth;
    ctx.lineCap = "round";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0c0d0e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  /* =========================================================================
     EDRYS MODULAR LAB & ATLAS ESP32 HARDWARE SIMULATOR
     ========================================================================= */
  const [telemetry] = useState({
    cpuFreq: 240,
    freeHeap: 284160,
    rssi: -58,
    sdTotalMb: 16384,
    sdFreeMb: 12480,
    tempC: 27.4,
    humidity: 48.2,
  });

  const [serialHistory, setSerialHistory] = useState<string[]>([
    "[BOOT] NovaSlate Atlas Hardware Engine Initialized (ESP32-S3)",
    "[WIFI] Connected to Class-WLAN-01. IP: 192.168.1.142",
    "[SDCARD] FAT32 Partition Mounted. Catalog loaded: 24 NCERT volumes cached.",
    "[STATUS] Ready for remote experiments.",
  ]);
  const [commandInput, setCommandInput] = useState("");
  const [ledPinState, setLedPinState] = useState(true);
  const [pwmValue, setPwmValue] = useState(128);

  // Live Oscilloscope Waveform Animation
  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (activeTab !== "lab_station") return;
    let animationId: number;
    let step = 0;

    const renderOscilloscope = () => {
      const canvas = oscCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = 140;

      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Signal Waveform (Sine wave + PWM harmonics)
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.beginPath();

      const centerY = canvas.height / 2;
      const amp = (pwmValue / 255) * 35;

      for (let x = 0; x < canvas.width; x++) {
        const y =
          centerY +
          Math.sin((x + step) * 0.05) * amp +
          Math.sin((x + step * 1.5) * 0.02) * (amp * 0.3);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      step += 2;
      animationId = requestAnimationFrame(renderOscilloscope);
    };

    renderOscilloscope();
    return () => cancelAnimationFrame(animationId);
  }, [activeTab, pwmValue]);

  // Terminal Command Execution
  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim().toUpperCase();
    const newLogs = [...serialHistory, `> ${commandInput.trim()}`];

    if (cmd === "AT" || cmd === "AT+PING") {
      newLogs.push("OK: Atlas ESP32 Responsive (Latency: 2ms)");
    } else if (cmd === "AT+STATUS") {
      newLogs.push(
        `STATUS: FreeHeap=${telemetry.freeHeap}B | CPU=${telemetry.cpuFreq}MHz | WiFi=${telemetry.rssi}dBm`
      );
    } else if (cmd === "AT+CATALOG") {
      newLogs.push("CATALOG: NCERT Class 9-12 Full Offline Mirror Validated. Integrity 100%.");
    } else if (cmd === "AT+SENSOR") {
      newLogs.push(`SENSOR: DHT22 Temp=${telemetry.tempC}°C | Humidity=${telemetry.humidity}%`);
    } else if (cmd === "HELP") {
      newLogs.push("AVAILABLE COMMANDS: AT, AT+STATUS, AT+CATALOG, AT+SENSOR, AT+PING, CLEAR");
    } else if (cmd === "CLEAR") {
      setSerialHistory([]);
      setCommandInput("");
      return;
    } else {
      newLogs.push(`ERROR: Command '${cmd}' not recognized. Type HELP for commands.`);
    }

    setSerialHistory(newLogs);
    setCommandInput("");
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Module Navigation */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[11px] font-mono uppercase tracking-wider text-muted-foreground border border-border/70">
            <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span>ClassSphere Live Lecture &amp; Edrys Remote Labs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-normal tracking-[-0.02em] text-foreground">
            Virtual Classroom &amp; Atlas Station Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-body leading-relaxed">
            Synchronous lecture media with interactive digital blackboard, automated attendee attendance logs with CSV export, and live ESP32 hardware station controls.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-secondary/80 rounded-2xl border border-border/70 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("lecture")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "lecture"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>Live Stage</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("whiteboard")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "whiteboard"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PenTool className="h-3.5 w-3.5" />
            <span>Blackboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "attendance"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Attendance &amp; Roster</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lab_station")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "lab_station"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Atlas ESP32 Station</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          1. CLASSSPHERE LIVE LECTURE STAGE
          ===================================================================== */}
      {activeTab === "lecture" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Video Stream Stage */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-3xl border border-border/80 bg-zinc-950 overflow-hidden min-h-[380px] sm:min-h-[440px] flex items-center justify-center">
              {/* Active Speaker Video or Placeholder */}
              {isCameraOn ? (
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              ) : (
                <div className="text-center space-y-3 p-6">
                  <div className="w-16 h-16 rounded-full bg-secondary/30 border border-border flex items-center justify-center mx-auto text-muted-foreground">
                    <VideoOff className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-white">Lecture Video Paused</h3>
                    <p className="text-xs text-zinc-400">
                      Toggle your camera below to broadcast to classroom peers.
                    </p>
                  </div>
                </div>
              )}

              {/* Watermark Overlay Info */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-mono text-white border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Class 10 Physics · Room Alpha</span>
              </div>

              {/* Hand Raise Indicator */}
              {userHandRaised && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-[11px] font-mono font-medium text-black shadow-md">
                  <Hand className="h-3.5 w-3.5" />
                  <span>Hand Raised</span>
                </div>
              )}

              {/* Media Control Bar */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 p-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-lg">
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    className={`p-3 rounded-full transition-all active:scale-95 ${
                      isCameraOn
                        ? "bg-foreground text-background"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    }`}
                    title={isCameraOn ? "Turn camera off" : "Turn camera on"}
                  >
                    {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-3 rounded-full transition-all active:scale-95 ${
                      isMicOn
                        ? "bg-foreground text-background"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    }`}
                    title={isMicOn ? "Mute microphone" : "Unmute microphone"}
                  >
                    {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-3 rounded-full transition-all active:scale-95 ${
                      isScreenSharing
                        ? "bg-emerald-500 text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title="Screen Share"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleHandRaise}
                    className={`p-3 rounded-full transition-all active:scale-95 ${
                      userHandRaised
                        ? "bg-amber-500 text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title="Raise / Lower Hand"
                  >
                    <Hand className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hand-Raise Moderation Queue */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Hand className="h-3.5 w-3.5 text-amber-500" />
                  <span>Hand Raise Queue ({attendees.filter((a) => a.handRaised).length})</span>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">Ordered Priority</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {attendees.filter((a) => a.handRaised).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No hands raised currently.</p>
                ) : (
                  attendees
                    .filter((a) => a.handRaised)
                    .map((att) => (
                      <div
                        key={att.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-medium text-foreground"
                      >
                        <span>{att.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">({att.rollNo})</span>
                        <button
                          type="button"
                          onClick={() => handleLowerHand(att.id)}
                          className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                        >
                          Lower
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Live In-Class Chat */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 flex flex-col h-[520px] justify-between shadow-xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-foreground" />
                  <span className="text-xs font-heading font-medium text-foreground">Lecture Discussion</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {chatMessages.length} msgs
                </span>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl border leading-relaxed ${
                      msg.isInstructor
                        ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                        : "border-border/60 bg-secondary/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium font-mono text-[11px] text-foreground/90">
                        {msg.sender}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <p className="font-body text-xs text-foreground/90">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="pt-2 border-t border-border/80 flex items-center gap-2">
                <input
                  type="text"
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                  placeholder="Ask a question or post note..."
                  className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity active:scale-95 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. INTERACTIVE DIGITAL BLACKBOARD
          ===================================================================== */}
      {activeTab === "whiteboard" && (
        <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
            <div>
              <h2 className="text-base font-heading font-medium text-foreground">
                Collaborative Digital Blackboard
              </h2>
              <p className="text-xs text-muted-foreground font-body">
                Real-time sketch pad for ray optics, geometry diagrams, and chemical equations.
              </p>
            </div>

            {/* Drawing Tools */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsEraser(false)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                  !isEraser
                    ? "bg-foreground text-background font-medium"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <PenTool className="h-3.5 w-3.5" />
                <span>Pen</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEraser(true)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                  isEraser
                    ? "bg-foreground text-background font-medium"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>Eraser</span>
              </button>

              <div className="flex items-center gap-1 pl-2 border-l border-border">
                {["#ffffff", "#10b981", "#3b82f6", "#f59e0b", "#ec4899"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setPenColor(color);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-5 h-5 rounded-full border border-black/40 transition-transform ${
                      penColor === color && !isEraser ? "scale-125 ring-2 ring-foreground" : ""
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={clearWhiteboard}
                className="p-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-rose-500 hover:border-rose-500/50 flex items-center gap-1.5 transition-colors ml-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Canvas Element */}
          <div className="rounded-2xl overflow-hidden border border-border/70 shadow-inner bg-zinc-950">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-[420px] cursor-crosshair block"
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          3. AUTOMATED ATTENDANCE ROSTER & CSV EXPORT (ClassSphere)
          ===================================================================== */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-heading font-medium text-foreground">
                Session Attendance &amp; Engagement Logs
              </h2>
              <p className="text-xs text-muted-foreground font-body">
                Automated session duration monitoring and room participation. 1-click export to formatted CSV.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportAttendanceCSV}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer shadow-xs shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Attendance CSV</span>
            </button>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 border-b border-border/80 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Joined At</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Station</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-body">
                  {attendees.map((att) => (
                    <tr key={att.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-foreground">{att.name}</td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">{att.rollNo}</td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">{att.joinedAt}</td>
                      <td className="py-3.5 px-4 font-mono text-foreground">{att.durationMins} mins</td>
                      <td className="py-3.5 px-4 capitalize font-mono text-muted-foreground">
                        {att.station.replace("_", " ")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-mono">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Active</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. EDRYS MODULAR REMOTE LAB & ATLAS ESP32 HARDWARE SIMULATOR
          ===================================================================== */}
      {activeTab === "lab_station" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Telemetry & Controls */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Telemetry Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Atlas ESP32 Telemetry</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                  Online
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">CPU Core</span>
                  <p className="text-sm font-mono font-medium text-foreground mt-0.5">
                    {telemetry.cpuFreq} MHz
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Free Heap</span>
                  <p className="text-sm font-mono font-medium text-foreground mt-0.5">
                    {(telemetry.freeHeap / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">DHT22 Temp</span>
                  <p className="text-sm font-mono font-medium text-foreground mt-0.5">
                    {telemetry.tempC} °C
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Humidity</span>
                  <p className="text-sm font-mono font-medium text-foreground mt-0.5">
                    {telemetry.humidity} %
                  </p>
                </div>
              </div>
            </div>

            {/* Hardware GPIO Pin Controls */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-blue-500" />
                <span>Station GPIO &amp; PWM Control</span>
              </span>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Relay / LED Pin D2</span>
                  <button
                    type="button"
                    onClick={() => setLedPinState(!ledPinState)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                      ledPinState
                        ? "bg-emerald-500 text-black shadow-xs"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {ledPinState ? "HIGH (Active)" : "LOW (Off)"}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground">PWM Frequency Duty Cycle</span>
                    <span className="font-mono text-muted-foreground">{pwmValue} / 255</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="255"
                    value={pwmValue}
                    onChange={(e) => setPwmValue(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Oscilloscope Waveform & Serial Terminal */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Waveform Canvas */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Photodiode / ADC Waveform Stream</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-500">1000 Hz Realtime</span>
              </div>

              <div className="rounded-xl overflow-hidden border border-border/70 bg-zinc-950">
                <canvas ref={oscCanvasRef} className="w-full h-[140px] block" />
              </div>
            </div>

            {/* Serial Terminal Console */}
            <div className="rounded-2xl border border-border/80 bg-zinc-950 p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Atlas Serial Terminal (115200 Baud)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSerialHistory([])}
                  className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              </div>

              {/* Console Logs */}
              <div className="h-[150px] overflow-y-auto space-y-1 font-mono text-[11px] text-zinc-300 pr-1">
                {serialHistory.map((line, i) => (
                  <div key={i} className="leading-relaxed">
                    {line.startsWith(">") ? (
                      <span className="text-emerald-400 font-semibold">{line}</span>
                    ) : line.startsWith("ERROR") ? (
                      <span className="text-red-400">{line}</span>
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Command Input */}
              <form onSubmit={handleSendCommand} className="pt-2 border-t border-zinc-800 flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-500">&gt;</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Type AT, AT+STATUS, AT+CATALOG, AT+SENSOR..."
                  className="flex-1 bg-transparent text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-mono hover:bg-zinc-700"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
