import requests
from bs4 import BeautifulSoup
import pandas as pd
import re

def parse_address_phone(content):
    """Parse content to extract address components and phone number"""
    # Initialize all fields
    street_address = ""
    city = ""
    province = ""
    postal_code = ""
    phone_number = ""
    
    if not content:
        return street_address, city, province, postal_code, phone_number
    
    # Split content by newlines to separate address and phone
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    
    # Look for phone number pattern (xxx-xxx-xxxx or similar)
    phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}(?:\s*ext\.?\s*\d+)?\b'
    
    for line in lines:
        if re.search(phone_pattern, line):
            phone_number = line
        else:
            # This should be the address line
            # Canadian postal code pattern: Letter-Number-Letter Number-Letter-Number
            postal_pattern = r'\b[A-Za-z]\d[A-Za-z]\s*\d[A-Za-z]\d\b'
            postal_match = re.search(postal_pattern, line)
            
            if postal_match:
                postal_code = postal_match.group().replace(' ', '')
                
                # Extract province (usually ON for Ontario, before postal code)
                prov_pattern = r'\b(ON|BC|AB|SK|MB|QC|NB|NS|PE|NL|YT|NT|NU)\b'
                prov_match = re.search(prov_pattern, line)
                if prov_match:
                    province = prov_match.group()
                
                # Split the line to extract city and street address
                # Remove postal code and province from the end
                address_part = line
                if postal_match:
                    address_part = line[:postal_match.start()].strip()
                if prov_match and prov_match.start() < postal_match.start():
                    address_part = address_part[:address_part.rfind(province)].strip()
                
                # The city is usually the last part before province/postal code
                # Look for common city indicators
                if ',' in address_part:
                    parts = address_part.split(',')
                    if len(parts) >= 2:
                        street_address = ','.join(parts[:-1]).strip()
                        city = parts[-1].strip()
                    else:
                        street_address = address_part
                        city = "Toronto"  # Default assumption
                else:
                    # Try to identify if it contains Toronto, Etobicoke, etc.
                    city_pattern = r'\b(Toronto|Etobicoke|Brampton|Mississauga|North York|Scarborough)\b'
                    city_match = re.search(city_pattern, address_part)
                    if city_match:
                        city = city_match.group()
                        street_address = address_part[:city_match.start()].strip()
                    else:
                        street_address = address_part
                        city = "Toronto"  # Default
            else:
                # If no postal code found, treat entire line as street address
                street_address = line
                city = "Toronto"  # Default
                province = "ON"  # Default
    
    return street_address, city, province, postal_code, phone_number

url = "https://www.torontocentralhealthline.ca/listservices.aspx?id=10572"
res = requests.get(url)
soup = BeautifulSoup(res.text, 'html.parser')

# Extract service names from <a> tags
service_links = soup.find_all("a", href=re.compile(r"displayService\.aspx\?id="))
service_names = [link.get_text(strip=True) for link in service_links]

# Extract existing span content
elements = soup.find_all("span", class_="regtext")
span_data = [el.get_text(strip=True).replace('\xa0', ' ') for el in elements]

# Combine and parse the data
all_data = []

if len(service_names) == len(span_data):
    # If names and content align 1:1
    for name, content in zip(service_names, span_data):
        street_address, city, province, postal_code, phone_number = parse_address_phone(content)
        all_data.append({
            'Name': name,
            'Street Address': street_address,
            'City': city,
            'Province': province,
            'Postal Code': postal_code,
            'Phone Number': phone_number
        })
else:
    # If they don't align, try to match them or handle separately
    print("Warning: Service names and content don't align 1:1")
    
    # For now, create entries with available data
    max_len = max(len(service_names), len(span_data))
    
    for i in range(max_len):
        name = service_names[i] if i < len(service_names) else ""
        content = span_data[i] if i < len(span_data) else ""
        
        street_address, city, province, postal_code, phone_number = parse_address_phone(content)
        all_data.append({
            'Name': name,
            'Street Address': street_address,
            'City': city,
            'Province': province,
            'Postal Code': postal_code,
            'Phone Number': phone_number
        })

# Create DataFrame with proper column order
df = pd.DataFrame(all_data, columns=['Name', 'Street Address', 'City', 'Province', 'Postal Code', 'Phone Number'])
df.to_csv("output.csv", index=False)

# Print debug info
print(f"Found {len(service_names)} service names")
print(f"Found {len(span_data)} span elements")
print(f"Created {len(all_data)} total records")

# Display first few records for verification
print("\nFirst few records:")
print(df.head(10))

# Show sample of parsed data
print("\nSample parsed data:")
for i, row in df.head(3).iterrows():
    print(f"\nRecord {i+1}:")
    for col, val in row.items():
        if val:
            print(f"  {col}: {val}")