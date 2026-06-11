# Security Specification and Threat Model: Nara

This security specification details the Attribute-Based Access Control (ABAC) invariants and validations enforced in Nara's Firestore Database.

## 1. Core Data Invariants
1. **User Ownership Isolation**: No user may view, write, or query another user's personal profile, reading positions, stats, or bookmarks. Access control is locked around the path variable verification: `request.auth.uid == userId`.
2. **Path Integrity Protection**: All custom input IDs (such as bookmarks IDs and book IDs) are sanitized to prevent ID poisoning and denial-of-wallet path injection.
3. **Immutable Identity**: Once created, a document's parent relation (the `userId`) cannot be modified or reassigned.
4. **Strict Schema Constraints**: No shadow fields or unvalidated payloads are allowed inside UserProfiles, ReadingPositions, Stats, or Bookmarks.

---

## 2. The "Dirty Dozen" Payloads (Threat Vectors)
Here are twelve specific JSON payloads designed to violate system safety, all of which will be rejected by our Firestore Security rules.

### Vector 1: Identity Hijacking (UserProfile Spoofing)
*   **Description**: Attacker attempts to modify another reader's user preference sheet directly.
*   **Target Path**: `/users/legitimate_user_123`
*   **Payload**: `{ "font": "Inter", "theme": "dark", "textSize": 16, "reduceMotion": false }`
*   **Trigger**: Authenticated as `attacker_999`. Must be blocked because `request.auth.uid` is `attacker_999` while resource route is `legitimate_user_123`.

### Vector 2: Self-Promotion (Admin Role Spoofing)
*   **Description**: Attacker tries to inject a shadow Boolean attribute like `isAdmin` to gain privilege escalation.
*   **Target Path**: `/users/attacker_911`
*   **Payload**: `{ "uid": "attacker_911", "email": "attacker@darkweb.org", "font": "Lexend", "textSize": 16, "lineSpacing": 1.2, "theme": "cream", "support": "read-only", "reduceMotion": false, "isAdmin": true }`
*   **Trigger**: The strict schema validation blocks extra fields via strict length and key matching (`keys().size()`).

### Vector 3: Bookmark Theft (Cross-User Write)
*   **Description**: Attacker tries to create a bookmark in another user's collection space.
*   **Target Path**: `/users/victim_uid/bookmarks/rogue_bookmark`
*   **Payload**: `{ "id": "rogue_bookmark", "userId": "victim_uid", "bookId": "frankenstein", "chapterId": "chapter-1", "paragraphIndex": 0, "textSnippet": "Spoofed snippet", "timestamp": 1234567890 }`
*   **Trigger**: Rejected at path level: `request.auth.uid` must match the parent `{userId}`.

### Vector 4: Unauthenticated Profile Seeding
*   **Description**: Guest / anonymous user attempts to write a user record before proper authentication.
*   **Target Path**: `/users/unauthorized_user`
*   **Payload**: UserProfile data structure.
*   **Trigger**: Rejected because `request.auth` is null.

### Vector 5: ID Poisoning (Path-variable injection)
*   **Description**: Attacker tries to write a position with a 10KB junk-string as the `bookId`.
*   **Target Path**: `/users/attacker_uid/positions/<10KB_junk_string>`
*   **Payload**: `{ "userId": "attacker_uid", "bookId": "<10KB_junk_string>", "chapterId": "chapter-1", "paragraphIndex": 12 }`
*   **Trigger**: Path variable hardening blocks keys with excessive size/invalid characters.

### Vector 6: Bookmark Counterfeit (Orphaned Write)
*   **Description**: Attacker creates a bookmark referencing a different `userId` inside the nested payload compared to the path identifier.
*   **Target Path**: `/users/attacker_uid/bookmarks/bookmark_777`
*   **Payload**: `{ "id": "bookmark_777", "userId": "victim_uid", "bookId": "the-metamorphosis", "chapterId": "chapter-1", "paragraphIndex": 1, "textSnippet": "Stolen snippet", "timestamp": 1234567890 }`
*   **Trigger**: Blocked because `incoming().userId != request.auth.uid`.

### Vector 7: Reading Position Fraud (Negative Indices)
*   **Description**: Attacker registers a negative paragraph index to cause application buffer exception / UI crashes.
*   **Target Path**: `/users/attacker_uid/positions/frankenstein`
*   **Payload**: `{ "userId": "attacker_uid", "bookId": "frankenstein", "chapterId": "chapter-1", "paragraphIndex": -500 }`
*   **Trigger**: Rejected by boundary limits check: `paragraphIndex >= 0`.

### Vector 8: Reading Stats Bloating (Infinity values)
*   **Description**: Attacker attempts to set their `readingStreak` or `minutesRead` to a massive number (`99999999999`) to corrupt high scores.
*   **Target Path**: `/users/attacker_uid/stats/reading`
*   **Payload**: `{ "userId": "attacker_uid", "booksCompleted": 0, "readingStreak": 999999999, "minutesRead": 999999999, "wordsRead": 999999999, "dailyGoalMinutes": 30 }`
*   **Trigger**: Blocked by maximum value constraints: `minutesRead <= 1440` (minutes in a single day maximum increment limit).

### Vector 9: PII Scraping / Blanket Reads
*   **Description**: Attacker issues an open query for all profiles without filters to scrape subscriber emails.
*   **Target Path**: `/users` (Collection Query)
*   **Trigger**: Security rules explicitly mandate query limits matching owner id (`resource.data.uid == request.auth.uid`) preventing O(n) leaks.

### Vector 10: Bookmark Note Injection (Massive string)
*   **Description**: Attacker injects a 5MB notes value inside a bookmark to trigger Denial-of-Wallet out of bounds.
*   **Target Path**: `/users/attacker_uid/bookmarks/bm_huge`
*   **Payload**: `{ "id": "bm_huge", "userId": "attacker_uid", "bookId": "frankenstein", "chapterId": "chapter-1", "paragraphIndex": 0, "textSnippet": "Snippet", "note": "<5MB string>", "timestamp": 1234567890 }`
*   **Trigger**: Bookmarks validation limits note sizes: `incoming().note.size() <= 2000`.

### Vector 11: Future Timestamp Poisoning
*   **Description**: Attacker attempts to set an inaccurate registration timestamp (`createdAt` / `updatedAt`) using a spoofed client epoch 100 years in the future.
*   **Target Path**: `/users/attacker_uid`
*   **Payload**: UserProfile data with `createdAt = 2026-06-11T12:00:00Z` client set.
*   **Trigger**: Rejected because all system dates must match `request.time` server epoch strictly or match existing on updates.

### Vector 12: Invalid State Jump
*   **Description**: Attacker attempts to modify their UserProfile with an unapproved font selection.
*   **Target Path**: `/users/attacker_uid`
*   **Payload**: `{ "uid": "attacker_uid", "email": "test@demo.com", "font": "ComicSans", "textSize": 16, "lineSpacing": 1.2, "theme": "cream", "support": "read-only", "reduceMotion": false }`
*   **Trigger**: Rejected since the `font` parameter must be limited to the defined enum list: `font in ["Lexend", "OpenDyslexic", "Atkinson", "Inter"]`.
