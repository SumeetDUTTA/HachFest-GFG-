
## Dataset Description

## General Overview

This dataset represents consumer profiles detailing demographics, digital behavior, shopping habits,
psychographic scores, and spending patterns across online and physical store channels. It captures
structural variables that contrast digital engagement metrics against traditional brick-and-mortar
retail interactions.

## Domain

Retail and E-commerce.

## Potential Use Cases

● Customer Segmentation: Grouping consumers based on their overarching shopping
preferences (Store, Online, Hybrid) to engineer targeted omnichannel marketing strategies.
● Channel Preference Prediction: Building classification models to predict a customer's primary
shopping channel using their demographic data and psychographic scores.
● Revenue Attribution Modeling: Analyzing how factors such as digital engagement and
tech-savviness correlate directly with average online spend versus average in-store spend.

## Data Dictionary

## Column Name Data Type Description Sample Values

age Integer The age of the consumer
in years.

## 56, 69

monthly_income Integer The monthly financial
income of the consumer.

## 221111, 96029

daily_internet_hours Float The number of hours the
consumer spends on the
internet daily.

## 6.5, 8.2

smartphone_usage_years Integer The total number of
years the consumer has
used a smartphone.

## 12, 13

social_media_hours Float The number of hours the
consumer spends on
social media daily.

## 0.7, 2.7

online_payment_trust_sc
ore
Integer A numerical score
indicating the
consumer's level of trust
in online payment
gateways.

## 1, 6

tech_savvy_score Integer A numerical score
reflecting the consumer's
technological
proficiency.

## 6, 9

monthly_online_orders Integer The frequency of online
orders placed by the
consumer per month.

## 16, 14

monthly_store_visits Integer The frequency of visits
to physical retail stores
per month.

## 16, 1

avg_online_spend Integer The average monetary
amount spent on online
purchases.

## 28551, 124056

avg_store_spend Integer The average monetary
amount spent during
in-store purchases.

## 144092, 28421

discount_sensitivity Integer A numerical score
measuring how
influenced the consumer
is by promotional
discounts.

## 2, 4

return_frequency Integer A numerical score or
count evaluating how
often the consumer
returns purchases.

## 3, 7

avg_delivery_days Integer The average number of
days the consumer
experiences or waits for
product deliveries.

## 2, 4

delivery_fee_sensitivity Integer A numerical score
measuring the
consumer's aversion to
paying delivery fees.

## 6, 1

free_return_importance Integer A numerical score
indicating the
importance the
consumer places on free
return policies.

## 7, 3

product_availability_onli
ne
Integer Purpose ambiguous;
requires further
stakeholder context.

## 7, 4

impulse_buying_score Integer A psychometric 1, 9

evaluation of the
consumer's tendency to
make unplanned
purchases.
need_touch_feel_score Integer A metric indicating the
consumer's requirement
to physically interact
with a product prior to
purchase.

## 3, 6

brand_loyalty_score Integer A score representing the
consumer's dedication or
loyalty to specific brands.

## 6, 8

environmental_awarenes
s
Integer A score reflecting the
consumer's
consideration of
environmental factors
during shopping.

## 5, 1

time_pressure_level Integer A score indicating the
level of time constraint
or rush the consumer
experiences when
shopping.

## 2, 7

gender String / Categorical The reported gender
identity of the consumer.

## Other, Male

city_tier String / Categorical The tier classification of
the city where the
consumer resides.

## Tier 3, Tier 1

shopping_preference String / Categorical The primary shopping
channel preference of
the consumer.

## Store, Hybrid
