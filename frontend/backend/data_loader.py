import pandas as pd # type: ignore
from typing import Dict, Any, Optional
import json
import io
from config import DATA_FILE_PATH

class DataSchemaProvider:
    """Loads and provides metadata about the dataset schema for LLM context."""
    
    _instance = None
    _df = None
    _schema = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataSchemaProvider, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._df is None:
            self.load_data()
    
    def load_data(self):
        """Load CSV/Excel and build schema metadata."""
        try:
            self._df = None
            csv_path = DATA_FILE_PATH.replace('.xlsx', '.csv')
            
            # Try to extract clean CSV from possibly corrupted file
            import re
            try:
                with open(csv_path, 'rb') as f:
                    raw_content = f.read()
                
                # Decode with error handling
                content_str = raw_content.decode('latin-1', errors='ignore')
                
                # Extract CSV data using regex - look for the age...shopping_preference pattern
                csv_match = re.search(
                    r'(age,.*?shopping_preference[^\n]*\n(?:.*?\n)*)',
                    content_str,
                    re.DOTALL | re.IGNORECASE
                )
                
                if csv_match:
                    csv_data = csv_match.group(1)
                    import io
                    self._df = pd.read_csv(io.StringIO(csv_data), on_bad_lines='skip')
                    
            except:
                pass
            
            # If regex extraction failed, try Excel
            if self._df is None or len(self._df.columns) < 5:
                xlsx_path = DATA_FILE_PATH if DATA_FILE_PATH.endswith('.xlsx') else DATA_FILE_PATH.replace('.csv', '.xlsx')
                try:
                    # Try reading first sheet, then second sheet
                    self._df = pd.read_excel(xlsx_path, sheet_name=0)
                    if len(self._df.columns) < 5:
                        try:
                            self._df = pd.read_excel(xlsx_path, sheet_name=1)
                        except:
                            pass
                except:
                    pass
            
            # Last resort: try standard CSV read
            if self._df is None or len(self._df.columns) < 5:
                encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
                for encoding in encodings:
                    try:
                        self._df = pd.read_csv(csv_path, encoding=encoding, on_bad_lines='skip')
                        if len(self._df.columns) > 10:
                            break
                    except:
                        continue
            
            if self._df is None or len(self._df.columns) < 10:
                raise RuntimeError(f"Could not load valid data (got {len(self._df.columns) if self._df is not None else 0} columns)")
            
            self._build_schema()
            print(f"✓ Loaded {len(self._df)} rows, {len(self._df.columns)} columns")
        except Exception as e:
            raise RuntimeError(f"Failed to load data: {e}")

    def load_uploaded_csv(self, csv_bytes: bytes) -> None:
        """Load CSV bytes uploaded by frontend and rebuild schema."""
        if not csv_bytes:
            raise ValueError("Uploaded CSV file is empty")

        last_error: Optional[Exception] = None
        encodings = ["utf-8", "utf-8-sig", "latin-1", "iso-8859-1", "cp1252"]

        for encoding in encodings:
            try:
                decoded = csv_bytes.decode(encoding)
                df = pd.read_csv(io.StringIO(decoded), on_bad_lines="skip")

                if df.empty:
                    raise ValueError("CSV contains no data rows")
                if len(df.columns) < 2:
                    raise ValueError("CSV must contain at least 2 columns")

                self._df = df
                self._build_schema()
                print(f"✓ Loaded uploaded CSV: {len(self._df)} rows, {len(self._df.columns)} columns")
                return
            except Exception as exc:
                last_error = exc

        raise RuntimeError(f"Failed to parse uploaded CSV: {last_error}")
    
    def _build_schema(self):
        """Build comprehensive schema metadata."""
        self._schema = {
            "columns": {},
            "row_count": len(self._df),
            "column_names": list(self._df.columns)
        }
        
        for col in self._df.columns:
            col_data = {
                "dtype": str(self._df[col].dtype),
                "nullable": bool(self._df[col].isna().any()),
                "non_null_count": int(self._df[col].notna().sum()),
            }
            
            # Add stats based on data type
            if pd.api.types.is_numeric_dtype(self._df[col]):
                col_data.update({
                    "min": float(self._df[col].min()),
                    "max": float(self._df[col].max()),
                    "mean": float(self._df[col].mean()),
                    "median": float(self._df[col].median()),
                })
            elif pd.api.types.is_object_dtype(self._df[col]):
                unique_vals = self._df[col].unique()
                col_data["unique_count"] = int(len(unique_vals))
                if len(unique_vals) <= 20:
                    col_data["unique_values"] = [str(v) for v in unique_vals[:20]]
            
            self._schema["columns"][col] = col_data
    
    def get_schema_summary(self) -> str:
        """Return LLM-friendly schema description."""
        summary = "## Dataset Schema\n\n"
        summary += f"Total Rows: {self._schema['row_count']}\n"
        summary += f"Total Columns: {len(self._schema['columns'])}\n\n"
        summary += "### Available Columns:\n\n"
        
        for col, info in self._schema["columns"].items():
            summary += f"- **{col}** ({info['dtype']}): "
            
            if pd.api.types.is_numeric_dtype(self._df[col]):
                summary += f"Range [{info['min']:.0f}, {info['max']:.0f}], Mean: {info['mean']:.1f}\n"
            elif "unique_values" in info:
                summary += f"Unique values: {', '.join(info['unique_values'][:5])}"
                if len(info['unique_values']) > 5:
                    summary += f" (+ {len(info['unique_values']) - 5} more)"
                summary += "\n"
            else:
                summary += f"Unique values: {info['unique_count']}\n"
        
        return summary
    
    def get_dataframe(self) -> pd.DataFrame:
        """Return the loaded dataframe."""
        return self._df.copy()
    
    def get_column_names(self) -> list:
        """Return list of all column names."""
        return self._schema["column_names"]
    
    def get_schema_json(self) -> Dict[str, Any]:
        """Return schema as JSON dict."""
        return self._schema
    
    def validate_columns(self, column_list: list) -> tuple[bool, list]:
        """
        Validate that requested columns exist.
        Returns (is_valid, list_of_invalid_columns)
        """
        invalid = [col for col in column_list if col not in self._schema["column_names"]]
        return (len(invalid) == 0, invalid)
