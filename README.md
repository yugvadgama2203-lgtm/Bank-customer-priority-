# 🏦 Bank Customer Priority Management System

A responsive bank queue-management website built with **HTML, CSS and JavaScript**.

## Features
- Customer registration
- Automatic token generation
- High / Medium / Normal priority
- Binary Heap based Priority Queue
- Serve Next Customer
- Search and filter
- Remove customer
- Now Serving dashboard
- Service history
- Live statistics
- LocalStorage persistence
- Responsive mobile/desktop UI

## Algorithm

The application uses a **Priority Queue implemented with a Binary Heap**.

Priority:
- 3 = High
- 2 = Medium
- 1 = Normal

If two customers have the same priority, the customer who arrived earlier is served first.

### Complexity
- Insert: O(log n)
- Remove highest priority: O(log n)
- Search/filter display: O(n log n) due to display sorting

## Run
Download the three files and open `index.html` in a browser.

## Deploy on GitHub Pages
1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, and `script.js`.
3. Open **Settings → Pages**.
4. Select the `main` branch and root folder.
5. Save.
6. GitHub will provide the public website URL.
