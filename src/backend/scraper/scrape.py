import requests
from bs4 import BeautifulSoup
import pandas as pd

url = "https://www.torontocentralhealthline.ca/listservices.aspx?id=10572"
res = requests.get(url)
soup = BeautifulSoup(res.text, 'html.parser')
elements = soup.find_all("span", class_="regtext")

data = [el.get_text(strip=True)
        .replace('\xa0', ' ') 
        for el in elements]
# Scraper will work fine after this point with no issues on data returns
# However further splitting of the returned data so it's sectioned is easier formatting
# Plus it allows for easier CSV -> JSON conversion should be we need it    
df = pd.DataFrame(data, columns=["Content"])
# Needs to be a line that removes duplicates from the data 
df_cleaned = df.drop_duplicates(keep='first')   

df_cleaned.to_csv("output.csv", index=False)