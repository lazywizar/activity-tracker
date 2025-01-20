# Activity Tracker Manual Test Plan

This document outlines the manual test plan for the Activity Tracker application after migration to Firebase. Use this plan to verify all functionality is working as expected.

## 1. Authentication Tests

### 1.1 User Registration
- [x] Register with valid email and password
- [x] Verify email validation (try invalid email format)
- [] Verify password requirements (try short password)

**Expected**: Success message, redirect to login, email verification sent

### 1.2 User Login
- [x] Login with registered email/password
- [x] Try incorrect password
- [x] Try non-existent email

**Expected**: Successful login redirects to dashboard, error messages for invalid attempts

### 1.3 Session Management
- [x] Close and reopen browser
- [x] Check if session persists
- [x] Test logout functionality

**Expected**: Session should persist on browser restart, logout should clear session

## 2. Activity Management

### 2.1 Creating Activities
- [ ] Create activity with name and weekly goal
- [ ] Create activity with optional description
- [ ] Try creating without name
- [ ] Try creating with invalid goal (0 or negative)

**Expected**: Success for valid inputs, appropriate error messages for invalid inputs

### 2.2 Editing Activities
- [ ] Edit activity name
- [ ] Edit weekly goal
- [ ] Edit description
- [ ] Cancel edit without saving

**Expected**: Changes should persist after refresh, cancel should revert changes

### 2.3 Deleting Activities
- [ ] Delete an activity
- [ ] Verify activity disappears from list
- [ ] Refresh page to confirm deletion

**Expected**: Activity should be removed immediately and not reappear after refresh

## 3. Time Tracking

### 3.1 Basic Time Entry
- [ ] Enter minutes in current week
- [ ] Enter minutes in past week
- [ ] Enter minutes in future week
- [ ] Enter 0 minutes
- [ ] Clear minutes (empty field)

**Expected**: All entries should persist after refresh

### 3.2 Data Validation
- [ ] Try entering negative minutes
- [ ] Try entering non-numeric values
- [ ] Try entering decimals
- [ ] Try entering very large numbers (>999)

**Expected**: Invalid inputs should be prevented or handled gracefully

### 3.3 Progress Calculation
- [ ] Verify weekly progress calculation
- [ ] Check progress color coding (red/yellow/green)
- [ ] Verify progress emoji changes

**Expected**: Progress should update in real-time, colors should match progress levels

## 4. Navigation and Date Handling

### 4.1 Week Navigation
- [ ] Navigate to previous week
- [ ] Navigate to next week
- [ ] Navigate multiple weeks
- [ ] Verify date display format

**Expected**: Data should load correctly for each week, dates should be formatted properly

### 4.2 Data Persistence Across Weeks
- [ ] Enter data in current week
- [ ] Navigate away and back
- [ ] Change weeks multiple times

**Expected**: Data should persist across week changes

## 5. UI/UX Features

### 5.1 Responsive Design
- [ ] Test on desktop (various window sizes)
- [ ] Test on tablet view (if applicable)
- [ ] Test on mobile view (if applicable)

**Expected**: UI should adapt smoothly to different screen sizes

### 5.2 Activity Expansion
- [ ] Expand/collapse individual activities
- [ ] Check past weeks data display
- [ ] Verify expansion state persists during navigation

**Expected**: Smooth expansion/collapse, correct data display

## 6. Error Handling

### 6.1 Network Issues
- [ ] Test with slow connection
- [ ] Test with no connection
- [ ] Test reconnection behavior

**Expected**: Appropriate error messages, retry mechanism should work

### 6.2 Data Recovery
- [ ] Enter data and immediately close browser
- [ ] Enter data and immediately lose connection
- [ ] Enter data and refresh page

**Expected**: No data loss in any scenario

## 7. Export Functionality

### 7.1 CSV Export
- [ ] Export current week
- [ ] Export date range
- [ ] Verify CSV format
- [ ] Check all activities are included

**Expected**: CSV should contain correct data in proper format

## Test Execution Guidelines

### Tips
1. Execute tests in order
2. Document any unexpected behavior
3. Test with real-world usage patterns
4. Verify browser console for errors
5. Check server logs for issues

### Critical Paths to Test Multiple Times
1. Authentication flow
2. Activity creation
3. Time entry and persistence
4. Week navigation with data
5. Export functionality

## Issue Reporting

When reporting issues, please include:
1. Test case number/name
2. Expected behavior
3. Actual behavior
4. Steps to reproduce
5. Browser console logs (if applicable)
6. Server logs (if applicable)
7. Screenshots (if applicable)
