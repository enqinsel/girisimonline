import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#F8FAFC",
          color: "#0F172A",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 64,
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "flex-start",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 24,
            display: "flex",
            flexDirection: "column",
            gap: 32,
            height: "100%",
            justifyContent: "space-between",
            padding: 56,
            width: "100%",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: 20 }}>
            <div
              style={{
                alignItems: "center",
                background: "#0F172A",
                borderRadius: 18,
                color: "#F8FAFC",
                display: "flex",
                fontSize: 48,
                fontWeight: 900,
                height: 86,
                justifyContent: "center",
                position: "relative",
                width: 86,
              }}
            >
              G
              <div
                style={{
                  background: "#F59E0B",
                  borderRadius: 999,
                  height: 14,
                  position: "absolute",
                  right: 13,
                  top: 13,
                  width: 14,
                }}
              />
              <div
                style={{
                  background: "#10B981",
                  borderRadius: 999,
                  bottom: 14,
                  height: 8,
                  position: "absolute",
                  right: 14,
                  width: 34,
                }}
              />
              <div
                style={{
                  background: "#2563EB",
                  borderRadius: 999,
                  bottom: 14,
                  height: 8,
                  left: 14,
                  position: "absolute",
                  width: 30,
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ color: "#047857", fontSize: 28, fontWeight: 800 }}>
                Girişim Online
              </div>
              <div style={{ color: "#64748B", fontSize: 22 }}>
                Girişim, yatırım ve ekonomi haberleri
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                fontSize: 76,
                fontWeight: 800,
                letterSpacing: 0,
                lineHeight: 1.05,
                maxWidth: 920,
              }}
            >
              Gündemi kısa özetlerle takip et.
            </div>
            <div
              style={{
                color: "#64748B",
                fontSize: 30,
                lineHeight: 1.35,
                maxWidth: 860,
              }}
            >
              Kaynaklara yönlendiren sade haber akışı.
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 16,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            <span style={{ color: "#10B981" }}>girisimonline.org</span>
            <span style={{ color: "#CBD5E1" }}>•</span>
            <span style={{ color: "#2563EB" }}>startup</span>
            <span style={{ color: "#CBD5E1" }}>•</span>
            <span style={{ color: "#F59E0B" }}>ekonomi</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
