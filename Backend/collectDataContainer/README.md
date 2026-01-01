# Example Query used to generate csv file:
\copy product(DEFAULT,city,store,product_name,code,category, price, price_promotion) FROM '/home/mihoarch/Documents/ShopPricer/Shop-Pric
er/Backend/local/storesData/stores/ABC MARKET (ЦБА-ДОБРИЧ ООД)_124634359.csv' DELIMITER ',' CSV HEADER;