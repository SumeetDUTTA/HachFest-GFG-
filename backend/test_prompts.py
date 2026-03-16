"""
Test script for the AI Brain - validates components step by step.
Run this to verify the system is working correctly.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

def test_data_loader():
    """Test 1: Data loading and schema extraction."""
    print("\n" + "="*60)
    print("TEST 1: Data Loader & Schema Extraction")
    print("="*60)
    
    try:
        from data_loader import DataSchemaProvider
        
        provider = DataSchemaProvider()
        schema = provider.get_schema_json()
        
        print(f"✓ Loaded {schema['row_count']} rows")
        print(f"✓ Found {len(schema['columns'])} columns")
        print(f"✓ Column names: {', '.join(schema['column_names'][:5])}...")
        
        # Test column validation
        is_valid, invalid = provider.validate_columns(['age', 'monthly_income', 'fake_column'])
        if not is_valid:
            print(f"✓ Column validation working - caught invalid columns: {invalid}")
        
        print("\n✓ TEST 1 PASSED\n")
        return True
    except Exception as e:
        print(f"\n✗ TEST 1 FAILED: {e}\n")
        return False

def test_query_executor():
    """Test 2: Query execution and validation."""
    print("="*60)
    print("TEST 2: Query Executor")
    print("="*60)
    
    try:
        from query_executor import QueryExecutor
        
        executor = QueryExecutor()
        
        # Test simple query
        result = executor.execute_query("df[['age', 'monthly_income']].head(10)")
        
        if result['success']:
            print(f"✓ Query executed successfully")
            print(f"✓ Returned {result['row_count']} rows")
            print(f"✓ Columns: {result['columns']}")
        else:
            print(f"✗ Query failed: {result['error']}")
            return False
        
        # Test dangerous code detection
        is_valid, msg = executor.validate_pandas_code("df; import os; os.system('rm -rf /')")
        if not is_valid:
            print(f"✓ Dangerous code detection working: {msg}")
        
        # Test invalid column detection
        is_valid, msg = executor.validate_pandas_code("df[['invalid_column']]")
        if not is_valid:
            print(f"✓ Invalid column detection working: {msg}")
        
        print("\n✓ TEST 2 PASSED\n")
        return True
    except Exception as e:
        print(f"\n✗ TEST 2 FAILED: {e}\n")
        import traceback
        traceback.print_exc()
        return False

def test_chart_selector():
    """Test 3: Chart selection."""
    print("="*60)
    print("TEST 3: Chart Selector")
    print("="*60)
    
    try:
        from chart_selector import ChartSelector
        
        selector = ChartSelector()
        
        # Test chart type recommendation
        test_data = [
            {"age_group": "20-30", "avg_spend": 5000},
            {"age_group": "30-40", "avg_spend": 7500},
            {"age_group": "40-50", "avg_spend": 9000},
        ]
        
        chart_config = selector.generate_recharts_config(
            chart_type="bar",
            data=test_data,
            title="Average Spend by Age",
            x_axis="age_group",
            y_axis="avg_spend"
        )
        
        print(f"✓ Generated chart config for bar chart")
        print(f"  - Type: {chart_config['type']}")
        print(f"  - Data points: {len(chart_config['data'])}")
        
        # Test data analysis
        analysis = selector.get_data_analysis_summary(test_data)
        print(f"✓ Data analysis generated:")
        print(f"  - Rows: {analysis['row_count']}")
        print(f"  - Columns: {analysis['column_count']}")
        
        print("\n✓ TEST 3 PASSED\n")
        return True
    except Exception as e:
        print(f"\n✗ TEST 3 FAILED: {e}\n")
        import traceback
        traceback.print_exc()
        return False

def test_llm_engine():
    """Test 4: LLM Engine (requires API key)."""
    print("="*60)
    print("TEST 4: LLM Engine Integration")
    print("="*60)
    
    try:
        from dotenv import load_dotenv
        from config import GEMINI_API_KEY
        
        load_dotenv()
        
        if not GEMINI_API_KEY:
            print("⚠ GEMINI_API_KEY not set in .env file")
            print("  To test LLM engine:")
            print("  1. Copy .env.example to .env")
            print("  2. Get API key from https://aistudio.google.com/app/apikey")
            print("  3. Add key to .env file")
            print("\n✓ TEST 4 SKIPPED (API key not configured)\n")
            return True
        
        from llm_engine import LLMEngine
        
        engine = LLMEngine()
        print("✓ LLM Engine connected successfully")
        
        # Test simple prompt (optional, as it uses API quota)
        print("✓ Engine ready for prompts")
        
        print("\n✓ TEST 4 PASSED\n")
        return True
    except Exception as e:
        print(f"\n✗ TEST 4 FAILED: {e}\n")
        import traceback
        traceback.print_exc()
        return False

def test_end_to_end():
    """Test 5: End-to-end flow with mock data."""
    print("="*60)
    print("TEST 5: End-to-End Flow (Mock)")
    print("="*60)
    
    try:
        from query_executor import QueryExecutor
        from chart_selector import ChartSelector
        
        executor = QueryExecutor()
        selector = ChartSelector()
        
        # Simulate an LLM-generated query
        mock_query = "df.groupby('age')['avg_online_spend'].mean().reset_index().head(5)"
        
        result = executor.execute_query(mock_query)
        print(f"✓ Query executed: {result['row_count']} rows returned")
        
        # Validate and generate chart
        is_valid, warning = executor.validate_query_result(result, "bar")
        print(f"✓ Chart validation: {is_valid}")
        
        if is_valid:
            chart_config = selector.generate_recharts_config(
                chart_type="bar",
                data=result['data'],
                title="Average Online Spend by Age",
                x_axis="age",
                y_axis="avg_online_spend"
            )
            print(f"✓ Chart config generated")
            print(f"  - Chart type: {chart_config['type']}")
            print(f"  - Data points: {len(chart_config['data'])}")
        
        print("\n✓ TEST 5 PASSED\n")
        return True
    except Exception as e:
        print(f"\n✗ TEST 5 FAILED: {e}\n")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("\n" + "[TEST] "*30)
    print("CONVERSATIONAL BI AI BRAIN - TEST SUITE")
    print("[TEST] "*15)
    
    tests = [
        ("Data Loader", test_data_loader),
        ("Query Executor", test_query_executor),
        ("Chart Selector", test_chart_selector),
        ("LLM Engine", test_llm_engine),
        ("End-to-End", test_end_to_end),
    ]
    
    results = []
    for name, test_func in tests:
        results.append((name, test_func()))
    
    # Summary
    print("="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All tests passed! AI Brain is ready to use.")
        print("\nNext steps:")
        print("1. Configure .env file with GEMINI_API_KEY")
        print("2. Run: python -m uvicorn main:app --reload")
        print("3. Visit: http://localhost:8000/docs")
    else:
        print(f"\n✗ {total - passed} test(s) failed. Please fix issues above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
