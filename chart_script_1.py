import plotly.graph_objects as go
import plotly.express as px
import numpy as np
from sklearn.linear_model import LinearRegression
import pandas as pd

# Data from the provided JSON
cutting_calories = [1850, 1900, 1825, 1875, 1800, 1850, 1900]
cutting_protein = [155, 160, 150, 158, 145, 152, 165]
bulking_calories = [2800, 2900, 2750, 2850, 2950, 3000, 2920, 2880, 2950, 3100, 2850, 2900, 2950, 3050, 2800, 2900, 2850, 2950, 3000, 2880, 2920, 2850, 2900, 2950]
bulking_protein = [180, 190, 175, 185, 195, 200, 188, 182, 195, 210, 185, 190, 195, 205, 180, 190, 185, 195, 200, 182, 188, 185, 190, 195]

# Brand colors
colors = ['#1FB8CD', '#FFC185']

# Create figure
fig = go.Figure()

# Add cutting phase scatter
fig.add_trace(go.Scatter(
    x=cutting_calories,
    y=cutting_protein,
    mode='markers',
    name='Cutting',
    marker=dict(
        color=colors[0],
        size=8,
        symbol='circle'
    ),
    cliponaxis=False
))

# Add bulking phase scatter
fig.add_trace(go.Scatter(
    x=bulking_calories,
    y=bulking_protein,
    mode='markers',
    name='Bulking',
    marker=dict(
        color=colors[1],
        size=8,
        symbol='diamond'
    ),
    cliponaxis=False
))

# Add target zones as rectangles
# Cutting target zone
fig.add_shape(
    type="rect",
    x0=1750, y0=140, x1=1950, y1=170,
    fillcolor=colors[0],
    opacity=0.1,
    line=dict(color=colors[0], width=1, dash="dash")
)

# Bulking target zone
fig.add_shape(
    type="rect",
    x0=2700, y0=170, x1=3200, y1=220,
    fillcolor=colors[1],
    opacity=0.1,
    line=dict(color=colors[1], width=1, dash="dash")
)

# Calculate and add trend line for all data
all_calories = cutting_calories + bulking_calories
all_protein = cutting_protein + bulking_protein

# Fit linear regression
X = np.array(all_calories).reshape(-1, 1)
y = np.array(all_protein)
reg = LinearRegression().fit(X, y)

# Create trend line data
trend_x = np.linspace(min(all_calories), max(all_calories), 100)
trend_y = reg.predict(trend_x.reshape(-1, 1))

fig.add_trace(go.Scatter(
    x=trend_x,
    y=trend_y,
    mode='lines',
    name='Trend',
    line=dict(color='#5D878F', width=2, dash='solid'),
    cliponaxis=False
))

# Update layout
fig.update_layout(
    title='Calories vs Protein Intake',
    xaxis_title='Daily Calories',
    yaxis_title='Protein (g)',
    legend=dict(
        orientation='h',
        yanchor='bottom',
        y=1.05,
        xanchor='center',
        x=0.5
    )
)

# Update axes ranges
fig.update_xaxes(range=[1750, 3200])
fig.update_yaxes(range=[120, 220])

# Save the chart
fig.write_image('calories_protein_scatter.png')