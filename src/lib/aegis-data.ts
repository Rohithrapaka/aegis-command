export const AUTH_TREND = [
  { t: "00", auth: 42, risk: 21 },
  { t: "02", auth: 28, risk: 19 },
  { t: "04", auth: 22, risk: 16 },
  { t: "06", auth: 51, risk: 18 },
  { t: "08", auth: 96, risk: 24 },
  { t: "10", auth: 132, risk: 22 },
  { t: "12", auth: 148, risk: 27 },
  { t: "14", auth: 139, risk: 20 },
  { t: "16", auth: 121, risk: 18 },
  { t: "18", auth: 88, risk: 17 },
  { t: "20", auth: 63, risk: 15 },
  { t: "22", auth: 47, risk: 18 },
];

export const SUCCESS_TREND = [
  { t: "Mon", v: 98.6 },
  { t: "Tue", v: 99.1 },
  { t: "Wed", v: 98.9 },
  { t: "Thu", v: 99.4 },
  { t: "Fri", v: 99.2 },
  { t: "Sat", v: 99.6 },
  { t: "Sun", v: 99.71 },
];

export const METHODS = [
  { name: "Face", value: 96 },
  { name: "Fallback", value: 3 },
  { name: "Challenge", value: 1 },
];

export const PROTECTED_APPS = [
  { name: "WhatsApp", auths: 98, posture: "Excellent", policy: "Face + Liveness" },
  { name: "Gmail", auths: 67, posture: "Excellent", policy: "Face + Liveness" },
  { name: "Banking App", auths: 41, posture: "Hardened", policy: "Face + Risk ≤ 25" },
  { name: "Drive", auths: 23, posture: "Excellent", policy: "Face" },
  { name: "Internal VPN", auths: 19, posture: "Hardened", policy: "Face + Device bind" },
  { name: "Others", auths: 36, posture: "Standard", policy: "Face" },
];

export const INCIDENTS = [
  { severity: "High", type: "Spoof Attempt", detail: "Photo injection detected", time: "2m ago", status: "Blocked", origin: "Lagos, NG" },
  { severity: "Medium", type: "Unusual Behaviour", detail: "Multiple failed attempts", time: "15m ago", status: "Monitored", origin: "Warsaw, PL" },
  { severity: "Medium", type: "Low Quality Image", detail: "Image clarity below threshold", time: "32m ago", status: "Monitored", origin: "Austin, US" },
  { severity: "Low", type: "New Device", detail: "Login from new device", time: "1h ago", status: "Allowed", origin: "Lisbon, PT" },
  { severity: "Low", type: "Geolocation Change", detail: "New location detected", time: "2h ago", status: "Allowed", origin: "Mumbai, IN" },
  { severity: "High", type: "Replay Attack", detail: "Recorded video signature", time: "3h ago", status: "Blocked", origin: "São Paulo, BR" },
];

export const TIMELINE = [
  { label: "Authentication successful", user: "m.alvarez", risk: 12, ago: "2s ago" },
  { label: "Risk evaluated — low", user: "s.okafor", risk: 18, ago: "9s ago" },
  { label: "BioHash generated", user: "j.lindqvist", risk: 14, ago: "24s ago" },
  { label: "Protected app launched", user: "a.deshmukh", risk: 11, ago: "48s ago" },
  { label: "Spoof attempt blocked", user: "unknown", risk: 91, ago: "2m ago" },
  { label: "Authentication successful", user: "r.kimura", risk: 9, ago: "3m ago" },
  { label: "Device binding renewed", user: "l.moreau", risk: 16, ago: "6m ago" },
  { label: "Authentication successful", user: "t.nakamura", risk: 13, ago: "8m ago" },
];

export const LOCATIONS = [
  { city: "London", share: 28, x: 47, y: 32 },
  { city: "New York", share: 24, x: 26, y: 38 },
  { city: "Mumbai", share: 18, x: 68, y: 47 },
  { city: "Singapore", share: 14, x: 76, y: 56 },
  { city: "São Paulo", share: 9, x: 33, y: 68 },
  { city: "Lagos", share: 7, x: 49, y: 55 },
];