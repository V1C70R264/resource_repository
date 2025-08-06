# DHIS2 Setup Guide

## 🚀 **Quick Start - Use Demo Server**

For testing purposes, use DHIS2's public demo server:

### Step 1: Create `.env` file
Create a file named `.env` in the `resource_repository` folder with this content:

```env
VITE_DHIS2_URL=https://play.dhis2.org/2.40.0
VITE_DHIS2_USERNAME=admin
VITE_DHIS2_PASSWORD=district
```

### Step 2: Start the development server
```bash
cd resource_repository
npm run dev
```

### Step 3: Test the connection
- Open your browser to `http://localhost:5173`
- You should see "Connected to DHIS2" in the bottom-right corner
- Try creating a folder using the "New Folder" button

## 🔧 **Other Options**

### Option A: Your Organization's DHIS2 Server
If your organization has DHIS2:
```env
VITE_DHIS2_URL=https://your-organization-dhis2.com
VITE_DHIS2_USERNAME=your-username
VITE_DHIS2_PASSWORD=your-password
```

### Option B: Local DHIS2 Server
If you're running DHIS2 locally:
```env
VITE_DHIS2_URL=http://localhost:8080
VITE_DHIS2_USERNAME=admin
VITE_DHIS2_PASSWORD=district
```

## ❓ **What is DHIS2?**

DHIS2 is a health information system used by organizations worldwide to:
- Store and manage health data
- Create reports and dashboards
- Track programs and indicators
- Manage resources and documents

## 🔍 **How to Find Your DHIS2 Server**

1. **Ask your IT team** - They likely know if your organization uses DHIS2
2. **Check your organization's intranet** - Look for links to "DHIS2" or "Health Information System"
3. **Contact your health information officer** - They usually manage DHIS2 access

## 🆘 **Need Help?**

If you don't have access to a DHIS2 server:
1. **Use the demo server** (recommended for testing)
2. **Contact your organization's IT support**
3. **Ask your supervisor about DHIS2 access**

## ✅ **Testing Checklist**

- [ ] Created `.env` file with correct credentials
- [ ] Started development server (`npm run dev`)
- [ ] See "Connected to DHIS2" message
- [ ] Can create folders
- [ ] Can upload files
- [ ] Can search and filter files 