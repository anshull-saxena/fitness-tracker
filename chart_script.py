import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from datetime import datetime

# Create the data including waist measurements
data = {
    "dates": ["2025-06-22", "2025-06-29", "2025-07-06", "2025-07-13", "2025-07-20", "2025-07-27", "2025-08-03", "2025-08-10", "2025-08-17", "2025-08-24", "2025-08-31", "2025-09-07", "2025-09-14", "2025-09-21", "2025-09-28", "2025-10-05", "2025-10-12", "2025-10-19", "2025-10-26", "2025-11-02", "2025-11-09", "2025-11-16", "2025-11-23", "2025-11-30", "2025-12-07", "2025-12-14", "2025-12-21", "2025-12-28", "2026-01-04", "2026-01-11", "2026-01-18"],
    "weight_sample": [75.0, 74.2, 73.8, 73.1, 72.6, 72.0, 72.5, 73.2, 74.1, 74.8, 75.6, 76.2, 76.9, 77.4, 78.1, 78.7, 79.2, 79.8, 80.3, 80.9, 81.4, 81.8, 82.2, 82.6, 83.0, 83.3, 83.6, 83.9, 84.1, 84.4, 84.6],
    "waist_sample": [32.0, 31.7, 31.4, 31.0, 30.8, 30.5, 30.7, 31.0, 31.3, 31.6, 31.9, 32.1, 32.4, 32.6, 32.9, 33.1, 33.3, 33.5, 33.7, 33.9, 34.0, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 35.1],
    "phases": ["Cutting", "Cutting", "Cutting", "Cutting", "Cutting", "Cutting", "Cutting", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking", "Bulking"]
}

# Convert to DataFrame
df = pd.DataFrame(data)
df['dates'] = pd.to_datetime(df['dates'])

# Create separate datasets for cutting and bulking phases
cutting_df = df[df['phases'] == 'Cutting'].copy()
bulking_df = df[df['phases'] == 'Bulking'].copy()

# Create the figure with secondary y-axis
fig = go.Figure()

# Add weight traces - cutting phase
fig.add_trace(go.Scatter(
    x=cutting_df['dates'],
    y=cutting_df['weight_sample'],
    mode='lines+markers',
    name='Weight Cutting',
    line=dict(color='#1FB8CD', width=3),
    marker=dict(size=6, color='#1FB8CD'),
    cliponaxis=False,
    hovertemplate='<b>%{y:.1f} kg</b><br>%{x}<extra></extra>',
    yaxis='y'
))

# Add weight traces - bulking phase
fig.add_trace(go.Scatter(
    x=bulking_df['dates'],
    y=bulking_df['weight_sample'],
    mode='lines+markers',
    name='Weight Bulking',
    line=dict(color='#FFC185', width=3),
    marker=dict(size=6, color='#FFC185'),
    cliponaxis=False,
    hovertemplate='<b>%{y:.1f} kg</b><br>%{x}<extra></extra>',
    yaxis='y'
))

# Add waist traces - cutting phase
fig.add_trace(go.Scatter(
    x=cutting_df['dates'],
    y=cutting_df['waist_sample'],
    mode='lines+markers',
    name='Waist Cutting',
    line=dict(color='#5D878F', width=3, dash='dash'),
    marker=dict(size=6, color='#5D878F'),
    cliponaxis=False,
    hovertemplate='<b>%{y:.1f} in</b><br>%{x}<extra></extra>',
    yaxis='y2'
))

# Add waist traces - bulking phase
fig.add_trace(go.Scatter(
    x=bulking_df['dates'],
    y=bulking_df['waist_sample'],
    mode='lines+markers',
    name='Waist Bulking',
    line=dict(color='#D2BA4C', width=3, dash='dash'),
    marker=dict(size=6, color='#D2BA4C'),
    cliponaxis=False,
    hovertemplate='<b>%{y:.1f} in</b><br>%{x}<extra></extra>',
    yaxis='y2'
))

# Update layout with secondary y-axis
fig.update_layout(
    title='Fitness Progress',
    xaxis_title='Date',
    yaxis=dict(
        title='Weight (kg)',
        side='left'
    ),
    yaxis2=dict(
        title='Waist (in)',
        side='right',
        overlaying='y'
    ),
    showlegend=True
)

# Save the chart
fig.write_image("fitness_progress_chart.png")