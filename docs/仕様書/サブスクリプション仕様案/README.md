# **サブスクリプション機能仕様**

## **目的**

- フリーミアムモデルでマネタイズ
- 無料ユーザーに基本機能を提供し、有料ユーザーに高度な機能を提供
- 月額課金で安定した収益を確保

---

## **プラン構成**

### **フリープラン（無料）**

**料金**: 0円/月

**機能制限**:
- 献立生成: **月10回まで**
- 再生成: **1食につき1回まで**
- 履歴保存: **直近7日分まで**
- レシピ表示: ❌ 利用不可
- 栄養分析: 基本のみ（PFC、カロリー）
- サポート: コミュニティサポートのみ

**ターゲット**:
- アプリを試してみたいユーザー
- たまにしか使わないユーザー

---

### **プレミアムプラン（有料）**

**料金**: ¥980/月 または ¥9,800/年（2ヶ月分お得）

**機能**:
- 献立生成: **無制限**
- 再生成: **無制限**
- 履歴保存: **無制限**
- レシピ表示: ✅ 調理手順、所要時間、難易度
- 栄養分析: 詳細（ビタミン、ミネラル等）※将来実装
- 週間献立: 1週間分まとめて生成 ※将来実装
- お気に入り保存: 無制限
- 広告非表示: ✅（広告実装後）
- サポート: 優先メールサポート

**ターゲット**:
- 毎日使いたいユーザー
- 真剣にダイエット・健康管理したいユーザー

---

### **プロプラン（将来検討）**

**料金**: ¥1,980/月

**機能**: プレミアム機能 + 以下
- AI栄養士チャット
- カスタム栄養プラン
- 家族アカウント（最大4人）
- API連携（フィットネストラッカー等）

---

## **技術実装**

### **1. データベース設計**

#### **新規テーブル: `subscriptions`**

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL, -- 'free', 'premium', 'pro'
    status VARCHAR(20) NOT NULL, -- 'active', 'canceled', 'past_due', 'expired'

    -- Stripe関連
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),

    -- 期間
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP, -- サブスク終了日（null = 無期限）
    cancel_at_period_end BOOLEAN DEFAULT FALSE,

    -- 使用量トラッキング（フリープランのみ）
    monthly_generation_count INT DEFAULT 0, -- 今月の生成回数
    generation_reset_date DATE, -- 次回リセット日

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
```

#### **新規テーブル: `payment_history`**

```sql
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

    amount INT NOT NULL, -- 円単位
    currency VARCHAR(3) DEFAULT 'JPY',
    status VARCHAR(20) NOT NULL, -- 'succeeded', 'failed', 'refunded'

    -- Stripe関連
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),

    payment_method VARCHAR(50), -- 'card', 'bank_transfer', etc.

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_history_user ON payment_history(user_id);
CREATE INDEX idx_payment_history_subscription ON payment_history(subscription_id);
```

---

### **2. バックエンド実装**

#### **新規ファイル構成**

```
backend/app/
├── routers/
│   └── subscription.py  # サブスク管理API
├── services/
│   ├── stripe_service.py  # Stripe SDK連携
│   └── subscription_service.py  # プラン管理ロジック
├── models/
│   ├── subscription.py
│   └── payment_history.py
└── schemas/
    └── subscription.py
```

#### **主要API**

```python
# routers/subscription.py

@router.get("/subscription/current")
async def get_current_subscription():
    """現在のサブスクリプション情報を取得"""
    pass

@router.post("/subscription/checkout")
async def create_checkout_session():
    """Stripe Checkoutセッション作成"""
    pass

@router.post("/subscription/cancel")
async def cancel_subscription():
    """サブスクをキャンセル（期間終了時に停止）"""
    pass

@router.post("/subscription/resume")
async def resume_subscription():
    """キャンセル予定のサブスクを再開"""
    pass

@router.post("/webhooks/stripe")
async def stripe_webhook():
    """Stripe Webhookを受け取る（支払い成功/失敗通知）"""
    pass
```

#### **使用量制限チェック**

```python
# services/subscription_service.py

def can_generate_meal(user_id: UUID) -> bool:
    """献立生成可能かチェック"""
    subscription = get_user_subscription(user_id)

    if subscription.plan_type == "premium" or subscription.plan_type == "pro":
        return True  # 無制限

    # フリープランの場合
    if subscription.monthly_generation_count >= 10:
        return False  # 月10回制限

    return True

def increment_generation_count(user_id: UUID):
    """生成回数をカウントアップ"""
    subscription = get_user_subscription(user_id)
    subscription.monthly_generation_count += 1
    # 月初にリセット
