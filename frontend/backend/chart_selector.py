from typing import Dict, Any, List
import pandas as pd # type: ignore

class ChartSelector:
    """Intelligently selects chart types and generates chart configurations."""
    
    CHART_TYPES = {
        "bar": {
            "description": "Bar chart for categorical vs numeric comparison",
            "best_for": ["categories vs values", "rankings", "totals by group"],
        },
        "line": {
            "description": "Line chart for time-series or continuous trends",
            "best_for": ["trends over time", "continuous change", "multiple series trends"],
        },
        "pie": {
            "description": "Pie chart for parts-of-a-whole percentages",
            "best_for": ["market share", "percentage distribution", "composition"],
        },
        "scatter": {
            "description": "Scatter plot for relationships between two continuous variables",
            "best_for": ["correlation analysis", "relationship patterns", "outliers"],
        },
        "table": {
            "description": "Table for detailed data with multiple columns",
            "best_for": ["detailed insights", "rankings with metadata", "raw data"],
        },
        "area": {
            "description": "Area chart for cumulative trends over time",
            "best_for": ["stacked trends", "cumulative values", "composition over time"],
        }
    }
    
    def recommend_chart_type(self, llm_suggestion: str, data: List[Dict[str, Any]]) -> str:
        """
        Validate and confirm chart type recommendation.
        
        Args:
            llm_suggestion: Chart type suggested by LLM
            data: Query result data
            
        Returns:
            Validated chart type
        """
        if not data:
            return "table"

        keys = list(data[0].keys())
        if len(keys) < 2:
            return "table"

        x_key = keys[0]
        y_key = keys[1]

        x_series = pd.Series([row.get(x_key) for row in data])
        y_series = pd.Series([row.get(y_key) for row in data])
        x_numeric = pd.api.types.is_numeric_dtype(x_series)
        y_numeric = pd.api.types.is_numeric_dtype(y_series)

        normalized = (llm_suggestion or "").lower()
        if normalized not in self.CHART_TYPES:
            normalized = "table"

        # Guardrail: trend-like x-axis (age/time/year/month/day) should default to line.
        trend_hint = any(token in x_key.lower() for token in ["age", "time", "date", "year", "month", "day"])
        if normalized == "bar" and x_numeric and y_numeric and trend_hint:
            return "line"

        return normalized

    def optimize_for_readability(self, chart_type: str, data: List[Dict[str, Any]]) -> tuple[List[Dict[str, Any]], List[str]]:
        """Apply visual guardrails to keep charts readable for large result sets."""
        if not data:
            return data, []

        notes: List[str] = []
        keys = list(data[0].keys())
        if len(keys) < 2:
            return data, notes

        x_key = keys[0]
        y_key = keys[1]
        df = pd.DataFrame(data)

        # Pie readability: keep top 10 categories.
        if chart_type == "pie" and len(df) > 10 and pd.api.types.is_numeric_dtype(df[y_key]):
            df = df.sort_values(by=y_key, ascending=False).head(10)
            notes.append("Reduced pie slices to top 10 for readability.")

        # Bar readability: for non-trend bars with many rows, keep top 25 by y.
        if chart_type == "bar" and len(df) > 25 and pd.api.types.is_numeric_dtype(df[y_key]):
            trend_hint = any(token in x_key.lower() for token in ["age", "time", "date", "year", "month", "day"])
            if not trend_hint:
                df = df.sort_values(by=y_key, ascending=False).head(25)
                notes.append("Reduced bar categories to top 25 for readability.")

        # Line readability: downsample very large series.
        if chart_type == "line" and len(df) > 150:
            step = max(1, len(df) // 150)
            df = df.iloc[::step]
            notes.append("Downsampled line series to improve rendering performance.")

        return df.to_dict(orient="records"), notes
    
    def generate_recharts_config(
        self,
        chart_type: str,
        data: List[Dict[str, Any]],
        title: str = "",
        x_axis: str = "",
        y_axis: str = ""
    ) -> Dict[str, Any]:
        """
        Generate Recharts configuration JSON.
        
        Args:
            chart_type: Type of chart (bar, line, pie, scatter, table)
            data: Query result data
            title: Chart title
            x_axis: X-axis column name
            y_axis: Y-axis column name
            
        Returns:
            Recharts configuration object
        """
        keys = list(data[0].keys()) if data else []
        x_key = x_axis or (keys[0] if len(keys) > 0 else "")
        y_key = y_axis or (keys[1] if len(keys) > 1 else "")

        config = {
            "type": chart_type,
            "title": title,
            "data": data,
            "responsive": True,
            "autoMargin": True,
        }
        
        if chart_type == "bar":
            config.update({
                "xAxisDataKey": x_key,
                "yAxisDataKey": y_key,
                "layout": "vertical",
                "colors": ["#8884d8"],
            })
        
        elif chart_type == "line":
            config.update({
                "xAxisDataKey": x_key,
                "yAxisDataKey": y_key,
                "strokeWidth": 2,
                "dot": True,
                "colors": ["#8884d8"],
            })
        
        elif chart_type == "pie":
            config.update({
                "dataKey": y_key or "value",
                "nameKey": x_key or "name",
            })
        
        elif chart_type == "scatter":
            config.update({
                "xAxisDataKey": x_key,
                "yAxisDataKey": y_key,
                "fill": "#8884d8",
            })
        
        elif chart_type == "table":
            config.update({
                "columns": list(data[0].keys()) if data else [],
                "striped": True,
                "bordered": True,
            })
        
        elif chart_type == "area":
            config.update({
                "xAxisDataKey": x_key,
                "yAxisDataKey": y_key,
                "fillOpacity": 0.6,
                "colors": ["#8884d8"],
            })
        
        return config
    
    def generate_plotly_config(
        self,
        chart_type: str,
        data: List[Dict[str, Any]],
        title: str = "",
        x_axis: str = "",
        y_axis: str = ""
    ) -> Dict[str, Any]:
        """
        Generate Plotly configuration JSON (alternative visualization library).
        
        Args:
            chart_type: Type of chart
            data: Query result data
            title: Chart title
            x_axis: X-axis column name
            y_axis: Y-axis column name
            
        Returns:
            Plotly configuration object
        """
        config = {
            "type": chart_type,
            "title": title,
            "data": data,
        }
        
        if not data:
            return config
        
        keys = list(data[0].keys())
        x_key = x_axis or keys[0]
        y_key = y_axis or (keys[1] if len(keys) > 1 else keys[0])
        
        if chart_type == "bar":
            config.update({
                "x": [row.get(x_key) for row in data],
                "y": [row.get(y_key) for row in data],
                "type": "bar",
                "marker": {"color": "#8884d8"},
            })
        
        elif chart_type == "line":
            config.update({
                "x": [row.get(x_key) for row in data],
                "y": [row.get(y_key) for row in data],
                "type": "scatter",
                "mode": "lines+markers",
                "line": {"color": "#8884d8", "width": 2},
            })
        
        elif chart_type == "pie":
            config.update({
                "labels": [row.get(x_key) for row in data],
                "values": [row.get(y_key) for row in data],
                "type": "pie",
            })
        
        elif chart_type == "scatter":
            config.update({
                "x": [row.get(x_key) for row in data],
                "y": [row.get(y_key) for row in data],
                "type": "scatter",
                "mode": "markers",
                "marker": {"size": 8, "color": "#8884d8"},
            })
        
        return config
    
    def get_data_analysis_summary(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate insights and summary statistics about the data."""
        if not data:
            return {"message": "No data available"}
        
        df = pd.DataFrame(data)
        summary = {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": list(df.columns),
            "numeric_summary": {},
            "categorical_summary": {}
        }
        
        # Numeric column summary
        numeric_cols = df.select_dtypes(include=["number"]).columns
        for col in numeric_cols:
            summary["numeric_summary"][col] = {
                "min": float(df[col].min()),
                "max": float(df[col].max()),
                "mean": float(df[col].mean()),
                "median": float(df[col].median()),
            }
        
        # Categorical column summary
        categorical_cols = df.select_dtypes(include=["object"]).columns
        for col in categorical_cols:
            unique_count = df[col].nunique()
            summary["categorical_summary"][col] = {
                "unique_count": unique_count,
                "top_value": str(df[col].mode()[0]) if len(df[col].mode()) > 0 else "N/A"
            }
        
        return summary
