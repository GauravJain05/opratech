# Live Acceptance Demo Walkthrough Script
**Cotton Junction — High-Speed Counter Capture & Lapsed Customer Tracker**  
*Team 26 Presentation Demo*

---

## ⏱️ 90-Second Demo Plan for Judges

| Step | Screen | Action | Key Talking Point for Judges |
| :--- | :--- | :--- | :--- |
| **Step 1** | **Core Checkout** | Click **"⚡ Load Demo Household"** | *"Phone captured in 1.8 seconds (< 5s target). Verbal consent is respected, or defaults to anonymous."* |
| **Step 2** | **Household Selection** | Click **Rohan** or **Meera** | *"Two distinct profiles share one phone (`9800000001`). Purchase histories & preferences are never mixed."* |
| **Step 3** | **Lapsed Customers** | Filter **90+ Days Absent** | *"Meera is identified as absent for 96 days. Click WhatsApp to launch a pre-drafted pure cotton message."* |

---

### Step-by-Step Instructions

#### 1. Core Checkout & Ultra-Fast Phone Intake
1. Navigate to **`1. Core Checkout`**.
2. **Verbal Consent:**
   - Notice the **"Verbal Privacy Consent"** switch.
   - Explain to the judges:
     > *"If a customer declines or is in a hurry, the sale is saved as 100% anonymous immediately without delaying the queue. If they agree, the cashier takes their phone number."*
3. **Capture Speed Demonstration:**
   - Tap the shortcut button **`⚡ Load Demo Household (Rohan & Meera)`** (or type `9800000001` on the keypad).
   - Point to the green stopwatch badge: **`⚡ 1.8s (< 5s Target)`**.
   - Explain:
     > *"Cashiers can enter customer mobile numbers in under 3 seconds using the large touch keypad."*

#### 2. Disambiguating Two Family Members on One Phone
1. Under **"👥 Family Members on this Phone"**, notice two distinct profiles appear:
   * **Rohan** (Shopped 5 days ago)
   * **Meera** (Absent 96 days ago — flagged as Lapsed)
2. Tap on **Rohan**, enter amount `2450`, and click **"Complete Sale & Print Bill"**.
3. Explain to the judges:
   > *"In India, families share one phone number. Traditional CRM systems overwrite the wife's preferences with the husband's purchases. Our system maintains separate sub-profiles under one household phone."*
4. Notice the digital receipt link generated:
   > `http://localhost:5000/r/...`
   > *"Customers receive a link via SMS allowing them to earn 50 bonus points by adding birthdays at home, keeping the counter line moving fast."*

#### 3. Identifying the 90-Day Lapsed Customer & WhatsApp Message
1. Switch to the **`3. Lapsed Customers`** tab.
2. In the **"Days Absent"** filter, set it to **`90`**.
3. Point to **Meera** at phone `98••••••01`:
   - She is clearly marked: **96 days ago**.
   - Explain:
     > *"Even though Rohan shopped 5 days ago on this exact same phone number, Meera is accurately identified as lapsed for 96 days."*
4. Notice the pre-drafted WhatsApp message preview:
   > *"Hi Meera, we miss you at Cotton Junction, Sudama Nagar. Come see our fresh pure cotton arrivals and handloom fabrics. Reply STOP to opt out."*
5. Click **"Open WhatsApp ➜"**:
   - Opens direct `wa.me` link ready to send with zero manual typing required by the staff.

#### 4. (Bonus) Batch Campaign Generator
1. Switch to **`4. Campaign Generator`**.
2. Select preset: **"Lapsed shoppers (60+ days) who spent > ₹3,000"**.
3. Point out the live query match count and preview bubble, then click **"🚀 Dispatch Campaign"**.
4. Show the outbound dispatch history log table below.
