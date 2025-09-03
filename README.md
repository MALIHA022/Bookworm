# 📚 BookWorm

BookWorm is a multi-page web-based social networking platform for book enthusiasts. It enables users to create book reviews, discuss favorite books, donate or sell books, and connect with others who share similar interests. The platform supports both **user-facing** and **admin-facing** functionalities.

---

## 🚀 Features

### 👤 User Features
- **Authentication**
  - Register and auto-login (stored in backend).
  - Edit/update profile information.

- **Posts**
  - Create three types of posts:
    - **Review** → Title, Author, Description.  
    - **Donate** → Title, Author, Description.  
    - **Sell** → Title, Author, Price, Description.  
  - Edit and delete own posts.
  - View recent posts on the dashboard.
  - Interact with posts:
    - Like (with visible like count).
    - Bookmark posts (accessible in Bookmarks page).
    - Add to Wishlist (accessible in Wishlist page).
    - Report or mark "Not Interested" on posts.

- **Wishlist & Messaging**
  - Wishlisted posts appear in the **Wishlist page**.  
  - Send messages to post creators (stored under "Messages" tab in Wishlist page).
  - Notifications for messages and admin warnings.

- **Explore**
  - Browse **Donate** and **Sell** posts from the community.

---

### 🛡️ Admin Features
- **Dashboard**
  - Metrics: total posts, total users, total reports, pending reports.
  - Line charts for posts & reports activity over the last 30 days.

- **User Management**
  - View all users.
  - Suspend users for offensive content.
  - Handle account reactivation requests (received in notifications).

- **Post Management**
  - View all posts from a centralized admin panel.
  - Moderate reported content.

- **Reports Management**
  - Tabs: **All**, **Pending**, **Resolved**.
  - Pending reports appear as cards with action options:
    - Delete Post
    - Warn User
    - Dismiss  
  - Resolved reports include dismissed and warned cases.

---

## 📌 Tech Stack
- **Frontend:** React, Tailwind CSS (multi-page setup)  
- **Backend:** Express.js, Node.js  
- **Database:** MongoDB  

---

## 📜 License
This project is created for learning purpose only. Do not copy, modify, merge, publish, and distribute this software.