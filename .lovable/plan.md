

## Student Portal Layout Redesign

Currently everything is mixed in a 3-column grid: QR scanner + history on the left (2 cols), stats sidebar on the right (1 col). The user wants a cleaner separation between **stats** and **camera/history**.

### Proposed Layout

Use **Tabs** to separate the two concerns:

1. **Tab 1: "Scan"** — The QR code scanner/camera area (mark attendance)
2. **Tab 2: "History"** — Attendance history list

**Stats** move to a compact summary bar at the top (below the header), always visible regardless of active tab. This gives a clean separation:

```text
┌──────────────────────────────────┐
│  Header: Student Portal          │
├──────────────────────────────────┤
│  Stats Bar: 100% | 3 Present | 3 Total │
├──────────────────────────────────┤
│  [Scan]  [History]   ← Tabs     │
├──────────────────────────────────┤
│  Tab content (full width)        │
└──────────────────────────────────┘
```

### Changes in `StudentPortal.tsx`

- Add `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` imports
- Move the stats into a horizontal card row at the top (attendance %, present count, total classes — as 3 inline stat cards)
- Tab "Scan": Contains the QR scanner card
- Tab "History": Contains the attendance history list
- Remove the 3-column grid layout, use full-width single column
- Keep the tip below the stats bar or inside the scan tab