```

---

### **3. Stripe連携**

#### **必要なStripe設定**

1. **Stripeアカウント作成**
   - https://stripe.com/

2. **商品（Product）作成**
   - プレミアムプラン（月額）: ¥980
   - プレミアムプラン（年額）: ¥9,800

3. **Webhook設定**
   - イベント:
     - `checkout.session.completed` - 支払い成功
     - `invoice.payment_succeeded` - 定期支払い成功
     - `invoice.payment_failed` - 支払い失敗
     - `customer.subscription.deleted` - サブスク削除

#### **環境変数追加**

```bash
# .env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# プラン価格ID
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx
```

#### **依存関係追加**

```
# requirements.txt
stripe==7.0.0
```

---

### **4. フロントエンド実装**

#### **新規ページ/コンポーネント**

```
frontend/src/
├── app/
│   └── (auth)/
│       ├── subscription/
│       │   └── page.tsx  # サブスク管理ページ
│       └── pricing/
│           └── page.tsx  # 料金プラン選択ページ
├── components/
│   ├── PricingCard.tsx  # プラン比較カード
│   └── SubscriptionBadge.tsx  # プランバッジ表示
└── lib/api/
    └── subscription/
        ├── getCurrentSubscription.ts
        ├── createCheckoutSession.ts
        └── cancelSubscription.ts
```

#### **型定義**

```typescript
// types/Subscription.ts

export type PlanType = 'free' | 'premium' | 'pro'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'expired'

export interface Subscription {
  id: string
  user_id: string
  plan_type: PlanType
  status: SubscriptionStatus
  start_date: string
  end_date?: string
  cancel_at_period_end: boolean
  monthly_generation_count: number
  generation_limit: number
}
```

---

## **UI/UX設計**

### **1. 料金プランページ**

```
┌─────────────────────────────────────┐
│  料金プラン                          │
├─────────────────────────────────────┤
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │ Free │  │Premium│  │ Pro  │     │
│  │  0円 │  │ 980円 │  │1980円│     │
│  ├──────┤  ├──────┤  ├──────┤     │
│  │ 月10回│  │ 無制限│  │ 無制限│     │
│  │ 基本  │  │レシピ │  │+ AI  │     │
│  │      │  │表示  │  │チャット│     │
│  │      │  │      │  │      │     │
│  └──────┘  └──────┘  └──────┘     │
│              [選択]    [選択]      │
└─────────────────────────────────────┘
```

### **2. サブスク管理ページ**

```
┌─────────────────────────────────────┐
│  サブスクリプション管理               │
├─────────────────────────────────────┤
│  現在のプラン: Premium               │
│  次回更新日: 2026/05/03             │
│  月額: ¥980                         │
│                                     │
│  [プラン変更] [キャンセル]          │
│                                     │
│  ─────────────────────────────      │
│  支払い履歴                          │
│  - 2026/04/03  ¥980  成功          │
│  - 2026/03/03  ¥980  成功          │
└─────────────────────────────────────┘
```

### **3. 使用量表示（フリープラン）**

```
┌─────────────────────────────────────┐
│  今月の献立生成: 7/10回             │
│  ■■■■■■■□□□                  │
│                                     │
│  残り3回です。                       │
│  [プレミアムにアップグレード]        │
└─────────────────────────────────────┘
```

---

## **実装の段階的ロールアウト**

### **Phase 1: 基盤構築（2-3週間）**
- データベース設計・マイグレーション
- Stripeアカウント設定
- バックエンドAPI実装（サブスク取得、作成）

### **Phase 2: 課金フロー（2-3週間）**
- Stripe Checkout統合
- Webhook処理実装
- 支払い履歴機能

### **Phase 3: 使用量制限（1-2週間）**
- フリープランの制限実装
- 使用量カウント機能
- アップグレードプロンプト

### **Phase 4: UI実装（2週間）**
- 料金プランページ
- サブスク管理ページ
- バッジ・通知表示

### **Phase 5: テスト・リリース（1週間）**
- テストカードでの決済テスト
- 本番環境Stripe設定
- ソフトローンチ

**合計想定期間**: 8-11週間

---

## **注意事項・リスク**

### **法務・コンプライアンス**
- 特定商取引法に基づく表記が必要
- 利用規約・プライバシーポリシーの更新
- 返金ポリシーの明記

### **税務**
- 消費税の処理（Stripeが自動対応）
- 適格請求書（インボイス）対応

### **セキュリティ**
- Webhook署名検証（必須）
- カード情報を自社サーバーに保存しない（Stripe Elementsを使用）
- PCI DSS準拠

### **ユーザー体験**
- 無料ユーザーの離脱を防ぐバランス
- トライアル期間の検討（7日間無料など）
- ダウングレード時のデータ保持ポリシー

---

## **KPI・目標**

### **ビジネス目標**
- 有料ユーザー転換率: **5-10%**
- 月間解約率（Churn Rate）: **5%以下**
- 平均顧客生涯価値（LTV）: **¥10,000+**

### **測定指標**
- 無料ユーザー数 vs 有料ユーザー数
- 月次経常収益（MRR）
- アップグレード率
- ダウングレード率
- 支払い失敗率

---

## **参考リンク**

- [Stripe ドキュメント](https://stripe.com/docs)
- [Stripe サブスクリプション](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
