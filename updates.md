# Updates

## 0.25.82

### Fixed
- Refreshed the remote Security Seed before each replication, preventing a client that remained open during a remote database rebuild from uploading data encrypted with the previous seed.
- Improved the P2P connection handling to settle before closing the dialogue.

### Improved
- One-shot operations, peer discovery, database rebuild and fetch operations, and remote chunk fetching now keep the screen awake for the duration of finite remote operations on supported devices.
- Enhanced status-bar indicators for remote activity and chunk fetching.

## 0.25.81

### Fixed
- Fixed an issue where a U+FEFF character at a chunk boundary could be lost, improving reconstructed file consistency.

### Improved
- Improved vault scanning and file filtering by reusing compiled ignore patterns, reducing processing overhead.
- Rooted storage adapters now reject traversal paths and prevent file writes outside configured roots.
