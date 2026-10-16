# Chat History Export Feature

This feature allows users to export their chat history and assistant responses in multiple formats: PDF, TXT, Markdown, and Python. It provides a simple menu to select the preferred format and download the conversation file.

### User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the requirement to export chat history and assistant responses.

- **Confirmed Decision**: Export functionality will support PDF, TXT, MD, and Python formats.
- **Confirmed Decision**: Export will be client-side triggered.

### 1. Overview & Core Concept

- **What It Does**: Adds an "Export" option in the chat interface that allows users to download the current conversation's history in their preferred format.
- **Key Value**: Enables users to save and share conversation insights for future reference or offline analysis.

### 2. User Experience & Visual Design

- **Flow**:
    1. User clicks the "Export" button in the chat header.
    2. A dropdown menu appears with options: PDF, TXT, Markdown, Python.
    3. User selects format, and a file download is triggered automatically.
- **Visuals**:
    - Clean, modern export dropdown.
    - Icons for each format.
    - Status feedback (download started).

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Export**
    - *Chosen Approach*: Handle all formatting and download generation on the client-side.
    - *Why*: Privacy, speed, and simplicity. No need to send conversation data to a backend for formatting.
    - *Alternatives Considered*: Server-side generation. Rejected due to increased complexity and latency.

- **Decision 2: Formatting Libraries**
    - *Chosen Approach*: Use `jspdf` for PDF, and standard `Blob` / `URL.createObjectURL` for text/code formats (TXT, MD, PY).
    - *Why*: Reliable, widely used libraries with minimal dependencies.

### 4. Technical Architecture & Data Strategy

```text
┌────────────────────┐
│    Chat Header     │
│   (Export Button)  │
└─────────┬──────────┘
          │ (onClick)
┌─────────▼──────────┐
│    Export Menu     │
│  (Dropdown/List)   │
└─────────┬──────────┘
          │ (select format)
┌─────────▼──────────┐
│  Export Service    │
│ (Message Formatter)│
└─────────┬──────────┘
          │ (Download)
┌─────────▼──────────┐
│   User Browser     │
└────────────────────┘
```

- **Data Model**: The Export Service will take the `messages` array from the current chat session and transform it into the appropriate string or PDF blob representation.
- **Interactive Component**: A new `ChatExportMenu` component will handle the dropdown state and trigger the file download.
