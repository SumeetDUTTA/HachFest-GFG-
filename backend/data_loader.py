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
        candidate_separators = [None, ",", ";", "\t", "|"]
        best_df: Optional[pd.DataFrame] = None
        best_score = (-1, -1)

        for encoding in encodings:
            try:
                decoded = csv_bytes.decode(encoding)
                decoded_buffer = io.StringIO(decoded)

                for sep in candidate_separators:
                    decoded_buffer.seek(0)
                    try:
                        read_kwargs = {
                            "on_bad_lines": "skip",
                            "skip_blank_lines": True,
                        }
                        if sep is None:
                            # Let pandas sniff delimiter for unknown CSV formats.
                            read_kwargs.update({"sep": None, "engine": "python"})
                        else:
                            read_kwargs.update({"sep": sep})

                        df = pd.read_csv(decoded_buffer, **read_kwargs)

                        if df.empty:
                            continue
                        column_count = len(df.columns)
                        if column_count < 2:
                            continue

                        # Pick the richest parse result across delimiter/encoding attempts.
                        score = (column_count, len(df))
                        if score > best_score:
                            best_df = df
                            best_score = score
                    except Exception as parse_exc:
                        last_error = parse_exc

                # Fallback for noisy files: extract the longest contiguous CSV-like block.
                lines = [line for line in decoded.splitlines() if line.strip()]
                for sep in [",", ";", "\t", "|"]:
                    if len(lines) < 2:
                        continue

                    counts = [line.count(sep) for line in lines]
                    max_count = max(counts) if counts else 0
                    if max_count < 1:
                        continue

                    threshold = max(1, int(max_count * 0.8))
                    best_start = -1
                    best_end = -1
                    start = None

                    for idx, count in enumerate(counts):
                        if count >= threshold:
                            if start is None:
                                start = idx
                        elif start is not None:
                            if (idx - start) > (best_end - best_start):
                                best_start, best_end = start, idx
                            start = None

                    if start is not None and (len(lines) - start) > (best_end - best_start):
                        best_start, best_end = start, len(lines)

                    if best_start == -1 or (best_end - best_start) < 2:
                        continue

                    candidate_text = "\n".join(lines[best_start:best_end])
                    try:
                        extracted_df = pd.read_csv(
                            io.StringIO(candidate_text),
                            sep=sep,
                            on_bad_lines="skip",
                            skip_blank_lines=True,
                        )
                        if extracted_df.empty or len(extracted_df.columns) < 2:
                            continue

                        score = (len(extracted_df.columns), len(extracted_df))
                        if score > best_score:
                            best_df = extracted_df
                            best_score = score
                    except Exception as parse_exc:
                        last_error = parse_exc
            except Exception as exc:
                last_error = exc

        if best_df is not None:
            self._df = best_df
            self._build_schema()
            print(f"✓ Loaded uploaded CSV: {len(self._df)} rows, {len(self._df.columns)} columns")
            return

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
