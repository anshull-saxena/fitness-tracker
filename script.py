import pandas as pd

# Load and examine the Excel file
df = pd.read_excel("Anshul_Progress_Tracker.xlsx")

# Display basic information about the dataset
print("Dataset Info:")
print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print("\nFirst few rows:")
print(df.head())

print("\nData types:")
print(df.dtypes)

print("\nNull values count:")
print(df.isnull().sum())

print("\nUnique phases:")
print(df['Phase'].unique())

print("\nDate range:")
print(f"Start date: {df['Date'].min()}")
print(f"End date: {df['Date'].max()}")