# Security Specification: One Piece Grid Player Accounts

## 1. Data Invariants
- A player account is represented by a document at `/users/{email}` where `{email}` is the player's unique email address.
- All documents in `users` must contain an `email` field matching the document key.
- A player must have a valid `username` (between 2 and 32 characters).
- Player `bounty` must be a non-negative number.
- Numeric statistic fields (`gridWins`, `gridLosses`, `trackerWins`, `trackerPlays`, `duelHigh`) must be non-negative integers.

## 2. The "Dirty Dozen" Payloads (Denial/Exploit Attempts)
1. **Identity Spoofing**: Attempt to update a user's `email` field to someone else's email. (Should fail - email is immutable).
2. **Bounty Injection**: Attempt to set a player's `bounty` to a negative number or a non-numeric string. (Should fail).
3. **Privilege Escalation / Shadow Fields**: Attempt to write an un-blueprint-described field like `role: "admin"` or `isStaff: true`. (Should fail).
4. **Infinite Score Attack**: Attempt to set `gridWins` or `trackerWins` to large floating values or a huge string. (Should fail).
5. **ID Poisoning / Path Bypass**: Attempt to create a user profile inside `users/` with a document ID containing special illegal carriage characters or malicious path patterns. (Should fail - IDs must match safe emails).
6. **Denial of Wallet (Huge Payloads)**: Attempt to save an excessively long username (e.g., > 100 characters). (Should fail).
7. **Bounty Jump (State Shortcutting)**: Attempt to update client-side bounty by an arbitrary amount without incremental validation. (Should fail).
8. **Malicious Log Injector**: Attempt to write arbitrary arrays to the game events logs. (Should fail).
9. **Creation without Timestamps**: Attempt to create a user record without the correct system-provided `createdAt` timestamp. (Should fail).
10. **Malicious Update Timestamp**: Attempt to save local/different computer times in `updatedAt` instead of server times. (Should fail).
11. **Spoofed Read Entry**: Attempting to read another player's private user history if they restrict read permission. (Should fail/secure).
12. **Orphaned Write**: Attempting to complete a record with incorrect key list size or mismatched keys. (Should fail).

## 3. The Test Runner Reference
All of these rules will be verified and compiled to enforce that bad payloads fail matching.
