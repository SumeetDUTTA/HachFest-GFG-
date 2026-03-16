import pandas as pd # type: ignore
import numpy as np
from typing import Dict, Any, Tuple, List
from data_loader import DataSchemaProvider
from config import MAX_ROWS_RETURNED
import re

class QueryExecutor:
    """Executes pandas queries with validation and error handling."""
    
    def __init__(self):
        self.schema_provider = DataSchemaProvider()
        self.df = self.schema_provider.get_dataframe()
        self._result_cache: Dict[str, Dict[str, Any]] = {}

    def refresh_data(self) -> None:
        """Reload in-memory dataframe from shared schema provider after dataset updates."""
        self.df = self.schema_provider.get_dataframe()
        self._result_cache.clear()
    
    def validate_pandas_code(self, code: str) -> Tuple[bool, str]:
        """
        Validate pandas code for safety and correctness.
        
        Returns:
            (is_valid, error_message)
        """
        # Check for dangerous operations
        dangerous_patterns = [
            r'__import__',
            r'eval\(',
            r'exec\(',
            r'os\.',
            r'subprocess',
            r'open\(',
            r'system\(',
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                return False, f"Code contains forbidden operation: {pattern}"
        
        # Check that code only references valid columns
        column_pattern = r"['\"]([^'\"]+)['\"]"
        referenced_cols = re.findall(column_pattern, code)
        
        valid_cols = self.schema_provider.get_column_names()
        invalid_cols = [col for col in referenced_cols if col not in valid_cols]
        
        if invalid_cols:
            return False, f"Code references non-existent columns: {', '.join(set(invalid_cols))}"
        
        return True, ""
    
    def execute_query(self, pandas_code: str, max_rows: int = MAX_ROWS_RETURNED) -> Dict[str, Any]:
        """
        Execute pandas code and return results.
        
        Args:
            pandas_code: Pandas code string to execute (e.g., "df.groupby('age')['avg_online_spend'].mean()")
            
        Returns:
            Dict with success status, data, and metadata
        """
        # Always execute against the latest uploaded/default dataset snapshot.
        self.df = self.schema_provider.get_dataframe()

        # Validate code
        is_valid, error_msg = self.validate_pandas_code(pandas_code)
        if not is_valid:
            return {
                "success": False,
                "error": error_msg,
                "data": None
            }

        # Fast path: exact query cache hit
        if pandas_code in self._result_cache:
            cached = dict(self._result_cache[pandas_code])
            cached["cache_hit"] = True
            return cached
        
        try:
            # Execute the query in a safe namespace
            local_namespace = {
                'df': self.df,
                'pd': pd,
                'np': np,
            }
            
            result = eval(pandas_code, {"__builtins__": {}}, local_namespace)
            
            # Convert result to dataframe if needed
            if isinstance(result, pd.Series):
                result = result.reset_index()
            elif isinstance(result, (int, float, str)):
                result = pd.DataFrame([{"value": result}])
            elif not isinstance(result, pd.DataFrame):
                result = pd.DataFrame(result)
            
            effective_max_rows = max(1, min(max_rows, MAX_ROWS_RETURNED))

            # Check if result exceeds max rows
            if len(result) > effective_max_rows:
                result = result.head(effective_max_rows)
                truncated = True
            else:
                truncated = False
            
            # Convert to JSON-serializable format
            result_json = result.to_dict(orient='records')
            
            result_payload = {
                "success": True,
                "data": result_json,
                "row_count": len(result_json),
                "truncated": truncated,
                "columns": list(result.columns),
                "dtypes": {col: str(dtype) for col, dtype in result.dtypes.items()},
                "cache_hit": False
            }

            # Store successful results for repeat prompts/follow-ups.
            self._result_cache[pandas_code] = dict(result_payload)
            return result_payload
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Query execution failed: {str(e)}",
                "data": None
            }
    
    def validate_query_result(self, result: Dict[str, Any], expected_chart_type: str) -> Tuple[bool, str]:
        """
        Validate that query result is appropriate for the suggested chart type.
        
        Returns:
            (is_valid, warning_message)
        """
        if not result.get("success"):
            return False, result.get("error", "Query failed")
        
        data = result.get("data", [])
        row_count = result.get("row_count", 0)
        
        # Validate based on chart type
        if expected_chart_type == "pie" and row_count > 10:
            return True, f"Warning: Pie chart with {row_count} slices may be hard to read. Consider limiting to top 10."
        
        if expected_chart_type == "scatter" and row_count < 10:
            return True, f"Warning: Scatter plot with only {row_count} points may not show patterns clearly."
        
        if expected_chart_type == "line" and row_count < 3:
            return False, "Line chart requires at least 3 data points"
        
        if expected_chart_type == "table" and row_count > 100:
            return True, f"Info: Large table ({row_count} rows). Consider pagination in UI."
        
        return True, ""
    
    def get_column_stats(self, column_name: str) -> Dict[str, Any]:
        """Get statistical summary of a column."""
        if column_name not in self.df.columns:
            return {"error": f"Column '{column_name}' not found"}
        
        col = self.df[column_name]
        
        stats = {
            "column": column_name,
            "dtype": str(col.dtype),
            "non_null_count": int(col.notna().sum()),
            "null_count": int(col.isna().sum()),
        }
        
        if pd.api.types.is_numeric_dtype(col):
            stats.update({
                "min": float(col.min()),
                "max": float(col.max()),
                "mean": float(col.mean()),
                "median": float(col.median()),
                "std": float(col.std()),
                "q25": float(col.quantile(0.25)),
                "q75": float(col.quantile(0.75)),
            })
        else:
            unique_vals = col.unique()
            stats.update({
                "unique_count": int(len(unique_vals)),
                "most_common": str(col.mode()[0]) if len(col.mode()) > 0 else None,
            })
        
        return stats
