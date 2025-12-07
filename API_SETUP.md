# API Key Setup Guide for SmartCart

To enable "Live Mode" for your SmartCart Agent, you need to obtain the following keys. 
**Note**: If you cannot get these keys (e.g., due to Amazon's strict approval rules), the system will automatically fallback to "Realistic Mock Data" so your demo will still work perfectly for the judges.

## 1. Amazon Product Advertising API (PA-API 5.0)
This allows the agent to search for real products on Amazon.

1.  **Sign Up for Amazon Associates**:
    *   Go to [Amazon Associates Central](https://affiliate-program.amazon.com/).
    *   Sign up with your Amazon account.
2.  **Request API Access**:
    *   Once logged in, go to **Tools** -> **Product Advertising API**.
    *   Click **"Join"** or **"Add Credentials"**.
    *   *Requirement*: Amazon typically requires 3 qualifying sales before granting full API access. If you see a "Access Denied" or "Pending" message, you may not be able to get a live key immediately.
3.  **Get Credentials**:
    *   Copy your **Access Key ID**.
    *   Copy your **Secret Access Key**.
    *   Copy your **Partner Tag** (usually ends in `-20`).
4.  **Update `.env`**:
    ```env
    AMAZON_ACCESS_KEY=your_access_key
    AMAZON_SECRET_KEY=your_secret_key
    AMAZON_TAG=your_partner_tag
    ```

## 2. Walmart Open API (Walmart.io)
This allows the agent to check prices at Walmart.

1.  **Create Developer Account**:
    *   Go to [Walmart.io](https://developer.walmart.com/).
    *   Click **"Sign Up"** (or Log In).
2.  **Generate Keys**:
    *   In your profile/dashboard, look for **"My Keys"** or **"API Keys"**.
    *   Generate a new key for "Product Lookup" or "Search".
3.  **Get Credentials**:
    *   Copy your **Consumer ID**.
    *   Copy your **Private Key** (or API Key).
    *   *Note*: Walmart keys also expire; ensure you generate a fresh one.
4.  **Update `.env`**:
    ```env
    WALMART_API_KEY=your_private_key
    WALMART_CONSUMER_ID=your_consumer_id
    ```

## 3. How Payment Works (The "Simulation")
Since we removed Crypto, here is how the "Payment" flow works for the Bounty:

1.  **Agent Action**: The Agent builds a cart (e.g., Milk, Eggs) via the API.
2.  **User Approval**: The User clicks "Approve Order" in the UI.
3.  **Execution**:
    *   **Live Mode**: The Agent sends the "Add to Cart" command to Amazon/Walmart (if their API permits). The final "Checkout" usually happens by redirecting the user to a pre-filled cart URL on Amazon.com. **We do not process credit cards directly.**
    *   **Demo Mode**: The Agent returns a "Success" message: *"Order #12345 placed successfully! Total: $15.99"*. This is sufficient for the hackathon MVP.

**Recommendation**: For the hackathon video, use the **Simulation/Demo Mode** for checkout verification, as it is valid and safe.
