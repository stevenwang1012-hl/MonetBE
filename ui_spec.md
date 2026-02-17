# UI Component Specification (介面元件規範)

這份文件定義了「花蓮莫內花園咖啡農莊」預約系統的 UI 版位名稱與用途，供開發與設計溝通使用。

## 1. Global Layout (全域佈局)

| Component Name (EN) | Component Name (TW) | code reference | Description |
| :--- | :--- | :--- | :--- |
| **ScreenContainer** | 螢幕容器 | `ui.tsx` | 限制最大寬度 (Max-width 480px)，模擬手機 App 體驗。 |
| **Global Header** | 頂部導覽列 | `ui.tsx` / `Header` | 固定在頂部的導覽列，包含標題、地址與使用者頭像。 |
| **Bottom Tab Bar** | 底部功能列 | `App.tsx` | 固定在底部的切換列，用於切換「預約房型」與「預約紀錄」。 |

## 2. Guest View (住客端)

### 2.1 Navigation & Filters
| Component Name (EN) | Component Name (TW) | code reference | Description |
| :--- | :--- | :--- | :--- |
| **Date Picker Bar** | 日期選擇列 | `App.tsx` | 吸附在 Header 下方的日期選擇器，包含「入住」與「退房」日期。 |
| **Guest Filter** | 人數篩選器 | `GuestView.tsx` | 切換「兩人房」與「四人房」的按鈕群組。 |

### 2.2 Room List (房源列表)
| Component Name (EN) | Component Name (TW) | code reference | Description |
| :--- | :--- | :--- | :--- |
| **Room Card** | 房源卡片 | `GuestView.tsx` | 展示單一房源資訊的卡片。包含圖片輪播、標籤、價格與預約按鈕。 |
| **Image Carousel** | 圖片輪播 | `GuestView.tsx` | 房源卡片上方的圖片區域，包含左右切換箭頭 (Chevron)。 |
| **Room Tags** | 房源標籤 | `GuestView.tsx` | 顯示床型配置與設施（如：加大床、按摩椅）。 |
| **Price Block** | 價格區塊 | `GuestView.tsx` | 顯示總價與天數說明。 |

### 2.3 Guest History (預約紀錄)
| Component Name (EN) | Component Name (TW) | code reference | Description |
| :--- | :--- | :--- | :--- |
| **History List** | 紀錄列表 | `GuestView.tsx` | 展示所有歷史與當前預約的列表。 |
| **Booking Card** | 預約卡片 | `GuestView.tsx` | 單筆預約的詳細資訊卡片，包含狀態標籤、早餐資訊與取消按鈕。 |
| **Empty State** | 空狀態 | `GuestView.tsx` | 當沒有資料時顯示的提示畫面（日曆圖示 + 文字）。 |

### 2.4 Modals (彈窗)
| Component Name (EN) | Component Name (TW) | code reference | Description |
| :--- | :--- | :--- | :--- |
| **Booking Modal** | 預約確認彈窗 | `App.tsx` | 點擊「預約」後跳出的確認視窗，包含早餐加購選項與最終價格試算。 |
| **Login Modal** | 登入彈窗 | `App.tsx` | 使用者未登入時顯示的選擇角色畫面。 |

## 3. Host View (房東端)

| Component Name (EN) | Component Name (TW) | code reference | Description |
| :--- | :--- | :--- | :--- |
| **Host Dashboard** | 房東儀表板 | `HostView.tsx` | 房東的主要管理介面。 |
| **Dashboard Date Picker** | 儀表板日期選擇器 | `HostView.tsx` | 位於儀表板頂部，用於切換檢視特定日期的房況。 |
| **Stat Card** | 統計卡片 | `HostView.tsx` | 顯示今日入住、退房等關鍵數據的卡片。 |
| **Room Grid** | 房況總覽 | `HostView.tsx` | 顯示實體房間號碼（101, 102...）及其佔用狀態的網格。 |
| **Management List** | 管理列表 | `HostView.tsx` | 需要房東處理的訂單列表（確認預約、辦理入住）。 |

## 4. Shared Components (共用元件)

| Component Name (EN) | Component Name (TW) | code reference | Description |
| :--- | :--- | :--- | :--- |
| **Status Badge** | 狀態標籤 | `ui.tsx` | 顯示訂單狀態（預約確認中、已付款、已入住...）的彩色標籤。 |
| **Primary Button** | 主要按鈕 | `ui.tsx` | 黑色背景的圓角按鈕。 |
| **Secondary Button** | 次要按鈕 | `ui.tsx` | 灰色或透明背景的按鈕。 |
