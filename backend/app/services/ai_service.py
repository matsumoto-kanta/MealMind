import json
import google.generativeai as genai
from typing import List, Dict, Any
from app.core.config import settings
from app.models.user_settings import GenderEnum, ActivityLevelEnum


class GeminiAIService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def generate_daily_meals(
        self,
        gender: GenderEnum,
        age: int,
        height: int,
        weight: int,
        activity_level: ActivityLevelEnum,
        target_weight: int,
        target_period_months: int,
        daily_budget: int,
        disliked_foods: List[str],
        allergies: List[str],
        past_meal_names: List[str],
    ) -> List[Dict[str, Any]]:
        """1日分の献立（朝・昼・夕）を生成"""
        target_calories = self._calculate_target_calories(
            gender,
            age,
            height,
            weight,
            activity_level,
            target_weight,
            target_period_months,
        )

        prompt = self._build_daily_meal_prompt(
            gender=gender,
            age=age,
            height=height,
            weight=weight,
            activity_level=activity_level,
            target_weight=target_weight,
            target_period_months=target_period_months,
            daily_budget=daily_budget,
            target_calories=target_calories,
            disliked_foods=disliked_foods,
            allergies=allergies,
            past_meal_names=past_meal_names,
        )

        response = self.model.generate_content(prompt)
        return self._parse_meal_response(response.text)

    def regenerate_single_meal(
        self,
        meal_type: str,
        gender: GenderEnum,
        age: int,
        height: int,
        weight: int,
        activity_level: ActivityLevelEnum,
        target_weight: int,
        target_period_months: int,
        meal_budget: int,
        disliked_foods: List[str],
        allergies: List[str],
        past_meal_names: List[str],
        other_meals_today: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """1食分の献立を再生成"""
        target_calories = self._calculate_target_calories(
            gender,
            age,
            height,
            weight,
            activity_level,
            target_weight,
            target_period_months,
        )

        prompt = self._build_single_meal_prompt(
            meal_type=meal_type,
            gender=gender,
            age=age,
            height=height,
            weight=weight,
            activity_level=activity_level,
            target_weight=target_weight,
            target_period_months=target_period_months,
            meal_budget=meal_budget,
            target_calories=target_calories,
            disliked_foods=disliked_foods,
            allergies=allergies,
            past_meal_names=past_meal_names,
            other_meals_today=other_meals_today,
        )

        response = self.model.generate_content(prompt)
        meals = self._parse_meal_response(response.text)
        return meals[0] if meals else None

    def _build_daily_meal_prompt(
        self,
        gender: GenderEnum,
        age: int,
        height: int,
        weight: int,
        activity_level: ActivityLevelEnum,
        target_weight: int,
        target_period_months: int,
        daily_budget: int,
        target_calories: int,
        disliked_foods: List[str],
        allergies: List[str],
        past_meal_names: List[str],
    ) -> str:
        """1日分の献立生成プロンプトを構築"""
        gender_str = "男性" if gender == GenderEnum.male else "女性"
        activity_str = {
            ActivityLevelEnum.low: "低い（デスクワーク中心）",
            ActivityLevelEnum.medium: "普通（立ち仕事あり）",
            ActivityLevelEnum.high: "高い（運動習慣あり）",
        }.get(activity_level, "普通")

        disliked_str = ", ".join(disliked_foods) if disliked_foods else "なし"
        allergies_str = ", ".join(allergies) if allergies else "なし"
        past_meals_str = (
            "\n".join([f"- {name}" for name in past_meal_names])
            if past_meal_names
            else "なし"
        )

        prompt = f"""あなたは栄養士です。以下の条件に基づいて、1日分の献立（朝食・昼食・夕食）を提案してください。

【ユーザー情報】
- 性別: {gender_str}
- 年齢: {age}歳
- 身長: {height}cm
- 体重: {weight}kg
- 活動量: {activity_str}
- 目標体重: {target_weight}kg
- 目標期間: {target_period_months}ヶ月

【制約条件】
- 1日の予算: {daily_budget}円
- 1日の目標カロリー: 約{target_calories}kcal
- 嫌いな食べ物: {disliked_str}
- アレルギー: {allergies_str}

【重複防止】
以下の献立は過去3週間で使用済みなので、避けてください：
{past_meals_str}

【出力形式】
JSON形式で出力（説明文は不要。JSONのみを出力してください）：
{{
  "meals": [
    {{
      "meal_type": "breakfast",
      "name": "高タンパク和風オムレツ定食",
      "kcal": 450,
      "cost": 280,
      "protein": 25,
      "fat": 15,
      "carbohydrates": 45,
      "ingredients": [
        {{"name": "卵", "amount": "2個", "price": 60}},
        {{"name": "ご飯", "amount": "150g", "price": 50}},
        {{"name": "納豆", "amount": "1パック", "price": 40}},
        {{"name": "味噌汁の具", "amount": "適量", "price": 80}},
        {{"name": "海苔", "amount": "2枚", "price": 50}}
      ]
    }},
    {{
      "meal_type": "lunch",
      "name": "料理名",
      "kcal": カロリー数値,
      "cost": コスト数値,
      "protein": タンパク質g数値,
      "fat": 脂質g数値,
      "carbohydrates": 炭水化物g数値,
      "ingredients": [{{"name": "食材名", "amount": "分量", "price": 価格数値}}]
    }},
    {{
      "meal_type": "dinner",
      "name": "料理名",
      "kcal": カロリー数値,
      "cost": コスト数値,
      "protein": タンパク質g数値,
      "fat": 脂質g数値,
      "carbohydrates": 炭水化物g数値,
      "ingredients": [{{"name": "食材名", "amount": "分量", "price": 価格数値}}]
    }}
  ]
}}

【重要な注意事項】
- 朝食・昼食・夕食の3食を提案
- **価格は必ず実際のスーパーの相場を反映すること（0円は禁止）**
- **costは各ingredientsのpriceの合計値にすること**
- 各食事のコストの合計が予算（{daily_budget}円）を超えないこと
- 栄養バランスを考慮
- 実現可能な自炊レシピ
- すべての数値は整数で出力
- JSONのみを出力し、説明文やマークダウンのコードブロックは含めないでください"""

        return prompt

    def _build_single_meal_prompt(
        self,
        meal_type: str,
        gender: GenderEnum,
        age: int,
        height: int,
        weight: int,
        activity_level: ActivityLevelEnum,
        target_weight: int,
        target_period_months: int,
        meal_budget: int,
        target_calories: int,
        disliked_foods: List[str],
        allergies: List[str],
        past_meal_names: List[str],
        other_meals_today: List[Dict[str, Any]],
    ) -> str:
        """1食分の再生成プロンプトを構築"""
        gender_str = "男性" if gender == GenderEnum.male else "女性"
        activity_str = {
            ActivityLevelEnum.low: "低い（デスクワーク中心）",
            ActivityLevelEnum.medium: "普通（立ち仕事あり）",
            ActivityLevelEnum.high: "高い（運動習慣あり）",
        }.get(activity_level, "普通")

        meal_type_ja = {"breakfast": "朝食", "lunch": "昼食", "dinner": "夕食"}.get(
            meal_type, meal_type
        )

        disliked_str = ", ".join(disliked_foods) if disliked_foods else "なし"
        allergies_str = ", ".join(allergies) if allergies else "なし"
        past_meals_str = (
            "\n".join([f"- {name}" for name in past_meal_names])
            if past_meal_names
            else "なし"
        )

        # 他の食事の情報を追加
        other_meals_info = ""
        if other_meals_today:
            other_meals_kcal = sum(meal.get("kcal", 0) for meal in other_meals_today)
            other_meals_cost = sum(meal.get("cost", 0) for meal in other_meals_today)
            other_meals_info = f"""
【今日の他の食事】
- 既に消費したカロリー: {other_meals_kcal}kcal
- 既に消費した予算: {other_meals_cost}円
"""

        prompt = f"""あなたは栄養士です。以下の条件に基づいて、{meal_type_ja}の献立を1つ提案してください。

【ユーザー情報】
- 性別: {gender_str}
- 年齢: {age}歳
- 身長: {height}cm
- 体重: {weight}kg
- 活動量: {activity_str}
- 目標体重: {target_weight}kg
- 目標期間: {target_period_months}ヶ月

【制約条件】
- この食事の予算: {meal_budget}円
- 1日の目標カロリー: 約{target_calories}kcal
- 嫌いな食べ物: {disliked_str}
- アレルギー: {allergies_str}
{other_meals_info}
【重複防止】
以下の献立は過去3週間で使用済みなので、避けてください：
{past_meals_str}

【出力形式】
JSON形式で出力（説明文は不要。JSONのみを出力してください）：
{{
  "meals": [
    {{
      "meal_type": "{meal_type}",
      "name": "鶏むね肉と野菜の炒め物定食",
      "kcal": 520,
      "cost": 350,
      "protein": 35,
      "fat": 12,
      "carbohydrates": 55,
      "ingredients": [
        {{"name": "鶏むね肉", "amount": "150g", "price": 120}},
        {{"name": "キャベツ", "amount": "100g", "price": 40}},
        {{"name": "人参", "amount": "50g", "price": 30}},
        {{"name": "ご飯", "amount": "200g", "price": 70}},
        {{"name": "調味料", "amount": "適量", "price": 90}}
      ]
    }}
  ]
}}

【重要な注意事項】
- **価格は必ず実際のスーパーの相場を反映すること（0円は禁止）**
- **costは各ingredientsのpriceの合計値にすること**
- 予算（{meal_budget}円）内に収めること
- 栄養バランスを考慮
- 実現可能な自炊レシピ
- すべての数値は整数で出力
- JSONのみを出力し、説明文やマークダウンのコードブロックは含めないでください"""

        return prompt

    def _calculate_target_calories(
        self,
        gender: GenderEnum,
        age: int,
        height: int,
        weight: int,
        activity_level: ActivityLevelEnum,
        target_weight: int,
        target_period_months: int,
    ) -> int:
        """Harris-Benedict式で目標カロリーを計算"""
        # 基礎代謝量（BMR）の計算
        if gender == GenderEnum.male:
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)

        # 活動レベル係数
        activity_multiplier = {
            ActivityLevelEnum.low: 1.2,
            ActivityLevelEnum.medium: 1.55,
            ActivityLevelEnum.high: 1.9,
        }.get(activity_level, 1.55)

        # 1日の消費カロリー
        tdee = bmr * activity_multiplier

        # 目標体重までの差
        weight_diff = target_weight - weight

        # 1kg減らすために必要なカロリー不足: 約7200kcal
        # 1ヶ月 = 30日として計算
        if target_period_months > 0:
            daily_calorie_adjustment = (weight_diff * 7200) / (
                target_period_months * 30
            )
        else:
            daily_calorie_adjustment = 0

        target_calories = int(tdee + daily_calorie_adjustment)

        # 最低でも基礎代謝量は確保
        min_calories = int(bmr)
        return max(target_calories, min_calories)

    def _parse_meal_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Gemini APIのレスポンスをパースしてJSONに変換"""
        try:
            # マークダウンのコードブロックを除去
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]

            cleaned_text = cleaned_text.strip()

            # JSONをパース
            data = json.loads(cleaned_text)
            return data.get("meals", [])
        except json.JSONDecodeError as e:
            raise ValueError(
                f"Failed to parse Gemini response as JSON: {e}\nResponse: {response_text}"
            )
        except Exception as e:
            raise ValueError(
                f"Failed to process Gemini response: {e}\nResponse: {response_text}"
            )
